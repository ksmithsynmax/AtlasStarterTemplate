import type { SuggestionGroup } from '../../components/ui';

export type DomainFilter = 'all' | 'ep' | 'maritime';

export const domainFilters: { value: DomainFilter; label: string }[] = [
  { value: 'all', label: 'All Domains' },
  { value: 'ep', label: 'E&P Analysis' },
  { value: 'maritime', label: 'Maritime Intel' },
];

interface Domain extends SuggestionGroup {
  filter: Exclude<DomainFilter, 'all'>;
}

/** Single letters are placeholders until the real icons are supplied. */
const ep = (id: string, label: string, icon: string, prompts: string[]): Domain => ({
  id,
  label,
  icon,
  prompts,
  color: 'success',
  filter: 'ep',
});

const maritime = (id: string, label: string, icon: string, prompts: string[]): Domain => ({
  id,
  label,
  icon,
  prompts,
  color: 'accent3',
  filter: 'maritime',
});

export const domains: Domain[] = [
  ep('production', 'Production & Supply', 'P', [
    'Show Permian oil production trends over the last 12 months',
    'Compare Lower-48 gas supply to last year',
    'Which basins grew production fastest this quarter?',
  ]),
  ep('drilling', 'Drilling & Operators', 'D', [
    'Rank operators by new wells spudded this month',
    'Show active rig counts by basin',
    'Compare well performance by operator in the Haynesville',
  ]),
  ep('pipelines', 'Pipelines', 'P', [
    'Show pipeline flows out of the Permian',
    'Which pipelines are near capacity?',
  ]),
  ep('lng', 'LNG & Markets', '$', [
    'Show LNG feedgas by export terminal',
    'Compare Henry Hub to TTF over the last 6 months',
  ]),
  ep('infrastructure', 'Infrastructure', 'I', [
    'Map processing plants in the Delaware Basin',
    'Show storage levels across Gulf Coast facilities',
  ]),
  ep('data', 'Data & Dashboards', 'D', [
    'Build a dashboard of daily gas production',
    'What datasets are available for the Eagle Ford?',
  ]),
  ep('vulcan', 'Vulcan Prompts', 'V', [
    'What is Vulcan and what can it detect?',
    'Show new well pads detected by Vulcan this week',
  ]),
  maritime('spoofing', 'Spoofing & AIS Anomalies', 'S', [
    'Find vessels with AIS gaps near the Strait of Hormuz',
    'Show likely spoofing events in the last 7 days',
  ]),
  maritime('dark-vessels', 'Dark Vessel Tracking', 'D', [
    'Show dark vessel activity in the Red Sea',
    'Which tankers went dark after leaving port?',
  ]),
  maritime('fleet', 'Fleet & Voyage Analytics', 'F', [
    'Track LNG carrier voyages to Europe',
    'Show tanker transit times through Suez',
  ]),
  maritime('compliance', 'Compliance & Sanctions', 'C', [
    'Flag vessels with sanctioned ownership',
    'Show ship-to-ship transfers near sanctioned ports',
  ]),
];
