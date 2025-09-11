import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AIPanel from "@/components/ai/ai-panel";
import { Bot, MessageSquare, FileText, Search, Scale, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import type { AiConversation } from "@shared/schema";

// Mock user ID - in real app this would come from auth context
const USER_ID = "user-1";

const featuresData = [
  {
    icon: Search,
    title: "Legal Research",
    description: "Get help with case law research, legal precedents, and statutory interpretation",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: FileText,
    title: "Document Drafting",
    description: "Assist with drafting motions, contracts, letters, and other legal documents",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Scale,
    title: "Hawaii Law Compliance",
    description: "Guidance on Hawaii-specific legal requirements, deadlines, and regulations",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Lightbulb,
    title: "Case Strategy",
    description: "Strategic insights and suggestions for case planning and execution",
    color: "bg-purple-100 text-purple-600",
  },
];

const examplePrompts = [
  "Help me draft a motion to dismiss for lack of jurisdiction",
  "What are the Hawaii-specific requirements for estate planning?",
  "Research recent Hawaii Supreme Court cases on personal injury",
  "Create a client intake checklist for business law cases",
  "Draft a cease and desist letter for trademark infringement",
  "What are the statute of limitations for contract disputes in Hawaii?",
];

export default function AIAssistant() {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/ai/conversations", USER_ID],
  });

  const recentConversations = conversations.slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bot className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">AI Legal Assistant</h1>
            <p className="text-sm text-muted-foreground">Powered by Groq AI</p>
          </div>
        </div>
        <Button onClick={() => setIsAIPanelOpen(true)} data-testid="button-open-ai-chat">
          <MessageSquare className="w-4 h-4 mr-2" />
          Start Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>What I Can Help You With</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuresData.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50" data-testid={`feature-${index}`}>
                  <div className={`p-2 rounded-full ${feature.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Conversations</CardTitle>
              <Badge variant="secondary" data-testid="conversation-count">
                {conversations.length} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {recentConversations.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" data-testid="no-conversations">
                  No conversations yet. Start your first chat to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentConversations.map((conversation: AiConversation) => (
                  <div 
                    key={conversation.id} 
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    data-testid={`conversation-${conversation.id}`}
                  >
                    <p className="text-sm font-medium text-foreground mb-1" data-testid={`conversation-query-${conversation.id}`}>
                      {conversation.query.length > 60 
                        ? `${conversation.query.substring(0, 60)}...` 
                        : conversation.query}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`conversation-date-${conversation.id}`}>
                      {format(new Date(conversation.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Example Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Example Questions to Get Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examplePrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left justify-start"
                onClick={() => setIsAIPanelOpen(true)}
                data-testid={`example-prompt-${index}`}
              >
                <div>
                  <p className="font-medium text-sm">{prompt}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to use this prompt</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>Tips for Best Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Be specific about your jurisdiction (Hawaii law)</li>
              <li>• Provide context about your case or situation</li>
              <li>• Ask for step-by-step guidance when needed</li>
            </ul>
            <ul className="space-y-2">
              <li>• Request specific document templates or formats</li>
              <li>• Ask for legal research on recent cases</li>
              <li>• Remember to verify all information independently</li>
            </ul>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This AI assistant provides general legal information and should not be considered as legal advice. 
              Always verify information and consult with qualified legal professionals for specific cases.
            </p>
          </div>
        </CardContent>
      </Card>

      <AIPanel isOpen={isAIPanelOpen} onClose={() => setIsAIPanelOpen(false)} />
    </div>
  );
}
