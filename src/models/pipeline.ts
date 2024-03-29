import type { CustomMap } from '$lib/types/customMap';

export type BuildConfig = {
	imageName: string;
	imageTag: string;
	args: object;
	dockerfile: string;
	repoUrl: string;
	repoName: string;
	repoBranch: string;
};

export type FileMountConfig = {
	name: string;
	content: string;
};

export type RestartPolicy = {
	name: string;
	maximumRetryCount?: number;
};

export type DeployConfig = {
	imageName: string;
	imageTag: string;
	serviceName: string;
	restartPolicy: RestartPolicy;
	volumeMounts: CustomMap<string, string>;
	files: CustomMap<string, string>;
	autoRemove: boolean;
	env: string[];
	ports: CustomMap<string, string>;
	networkId: string;
	networkName: string;
	command?: string;
};

export type Task = {
	id: string;
	name: string;
	createdAt?: number;
	updatedAt?: number;
	executedAt?: number;
	stoppedAt?: number;
	scheduledAt?: number;
	status?: string;
	upstreamTaskId: string;
	streamWebhook: string;
	logUrl: string;
	config: BuildConfig | DeployConfig | undefined;
	remarks?: string;
	autoRun: boolean;
	timeout?: number;
	type: string;
	diskInfo?: DiskInfo;
};

export type DiskInfo = {
	totalSize: number;
	availSize: number;
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
