import type { Member } from './member'

export type Server = {
  name: string;
  host: string;
  networks?: any;
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
  id: string
  name: string
}