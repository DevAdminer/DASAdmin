import { request } from '@umijs/max';

// ===================== Resource Pool 类型 =====================

export interface ProxyItem {
  id: number;
  code: string;
  host: string;
  port: number;
  protocol: string;
  region: string;
  status: number; // 1正常 0异常
  responseTimeMs: number;
  successRate: number;
  useCount: number;
  rotationStrategy: string;
  lastCheckAt: string;
  createdAt: string;
}

export interface CookieItem {
  id: number;
  code: string;
  name: string;
  domain: string;
  status: number; // 1有效 0过期
  expireAt: string;
  lastCheckAt: string;
  autoRefresh: number;
  createdAt: string;
}

export interface HeaderItem {
  id: number;
  code: string;
  name: string;
  domain: string;
  content: Record<string, string>;
  rotate: boolean;
  createdAt: string;
}

export interface UAItem {
  id: number;
  uaString: string;
  browser: string;
  useCount: number;
  createdAt: string;
}

export interface CredentialItem {
  id: number;
  code: string;
  name: string;
  credentialType: string;
  domain: string;
  expireAt: string;
  status: number;
  createdAt: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProTableResult<T> {
  data: T[];
  total: number;
  success: boolean;
}
