import { Button } from '@mantine/core';
import { useClipboard, useLocalStorage } from '@mantine/hooks';
import { Check, ChevronLeft, Copy01, Download01, Edit05, File04, Maximize01, Share07 } from '@untitledui/icons';
import { useState } from 'react';
import { ChatPanel, type ChatMessageData } from '../../components/chat';
import { DashboardPane } from '../../components/dashboard';
import { ChatIcon, KebabIcon } from '../../components/icons';
import { IconButton } from '../../components/ui';
import { ATLAS_RADIUS_FULL } from '../../theme';
import { fallbackConversation, sampleConversations } from './sampleConversations';
import { sampleDashboards } from './sampleDashboards';
import classes from './SessionView.module.css';

const PROTOTYPE_REPLY = "Thanks — responses aren't connected in this prototype yet, but this is where the answer will appear.";

const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export interface SessionViewProps {
  sessionId: string;
  title: string;
}

/** An open session: chat docked on the left (collapsible) beside the session's dashboard. */
export function SessionView({ sessionId, title }: SessionViewProps) {
  const [chatOpen, setChatOpen] = useLocalStorage({ key: 'atlas-chat-open', defaultValue: true });
  const [messages, setMessages] = useState<ChatMessageData[]>(
    () => sampleConversations[sessionId] ?? fallbackConversation(title),
  );
  const clipboard = useClipboard({ timeout: 1500 });

  const send = (text: string) => {
    const time = timeNow();
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', text, time },
      { id: crypto.randomUUID(), role: 'assistant', text: PROTOTYPE_REPLY, time },
    ]);
  };

  const copyConversation = () =>
    clipboard.copy(messages.map((message) => `${message.role === 'user' ? 'You' : 'Atlas'}: ${message.text}`).join('\n\n'));

  const dashboard = sampleDashboards[sessionId];

  return (
    <div className={classes.view}>
      {chatOpen ? (
        <ChatPanel
          variant="docked"
          className={classes.chat}
          title={title}
          messages={messages}
          onSend={send}
          headerActions={
            <>
              <IconButton
                label={clipboard.copied ? 'Copied' : 'Copy conversation'}
                icon={clipboard.copied ? <Check size={16} /> : <Copy01 size={16} />}
                onClick={copyConversation}
              />
              <IconButton label="More options" icon={<KebabIcon />} />
              <IconButton label="Close chat" icon={<ChevronLeft size={16} />} onClick={() => setChatOpen(false)} />
            </>
          }
        />
      ) : (
        <div className={classes.chatRail}>
          <IconButton
            label="Open chat"
            icon={<ChatIcon size={18} />}
            size={36}
            tooltipPosition="right"
            onClick={() => setChatOpen(true)}
          />
        </div>
      )}

      <DashboardPane
        actions={
          <>
            <IconButton label="Full screen" icon={<Maximize01 size={16} />} />
            <IconButton label="Download" icon={<Download01 size={16} />} />
            <IconButton label="Share" icon={<Share07 size={16} />} />
            <IconButton label="Export report" icon={<File04 size={16} />} />
            <IconButton label="Edit dashboard" icon={<Edit05 size={16} />} />
            <Button size="xs" radius={ATLAS_RADIUS_FULL} ml={8}>
              Dashboard Components
            </Button>
          </>
        }
      >
        {dashboard ?? (
          <div className={classes.emptyDashboard}>
            Charts, maps and tables Atlas builds in this session will show up here.
          </div>
        )}
      </DashboardPane>
    </div>
  );
}
