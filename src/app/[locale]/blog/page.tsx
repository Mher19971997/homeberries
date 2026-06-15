'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';
import Breadcrumb from '@homeberris/components/Breadcrumb';

const POSTS = [
  { id: 1, tag: 'blog.posts.post1.tag', title: 'blog.posts.post1.title', excerpt: 'blog.posts.post1.excerpt', date: '2025-06-01', img: '/images/cardEmpty.png' },
  { id: 2, tag: 'blog.posts.post2.tag', title: 'blog.posts.post2.title', excerpt: 'blog.posts.post2.excerpt', date: '2025-05-20', img: '/images/cardEmpty.png' },
  { id: 3, tag: 'blog.posts.post3.tag', title: 'blog.posts.post3.title', excerpt: 'blog.posts.post3.excerpt', date: '2025-05-10', img: '/images/cardEmpty.png' },
];

const BlogPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.page}>
      <Breadcrumb items={[
        { label: t('nav.home'), href: '/' },
        { label: t('nav.blog') },
      ]} />
    </div>
  );
};

export default BlogPage;
