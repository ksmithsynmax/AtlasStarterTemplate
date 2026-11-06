import {
  Anchor,
  Building07,
  CurrencyDollar,
  Eye,
  Globe01,
  Grid01,
  LineChartUp01,
  Route,
  Scan,
  Shield01,
  Zap,
} from '@untitledui/icons';
import type { ReactNode } from 'react';
import type { SuggestionGroup } from '../../components/ui';

const ICON_SIZE = 18;

export type DomainFilter = 'all' | 'ep' | 'maritime';

export const domainFilters: { value: DomainFilter; label: string }[] = [
  { value: 'all', label: 'All Domains' },
  { value: 'ep', label: 'E&P Analysis' },
  { value: 'maritime', label: 'Maritime Intel' },
];

interface Domain extends SuggestionGroup {
  filter: Exclude<DomainFilter, 'all'>;
}

/** Section headings shown when every domain is listed. */
export const domainSections: { filter: Exclude<DomainFilter, 'all'>; title: string }[] = [
  { filter: 'ep', title: 'Energy' },
  { filter: 'maritime', title: 'Maritime' },
];

const ep = (id: string, label: string, icon: ReactNode, prompts: string[]): Domain => ({
  id,
  label,
  icon,
  prompts,
  filter: 'ep',
});

const maritime = (id: string, label: string, icon: ReactNode, prompts: string[]): Domain => ({
  id,
  label,
  icon,
  prompts,
  filter: 'maritime',
});

export const domains: Domain[] = [
  ep('production', 'Production & Supply', <LineChartUp01 size={ICON_SIZE} />, [
    'Show Permian oil production trends over the last 12 months',
    'Compare Lower-48 gas supply to last year',
    'Which basins grew production fastest this quarter?',
  ]),
  ep('drilling', 'Drilling & Operators', <Zap size={ICON_SIZE} />, [
    'Rank operators by new wells spudded this month',
    'Show active rig counts by basin',
    'Compare well performance by operator in the Haynesville',
  ]),
  ep('pipelines', 'Pipelines', <Route size={ICON_SIZE} />, [
    'Show pipeline flows out of the Permian',
    'Which pipelines are near capacity?',
  ]),
  ep('lng', 'LNG & Markets', <CurrencyDollar size={ICON_SIZE} />, [
    'Show LNG feedgas by export terminal',
    'Compare Henry Hub to TTF over the last 6 months',
  ]),
  ep('infrastructure', 'Infrastructure', <Building07 size={ICON_SIZE} />, [
    'Map processing plants in the Delaware Basin',
    'Show storage levels across Gulf Coast facilities',
  ]),
  ep('data', 'Data & Dashboards', <Grid01 size={ICON_SIZE} />, [
    'Build a dashboard of daily gas production',
    'What datasets are available for the Eagle Ford?',
  ]),
  ep('vulcan', 'Vulcan Prompts', <Globe01 size={ICON_SIZE} />, [
    'What is Vulcan and what can it detect?',
    'Show new well pads detected by Vulcan this week',
  ]),
  maritime('spoofing', 'Spoofing & AIS Anomalies', <Shield01 size={ICON_SIZE} />, [
    'Find vessels with AIS gaps near the Strait of Hormuz',
    'Show likely spoofing events in the last 7 days',
  ]),
  maritime('dark-vessels', 'Dark Vessel Tracking', <Eye size={ICON_SIZE} />, [
    'Show dark vessel activity in the Red Sea',
    'Which tankers went dark after leaving port?',
  ]),
  maritime('fleet', 'Fleet & Voyage Analytics', <Anchor size={ICON_SIZE} />, [
    'Track LNG carrier voyages to Europe',
    'Show tanker transit times through Suez',
  ]),
  maritime('compliance', 'Compliance & Sanctions', <Scan size={ICON_SIZE} />, [
    'Flag vessels with sanctioned ownership',
    'Show ship-to-ship transfers near sanctioned ports',
  ]),
];
