export type BuildConfig = {
	imageName: string;
	imageTag: string;
	dockerfile: string;
	repoUrl: string;
	repoName: string;
};

export type DeployConfig = {
	imageName: string;
	imageTag: string;
	ServiceName: string;
	MountSource: string;
	MountTarget: string;
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
	tasks: Task[];
	repoWatched: string;
	branchWatched: string;
	autoRun: boolean;
};
