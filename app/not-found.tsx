"use client";
import { Card } from "@/components/ui/card";
import { BadgeQuestionMarkIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className=" w-50">
        <Card className="bg-dark-secondary border-info border justify-center items-center rounded-4 p-3 flex flex-column">
          <BadgeQuestionMarkIcon size={50} className="bg-danger rounded-4" />
          <p className="mb-6 font-bold text-xl">
            I am sorry but the page you searched could not be found
          </p>
          <button
            className="btn btn-primary text-lg"
            onClick={() => redirect("/")}
          >
            go to the home page
          </button>
        </Card>
      </div>
    </div>
  );
}
