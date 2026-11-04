import type { ReactNode } from 'react';
import { ActionIcon, Card, Menu } from '@mantine/core';
import { ChartLegend } from './ChartLegend';
import type { LegendItem } from './types';
import classes from './ChartCard.module.css';

export interface ChartCardProps {
  title: string;
  legend?: LegendItem[];
  /** `Menu.Item`s for the card's "more" menu. */
  menu?: ReactNode;
  /** Card height in px; the chart fills whatever the header and legend leave. */
  height?: number;
  children: ReactNode;
}

/** Atlas dashboard card: drag handle, title, "more" menu, legend and chart area. */
export function ChartCard({ title, legend, menu, height = 404, children }: ChartCardProps) {
  return (
    <Card padding={0} h={height} className={classes.root}>
      <div className={classes.header}>
        <span className={classes.grip} aria-hidden />
        <div className={classes.title}>{title}</div>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`${title} options`}>
              <span className={classes.kebab} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>{menu ?? <Menu.Item disabled>No actions yet</Menu.Item>}</Menu.Dropdown>
        </Menu>
      </div>
      <div className={classes.body}>
        {legend && legend.length > 0 && <ChartLegend items={legend} />}
        <div className={classes.chart}>{children}</div>
      </div>
    </Card>
  );
}
