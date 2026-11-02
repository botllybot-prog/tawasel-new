import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Bell, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './session';
import { useLanguage } from './language';
import { when } from '@/lib/tobezly';
import { toast } from 'sonner';

type DiscoverablePerson = { id: string; nickname: string; mutual: boolean };

export function MessageNotifications() {
  const { user } = useSession();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [lastReadAt, setLastReadAt] = useState('');
  const storageKey = user ? 'tobezly-message-notifications-read-at:' + user.id : '';

  const { data: people = [] } = useQuery({
    queryKey: ['people', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('discover_people');
      if (error) throw error;
      return (data ?? []) as DiscoverablePerson[];
    }
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['incoming-messages', user?.id],
    enabled: !!user,
    refetchInterval: 20000,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, body, created_at')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    }
  });

  useEffect(() => {
    if (!storageKey) {
      setLastReadAt('');
      return;
    }
    setLastReadAt(localStorage.getItem(storageKey) ?? '');
  }, [storageKey]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('incoming-messages-' + user.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: 'recipient_id=eq.' + user.id },
        () => {
          queryClient.invalidateQueries({ queryKey: ['incoming-messages', user.id] });
          toast.info(t('وصلتك رسالة جديدة'));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, language, t]);

  if (!user) return null;

  const peopleById = new Map(people.map(person => [person.id, person]));
  const visibleMessages = messages.filter(message => peopleById.has(message.sender_id));
  const lastReadTime = lastReadAt ? Date.parse(lastReadAt) : 0;
  const unreadCount = visibleMessages.filter(message => {
    const createdAt = Date.parse(message.created_at);
    return createdAt > (Number.isFinite(lastReadTime) ? lastReadTime : 0);
  }).length;

  function openNotifications() {
    const now = new Date().toISOString();
    localStorage.setItem(storageKey, now);
    setLastReadAt(now);
    setOpen(true);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="notification-bell message-notification-trigger"
        aria-label={t('إشعارات الرسائل')}
        title={t('إشعارات الرسائل')}
        onClick={openNotifications}
      >
        <Bell />
        {unreadCount > 0 && <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={language === 'en' ? 'ltr' : 'rtl'}>
          <DialogTitle>{t('رسائل واردة')}</DialogTitle>
          <DialogDescription>{t('إشعارات الرسائل')}</DialogDescription>
          <div className="message-notification-list">
            {visibleMessages.length ? visibleMessages.map(message => {
              const sender = peopleById.get(message.sender_id);
              const createdAt = Date.parse(message.created_at);
              const isUnread = createdAt > (Number.isFinite(lastReadTime) ? lastReadTime : 0);
              return (
                <Link
                  key={message.id}
                  to="/dating"
                  search={{ interest: '', chat: message.sender_id }}
                  className={isUnread ? 'message-notification-item unread' : 'message-notification-item'}
                  onClick={() => setOpen(false)}
                >
                  <MessageCircle size={18} />
                  <div>
                    <strong>{sender?.nickname ?? t('عضو من مجتمع تواصل')}</strong>
                    <small>{when(message.created_at)}</small>
                    <p>{message.body}</p>
                  </div>
                </Link>
              );
            }) : <p className="muted-empty">{t('لا توجد رسائل بعد.')}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
