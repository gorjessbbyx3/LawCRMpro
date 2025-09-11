import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, X, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock user ID - in real app this would come from auth context
const USER_ID = "user-1";

const suggestedPrompts = [
  "Lack of jurisdiction",
  "Failure to state claim", 
  "Statute of limitations",
  "Help with contract review",
  "Hawaii legal requirements",
];

export default function AIPanel({ isOpen, onClose }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI legal assistant. I can help you with:\n\n• Legal research and case law\n• Document drafting\n• Hawaii compliance questions\n• Case strategy suggestions\n\nWhat can I help you with today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        query,
        userId: USER_ID,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + "-assistant",
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      content: `Can you help me draft a motion to dismiss based on: ${prompt}`,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(userMessage.content);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-6 w-96 h-96 bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col" data-testid="ai-panel">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="text-primary w-5 h-5" />
          <CardTitle className="text-base">Groq AI Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-ai">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4" data-testid="ai-messages">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.isUser
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted mr-8"
                }`}
                data-testid={`ai-message-${message.id}`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {!message.isUser && message.id === "welcome" && (
                  <div className="mt-3 space-y-1">
                    {suggestedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="secondary"
                        className="text-xs mr-1 mb-1"
                        onClick={() => handleSuggestedPrompt(prompt)}
                        data-testid={`ai-suggestion-${index}`}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="bg-muted mr-8 p-3 rounded-lg" data-testid="ai-loading">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 text-sm"
              disabled={chatMutation.isPending}
              data-testid="ai-input"
            />
            <Button 
              type="submit"
              size="sm"
              disabled={chatMutation.isPending || !inputValue.trim()}
              data-testid="button-send-ai"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </div>
  );
}
