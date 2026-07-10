"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessagesSquareIcon, SendIcon, Loader2, WifiIcon } from "lucide-react";
import React, { ChangeEvent, useState } from "react";

export function Header(): React.JSX.Element {
  return (
    <div className="bg-linear-to-r mt-2 rounded-4 mx-3 from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="flex flex-col lg:flex-row justify-center items-center gap-4 py-4 px-4">
        <MessagesSquareIcon size={64} className="text-white drop-shadow-lg" />
        <h1 className="text-5xl lg:text-6xl font-bold text-white drop-shadow-md">
          NeuroChat
        </h1>
      </div>
      <p className="text-center text-blue-100 text-lg pb-2 px-4">
        Your #1 best chatting platform for families
      </p>
    </div>
  );
}

export const ChannelConnect = ({
  channelTitle,
  handleChannelTitleChange,
  submitChannel,
}: {
  channelTitle: string;
  handleChannelTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  submitChannel: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    submitChannel();
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          title="connect to a channel"
          className="fixed top-6 btn  right-6 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg px-6 py-2 shadow-lg hover:shadow-xl transition-all z-40"
          onClick={() => setIsOpen(true)}
        >
          <WifiIcon size={50} />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-linear-to-b from-slate-900 to-slate-800 border border-slate-700 rounded-xl shadow-2xl">
        <DialogHeader>
          <h2 className="text-2xl font-bold text-white text-center">
            Join a Channel
          </h2>
          <p className="text-lg text-gray-300 text-center">
            Enter a channel name to start chatting
          </p>
        </DialogHeader>

        <div className="py-4">
          <div>
            <label
              htmlFor="channel-input"
              className="text-lg mt-0 font-semibold text-gray-200 block mb-2"
            >
              Channel Name
            </label>
            <Input
              id="channel-input"
              value={channelTitle}
              onChange={handleChannelTitleChange}
              onKeyPress={handleKeyPress}
              placeholder="e.g., somto or chisom"
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2">
              Available channels:{" "}
              <span className="text-blue-400 font-semibold">somto</span>,{" "}
              <span className="text-blue-400 font-semibold">chisom</span>
            </p>
          </div>

          <div className="flex gap-3">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="flex-1 rounded text-white  border-slate-600 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={!channelTitle.trim()}
              className="flex-1 rounded bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const CredentialBar = ({
  channel,
  content,
  handleChange,
  sendMessage,
}: {
  channel: string;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  content: string;
  sendMessage: () => void;
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;

    setIsSending(true);
    try {
      await sendMessage();
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && content.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-linear-to-t from-slate-900 to-slate-800 border-t border-slate-700 p-4 shadow-xl">
      <div className="flex gap-3">
        <Input
          value={content}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          disabled={!channel}
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || !channel || isSending}
          className="bg-linear-to-r rounded from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <SendIcon size={18} />
          )}
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>

      {channel && (
        <div className="mt-3 p-3 bg-linear-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-lg">
          <p className="text-lg sm:text-sm text-gray-200">
            📍 Connected to{" "}
            <span className="font-bold text-lg text-blue-300 capitalize">
              {channel} channel
            </span>
          </p>
        </div>
      )}

      {!channel && (
        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
          <p className="text-xs sm:text-sm text-yellow-300">
            ⚠️ Select a channel from the button above to start chatting
          </p>
        </div>
      )}
    </div>
  );
};

export const MessageBox = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "user" | "system";
}) => {
  const baseStyle =
    "rounded-lg p-4 mb-3 wrap-break-word shadow-md border transition-all hover:shadow-lg";

  const variantStyles = {
    default: "bg-slate-700 border-slate-600 text-white",
    user: "bg-linear-to-r from-blue-600 to-purple-600 border-blue-500 text-white ml-8",
    system:
      "bg-linear-to-r from-slate-600 to-slate-700 border-slate-500 text-gray-100 italic",
  };

  return (
    <div className={`${baseStyle} ${variantStyles[variant]}`}>{children}</div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-full gap-2">
      <Loader2 className="animate-spin text-blue-500" size={24} />
      <p className="text-gray-400">Loading messages...</p>
    </div>
  );
};

export const EmptyState = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <MessagesSquareIcon size={48} className="text-gray-500" />
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  );
};
