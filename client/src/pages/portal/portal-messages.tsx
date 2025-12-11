import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MessageSquare, Send, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { usePortalAuth } from '@/lib/portal-auth';

interface PortalMessage {
  id: string;
  caseId?: string;
  subject?: string;
  content: string;
  senderType: 'client' | 'attorney';
  isRead: boolean;
  createdAt: string;
}

interface Case {
  id: string;
  caseNumber: string;
  title: string;
}

export default function PortalMessages() {
  const { user } = usePortalAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  const { data: messages, isLoading: messagesLoading } = useQuery<PortalMessage[]>({
    queryKey: ['/api/portal/messages'],
  });

  const { data: cases } = useQuery<Case[]>({
    queryKey: ['/api/portal/cases'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { caseId?: string; subject?: string; content: string }) => {
      const response = await apiRequest('POST', '/api/portal/messages', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/messages'] });
      setSubject('');
      setContent('');
      setSelectedCaseId('');
      toast({
        title: 'Message sent',
        description: 'Your message has been sent to your attorney.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = () => {
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message.',
        variant: 'destructive',
      });
      return;
    }

    sendMessageMutation.mutate({
      caseId: selectedCaseId || undefined,
      subject: subject || undefined,
      content,
    });
  };

  if (messagesLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Messages
        </h1>
        <p className="text-muted-foreground">Communicate securely with your attorney</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send a Message</CardTitle>
          <CardDescription>Your attorney will receive your message and respond when available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cases && cases.length > 0 && (
            <div>
              <label className="text-sm font-medium">Related Case (optional)</label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger data-testid="select-case">
                  <SelectValue placeholder="Select a case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific case</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Subject (optional)</label>
            <Input
              placeholder="Message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              data-testid="input-message-subject"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Type your message here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32"
              data-testid="input-message-content"
            />
          </div>

          <Button 
            onClick={handleSendMessage} 
            disabled={sendMessageMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="mr-2 h-4 w-4" />
            {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>Previous conversations</CardDescription>
        </CardHeader>
        <CardContent>
          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 rounded-md ${
                    message.senderType === 'client' 
                      ? 'bg-primary/10 ml-8' 
                      : 'bg-muted mr-8'
                  }`}
                  data-testid={`message-${message.id}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {message.senderType === 'client' ? 'You' : 'Your Attorney'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {message.subject && (
                    <p className="font-medium mb-1">{message.subject}</p>
                  )}
                  <p className="text-muted-foreground whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet. Send your first message above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
