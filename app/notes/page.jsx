"use client";

import { Plus, Moon, Sun, Trash2, Send, SendIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const STORAGE_KEY = "neuroweb-notes";
const STORAGE_THEME = "neuroweb-theme";
const initialNotes = [
  {
    id: "welcome-note",
    title: "Welcome to NeuroWeb Notes",
    content:
      "This is your personal notes workspace. Add a new note, type anything, and your work will be saved automatically in the browser.",
    updatedAt: new Date().toISOString(),
  },
];

export default function Page() {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedId, setSelectedId] = useState(initialNotes[0].id);
  const [isDark, setIsDark] = useState(true);
  const [title, setTitle] = useState(initialNotes[0].title);
  const [content, setContent] = useState(initialNotes[0].content);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === selectedId) ?? notes[0],
    [notes, selectedId],
  );

  useEffect(() => {
    const savedNotes = window.localStorage.getItem(STORAGE_KEY);
    const savedTheme = window.localStorage.getItem(STORAGE_THEME);
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setNotes(parsed);
        setSelectedId(parsed[0].id ?? initialNotes[0].id);
      }
    }
    if (savedTheme) {
      setIsDark(savedTheme !== "light");
    }
  }, []);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
    }
  }, [activeNote?.id]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem(STORAGE_THEME, isDark ? "dark" : "light");
  }, [isDark]);

  const createNote = () => {
    const id = crypto?.randomUUID?.() ?? `${Date.now()}`;
    const newNote = {
      id,
      title: "New note",
      content: "Type your idea here...",
      updatedAt: new Date().toISOString(),
    };
    setNotes((current) => [newNote, ...current]);
    setSelectedId(id);
  };

  const updateNote = (changes) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === activeNote.id
          ? {
              ...note,
              ...changes,
              updatedAt: new Date().toISOString(),
            }
          : note,
      ),
    );
  };

  const removeNote = (id) => {
    setNotes((current) => {
      const filtered = current.filter((note) => note.id !== id);
      if (!filtered.length) {
        setSelectedId(initialNotes[0].id);
        return initialNotes;
      }
      if (id === selectedId) {
        setSelectedId(filtered[0].id);
      }
      return filtered;
    });
  };

  const [isSending, setIsSending] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);

  const sendNoteToAPI = async () => {
    if (!activeNote?.content?.trim()) {
      toast.error("Cannot send empty note content");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("http://localhost:8000/process-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: activeNote.id,
          title: activeNote.title,
          content: activeNote.content,
          timestamp: activeNote.updatedAt,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setProcessingResult(data);
      toast.success("Note sent to processing!");
    } catch (error) {
      console.error("Error sending note:", error);
      toast.error(`Failed to send note: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const formattedDate = (iso) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));

  return (
    <main className={`bg-${isDark ? 'dark' : 'white'} text-white py-5`}>
      <Toaster position="top-right" />
      <div className="container py-4">
        <header className="mb-4 rounded-4 shadow-lg border border-secondary p-4 bg-dark-secondary">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
            <div>
              <p className="text-uppercase small text-info mb-1">Notes Hub</p>
              <h1 className="h3 mb-2">Your modern note workspace</h1>
              <p className="text-muted mb-0">
                Save ideas instantly, switch color themes, and organize your
                notes with a responsive editor built for fast workflows.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                className="btn btn-outline-info d-flex align-items-center gap-2"
              >
                {isDark ? (
                  <Sun className="icon-sm" />
                ) : (
                  <Moon className="icon-sm" />
                )}
                {isDark ? "Light mode" : "Dark mode"}
              </button>
              <button
                type="button"
                onClick={createNote}
                className="btn btn-info text-dark d-flex align-items-center gap-2"
              >
                <Plus className="icon-sm" /> New note
              </button>
            </div>
          </div>
        </header>

        <div className="row gy-4">
          <aside className="col-lg-4">
            <div className="card bg-dark-secondary border-secondary h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="text-uppercase small text-muted mb-1">
                      Notes
                    </p>
                    <p className="mb-0 text-white-50">
                      {notes.length} saved items
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={createNote}
                    className="btn btn-sm btn-outline-info"
                  >
                    Add
                  </button>
                </div>

                <div
                  className="list-group list-group-flush overflow-auto"
                  style={{ maxHeight: "85vh" }}
                >
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(note.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(note.id);
                        }
                      }}
                      className={`list-group-item list-group-item-action bg-transparent border-0 rounded-3 mb-2 text-start ${
                        note.id === selectedId
                          ? "active text-white"
                          : "text-white-75"
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            {note.title || "Untitled note"}
                          </h6>
                          <small className="text-muted">
                            {formattedDate(note.updatedAt)}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeNote(note.id);
                          }}
                        >
                          <Trash2 className="icon-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <article className="col-lg-8">
            <div className="card bg-dark-secondary border-secondary shadow-sm">
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                  <div>
                    <p className="text-uppercase small text-info mb-1">
                      Editor
                    </p>
                    <h2 className="h4 mb-0">
                      {activeNote?.title || "Select a note"}
                    </h2>
                  </div>
                  <span className="badge rounded-pill bg-secondary text-white-50">
                    Last updated:{" "}
                    {formattedDate(
                      activeNote?.updatedAt ?? new Date().toISOString(),
                    )}
                  </span>
                </div>

                <div className="mb-4">
                  <label className="form-label text-white-75 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (activeNote) updateNote({ title: event.target.value });
                    }}
                    className="form-control form-control-dark rounded-4 bg-dark border-secondary text-white"
                    placeholder="Note title"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-white-75 mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(event) => {
                      setContent(event.target.value);
                      if (activeNote)
                        updateNote({ content: event.target.value });
                    }}
                    rows={12}
                    className="form-control form-control-dark rounded-4 bg-dark border-secondary text-white"
                    placeholder="Type your note content here..."
                  />
                </div>

                {processingResult && processingResult.summary && (
                  <div className="mb-4 p-3 rounded-3 bg-success bg-opacity-10 border border-success">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-success">AI Summary</span>
                    </div>
                    <p className="text-white mb-0">
                      {processingResult.summary}
                    </p>
                  </div>
                )}

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 pt-3 border-top border-secondary">
                  <p className="mb-0 text-white-50">
                    Responsive notes for desktop and mobile screens with
                    automatic browser persistence.
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={sendNoteToAPI}
                      disabled={isSending}
                      className="btn btn-outline-success  btn-sm d-flex align-items-center gap-2"
                    >
                      <SendIcon className="icon-sm" />{" "}
                      {isSending ? "Sending..." : "Send to Processing"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNote(activeNote.id)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      <Trash2 className="me-2 icon-sm" /> Delete current note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
