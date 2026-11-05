import { useClipboard } from '@mantine/hooks';
import { Check, Copy01, ThumbsDown, ThumbsUp } from '@untitledui/icons';
import { IconButton } from '../ui';
import classes from './Chat.module.css';
import { MessageText } from './MessageText';
import type { ChatMessageData } from './types';

/** One turn in a conversation. User turns are right-aligned bubbles; assistant turns get copy and feedback actions. */
export function ChatMessage({ message }: { message: ChatMessageData }) {
  const clipboard = useClipboard({ timeout: 1500 });

  if (message.role === 'user') {
    return (
      <div className={classes.userTurn}>
        <div className={classes.bubble}>
          <MessageText text={message.text} />
        </div>
        <span className={classes.time}>{message.time}</span>
      </div>
    );
  }

  return (
    <div className={classes.assistantTurn}>
      <MessageText text={message.text} />
      <span className={classes.time}>{message.time}</span>
      <div className={classes.feedback}>
        <IconButton
          label={clipboard.copied ? 'Copied' : 'Copy'}
          icon={clipboard.copied ? <Check size={14} /> : <Copy01 size={14} />}
          size={24}
          onClick={() => clipboard.copy(message.text)}
        />
        <IconButton label="Good response" icon={<ThumbsUp size={14} />} size={24} />
        <IconButton label="Bad response" icon={<ThumbsDown size={14} />} size={24} />
      </div>
    </div>
  );
}
