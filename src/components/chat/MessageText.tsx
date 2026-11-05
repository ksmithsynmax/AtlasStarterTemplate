import type { ReactNode } from 'react';
import classes from './Chat.module.css';

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part,
  );
}

/** Renders the light formatting described on `ChatMessageData.text`. */
export function MessageText({ text }: { text: string }) {
  return (
    <div className={classes.text}>
      {text.split(/\n\s*\n/).map((block, index) => {
        const lines = block.split('\n');
        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={index}>
              {lines.map((line, item) => (
                <li key={item}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{inline(block)}</p>;
      })}
    </div>
  );
}
