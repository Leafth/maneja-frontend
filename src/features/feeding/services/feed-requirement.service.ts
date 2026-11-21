import { api } from '@/infrastructure/api';
import type { FeedRequirementDto, FeedRequirementListDto, SaveFeedRequirementDto } from '../dtos/feed-requirement.dto';

const base = (groupId: string) => `/groups/${encodeURIComponent(groupId)}/feed_requirements`;
export const feedRequirementService = {
  async list(groupRemoteId: string) { return (await api.get<FeedRequirementListDto>(base(groupRemoteId))).data; },
  async create(groupRemoteId: string, body: SaveFeedRequirementDto) { return (await api.post<FeedRequirementDto>(base(groupRemoteId), body)).data; },
  async update(groupRemoteId: string, remoteId: string, body: SaveFeedRequirementDto) { return (await api.patch<FeedRequirementDto>(`${base(groupRemoteId)}/${encodeURIComponent(remoteId)}`, body)).data; },
  async remove(groupRemoteId: string, remoteId: string) { await api.delete(`${base(groupRemoteId)}/${encodeURIComponent(remoteId)}`); },
};
