import type { BuildConfig, DeployConfig, Task } from 'models/pipeline'

export type TaskModalReq = {
  id: string;
  pipelineId: string;
  accessToken: string;
  isBuild: boolean;
}

export type TaskPayload = {
  Task: Task
}

export type TaskUpdateInput = {
  id: string
  pipelineId: string
  task: TaskConfig
}

type TaskConfig = {
  config: BuildConfig | DeployConfig | undefined
}