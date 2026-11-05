import { ActionIcon, Modal, ScrollArea, UnstyledButton } from '@mantine/core';
import { XClose } from '@untitledui/icons';
import { useState } from 'react';
import { ChatIcon, FolderIcon, SearchIcon } from '../icons';
import { FilterPills } from '../ui';
import classes from './SearchModal.module.css';

export type SearchResultKind = 'session' | 'project';

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  /** Relative time, e.g. "30m ago". */
  updated: string;
}

type Filter = 'all' | SearchResultKind;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'session', label: 'Session' },
  { value: 'project', label: 'Project' },
];

const KIND_ICON = { session: <ChatIcon />, project: <FolderIcon /> } satisfies Record<SearchResultKind, unknown>;

export interface SearchModalProps {
  opened: boolean;
  onClose: () => void;
  /** Most recent first. */
  results: SearchResult[];
  onSelect?: (result: SearchResult) => void;
}

/** Search sessions and projects by name, filtered by kind. Shows recent items until the user types. */
export function SearchModal({ opened, onClose, results, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const close = () => {
    onClose();
    setQuery('');
    setFilter('all');
  };

  const needle = query.trim().toLowerCase();
  const visible = results.filter(
    (result) => (filter === 'all' || result.kind === filter) && result.title.toLowerCase().includes(needle),
  );

  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      size={520}
      radius="lg"
      padding={0}
      yOffset="12vh"
      overlayProps={{ color: 'var(--atlas-background)', backgroundOpacity: 0.6, blur: 4 }}
      classNames={{ content: classes.content }}
    >
      <div className={classes.header}>
        <div className={classes.searchRow}>
          <SearchIcon className={classes.searchIcon} />
          <input
            className={classes.input}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search sessions by name..."
            aria-label="Search sessions and projects"
            data-autofocus
          />
          <ActionIcon variant="subtle" color="gray" size={28} aria-label="Close search" onClick={close}>
            <XClose size={18} />
          </ActionIcon>
        </div>
        <FilterPills value={filter} onChange={setFilter} options={FILTERS} aria-label="Filter results" />
      </div>

      <ScrollArea.Autosize mah={360} type="hover">
        <div className={classes.body}>
          <div className={classes.groupLabel}>{needle ? 'Results' : 'Recent'}</div>
          {visible.length > 0 ? (
            visible.map((result) => (
              <UnstyledButton
                key={result.id}
                className={classes.result}
                onClick={() => {
                  onSelect?.(result);
                  close();
                }}
              >
                <span className={classes.resultIcon}>{KIND_ICON[result.kind]}</span>
                <span className={classes.resultText}>
                  <span className={classes.resultTitle}>{result.title}</span>
                  <span className={classes.resultMeta}>{result.updated}</span>
                </span>
              </UnstyledButton>
            ))
          ) : (
            <div className={classes.empty}>No matches for “{query.trim()}”</div>
          )}
        </div>
      </ScrollArea.Autosize>
    </Modal>
  );
}
