import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Inbox, Mail, Search, Plus } from 'lucide-react';
import { parentAPI, Message, Teacher } from '@/services/parentApi';
import { useToast } from '@/hooks/use-toast';

const MessagesPage: React.FC = () => {
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // Compose form state
  const [recipientId, setRecipientId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchTeachers();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await parentAPI.getMessages();
      setMessages(data.messages);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch messages'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await parentAPI.getTeachers();
      setTeachers(data.teachers);
    } catch (error: any) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!recipientId || !subject.trim() || !content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields'
      });
      return;
    }

    setSending(true);
    try {
      await parentAPI.sendMessage({
        recipient_id: parseInt(recipientId),
        subject: subject.trim(),
        content: content.trim()
      });

      toast({
        title: 'Success',
        description: 'Message sent successfully'
      });

      // Reset form
      setRecipientId('');
      setSubject('');
      setContent('');
      setComposeDialogOpen(false);

      // Refresh messages
      fetchMessages();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to send message'
      });
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.subject.toLowerCase().includes(query) ||
      message.content.toLowerCase().includes(query) ||
      message.sender.name.toLowerCase().includes(query) ||
      message.recipient.name.toLowerCase().includes(query)
    );
  });

  const inboxMessages = filteredMessages.filter(m => m.recipient.name !== 'You');
  const sentMessages = filteredMessages.filter(m => m.sender.name === 'You');

  const MessageList = ({ messagesList }: { messagesList: Message[] }) => (
    <div className="space-y-3">
      {messagesList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No messages found</p>
        </div>
      ) : (
        messagesList.map((message) => (
          <Card
            key={message.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedMessage(message)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">{message.subject}</CardTitle>
                    {!message.is_read && <Badge variant="default">New</Badge>}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <span className="font-medium">
                      {message.sender.name === 'You' ? `To: ${message.recipient.name}` : `From: ${message.sender.name}`}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(message.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                      })}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {message.content}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with teachers</p>
        </div>
        <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
              <DialogDescription>Send a message to a teacher</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Recipient</label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={String(teacher.id)}>
                        {teacher.name} - {teacher.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  placeholder="Type your message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setComposeDialogOpen(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} disabled={sending}>
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages Tabs */}
      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            Inbox ({inboxMessages.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Sent ({sentMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <MessageList messagesList={inboxMessages} />
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <MessageList messagesList={sentMessages} />
          )}
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <span>From: {selectedMessage.sender.name}</span>
                    <span>•</span>
                    <span>To: {selectedMessage.recipient.name}</span>
                    <span>•</span>
                    <span>
                      {new Date(selectedMessage.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                      })}
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {selectedMessage.content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesPage;
