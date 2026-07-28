export interface DashboardOverview {
  totalTasks: number;
  todayJobs: number;
  jobGrowth: number;
  activeSpiders: number;
  totalItems: number;
  successRate: number;
  failedJobs: number;
  runningJobs: number;
  pendingJobs: number;
  recentJobs: {
    taskName: string;
    time: string;
    status: 'success' | 'failed' | 'running';
    itemsCount: number;
    duration: string;
  }[];
  sourceDistribution: {
    name: string;
    value: number;
    percent: number;
    color: string;
  }[];
}
