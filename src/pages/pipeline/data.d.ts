export interface PipelineItem {
  id: number; code: string; name: string; description: string; status: number;
  version: number; nodeCount: number; taskCount: number;
  createdAt: string; updatedAt: string;
}
export interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface ProTableResult<T> { data: T[]; total: number; success: boolean; }
