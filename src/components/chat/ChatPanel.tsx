import { ScrollArea } from '@mantine/core';
import { useEffect, useRef, type ReactNode } from 'react';
import classes from './Chat.module.css';
import { ChatComposer } from './ChatComposer';
import { ChatMessage } from './ChatMessage';
import type { ChatMessageData } from './types';

export interface ChatPanelProps {
  title: string;
  messages: ChatMessageData[];
  onSend: (text: string) => void;
  /** Buttons at the end of the header, e.g. `IconButton`s. */
  headerActions?: ReactNode;
  /** `card` is a bordered rounded box; `docked` is a full-height column with a divider on its right. */
  variant?: 'card' | 'docked';
  className?: string;
}

/** Conversation window: title bar, scrolling message list and composer. Keeps the newest message in view. */
export function ChatPanel({ title, messages, onSend, headerActions, variant = 'card', className }: ChatPanelProps) {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
  }, [messages.length]);

  return (
    <section
      className={[classes.panel, className].filter(Boolean).join(' ')}
      data-variant={variant}
      aria-label={title}
    >
      <header className={classes.header}>
        <h2 className={classes.title}>{title}</h2>
        {headerActions && <div className={classes.headerActions}>{headerActions}</div>}
      </header>

      <ScrollArea className={classes.messages} viewportRef={viewport} type="hover">
        <div className={classes.thread}>
          <div className={classes.threadStart}>Beginning of conversation</div>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      <div className={classes.footer}>
        <ChatComposer onSend={onSend} />
      </div>
    </section>
  );
}
