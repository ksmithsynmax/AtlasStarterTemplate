import type { ValueFormatter } from './types';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const shortMonth = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });

/** 3500 → "3.5K" */
export const formatCompact: ValueFormatter = (value) => compact.format(value);

/** 20000 → "$20K" */
export const formatCurrencyCompact: ValueFormatter = (value) => `$${compact.format(value)}`;

/** 182.4 → "$182" */
export const formatCurrency: ValueFormatter = (value) => `$${Math.round(value)}`;

/** 3.2 → "3.2%" (values are already percentages) */
export const formatPercent: ValueFormatter = (value) => `${Number(value.toFixed(1))}%`;

/** "2026-01-08" → "Jan 8" */
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso));

/** "2026-01-01" → "Jan" */
export const formatShortMonth = (iso: string) => shortMonth.format(new Date(iso));
