import { $host } from '@homeberris/http/index';
import * as qs from 'qs';

export const getCatalogUuidsByOptionValues = async (values: string[], categoryUuid: string): Promise<string[]> => {
  if (!values.length || !categoryUuid) return [];
  const queryString = qs.stringify({
    filterMeta: { categoryUuid },
    includeMeta: [
      {
        association: 'groupOption',
        include: [{ association: 'options' }],
      },
    ],
  });
  const { data } = await $host.get(`/api/v1/catalog?${queryString}`);
  const items: any[] = data?.data || [];
  return items
    .filter((catalog) =>
      (catalog.groupOption || []).some((group: any) =>
        (group.options || []).some((opt: any) => {
          const v = opt.value;
          const candidates: string[] = typeof v === 'string'
            ? [v]
            : [v?.ru, v?.en, v?.hy].filter(Boolean) as string[];
          return candidates.some((c) => values.includes(c));
        })
      )
    )
    .map((catalog) => catalog.uuid)
    .filter(Boolean);
};
