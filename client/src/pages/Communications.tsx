import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare,
  Send,
  Phone,
  VideoIcon,
  Bell,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Paperclip,
  Smile,
  Image,
  File,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Settings,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  X,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isYesterday } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  type: "text" | "image" | "file" | "system";
  edited?: boolean;
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

interface Conversation {
  id: string;
  type: "direct" | "group" | "support";
  name: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    status: "online" | "away" | "busy" | "offline";
    role?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  pinned: boolean;
  muted: boolean;
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export default function Communications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/communications/conversations", filterType, searchTerm],
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/communications/messages", selectedConversation?.id],
    enabled: !!selectedConversation,
    refetchInterval: 2000, // More frequent updates for messages
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/communications/notifications"],
    refetchInterval: 10000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, type = "text" }: { 
      conversationId: string; 
      content: string; 
      type?: string 
    }) => {
      return await apiRequest("POST", `/api/communications/messages`, {
        conversationId,
        content,
        type
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/communications/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communications/conversations"] });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest("PUT", `/api/communications/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications/conversations"] });
    },
  });

  // Mark notification as read
  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest("PUT", `/api/communications/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications/notifications"] });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate({
        conversationId: selectedConversation.id,
        content: newMessage.trim()
      });
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (conversation.unreadCount > 0) {
      markAsReadMutation.mutate(conversation.id);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday ' + format(date, 'HH:mm');
    } else {
      return format(date, 'MMM dd HH:mm');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredConversations = conversations.filter((conv: Conversation) => {
    const matchesSearch = searchTerm === "" || 
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || conv.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadNotifications = notifications.filter((n: Notification) => !n.read);
  const totalUnreadMessages = conversations.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
            <p className="text-gray-600 mt-2">Real-time messaging, notifications, and collaboration</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadNotifications.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-red-500">
                  {unreadNotifications.length}
                </Badge>
              )}
            </Button>
            <Button data-testid="button-new-conversation">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations Sidebar */}
          <div className="col-span-4 bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-conversations"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger data-testid="select-conversation-filter">
                  <SelectValue placeholder="Filter conversations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conversations</SelectItem>
                  <SelectItem value="direct">Direct Messages</SelectItem>
                  <SelectItem value="group">Group Chats</SelectItem>
                  <SelectItem value="support">Support Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conversation: Conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                      data-testid={`conversation-item-${conversation.id}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          {conversation.type === 'group' ? (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                          {conversation.participants.length > 0 && (
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.participants[0].status)}`} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.name}
                            </p>
                            <div className="flex items-center space-x-1">
                              {conversation.pinned && (
                                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                              )}
                              {conversation.muted && (
                                <VolumeX className="h-3 w-3 text-gray-400" />
                              )}
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-xs px-1 py-0">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-1">
                            {conversation.lastMessage && formatMessageTime(conversation.lastMessage.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="col-span-8 bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {selectedConversation.type === 'group' ? (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      {selectedConversation.participants.length > 0 && (
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedConversation.participants[0].status)}`} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.participants.length} participants
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" data-testid="button-voice-call">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsVideoCallActive(!isVideoCallActive)}
                      data-testid="button-video-call"
                    >
                      <VideoIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message: Message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {message.senderName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(message.timestamp)}
                          </span>
                          {message.edited && (
                            <span className="text-xs text-gray-400">(edited)</span>
                          )}
                        </div>
                        <div className="mt-1">
                          {message.type === 'text' ? (
                            <p className="text-sm text-gray-700">{message.content}</p>
                          ) : message.type === 'system' ? (
                            <p className="text-sm text-gray-500 italic">{message.content}</p>
                          ) : (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <File className="h-4 w-4" />
                              <span>{message.content}</span>
                            </div>
                          )}
                        </div>
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                              <button key={index} className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1 text-xs hover:bg-gray-200">
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Image className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        data-testid="input-new-message"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed right-4 top-20 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium">Notifications</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification: Notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markNotificationReadMutation.mutate(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.priority === 'urgent' ? 'bg-red-500' :
                          notification.priority === 'high' ? 'bg-orange-500' :
                          notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatMessageTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Call Overlay */}
        {isVideoCallActive && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-4 w-3/4 h-3/4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Video Call - {selectedConversation?.name}</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <VideoIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setIsVideoCallActive(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <VideoIcon className="h-16 w-16 mx-auto mb-4" />
                  <p>Video call interface would be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}