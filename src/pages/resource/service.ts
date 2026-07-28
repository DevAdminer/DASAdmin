import { request } from '@umijs/max';
import type { ProxyItem, CookieItem, HeaderItem, UAItem, CredentialItem, PageResult, ProTableResult } from './data.d';

// ===================== 代理池 =====================

export async function proxyList(params: { current?: number; pageSize?: number; protocol?: string; region?: string }): Promise<ProTableResult<ProxyItem>> {
  const res = await request<{ data: PageResult<ProxyItem> }>('/api/proxy/list', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20, protocol: params.protocol, region: params.region } });
  return { data: res.data.list, total: res.data.total, success: true };
}

export async function proxyCreate(data: Record<string, any>) {
  return request('/api/proxy/create', { method: 'POST', data });
}

export async function proxyCheck(id: number) {
  return request(`/api/proxy/${id}/check`, { method: 'POST' });
}

export async function proxyBatchCheck() {
  return request('/api/proxy/batch-check', { method: 'POST' });
}

export async function proxyDelete(id: number) {
  return request(`/api/proxy/${id}`, { method: 'DELETE' });
}

// ===================== Cookie 池 =====================

export async function cookieList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<CookieItem>> {
  const res = await request<{ data: PageResult<CookieItem> }>('/api/cookie/list', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}

export async function cookieCreate(data: Record<string, any>) {
  return request('/api/cookie/create', { method: 'POST', data });
}

export async function cookieCheck(id: number) {
  return request(`/api/cookie/${id}/check`, { method: 'POST' });
}

// ===================== 请求头池 =====================

export async function headerList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<HeaderItem>> {
  const res = await request<{ data: PageResult<HeaderItem> }>('/api/header/list', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}

// ===================== UA 池 =====================

export async function uaList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<UAItem>> {
  const res = await request<{ data: PageResult<UAItem> }>('/api/ua/list', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}

// ===================== 凭证管理 =====================

export async function credentialList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<CredentialItem>> {
  const res = await request<{ data: PageResult<CredentialItem> }>('/api/credential/list', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}

// ===================== 统计 =====================

export async function proxyStats() {
  return request<{ data: { total: number; healthy: number; unhealthy: number; availableRate: number; avgResponse: number } }>('/api/proxy/stats', { method: 'GET' });
}
