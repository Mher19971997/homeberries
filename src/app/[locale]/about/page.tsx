'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import Link from 'next/link';
import styles from './index.module.css';
import Breadcrumb from '@homeberris/components/Breadcrumb';
import electronics from '@homeberris/assets/electronics.jpeg';
import { Target, Eye, ShieldCheck } from 'lucide-react';

const AboutPage: React.FC = () => {
  const { t } = useTranslation('common');

  const values = [
    { key: 'mission', Icon: Target },
    { key: 'vision', Icon: Eye },
    { key: 'quality', Icon: ShieldCheck },
  ] as const;

  const stats = [
    { number: '10 000+', key: 'products' },
    { number: '50 000+', key: 'customers' },
    { number: '5', key: 'years' },
  ] as const;

  return (
    <div className={styles.page}>
      <Breadcrumb items={[
        { label: t('nav.home'), href: '/' },
        { label: t('nav.about') },
      ]} />

      <section className={styles.heroSplit}>
        <div className={styles.heroImageWrap}>
          <Image
            src={electronics}
            alt={t('about.hero.title')}
            className={styles.heroImage}
            placeholder="blur"
            priority
          />
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('about.hero.title')}</h1>
          <p className={styles.heroSubtitle}>{t('about.hero.subtitle')}</p>
          <Link href="/catalog" className={styles.heroCta}>
            {t('about.cta')}
          </Link>
        </div>
      </section>

      <section className={styles.values}>
        {values.map(({ key, Icon }) => (
          <div key={key} className={styles.valueCard}>
            <span className={styles.valueIcon}>
              <Icon size={36} strokeWidth={1.75} />
            </span>
            <h3 className={styles.valueTitle}>{t(`about.values.${key}.title`)}</h3>
            <p className={styles.valueDesc}>{t(`about.values.${key}.desc`)}</p>
          </div>
        ))}
      </section>

      <section className={styles.stats}>
        {stats.map(({ number, key }) => (
          <div key={key} className={styles.statItem}>
            <span className={styles.statNumber}>{number}</span>
            <span className={styles.statLabel}>{t(`about.stats.${key}`)}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AboutPage;
