export type AtlasDomain = 'maritime' | 'energy';

export type AtlasProduct = 'theia' | 'hyperion' | 'vulcan' | 'basiniq';

export const atlasProducts: { id: AtlasProduct; label: string; domain: AtlasDomain }[] = [
  { id: 'theia', label: 'Theia', domain: 'maritime' },
  { id: 'hyperion', label: 'Hyperion', domain: 'energy' },
  { id: 'vulcan', label: 'Vulcan', domain: 'energy' },
  { id: 'basiniq', label: 'BasinIQ', domain: 'energy' },
];

export const productById = Object.fromEntries(atlasProducts.map((product) => [product.id, product])) as Record<
  AtlasProduct,
  (typeof atlasProducts)[number]
>;
