export interface LogItem { id: number; level: string; message: string; module: string; entityId: number; context: Record<string, any>; createdAt: string; }
export interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface ProTableResult<T> { data: T[]; total: number; success: boolean; }
