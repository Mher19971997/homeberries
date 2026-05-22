import { $authHost } from '@homeberris/http/index';
import { UUID } from 'crypto';
import { CommentItem } from '@homeberris/types/catalog';
import { ListResult } from '@homeberris/types/filter';

const createComment = async (
  inputDto: {
    text: string;
    catalogUuid: UUID;
    image?: File;
  },
  token: string
): Promise<CommentItem> => {
  const formData = new FormData();
  formData.append('text', inputDto.text);
  formData.append('catalogUuid', inputDto.catalogUuid);
  if (inputDto.image) {
    formData.append('image', inputDto.image);
  }

  const { data } = await $authHost.post('/api/v1/comment', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

const getAllComments = async (
  query: string,
  token: string
): Promise<{ data: CommentItem[]; meta: ListResult }> => {
  const { data } = await $authHost.get(`/api/v1/comment?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

export { createComment, getAllComments };
