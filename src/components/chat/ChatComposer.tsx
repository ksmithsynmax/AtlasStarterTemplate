import { Textarea } from '@mantine/core';
import { Calendar, Send01 } from '@untitledui/icons';
import { useState } from 'react';
import { IconButton } from '../ui';
import classes from './Chat.module.css';

export interface ChatComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
}

/** Multi-line message box. Enter sends, Shift+Enter adds a line. */
export function ChatComposer({ onSend, placeholder = 'Ask Anything' }: ChatComposerProps) {
  const [value, setValue] = useState('');

  const send = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue('');
  };

  return (
    <div className={classes.composer}>
      <Textarea
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send();
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        variant="unstyled"
        autosize
        minRows={2}
        maxRows={8}
        classNames={{ input: classes.composerInput }}
      />
      <div className={classes.composerActions}>
        <IconButton label="Pick a date range" icon={<Calendar size={16} />} size={32} round />
        <IconButton label="Send" icon={<Send01 size={16} />} size={32} round onClick={send} />
      </div>
    </div>
  );
}
