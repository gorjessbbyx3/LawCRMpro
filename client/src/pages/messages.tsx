import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageSchema, type Message, type Case } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MessageSquare, Mail, Smartphone, Send, MailOpen } from "lucide-react";
import { format } from "date-fns";

// Mock user ID - in real app this would come from auth context
const USER_ID = "user-1";

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["/api/cases"],
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest("PUT", `/api/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: {
      subject: "",
      content: "",
      recipientEmail: "",
      messageType: "email",
      caseId: "",
      senderId: USER_ID,
    },
  });

  const onSubmit = (data: any) => {
    createMessageMutation.mutate(data);
  };

  const filteredMessages = messages.filter((message: Message) => {
    const matchesSearch = 
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || message.messageType === filterType;
    return matchesSearch && matchesType;
  });

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "sms":
        return <Smartphone className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "default";
      case "delivered":
        return "secondary";
      case "read":
        return "outline";
      case "draft":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const unreadCount = messages.filter((msg: Message) => !msg.isRead).length;
  const totalMessages = messages.length;
  const sentToday = messages.filter((msg: Message) => {
    const today = new Date();
    const msgDate = new Date(msg.sentAt || "");
    return msgDate.toDateString() === today.toDateString();
  }).length;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
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
          <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" data-testid="unread-count">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-compose-message">
              <Plus className="w-4 h-4 mr-2" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="messageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-message-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recipientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="email@example.com or phone number"
                            data-testid="input-recipient"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="caseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Case (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-case">
                            <SelectValue placeholder="Select case" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No case</SelectItem>
                          {cases.map((caseItem: Case) => (
                            <SelectItem key={caseItem.id} value={caseItem.id}>
                              {caseItem.title} (#{caseItem.caseNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Message subject" data-testid="input-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Type your message here..."
                          className="min-h-32"
                          data-testid="textarea-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMessageMutation.isPending} data-testid="button-send-message">
                    <Send className="w-4 h-4 mr-2" />
                    {createMessageMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-messages">
                  {totalMessages}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold text-foreground" data-testid="unread-messages">
                  {unreadCount}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <MailOpen className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent Today</p>
                <p className="text-2xl font-bold text-foreground" data-testid="sent-today">
                  {sentToday}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Send className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-messages"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48" data-testid="select-type-filter">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-messages">
                {searchTerm || filterType !== "all"
                  ? "No messages found matching your criteria."
                  : "No messages yet. Send your first message to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message: Message) => {
            const caseInfo = cases.find((c: Case) => c.id === message.caseId);
            
            return (
              <Card 
                key={message.id} 
                className={`hover:shadow-md transition-shadow ${!message.isRead ? "border-l-4 border-l-primary" : ""}`}
                data-testid={`message-card-${message.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getMessageIcon(message.messageType)}
                        <h3 className={`font-medium ${!message.isRead ? "font-semibold" : ""}`} data-testid={`message-subject-${message.id}`}>
                          {message.subject || "No Subject"}
                        </h3>
                        {!message.isRead && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        <Badge 
                          variant={getStatusColor(message.status || "sent")}
                          className="text-xs"
                          data-testid={`message-status-${message.id}`}
                        >
                          {message.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-1" data-testid={`message-recipient-${message.id}`}>
                        To: {message.recipientEmail}
                      </p>

                      {caseInfo && (
                        <p className="text-sm text-muted-foreground mb-2" data-testid={`message-case-${message.id}`}>
                          Case: {caseInfo.title} (#{caseInfo.caseNumber})
                        </p>
                      )}

                      <p className="text-sm text-foreground mb-2 line-clamp-2" data-testid={`message-content-${message.id}`}>
                        {message.content}
                      </p>

                      <p className="text-xs text-muted-foreground" data-testid={`message-date-${message.id}`}>
                        {format(new Date(message.sentAt || ""), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!message.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsReadMutation.mutate(message.id)}
                          disabled={markAsReadMutation.isPending}
                          data-testid={`button-mark-read-${message.id}`}
                        >
                          Mark as Read
                        </Button>
                      )}
                      <Badge variant="outline" className="text-xs" data-testid={`message-type-${message.id}`}>
                        {message.messageType}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
