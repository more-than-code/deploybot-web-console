import type { CustomMap } from '$lib/types/customMap';
import type { Member } from './member';

export type Server = {
  name: string;
  host: string;
  networks?: CustomMap<string, string>;
};


export type Project = {
  id: string;
  ownerUserId: string;
  avatarUrl: string;
	name: string;
	members: Member[];
  createdAt: number;
  deployServers: Server[];
  buildServers: Server[];
};
