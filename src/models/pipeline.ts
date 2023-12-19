export type BuildConfig = {
  imageName: string;
  imageTag: string;
  args: string
  dockerfile: string;
  repoUrl: string;
  repoName: string;
  repoBranch: string;
};

export type DeployConfig = {
  imageName: string;
  imageTag: string;
  serviceName: string;
  mountSource: string;
  mountTarget: string;
  autoRemove: boolean;
  env: string[];
  hostPort: string;
  exposedPort: string;
  networkId: string;
  networkName: string;
};

export type Task = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  executedAt: number;
  stoppedAt: number;
  scheduledAt: number;
  status: string;
  upstreamTaskId: string;
  streamWebhook: string;
  logUrl: string;
  config: BuildConfig | DeployConfig;
  remarks: string;
  autoRun: boolean;
  timeout: number;
  type: string;
};

export type Pipeline = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  executedAt: number;
  stoppedAt: number;
  scheduledAt: number;
  status: string;
  arguments: string[];
  labels: Map<string, string>;
  tasks: Task[];
  repoWatched: string;
  branchWatched: string;
  autoRun: boolean;
};