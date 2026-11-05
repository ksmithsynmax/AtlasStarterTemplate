import { Accordion } from '@mantine/core';
import type { ReactNode } from 'react';
import type { AtlasToken } from '../../theme';
import { IconTile } from './IconTile';
import { PromptChip } from './PromptChip';
import classes from './SuggestionAccordion.module.css';

export interface SuggestionGroup {
  id: string;
  label: string;
  icon: ReactNode;
  color: AtlasToken;
  prompts: string[];
}

export interface SuggestionAccordionProps {
  groups: SuggestionGroup[];
  onPick: (prompt: string) => void;
}

/** Expandable categories of starter prompts, each with a colored icon tile. */
export function SuggestionAccordion({ groups, onPick }: SuggestionAccordionProps) {
  return (
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
          <Accordion.Control icon={<IconTile color={group.color}>{group.icon}</IconTile>}>
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
  );
}
