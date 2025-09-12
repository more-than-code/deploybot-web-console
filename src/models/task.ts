import type { Task } from 'models/pipeline';

export type TaskModalReq = {
	id?: string;
	pipelineId: string;
	accessToken: string;
};

export type TaskPayload = {
	task: Task;
};

export type TaskDeleteReq = {
	id: string;
	pipelineId: string;
};
