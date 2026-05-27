const pr = new Intl.PluralRules('ru-RU');

export const pluralizeItems = (count: number) => {
  const rule = pr.select(count);

  if (rule === 'one') return `${count} товар`;
  if (rule === 'few') return `${count} товара`;
  return `${count} товаров`;
};