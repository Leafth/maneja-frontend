import { api } from '@/infrastructure/api';
import type { CreateFeedingDto, FeedingDto, FeedingListDto } from '../dtos/feeding.dto';

const base = (groupId: string) => `/groups/${encodeURIComponent(groupId)}/feedings`;
export const feedingService = {
  async create(groupRemoteId: string, body: CreateFeedingDto) {
    const response = await api.post<FeedingDto>(base(groupRemoteId), body);
    if (response.status !== 201 || !response.data.id) {throw new Error('Resposta de alimentação sem confirmação válida.');}
    return response.data;
  },
  async list(groupRemoteId: string, page = 1, perPage = 100) {
    return (await api.get<FeedingListDto>(base(groupRemoteId), { params: { page, per_page: perPage } })).data;
  },
};
