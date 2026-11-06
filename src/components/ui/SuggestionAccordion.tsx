import { Accordion } from '@mantine/core';
import type { ReactNode } from 'react';
import { PromptChip } from './PromptChip';
import classes from './SuggestionAccordion.module.css';

export interface SuggestionGroup {
  id: string;
  label: string;
  icon: ReactNode;
  prompts: string[];
}

export interface SuggestionAccordionProps {
  groups: SuggestionGroup[];
  onPick: (prompt: string) => void;
  /** Optional heading above the list, e.g. "Maritime". */
  title?: string;
}

/** Expandable categories of starter prompts, each with a muted icon. */
export function SuggestionAccordion({ groups, onPick, title }: SuggestionAccordionProps) {
  return (
    <section className={classes.section} aria-label={title}>
      {title && <h2 className={classes.title}>{title}</h2>}
      <Accordion
        chevronSize={14}
        classNames={{
          item: classes.item,
          control: classes.control,
          label: classes.label,
          chevron: classes.chevron,
          content: classes.content,
        }}
      >
        {groups.map((group) => (
          <Accordion.Item key={group.id} value={group.id}>
            <Accordion.Control icon={<span className={classes.icon}>{group.icon}</span>}>
              {group.label}
            </Accordion.Control>
            <Accordion.Panel>
              {group.prompts.map((prompt) => (
                <PromptChip key={prompt} onClick={() => onPick(prompt)}>
                  {prompt}
                </PromptChip>
              ))}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}
