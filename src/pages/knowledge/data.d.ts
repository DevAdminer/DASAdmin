export interface KBItem { id: number; code: string; name: string; description: string; documentCount: number; vectorCount: number; status: number; createdAt: string; }
export interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface ProTableResult<T> { data: T[]; total: number; success: boolean; }
