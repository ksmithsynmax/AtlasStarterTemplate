import { Card } from '@mantine/core';
import { useState } from 'react';
import { FilterPills } from '../components/ui';
import { ATLAS_RADIUS_FULL } from '../theme';
import { labExperiments } from './experiments';
import classes from './LabPage.module.css';
import { atlasProducts, productById, type AtlasProduct } from './products';

type Filter = 'all' | AtlasProduct;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...atlasProducts.map((product) => ({ value: product.id, label: product.label })),
];

/** Scratch area for dashboard components under test before they go into templates. */
export function LabPage() {
  const [filter, setFilter] = useState<Filter>('all');
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
                {(experiment.products ?? [undefined]).map((id) => (
                  <span
                    key={id ?? 'all'}
                    className={classes.tag}
                    data-domain={id ? productById[id].domain : undefined}
                    style={{ borderRadius: ATLAS_RADIUS_FULL }}
                  >
                    {id ? productById[id].label : 'All products'}
                  </span>
                ))}
                <span className={classes.status} data-status={experiment.status}>
                  {experiment.status === 'ready' ? 'Ready' : 'Exploring'}
                </span>
              </div>
              <p className={classes.description}>{experiment.description}</p>
              <div className={classes.stage}>{experiment.render()}</div>
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
