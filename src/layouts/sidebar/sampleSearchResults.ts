import type { SearchResult } from '../../components/search';
import { sampleProjects } from './navConfig';
import { sampleSessions } from './sampleSessions';

const session = (id: string): SearchResult => {
  const match = sampleSessions.find((item) => item.id === id)!;
  return { id: match.id, kind: 'session', title: match.title, updated: match.updated };
};

const project = (id: string): SearchResult => {
  const match = sampleProjects.find((item) => item.id === id)!;
  return { id: match.id, kind: 'project', title: match.label, updated: match.updated };
};

/** Sample recents, most recent first, until real search exists. */
export const sampleSearchResults: SearchResult[] = [
  session('s2'),
  project('testing-projects'),
  session('s3'),
  project('midland-activity'),
  project('strait-of-hormuz'),
  session('s1'),
  session('s4'),
  project('lng-exports'),
  session('s5'),
  session('s6'),
  session('s7'),
  project('battery-storage'),
  session('s8'),
];
