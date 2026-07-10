/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { ChangeEvent, useEffect, useState, useRef } from "react";
import {
  ChannelConnect,
  CredentialBar,
  Header,
  LoadingSpinner,
  EmptyState,
} from "./components";
import { supabase } from "./supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";
import { TrashIcon } from "lucide-react";

interface Message {
  id: any;
  content: string;
  timestamp: any;
  channel: string;
}

const VALID_CHANNELS = ["chisom", "somto"];

export default function HomePage() {
  const [channelTitle, setChannelTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [currentActiveChannel, setCurrentActiveChannel] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function deleteMessage(id: string) {
    if (!currentActiveChannel) {
      toast.error("Please connect to a channel first");
      return;
    }

    const tableName = currentActiveChannel;

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .match({ id, channel: currentActiveChannel });

      if (error) {
        throw error;
      }

      setMessages((prev) => prev.filter((message) => message.id !== id));
      toast.success("Message deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "There was a problem deleting the message";
      console.error("Delete error:", errorMessage);
      toast.error(errorMessage);
    }
  }

  // Load initial messages and setup realtime listener
  useEffect(() => {
    if (
      !currentActiveChannel ||
      !VALID_CHANNELS.includes(currentActiveChannel)
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const setupChannel = async () => {
      try {
        // Verify Supabase is initialized
        if (!supabase) {
          throw new Error(
            "Supabase client not initialized. Check your environment variables.",
          );
        }

        // Check if environment variables are configured
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (
          !url ||
          url.includes("your-project") ||
          !key ||
          key.includes("your-anon-key")
        ) {
          throw new Error(
            "Supabase credentials not configured. Please update .env.local with your Supabase URL and Anon Key.",
          );
        }

        // Fetch existing messages from the channel table
        const { data, error: fetchError } = await supabase
          .from(currentActiveChannel)
          .select("*")
          .eq("channel", currentActiveChannel) // Ensure we only get messages from this channel
          .order("timestamp", { ascending: true });

        if (fetchError) {
          console.error("Fetch error details:", fetchError);

          // Check if table exists
          if (fetchError.code === "PGRST116") {
            throw new Error(
              `Table "${currentActiveChannel}" does not exist in your Supabase database. Please create it first.`,
            );
          }

          // Check for auth issues
          if (fetchError.code === "42P01") {
            throw new Error(
              `Database table "${currentActiveChannel}" not found. Create the table in Supabase.`,
            );
          }

          throw new Error(
            `Failed to fetch messages: ${fetchError.message || JSON.stringify(fetchError)}`,
          );
        }

        // Type-safe message assignment and filtering
        const typedMessages = (data || [])
          .filter((msg: any) => msg.channel === currentActiveChannel)
          .map((msg: any) => ({
            id: msg.id || "",
            content: msg.content || "",
            timestamp: msg.timestamp || new Date().toISOString(),
            channel: msg.channel || currentActiveChannel,
          })) as Message[];

        setMessages(typedMessages);
        console.log(
          `📨 Loaded ${typedMessages.length} messages from ${currentActiveChannel}`,
        );
        toast.success(`✨ Connected to ${currentActiveChannel}!`);

        // Cleanup previous channel
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          console.log("🔌 Cleaned up previous channel subscription");
        }

        // Setup realtime listener for this specific channel
        const channel = supabase
          .channel(`${currentActiveChannel}:*`, {
            config: {
              broadcast: { self: true },
              presence: { key: currentActiveChannel },
            },
          })
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: currentActiveChannel,
              filter: `channel=eq.${currentActiveChannel}`,
            },
            (payload) => {
              console.log(
                `📩 Realtime: New message in ${currentActiveChannel}:`,
                payload,
              );
              const newMessage = payload.new as Message;

              // Only add if from current channel and not duplicate
              if (newMessage && newMessage.channel === currentActiveChannel) {
                setMessages((prev) => {
                  // Check if message already exists (prevent duplicates)
                  const exists = prev.some((msg) => msg.id === newMessage.id);
                  if (exists) {
                    console.log("🔄 Duplicate message skipped:", newMessage.id);
                    return prev;
                  }
                  console.log("✅ New message added to UI:", newMessage.id);
                  return [...prev, newMessage];
                });
              }
            },
          )
          .on(
            "postgres_changes",
            {
              event: "DELETE",
              schema: "public",
              table: currentActiveChannel,
              filter: `channel=eq.${currentActiveChannel}`,
            },
            (payload) => {
              const deletedMessage = payload.old as Message;
              if (deletedMessage?.id) {
                setMessages((prev) =>
                  prev.filter((msg) => msg.id !== deletedMessage.id),
                );
              }
            },
          )
          .subscribe((status, err) => {
            if (status === "SUBSCRIBED") {
              console.log(
                `✅ REALTIME ACTIVE: Listening to ${currentActiveChannel}`,
              );
              toast.success(
                `🔴 Live updates enabled for ${currentActiveChannel}`,
              );
            } else if (status === "CHANNEL_ERROR") {
              console.error("❌ Realtime channel error:", err);
              toast.error(
                "Realtime sync temporarily unavailable (auto-retry active)",
              );
            } else if (status === "CLOSED") {
              console.log("🔌 Realtime channel closed");
            } else if (status === "TIMED_OUT") {
              console.warn("⏱️ Realtime connection timed out");
            }
          });

        channelRef.current = channel;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error setting up channel:", errorMessage);
        setError(errorMessage);
        toast.error(`Failed to connect: ${errorMessage}`);
        setCurrentActiveChannel("");
      } finally {
        setIsLoading(false);
      }
    };

    setupChannel();

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentActiveChannel]);

  const handleChannelTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChannelTitle(event.target.value);
  };

  const subscribeChannel = async () => {
    if (
      !channelTitle.trim() ||
      (channelTitle != "somto" && channelTitle != "chisom")
    ) {
      toast.error("Please enter a channel name appriopriately");
      return;
    }

    if (!VALID_CHANNELS.includes(channelTitle)) {
      toast.error(
        `Invalid channel. Valid channels: ${VALID_CHANNELS.join(", ")}`,
      );
      return;
    }

    setCurrentActiveChannel(channelTitle);
    setChannelTitle("");
  };

  const sendMessage = async () => {
    if (!content.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!currentActiveChannel) {
      toast.error("Please connect to a channel first");
      return;
    }

    try {
      // Create the message object with all required fields
      const newMessage: Message = {
        id: crypto.randomUUID(),
        content: content.trim(),
        timestamp: new Date().toISOString(),
        channel: currentActiveChannel,
      };

      // Optimistic update - show message immediately in UI
      setMessages((prev) => [...prev, newMessage]);
      setContent(""); // Clear input immediately

      // Send to database
      const { error: sendError } = await supabase
        .from(currentActiveChannel)
        .insert([newMessage]);

      if (sendError) {
        // If database insert fails, remove the optimistic message
        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
        throw new Error(sendError.message);
      }

      // Success - message is saved and visible
      console.log(`✅ Message sent to ${currentActiveChannel}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      console.error("Error sending message:", errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Header />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/20 border-l-4 mt-3 border-red-500 p-2 text-red-200">
          <p className="text-lg mt-2 text-red-300">
            ⚠️Sorry but an error occurred make sure that you have available
            internet connection then try again
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {currentActiveChannel ? (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-800/50">
                {isLoading ? (
                  <LoadingSpinner />
                ) : messages.length === 0 ? (
                  <EmptyState message="No messages yet" />
                ) : (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="group flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="flex-1 justify-between flex bg-linear-to-r from-slate-700 to-slate-600 rounded-lg p-3 hover:from-slate-600 hover:to-slate-500 transition-all hover:shadow-md">
                          <div>
                            <p className="text-white text-sm wrap-break-word">
                              {msg.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>

                          <button
                            title="delete message"
                            onClick={() => {
                              deleteMessage(msg.id);
                            }}
                            className="btn p-2 hover:bg-slate-700 bg-black btn-warning active:bg-black/35 rounded-4"
                          >
                            <TrashIcon size={30} className="text-orange-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <CredentialBar
                content={content}
                sendMessage={sendMessage}
                handleChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setContent(e.target.value)
                }
                channel={currentActiveChannel}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState message="👉 Select a channel to start chatting" />
            </div>
          )}
        </div>
      </div>

      {/* Channel Connect Dialog */}
      <ChannelConnect
        handleChannelTitleChange={handleChannelTitleChange}
        channelTitle={channelTitle}
        submitChannel={subscribeChannel}
      />
    </div>
  );
}
