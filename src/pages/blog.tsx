import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './blog.module.css';

const POSTS = [
  { id: 1, tag: 'blog.posts.post1.tag', title: 'blog.posts.post1.title', excerpt: 'blog.posts.post1.excerpt', date: '2025-06-01', img: '/images/cardEmpty.png' },
  { id: 2, tag: 'blog.posts.post2.tag', title: 'blog.posts.post2.title', excerpt: 'blog.posts.post2.excerpt', date: '2025-05-20', img: '/images/cardEmpty.png' },
  { id: 3, tag: 'blog.posts.post3.tag', title: 'blog.posts.post3.title', excerpt: 'blog.posts.post3.excerpt', date: '2025-05-10', img: '/images/cardEmpty.png' },
];

const BlogPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t('nav.home')}</Link>
        <span className={styles.sep}>/</span>
        <span className={styles.breadcrumbActive}>{t('nav.blog')}</span>
      </nav>
    </div>
  );
};

export default BlogPage;
