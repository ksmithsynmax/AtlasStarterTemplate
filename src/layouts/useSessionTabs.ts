import { createContext, useContext, useState } from 'react';

export interface SessionTab {
  id: string;
  label: string;
  /** `new` tabs show the New Session view until a prompt is submitted. */
  kind: 'new' | 'session';
}

const initialTabs: SessionTab[] = [
  { id: 'vessel-dark-activity', label: 'Vessel Dark Activity', kind: 'session' },
  { id: 'permian-development', label: 'analyze development activity in permian basin', kind: 'session' },
];

let nextId = 1;

export function useSessionTabs() {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeId, setActiveId] = useState<string | undefined>(initialTabs.at(-1)?.id);

  const create = () => {
    const tab: SessionTab = { id: `new-${nextId++}`, label: 'New Session', kind: 'new' };
    setTabs((current) => [...current, tab]);
    setActiveId(tab.id);
  };

  const close = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id);
    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    if (id === activeId) {
      setActiveId(remaining[Math.min(index, remaining.length - 1)]?.id);
    }
  };

  /** Turns a `new` tab into a session titled by its first prompt. */
  const start = (id: string, prompt: string) => {
    setTabs((current) =>
      current.map((tab) => (tab.id === id ? { ...tab, label: prompt, kind: 'session' } : tab)),
    );
  };

  const activeTab = tabs.find((tab) => tab.id === activeId);

  return { tabs, activeId, activeTab, select: setActiveId, create, close, start };
}

export type SessionTabsState = ReturnType<typeof useSessionTabs>;

export const SessionTabsContext = createContext<SessionTabsState | null>(null);

export function useSessionTabsContext() {
  const value = useContext(SessionTabsContext);
  if (!value) throw new Error('useSessionTabsContext must be used inside AppLayout');
  return value;
}
