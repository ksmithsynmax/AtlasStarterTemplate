import { Stack, Title } from '@mantine/core';
import { useState } from 'react';
import { PillTabs, PromptInput, SuggestionAccordion } from '../../components/ui';
import { domainFilters, domains, type DomainFilter } from './domains';

export interface NewSessionViewProps {
  onSubmit: (prompt: string) => void;
}

/** Empty-state for a new session: prompt box, domain filter and starter prompts. */
export function NewSessionView({ onSubmit }: NewSessionViewProps) {
  const [prompt, setPrompt] = useState('');
  const [filter, setFilter] = useState<DomainFilter>('all');
  const visible = filter === 'all' ? domains : domains.filter((domain) => domain.filter === filter);

  return (
    <Stack align="center" gap={24} pt={80} pb={40}>
      <Title order={1} fw={500} ta="center">
        What would you like to explore or build together?
      </Title>

      <Stack w="100%" maw={640}>
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={onSubmit}
          placeholder="Share a goal, datasets or idea, and we'll work through it together"
          actions={[{ label: 'Pick a date range', icon: 'C' }]}
          sendIcon="S"
        />
      </Stack>

      <PillTabs value={filter} onChange={setFilter} options={domainFilters} />

      <Stack w="100%" maw={560} gap={0}>
        <SuggestionAccordion groups={visible} onPick={setPrompt} />
      </Stack>
    </Stack>
  );
}
