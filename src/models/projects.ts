import type { Member } from './member';
import type { CustomMap } from '$lib/types/customMap';

export type Server = {
	name: string;
	host: string;
	networks?: CustomMap<string, string> | Record<string, string>;
	allNetworks?: Network[];
	currentNetwork?: string;
};

export type Project = {
	id?: string;
	ownerUserId?: string;
	avatarUrl?: string;
	name: string;
	members?: Member[];
	createdAt?: number;
	deployServers: Server[];
	buildServers: Server[];
};

export type Network = {
	id: string;
	name: string;
};
