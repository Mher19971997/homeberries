import React from 'react';
import { useTranslation } from "next-i18next";
import { useFormatPrice } from '@homeberris/utils/formatPrice';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CatalogItem, groupOptionItem, CommentItem } from '@homeberris/types/catalog';
import CommentCard from '@homeberris/components/CommentCard';
import CreateComment from '@homeberris/components/CreateComment';
import styles from './index.module.css';

interface ProductCharacteristicsSidebarProps {
  open: boolean;
  onClose: () => void;
  catalog: CatalogItem | null;
}

const ProductCharacteristicsSidebar: React.FC<ProductCharacteristicsSidebarProps> = ({
  open,
  onClose,
  catalog
}) => {
  const { t } = useTranslation("common");
  const { formatPrice } = useFormatPrice();
  const handleCopyArticle = (text: string) => {
    navigator.clipboard.writeText(text);
    // Можно добавить уведомление об успешном копировании
  };

  const handleCommentSuccess = () => {
    // Комментарий успешно добавлен, данные обновятся автоматически через react-query
  };

  if (!catalog) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{
        paper: styles.drawerPaper
      }}
    >
      <Box className={styles.drawerContent}>
        <Box className={styles.header}>
          <Typography variant="h6" className={styles.title}>
            {t('sidebar.title')}
          </Typography>
          <IconButton onClick={onClose} className={styles.closeButton}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box className={styles.content}>
          {/* Основная информация */}
          <Box className={styles.section}>
            <Typography className={styles.sectionTitle}>{t('sidebar.basicInfo')}</Typography>
            <List disablePadding>
              <ListItem className={styles.listItem}>
                <ListItemText
                  primary={t('sidebar.article')}
                  secondary={
                    <Box className={styles.articleRow}>
                      <Typography className={styles.articleText}>{catalog.uuid}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyArticle(catalog.uuid)}
                        className={styles.copyButton}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                />
              </ListItem>
              {catalog.category && (
                <ListItem className={styles.listItem}>
                  <ListItemText
                    primary={t('sidebar.category')}
                    secondary={catalog.category.name}
                  />
                </ListItem>
              )}
              {catalog.subCategorie && (
                <ListItem className={styles.listItem}>
                  <ListItemText
                    primary={t('sidebar.subcategory')}
                    secondary={catalog.subCategorie.name}
                  />
                </ListItem>
              )}
            </List>
          </Box>

          {/* Характеристики */}
          {catalog.groupOption && catalog.groupOption.length > 0 && (
            <>
              {catalog.groupOption.map((group: groupOptionItem, groupIndex: number) => (
                group.options && group.options.length > 0 && (
                  <Box key={groupIndex} className={styles.section}>
                    <Typography className={styles.sectionTitle}>
                      {group.name || t('sidebar.specs')}
                    </Typography>
                    <List disablePadding>
                      {group.options.map((option: any, optionIndex: number) => (
                        <ListItem key={optionIndex} className={styles.listItem}>
                          <ListItemText
                            primary={option.name}
                            secondary={option.value}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )
              ))}
            </>
          )}

          {/* Описание */}
          {catalog.description && (
            <Box className={styles.section}>
              <Typography className={styles.sectionTitle}>{t('sidebar.description')}</Typography>
              <Typography className={styles.descriptionText}>
                {catalog.description}
              </Typography>
            </Box>
          )}

          {/* Дополнительная информация */}
          <Box className={styles.section}>
            <Typography className={styles.sectionTitle}>{t('sidebar.additionalInfo')}</Typography>
            <List disablePadding>
              <ListItem className={styles.listItem}>
                <ListItemText
                  primary={t('sidebar.price')}
                  secondary={formatPrice(catalog.price)}
                />
              </ListItem>
              {catalog.createdAt && (
                <ListItem className={styles.listItem}>
                  <ListItemText
                    primary={t('sidebar.dateAdded')}
                    secondary={new Date(catalog.createdAt).toLocaleDateString('ru-RU')}
                  />
                </ListItem>
              )}
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Комментарии */}
          <Box className={styles.section}>
            <Typography className={styles.sectionTitle}>{t('sidebar.reviews')}</Typography>
            
            {/* Форма создания комментария */}
            <Box sx={{ mb: 3 }}>
              <CreateComment 
                catalogUuid={catalog.uuid} 
                onSuccess={handleCommentSuccess}
              />
            </Box>

            {/* Список комментариев */}
            {catalog.comments && catalog.comments.length > 0 ? (
              <Box className={styles.commentsList}>
                {catalog.comments.map((comment: CommentItem) => (
                  <Box key={comment.uuid} sx={{ mb: 2 }}>
                    <CommentCard comment={comment} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography className={styles.emptyComments}>
                {t('sidebar.noReviews')}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ProductCharacteristicsSidebar;
