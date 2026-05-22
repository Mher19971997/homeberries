import React, { useMemo } from 'react';
import { Box, Typography, Rating } from '@mui/material';
import { CommentItem } from '@homeberris/types/catalog';
import styles from './index.module.css';

interface CommentRatingSummaryProps {
  comments: CommentItem[];
}

const CommentRatingSummary: React.FC<CommentRatingSummaryProps> = ({ comments }) => {
  const ratingData = useMemo(() => {
    if (!comments || comments.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: [0, 0, 0, 0, 0]
      };
    }

    // Парсим комментарии для извлечения рейтингов
    const ratings: number[] = [];
    
    comments.forEach(comment => {
      const text = comment.text || '';
      const lowerText = text.toLowerCase();
      
      // Определяем рейтинг на основе контента
      let rating = 5; // По умолчанию
      
      if (lowerText.includes('недостатки') || lowerText.includes('минусы') || lowerText.includes('cons')) {
        if (lowerText.includes('достоинства') || lowerText.includes('плюсы') || lowerText.includes('pros')) {
          rating = 3; // Есть и плюсы и минусы
        } else {
          rating = 2; // Только минусы
        }
      } else if (lowerText.includes('отлично') || lowerText.includes('супер') || lowerText.includes('прекрасно') || lowerText.includes('замечательно')) {
        rating = 5;
      } else if (lowerText.includes('хорошо') || lowerText.includes('нормально') || lowerText.includes('неплохо')) {
        rating = 4;
      } else if (lowerText.includes('плохо') || lowerText.includes('ужасно') || lowerText.includes('разочарован')) {
        rating = 1;
      }
      
      ratings.push(rating);
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings 
      : 0;

    // Распределение по звездам
    const ratingDistribution = [0, 0, 0, 0, 0];
    ratings.forEach(rating => {
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[Math.round(rating) - 1]++;
      }
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Округляем до 1 знака после запятой
      totalRatings,
      ratingDistribution
    };
  }, [comments]);

  if (ratingData.totalRatings === 0) {
    return null;
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography className={styles.title}>
          Оценки
          <Typography component="span" className={styles.count}>
            {ratingData.totalRatings}
          </Typography>
        </Typography>
        <Typography className={styles.questions}>
          Вопросы
          <Typography component="span" className={styles.questionsCount}>5</Typography>
        </Typography>
      </Box>

      <Box className={styles.ratingSection}>
        <Typography className={styles.averageRating}>
          {ratingData.averageRating.toFixed(1).replace('.', ',')}
        </Typography>
        <Box className={styles.ratingDisplay}>
          <Rating
            value={ratingData.averageRating}
            readOnly
            precision={0.1}
            className={styles.ratingStars}
            size="large"
          />
          <Typography className={styles.ratingsCount}>
            {ratingData.totalRatings} {ratingData.totalRatings === 1 ? 'оценка' : ratingData.totalRatings < 5 ? 'оценки' : 'оценок'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentRatingSummary;
