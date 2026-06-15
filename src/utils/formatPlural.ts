// pluralizeItems is kept for backward compat but callers should prefer
// the i18n `catalogFavorites.products` key with count interpolation.
const pr = new Intl.PluralRules('ru-RU');

export const pluralizeItems = (count: number) => {
  const rule = pr.select(count);

  if (rule === 'one') return `${count} item`;
  if (rule === 'few') return `${count} items`;
  return `${count} items`;
};