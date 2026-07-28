export interface ArticleItem { id: number; title: string; url: string; source: string; publishTime: string; tags: string[]; spiderName: string; createdAt: string; }
export interface DocumentItem { id: number; title: string; type: string; fileSize: number; status: number; createdAt: string; }
export interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface ProTableResult<T> { data: T[]; total: number; success: boolean; }
