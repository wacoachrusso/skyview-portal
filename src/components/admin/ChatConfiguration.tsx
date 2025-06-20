import { RefreshCcw, PlayCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useTheme } from "../theme-provider";

const ChatConfiguration = () => {
  const { toast } = useToast();
  const [chatServiceUrl, setChatServiceUrl] = useState("");
  const [maxToken, setMaxToken] = useState("700");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const getContentBackgroundClass = () => {
    if (theme === "light") {
      return "bg-white border-gray-200 shadow-lg";
    } else {
      return "bg-gray-900 border-gray-700 shadow-md";
    }
  };

  const getTextClass = () => {
    return theme === "light" ? "text-gray-800" : "text-gray-200";
  };

  const getHighlightClass = () => {
    return theme === "light"
      ? "data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700"
      : "data-[highlighted]:bg-blue-900/40 data-[highlighted]:text-blue-200";
  };
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("app_configs") // ← updated here
        .select("key, value")
        .in("key", ["chat_service_url", "chat_max_token"]);
  
      if (error) throw error;
  
      const settings = Object.fromEntries(data.map((s) => [s.key, s.value]));
  
      setChatServiceUrl(settings.chat_service_url ? String(settings.chat_service_url) : "");
      setMaxToken(settings.chat_max_token ? String(settings.chat_max_token) : "");
    } catch (err) {
      console.error("Error fetching settings:", err);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleSave = async () => {
    try {
      setLoading(true);
  
      const updates = [
        {
          key: "chat_service_url",
          value: chatServiceUrl,
        },
        {
          key: "chat_max_token",
          value: maxToken,
        },
      ];
  
      const { error } = await supabase
        .from("app_configs") // ← updated here
        .upsert(updates); // optional: add { onConflict: ["key"] } if needed
  
      if (error) throw error;
  
      toast({
        title: "Configured Successfully",
        description: "Settings updated successfully",
      });
  
      await fetchSettings(); // Re-fetch to reflect updated values
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Chat Configuration Manager</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              disabled={loading}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Manage and customize chat service endpoints and token limits
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-6">
          <Label>Chat Service URL</Label>
          <Select value={chatServiceUrl} onValueChange={setChatServiceUrl}>
            <SelectTrigger
              className=""
            >
              <SelectValue placeholder="Select an endpoint" />
            </SelectTrigger>
            <SelectContent  className={`${getContentBackgroundClass()}`}>
              <SelectItem
                value="https://chat.skyguide.site/chat-completion"
                className={`${getTextClass()} ${getHighlightClass()}`}
              >
                AWS Endpoint
              </SelectItem>
              <SelectItem
                value="https://xnlzqsoujwsffoxhhybk.supabase.co/functions/v1/chat-completion"
                className={`${getTextClass()} ${getHighlightClass()}`}
              >
                Supabase Endpoint
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6"> 
          <Label>Max Token</Label>
          <Input
            type="number"
            min={100}
            value={maxToken}
            onChange={(e) => setMaxToken(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatConfiguration;
