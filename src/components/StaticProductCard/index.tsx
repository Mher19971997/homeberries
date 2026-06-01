import styles from './index.module.css';
import CatalogCard from '../CatalogCard';
import { CatalogItem } from '@homeberris/types/catalog';

interface StaticProductCardProps {
  catalogs: CatalogItem[];
  onNavigate?: (item: CatalogItem) => void;
}

export default function StaticProductCard({ catalogs, onNavigate }: StaticProductCardProps) {
  return (
    <div className={styles.grid}>
      {catalogs.map((catalog) => (
        <CatalogCard
          key={catalog.uuid}
          catalog={catalog}
          onNavigate={onNavigate ? () => onNavigate(catalog) : undefined}
        />
      ))}
    </div>
  );
}
