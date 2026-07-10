"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import {
  Activity,
  BrainCircuit,
  Camera,
  ScanSearch,
  Sparkles,
  Smile,
} from "lucide-react";

type FaceSummary = {
  id: number;
  age: number;
  gender: string;
  mood: string;
  confidence: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const MODEL_BASE_URL = "/models";
const FALLBACK_MODEL_BASE_URL =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

export default function FaceDetectorPage() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [loadingText, setLoadingText] = useState(
    "Preparing your camera and AI models...",
  );
  const [error, setError] = useState("");
  const [faceSummaries, setFaceSummaries] = useState<FaceSummary[]>([]);
  const [statusLabel, setStatusLabel] = useState("Awaiting face scan");

  const loadModels = useCallback(async () => {
    try {
      setLoadingText("Loading intelligent face analysis models...");
      await Promise.all([
        loadModelWithFallback(
          faceapi.nets.tinyFaceDetector,
          "tinyFaceDetector",
        ),
        loadModelWithFallback(
          faceapi.nets.faceLandmark68Net,
          "faceLandmark68Net",
        ),
        loadModelWithFallback(
          faceapi.nets.faceExpressionNet,
          "faceExpressionNet",
        ),
        loadModelWithFallback(faceapi.nets.ageGenderNet, "ageGenderNet"),
      ]);
      setIsModelReady(true);
      setStatusLabel("Ready to analyze faces");
      setLoadingText("Everything is ready. Point your camera at a face.");
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "The face models could not be loaded.";
      setError(message);
      setLoadingText(
        "Model loading failed. Please refresh and allow the camera.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadModels();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadModels]);

  const detectFaces = useCallback(async () => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isModelReady || video.readyState !== 4) {
      return;
    }

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const summaries = resizedDetections.map((det, index) => {
      const expressionEntries = Object.entries(det.expressions || {});
      const topExpression = expressionEntries.sort((a, b) => b[1] - a[1])[0];
      const mood = topExpression ? topExpression[0] : "neutral";
      const confidence = Math.round((topExpression?.[1] ?? 0) * 100);
      const age = Math.round(det.age ?? 0);
      const gender = det.gender === "male" ? "Male" : "Female";
      const jawOutline = det.landmarks.getJawOutline();
      const points = Array.from({ length: 10 }, (_, pointIndex) => {
        const offset = Math.floor((pointIndex / 9) * (jawOutline.length - 1));
        return jawOutline[offset];
      });

      const box = {
        x: det.detection.box.x,
        y: det.detection.box.y,
        width: det.detection.box.width,
        height: det.detection.box.height,
      };

      drawDecagon(ctx, points, box, index);
      drawLabel(ctx, box, age, mood, gender, confidence);

      return {
        id: index,
        age,
        gender,
        mood,
        confidence,
        box,
      };
    });

    setFaceSummaries(summaries);
    if (summaries.length > 0) {
      setStatusLabel(
        `Detected ${summaries.length} face${summaries.length > 1 ? "s" : ""}`,
      );
    } else {
      setStatusLabel("No face detected yet");
    }
  }, [isModelReady]);

  useEffect(() => {
    if (!cameraReady || !isModelReady) {
      return;
    }

    const interval = window.setInterval(() => {
      void detectFaces();
    }, 180);

    return () => window.clearInterval(interval);
  }, [cameraReady, detectFaces, isModelReady]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Live detection",
        value:
          faceSummaries.length > 0
            ? `${faceSummaries.length} face(s)`
            : "Scanning",
        accent: "from-cyan-400 to-sky-500",
      },
      {
        title: "Current mood",
        value:
          faceSummaries[0]?.mood.replace(/_/g, " ").toUpperCase() ?? "WAITING",
        accent: "from-fuchsia-500 to-violet-500",
      },
      {
        title: "Estimated age",
        value: faceSummaries[0] ? `${faceSummaries[0].age}` : "--",
        accent: "from-amber-400 to-orange-500",
      },
    ],
    [faceSummaries],
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_40%),linear-gradient(135deg,#07111f_0%,#101d36_45%,#050816_100%)] p-4 text-slate-50 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-4xl border border-white/10 bg-slate-950/70 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Face Emotion Studio
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Real-time face detection with elegant analysis overlays
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                Let your webcam reveal facial geometry, age, and emotion in a
                cinematic experience.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {isModelReady ? "Models loaded and live" : "Loading AI models"}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-4xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_20px_70px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
                  Live camera view
                </p>
                <p className="text-lg font-semibold text-white">
                  {statusLabel}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                <Camera className="h-4 w-4 text-cyan-300" />
                {cameraReady ? "Camera on" : "Camera idle"}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90">
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                className="h-105 w-full object-cover sm:h-130"
                videoConstraints={{
                  facingMode: "user",
                  width: 1280,
                  height: 720,
                }}
                onUserMedia={() => {
                  setCameraReady(true);
                  setError("");
                }}
                onUserMediaError={(mediaError) => {
                  setCameraReady(false);
                  const message =
                    typeof mediaError === "string"
                      ? mediaError
                      : mediaError instanceof DOMException
                        ? mediaError.message
                        : "Camera access was blocked.";
                  setError(message);
                }}
              />
              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 px-6 text-center">
                  <div className="max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                    <ScanSearch className="mx-auto mb-3 h-10 w-10 text-cyan-300" />
                    <p className="text-lg font-semibold text-white">
                      Allow camera access
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      The application needs your webcam to detect facial
                      features and provide live insights.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex flex-wrap items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-fuchsia-300" />
                {loadingText}
              </div>
              {error ? <p className="mt-2 text-rose-300">{error}</p> : null}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-4xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_70px_rgba(2,6,23,0.4)] backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <Smile className="h-5 w-5 text-amber-300" />
                <h2 className="text-xl font-semibold text-white">
                  Live insights
                </h2>
              </div>
              <div className="grid gap-3">
                {summaryCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-white/10 bg-linear-to-br from-white/10 to-white/5 p-4"
                  >
                    <div
                      className={`mb-2 h-1.5 rounded-full bg-linear-to-r ${card.accent}`}
                    />
                    <p className="text-sm text-slate-400">{card.title}</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-4xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_70px_rgba(2,6,23,0.4)] backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white">How it works</h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
                <li className="flex gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  A tiny face detector locates each face in the webcam feed.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
                  Landmark points generate a smooth decagon around the face.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                  Emotion and age models estimate the person’s current mood and
                  age.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

async function loadModelWithFallback(
  model: { load: (url: string) => Promise<void> },
  name: string,
) {
  try {
    await model.load(MODEL_BASE_URL);
  } catch (error) {
    await model.load(FALLBACK_MODEL_BASE_URL);
    console.warn(`${name} loaded from fallback URL`, error);
  }
}

function drawDecagon(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  box: { x: number; y: number; width: number; height: number },
  index: number,
) {
  if (points.length < 3) {
    return;
  }

  ctx.beginPath();
  points.forEach((point, pointIndex) => {
    const x = point.x;
    const y = point.y;
    if (pointIndex === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();

  const gradient = ctx.createLinearGradient(
    box.x,
    box.y,
    box.x + box.width,
    box.y + box.height,
  );
  gradient.addColorStop(0, index % 2 === 0 ? "#22d3ee" : "#f472b6");
  gradient.addColorStop(1, "#ffffff");

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 16;
  ctx.shadowColor = "rgba(34, 211, 238, 0.35)";
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; width: number; height: number },
  age: number,
  mood: string,
  gender: string,
  confidence: number,
) {
  const labelX = box.x + box.width + 12;
  const labelY = Math.max(box.y, 24);
  const labelWidth = 180;
  const labelHeight = 74;

  ctx.fillStyle = "rgba(2, 6, 23, 0.86)";
  ctx.strokeStyle = "rgba(34, 211, 238, 0.45)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f8fafc";
  ctx.font = "600 15px sans-serif";
  ctx.fillText(`${gender} · ${age} yrs`, labelX + 16, labelY + 24);
  ctx.fillStyle = "#67e8f9";
  ctx.font = "500 13px sans-serif";
  ctx.fillText(`Mood: ${mood.replace(/_/g, " ")}`, labelX + 16, labelY + 46);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "500 12px sans-serif";
  ctx.fillText(`Confidence: ${confidence}%`, labelX + 16, labelY + 64);
}
