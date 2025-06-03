import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useRef } from "react";
import { MicButton } from "./MicButton";
import { SendButton } from "./SendButton";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  queryCount?: number;
  subscriptionPlan?: string;
  selectedQuestion?: string;
  userId?: string;
  initialRoleType?: "Line Holder" | "Reserve";
  onRoleChange?: (newRole: "Line Holder" | "Reserve") => void;
}

const ChatInput = ({
  onSendMessage,
  isLoading,
  queryCount,
  subscriptionPlan,
  selectedQuestion,
  disabled,
  userId,
  initialRoleType = "Line Holder",
  onRoleChange,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [roleType, setRoleType] = useState<"Line Holder" | "Reserve">(
    initialRoleType
  );
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const { toast } = useToast();
  const isSubmittingRef = useRef(false);

  // Determine if the chat input should be disabled
  const isInputDisabled =
    disabled || isLoading || (subscriptionPlan === "free" && queryCount >= 2);

  // Update role type when initialRoleType changes
  useEffect(() => {
    setRoleType(initialRoleType);
  }, [initialRoleType]);

  // Handle selectedQuestion changes - key issue fixed here
  useEffect(() => {
    // Log to debug
    console.log("Selected question changed:", selectedQuestion);

    // Directly check if selectedQuestion has a value
    if (selectedQuestion && selectedQuestion.trim() !== "") {
      setMessage(selectedQuestion);
    }
  }, [selectedQuestion]); // Removed isInputDisabled dependency

  // Update role in database
  const updateRoleType = async (newRole: "Line Holder" | "Reserve") => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID is required to update role",
      });
      return;
    }

    setIsUpdatingRole(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role_type: newRole })
        .eq("id", userId);

      if (error) throw error;

      setRoleType(newRole);
      onRoleChange?.(newRole);

      toast({
        title: "Role Updated",
        description: `Successfully switched to ${newRole}`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update role. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleRoleToggle = (checked: boolean) => {
    const newRole = checked ? "Reserve" : "Line Holder";
    updateRoleType(newRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !message.trim() ||
      isLoading ||
      isInputDisabled ||
      isSubmittingRef.current
    )
      return;

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately after submission

    // Prevent double submissions
    isSubmittingRef.current = true;
    try {
      console.log("Submitting message:", messageContent);
      await onSendMessage(messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore the message if there was an error
      setMessage(messageContent);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 w-full">
      <div className="bg-background/95 backdrop-blur-sm border-t border-border/50 w-full">
        <div className="mx-auto px-4 sm:px-6 w-full">
          {/* Chat Input Section */}
          <form onSubmit={handleSubmit} className="py-4">
            <div className="relative flex items-center">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isInputDisabled
                    ? "Chat unavailable while offline or trial ended"
                    : "Ask about your contract..."
                }
                className="min-h-[60px] w-full pr-[160px] resize-none bg-background/50 focus-visible:ring-1 focus-visible:outline-none border-brand-slate/20 focus-visible:ring-brand-purple/30 transition-all duration-300 rounded-lg"
                disabled={isInputDisabled}
                aria-label="Chat input"
                aria-describedby="chat-input-description"
              />
              <div className="absolute right-2 flex items-center space-x-1 h-full pr-1">
                <MicButton
                  onRecognized={setMessage}
                  disabled={isInputDisabled}
                />
                <SendButton
                  isLoading={isLoading}
                  disabled={!message.trim() || isInputDisabled}
                />
              </div>
            </div>
          </form>
          {/* Role Toggle Section */}
          <div className="py-3 border-t border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-primary/10 rounded-full">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    Role: {roleType}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {roleType === "Line Holder"
                      ? "Primary contract holder"
                      : "Reserve position"}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {roleType === "Line Holder" ? "Line" : "Reserve"}
                </span>
                <Switch
                  checked={roleType === "Reserve"}
                  onCheckedChange={handleRoleToggle}
                  disabled={isUpdatingRole || !userId}
                  className="scale-75 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-blue-500"
                />
              </div>
            </div>
          </div>
          <p
            id="chat-input-description"
            className="text-xs text-muted-foreground/70 text-center pb-2"
          >
            SkyGuide can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
