import React, { useState } from 'react';
import { CommentItem } from '@homeberris/types/catalog';
import { Avatar, Box, Card, Rating, Typography, Button } from '@mui/material';
import Image from 'next/image';
import styles from './index.module.css';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

interface CommentCardProps {
  comment: CommentItem;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Парсим текст комментария для извлечения структурированных данных
  const parseCommentText = (text: string) => {
    // Простой парсинг - можно улучшить
    const lines = text.split('\n').filter(line => line.trim());
    let pros = '';
    let cons = '';
    let commentText = '';
    
    let currentSection = '';
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('достоинства') || lowerLine.includes('плюсы') || lowerLine.includes('pros')) {
        currentSection = 'pros';
        pros = line.replace(/достоинства|плюсы|pros/gi, '').replace(':', '').trim();
      } else if (lowerLine.includes('недостатки') || lowerLine.includes('минусы') || lowerLine.includes('cons')) {
        currentSection = 'cons';
        cons = line.replace(/недостатки|минусы|cons/gi, '').replace(':', '').trim();
      } else if (lowerLine.includes('комментарий') || lowerLine.includes('comment')) {
        currentSection = 'comment';
        commentText = line.replace(/комментарий|comment/gi, '').replace(':', '').trim();
      } else {
        if (currentSection === 'pros') {
          pros += (pros ? ' ' : '') + line.trim();
        } else if (currentSection === 'cons') {
          cons += (cons ? ' ' : '') + line.trim();
        } else if (currentSection === 'comment') {
          commentText += (commentText ? ' ' : '') + line.trim();
        } else {
          commentText += (commentText ? ' ' : '') + line.trim();
        }
      }
    });
    
    // Если не найдено структурированных данных, используем весь текст как комментарий
    if (!pros && !cons && !commentText) {
      commentText = text;
    }
    
    return { pros, cons, commentText: commentText || text };
  };

  const { pros, cons, commentText } = parseCommentText(comment.text || '');
  const shouldShowExpand = commentText.length > 150;
  const displayText = isExpanded || !shouldShowExpand 
    ? commentText 
    : commentText.substring(0, 150) + '...';

  const formatDate = (date?: Date | string) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'd MMMM', { locale: ru });
    } catch {
      return '';
    }
  };

  // Генерируем имя пользователя из email
  const getUserName = (email?: string) => {
    if (!email) return 'Покупатель';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Определяем рейтинг (по умолчанию 5, если есть pros и нет cons - 5, если есть cons - 3-4)
  const getRating = () => {
    if (pros && !cons) return 5;
    if (cons && !pros) return 2;
    if (pros && cons) return 3;
    return 5;
  };

  return (
    <Card className={styles.body}>
      <Box className={styles.header}>
        <Box className={styles.userInfo}>
          <Avatar className={styles.avatar}>
            {getUserName(comment?.user?.email)[0]}
          </Avatar>
          <Box className={styles.userDetails}>
            <Typography className={styles.userName}>
              {getUserName(comment?.user?.email)}
            </Typography>
            {comment.createdAt && (
              <Typography className={styles.date}>
                {formatDate(comment.createdAt)}
              </Typography>
            )}
          </Box>
        </Box>
        <Rating 
          name='read-only' 
          value={getRating()} 
          readOnly 
          className={styles.rating}
          size="small"
        />
      </Box>

      <Box className={styles.content}>
        {pros && (
          <Box className={styles.section}>
            <Typography className={styles.sectionLabel}>Достоинства:</Typography>
            <Typography className={styles.sectionText}>{pros}</Typography>
          </Box>
        )}

        {cons && (
          <Box className={styles.section}>
            <Typography className={styles.sectionLabel}>Недостатки:</Typography>
            <Typography className={styles.sectionText}>{cons}</Typography>
          </Box>
        )}

        {commentText && (
          <Box className={styles.section}>
            {(!pros && !cons) && (
              <Typography className={styles.sectionLabel}>Комментарий:</Typography>
            )}
            <Typography className={styles.commentText}>{displayText}</Typography>
            {shouldShowExpand && (
              <Button
                className={styles.expandButton}
                onClick={() => setIsExpanded(!isExpanded)}
                size="small"
              >
                {isExpanded ? 'свернуть' : 'ещё'}
              </Button>
            )}
          </Box>
        )}
      </Box>

      {comment.image && (
        <Box className={styles.mediaContainer}>
          <Box className={styles.imageWrapper}>
            <Image
              className={styles.commentImage}
              src={process.env.NEXT_PUBLIC_BASE_URL + comment.image}
              alt="Review media"
              width={400}
              height={400}
            />
            <Box className={styles.playOverlay}>
              <PlayCircleOutlineIcon className={styles.playIcon} />
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default CommentCard;
