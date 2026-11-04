import { SimpleGrid } from '@mantine/core';
import {
  BarChart,
  CandlestickChart,
  DonutChart,
  DualAxisChart,
  ScatterChart,
  StackedAreaChart,
  TimeSeriesChart,
  formatCompact,
  formatCurrencyCompact,
  formatPercent,
  formatShortMonth,
} from '../../components/charts';
import {
  infrastructureData,
  priceData,
  revenueData,
  segmentData,
  sessionsData,
  trafficData,
  visitorsData,
} from './sampleData';

/** Every Atlas chart component with sample data, as laid out in Figma. */
export function ChartsPage() {
  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={24}>
      <TimeSeriesChart
        title="Time Series"
        data={trafficData}
        xKey="date"
        series={[
          { key: 'web', label: 'Web' },
          { key: 'mobile', label: 'Mobile' },
          { key: 'api', label: 'API' },
        ]}
      />
      <BarChart
        title="Bar Chart"
        data={visitorsData}
        xKey="month"
        xFormatter={formatShortMonth}
        series={[
          { key: 'new', label: 'New' },
          { key: 'returning', label: 'Returning' },
        ]}
      />
      <ScatterChart
        title="Scatter Plot"
        series={[
          { label: 'Segment A', points: segmentData.a },
          { label: 'Segment B', points: segmentData.b },
        ]}
        xDomain={[0, 100]}
        xTicks={[0, 25, 50, 75, 100]}
        yDomain={[1500, 3500]}
      />
      <DonutChart title="Donut Chart" data={sessionsData} totalLabel="Sessions" valueFormatter={formatCompact} />
      <DualAxisChart
        title="Dual Axis Time Series"
        data={revenueData}
        xKey="date"
        left={{ key: 'revenue', label: 'Revenue ($)' }}
        right={{ key: 'conversion', label: 'Conversion (%)', color: 'accent2' }}
        leftFormatter={formatCurrencyCompact}
        rightFormatter={formatPercent}
      />
      <StackedAreaChart
        title="Stacked Area Chart"
        data={infrastructureData}
        xKey="month"
        xFormatter={formatShortMonth}
        valueFormatter={formatCurrencyCompact}
        series={[
          { key: 'compute', label: 'Compute' },
          { key: 'storage', label: 'Storage' },
          { key: 'network', label: 'Network' },
          { key: 'database', label: 'Database' },
        ]}
      />
      <CandlestickChart title="Candlestick" data={priceData} domain={[140, 200]} ticks={[140, 160, 180, 200]} />
    </SimpleGrid>
  );
}
