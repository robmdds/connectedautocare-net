import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Send, 
  User, 
  MessageCircle, 
  FileText,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: string;
  helpful?: boolean;
}

interface AssistantContext {
  type: "general" | "claims" | "quotes" | "policy" | "technical";
  data?: any;
}

export default function AIAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I'm your TPA platform AI assistant. I can help you with policy questions, claims guidance, quote explanations, and operational support. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState<AssistantContext>({ type: "general" });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch knowledge base topics for context
  const { data: knowledgeTopics } = useQuery({
    queryKey: ["/api/ai/knowledge-topics"],
  });

  // Send message to AI assistant
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; context: AssistantContext; history: ChatMessage[] }) => {
      return await apiRequest("POST", "/api/ai/chat", data);
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response.message,
        timestamp: new Date(),
        context: response.context
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    sendMessageMutation.mutate({
      message: input.trim(),
      context,
      history: messages.slice(-10) // Send last 10 messages for context
    });

    setInput("");
  };

  const handleFeedback = async (messageId: string, helpful: boolean) => {
    try {
      await apiRequest("POST", "/api/ai/feedback", { messageId, helpful });
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, helpful } : msg
        )
      );
      toast({
        title: "Feedback Recorded",
        description: "Thank you for helping improve our AI assistant",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record feedback",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const quickActions = [
    { label: "Explain claim process", context: "claims", query: "How do I file a claim?" },
    { label: "Quote pricing help", context: "quotes", query: "Why is my quote this price?" },
    { label: "Policy coverage", context: "policy", query: "What does my policy cover?" },
    { label: "Technical support", context: "technical", query: "I'm having technical issues" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Bot className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
            </div>
            <p className="text-gray-600">
              Get instant help with policies, claims, quotes, and platform guidance
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Context & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={context.type}
                    onValueChange={(value: any) => setContext({ type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Help</SelectItem>
                      <SelectItem value="claims">Claims Support</SelectItem>
                      <SelectItem value="quotes">Quote Questions</SelectItem>
                      <SelectItem value="policy">Policy Info</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        setContext({ type: action.context as any });
                        setInput(action.query);
                      }}
                    >
                      <HelpCircle className="h-3 w-3 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-xs text-gray-600">
                    <Lightbulb className="h-3 w-3 mr-2 text-yellow-500" />
                    Smart contextual responses
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <FileText className="h-3 w-3 mr-2 text-blue-500" />
                    Policy document analysis
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <MessageCircle className="h-3 w-3 mr-2 text-green-500" />
                    24/7 availability
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bot className="h-5 w-5 text-blue-600 mr-2" />
                      <CardTitle className="text-lg">TPA Assistant</CardTitle>
                      <Badge className="ml-2" variant="secondary">
                        {context.type}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setMessages([messages[0]])}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === "assistant" && (
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          {message.type === "user" && (
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(message.content)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {message.type === "assistant" && message.id !== "welcome" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleFeedback(message.id, true)}
                                    >
                                      <ThumbsUp 
                                        className={`h-3 w-3 ${
                                          message.helpful === true ? "text-green-600" : ""
                                        }`} 
                                      />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleFeedback(message.id, false)}
                                    >
                                      <ThumbsDown 
                                        className={`h-3 w-3 ${
                                          message.helpful === false ? "text-red-600" : ""
                                        }`} 
                                      />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask a question about policies, claims, or quotes..."
                      disabled={sendMessageMutation.isPending}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!input.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2">
                    AI responses may contain errors. Always verify important information with official documentation.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}