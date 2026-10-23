import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Mail, Phone, Calendar, Monitor, RefreshCw } from 'lucide-react';
import { getContactMessages } from '../../services/api';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Visitor Messages</h1>
        <Button onClick={fetchMessages} variant="outline" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="animate-spin" size={16} />
              Refreshing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <RefreshCw size={16} />
              Refresh Messages
            </span>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="pt-6">
            <div className="text-danger font-medium">{error}</div>
          </CardContent>
        </Card>
      )}

      {!error && !loading && messages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-text-light">
            <Mail size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">No Messages Yet</p>
            <p className="text-sm mt-1">When visitors fill out the contact form, their queries will appear here.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.map((msg) => (
          <Card key={msg.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-surface-variant/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                    {msg.first_name.charAt(0)}{msg.last_name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{msg.first_name} {msg.last_name}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-text-light mt-0.5">
                      <Calendar size={12} />
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-text-light">
                  <Mail size={14} className="flex-shrink-0" />
                  <a href={`mailto:${msg.email}`} className="hover:text-primary hover:underline truncate">
                    {msg.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <Phone size={14} className="flex-shrink-0" />
                  <a href={`tel:${msg.phone_number}`} className="hover:text-primary hover:underline">
                    {msg.phone_number}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-text-light text-xs">
                  <Monitor size={14} className="flex-shrink-0" />
                  <span>IP: {msg.ip_address}</span>
                </div>
              </div>

              <div className="mt-2 bg-surface-container-lowest/50 p-4 rounded-xl border border-surface-variant/40">
                <p className="text-sm text-on-surface whitespace-pre-wrap font-medium leading-relaxed">
                  {msg.message}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Messages;
