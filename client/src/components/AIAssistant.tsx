import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  SendIcon, 
  MinusIcon, 
  XIcon,
  MessageCircleIcon,
  HelpCircleIcon,
  FileTextIcon,
  ClipboardListIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AIMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
}

export default function AIAssistant() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I'm your AI assistant. I can help you with policy comparisons, claim guidance, and answer questions about insurance coverage. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "How do I file a claim?",
        "What does comprehensive coverage include?",
        "Compare policy options",
        "Explain deductibles"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; context?: any }) => {
      const response = await apiRequest("POST", "/api/ai/chat", data);
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
        actions: data.actions,
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "AI Assistant Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive",
      });
      
      // Add fallback message
      const fallbackMessage: AIMessage = {
        id: `fallback-${Date.now()}`,
        type: "assistant",
        content: "I'm having trouble processing your request right now. Please try rephrasing your question or contact support for assistance.",
        timestamp: new Date(),
        suggestions: [
          "How do I file a claim?",
          "What coverage do I need?",
          "Contact support"
        ]
      };
      setMessages(prev => [...prev, fallbackMessage]);
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    sendMessageMutation.mutate({
      message: inputMessage,
      context: {
        // Add context like current page, user info, etc.
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
      }
    });

    setInputMessage("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleActionClick = (action: any) => {
    if (action.type === "navigate" && action.data?.route) {
      window.location.href = action.data.route;
    }
  };

  const quickActions = [
    { icon: FileTextIcon, label: "Policy Help", message: "Tell me about my policy options" },
    { icon: ClipboardListIcon, label: "Claims Guide", message: "How do I file a claim?" },
    { icon: HelpCircleIcon, label: "Coverage Info", message: "What coverage do I need?" },
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-xl transition-all duration-200 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <CardTitle className="flex items-center text-sm">
            <Bot className="w-4 h-4 mr-2 text-primary" />
            AI Assistant
            <Badge variant="secondary" className="ml-2 text-xs">Online</Badge>
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 p-0"
            >
              <MinusIcon className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 p-0"
            >
              <XIcon className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[436px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleActionClick(action)}
                            className="block w-full text-left text-xs bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {sendMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      <p className="text-sm text-gray-600">AI is thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(action.message)}
                      className="flex items-center text-xs bg-white border rounded-full px-2 py-1 hover:bg-gray-50 transition-colors"
                    >
                      <action.icon className="w-3 h-3 mr-1" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about insurance..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                  size="sm"
                >
                  <SendIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
