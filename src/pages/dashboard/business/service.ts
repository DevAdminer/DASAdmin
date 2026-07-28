import { request } from '@umijs/max';
import type { DashboardOverview } from './data.d';

/** 仪表盘总览数据 */
export async function dashboardOverview() {
  return request<{ data: DashboardOverview }>('/api/dashboard/overview', {
    method: 'GET',
  });
}
