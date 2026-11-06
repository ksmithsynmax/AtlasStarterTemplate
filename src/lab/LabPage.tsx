import { Card } from '@mantine/core';
import { useState } from 'react';
import { FilterPills } from '../components/ui';
import { primaryAccentVars } from '../theme';
import { useDashboardAccent } from './dashboardTheme';
import { labExperiments } from './experiments';
import classes from './LabPage.module.css';
import { atlasProducts, type AtlasProduct } from './products';

type Filter = 'all' | AtlasProduct;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...atlasProducts.map((product) => ({ value: product.id, label: product.label })),
];

/** Scratch area for dashboard components under test before they go into templates. */
export function LabPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const dashboardAccent = useDashboardAccent();
  const visible =
    filter === 'all'
      ? labExperiments
      : labExperiments.filter((item) => !item.products || item.products.includes(filter));

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <div>
          <h1 className={classes.title}>Component Lab</h1>
          <p className={classes.subtitle}>
            Dashboard components under test. Theia is Maritime; Hyperion, Vulcan and BasinIQ are Energy.
          </p>
        </div>
        <FilterPills value={filter} onChange={setFilter} options={FILTERS} aria-label="Filter by product" />
      </header>

      {visible.length > 0 ? (
        <div className={classes.grid}>
          {visible.map((experiment) => (
            <Card key={experiment.id} padding={0} className={classes.card} data-wide={experiment.wide || undefined}>
              <div className={classes.cardHeader}>
                <h2 className={classes.cardTitle}>{experiment.title}</h2>
              </div>
              <p className={classes.description}>{experiment.description}</p>
              <div className={classes.stage} style={dashboardAccent && primaryAccentVars(dashboardAccent)}>
                {experiment.render()}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className={classes.empty}>
          {labExperiments.length === 0
            ? 'No dashboard components in testing yet.'
            : 'No experiments for this product yet.'}
        </div>
      )}
    </div>
  );
}
