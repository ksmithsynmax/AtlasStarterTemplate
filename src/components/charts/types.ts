import type { AtlasToken } from '../../theme';

/** One plotted series. `key` is the data field; color defaults to its series slot. */
export interface ChartSeries<TKey extends string = string> {
  key: TKey;
  label: string;
  color?: AtlasToken;
}

export interface LegendItem {
  label: string;
  color: string;
}

export type ValueFormatter = (value: number) => string;
