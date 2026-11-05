import type { ReactNode } from 'react';
import { BarChart, ChartCard } from '../../components/charts';
import classes from './SessionView.module.css';

const hormuzDaily = [
  { day: '26 Oct', satellite: 512 },
  { day: '27 Oct', satellite: 498 },
  { day: '28 Oct', satellite: 601 },
  { day: '29 Oct', satellite: 577 },
  { day: '30 Oct', satellite: 534 },
  { day: '31 Oct', satellite: 489 },
  { day: '1 Nov', satellite: 556 },
  { day: '2 Nov', satellite: 551 },
];

/** Sample dashboard cards keyed by session id, until real dashboards exist. */
export const sampleDashboards: Record<string, ReactNode> = {
  s1: (
    <>
      <ChartCard title="Text" height={132}>
        <div className={classes.textCard}>
          <h3>Strait of Hormuz — Activity &amp; Detections, 26 Oct – 2 Nov 2026 (UTC)</h3>
          <p>
            Box 25.5–27.0°N, 55.6–57.3°E. Sources: SynMax Theia satellite detections (PlanetScope, Sentinel-1,
            Sentinel-2) and SynMax AIS dark-event tracking. Satellite counts depend on imagery coverage and cloud, so
            they swing a lot from day to day.
          </p>
        </div>
      </ChartCard>
      <ChartCard title="Satellite detections" height={132}>
        <div className={classes.kpi}>4,318</div>
      </ChartCard>
      <BarChart
        title="Satellite detections per day"
        height={320}
        data={hormuzDaily}
        xKey="day"
        series={[{ key: 'satellite', label: 'Satellite detections', color: 'primary' }]}
      />
    </>
  ),
};
