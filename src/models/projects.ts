import type { Member } from './member';

export type Project = {
  id: string;
  ownerUserId: string;
  avatarUrl: string;
	name: string;
	members: Member[];
  createdAt: number;
};
