export interface Session {
  id: string;
  title: string;
  updated: string;
}

export const sampleSessions: Session[] = [
  { id: 's1', title: 'Hormuz Strait Activity Detection', updated: '2 days ago' },
  { id: 's2', title: 'Laulie Final 10/19/26 (copy) - shipping lanes', updated: '4h ago' },
  { id: 's3', title: 'Vulcan: Meaning and Overview', updated: '6h ago' },
  { id: 's4', title: 'Lower-48 Gas Fundamentals Dashboard', updated: '2 days ago' },
  { id: 's5', title: 'Permian Rig Count Trends', updated: '3 days ago' },
  { id: 's6', title: 'LNG Export Terminal Utilization', updated: '5 days ago' },
  { id: 's7', title: 'Gulf Coast Storage Levels', updated: '1 week ago' },
  { id: 's8', title: 'Haynesville Production Forecast', updated: '2 weeks ago' },
];

/** `updated` holds the next run time for scheduled sessions. */
export const sampleScheduledSessions: Session[] = [
  { id: 'sch1', title: 'Weekly Permian Rig Count Report', updated: 'Every Monday, 8:00 AM' },
  { id: 'sch2', title: 'Daily Hormuz Vessel Transits', updated: 'Daily, 6:00 AM' },
  { id: 'sch3', title: 'LNG Terminal Utilization Snapshot', updated: 'Tomorrow, 9:00 AM' },
  { id: 'sch4', title: 'Monthly Gulf Coast Storage Summary', updated: 'Dec 1, 7:00 AM' },
];
