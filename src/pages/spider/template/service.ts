import { request } from "@umijs/max";
import type { SpiderType, ExtractRule, PaginationRule } from "../data.d";

/** 模板状态 */
export enum TemplateStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

/** 字段映射 */
export interface FieldMapping {
  source_field: string;
  target_field: string;
  field_type:
    | "string"
    | "text"
    | "number"
    | "datetime"
    | "boolean"
    | "array"
    | "object";
  transformer?: string;
  default_value?: string;
  required?: boolean;
  description?: string;
}

/** 爬虫模板创建参数 */
export interface SpiderTemplateCreate {
  name: string;
  description?: string;
  spider_type: SpiderType;
  version?: string;
  category?: string;
  tags?: string[];
  field_mapping?: FieldMapping[];
  extract_rules?: ExtractRule[];
  pagination_rule?: PaginationRule;
  code_template?: string;
  config_template?: Record<string, any>;
  headers_template?: Record<string, string>;
  allowed_domains?: string[];
  icon?: string;
}

/** 爬虫模板更新参数 */
export interface SpiderTemplateUpdate extends Partial<SpiderTemplateCreate> {
  status?: TemplateStatus;
}

/** 爬虫模板响应 */
export interface SpiderTemplateResponse {
  id: string;
  name: string;
  description?: string;
  spider_type: SpiderType;
  status: TemplateStatus;
  version: string;
  category?: string;
  tags?: string[];
  field_mapping?: FieldMapping[];
  extract_rules?: ExtractRule[];
  pagination_rule?: PaginationRule;
  code_template?: string;
  config_template?: Record<string, any>;
  headers_template?: Record<string, string>;
  allowed_domains?: string[];
  icon?: string;
  spider_count: number;
  created_at: string;
  updated_at: string;
}

/** 爬虫模板列表响应 */
export interface SpiderTemplateListResponse {
  items: SpiderTemplateResponse[];
  total: number;
  page: number;
  page_size: number;
}

/** 爬虫模板 API */
export async function listSpiderTemplates(
  data?: {
    page?: number;
    pageSize?: number;
    search?: string;
    spiderType?: SpiderType;
    status?: TemplateStatus;
    category?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
  options?: { [key: string]: any }
): Promise<SpiderTemplateListResponse> {
  return request("/api/spider/templates", {
    method: "POST",
    data,
    ...(options || {}),
  });
}

export async function getSpiderTemplate(
  id: string,
  options?: { [key: string]: any }
): Promise<SpiderTemplateResponse> {
  return request(`/api/v1/spider-templates/${id}`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function createSpiderTemplate(
  data: SpiderTemplateCreate,
  options?: { [key: string]: any }
): Promise<SpiderTemplateResponse> {
  return request("/api/v1/spider-templates", {
    method: "POST",
    data,
    ...(options || {}),
  });
}

export async function updateSpiderTemplate(
  id: string,
  data: SpiderTemplateUpdate,
  options?: { [key: string]: any }
): Promise<SpiderTemplateResponse> {
  return request(`/api/v1/spider-templates/${id}`, {
    method: "PUT",
    data,
    ...(options || {}),
  });
}

export async function deleteSpiderTemplate(
  id: string,
  options?: { [key: string]: any }
): Promise<void> {
  return request(`/api/v1/spider-templates/${id}`, {
    method: "DELETE",
    ...(options || {}),
  });
}

export async function publishSpiderTemplate(
  id: string,
  options?: { [key: string]: any }
): Promise<SpiderTemplateResponse> {
  return request(`/api/v1/spider-templates/${id}/publish`, {
    method: "POST",
    ...(options || {}),
  });
}

export async function createSpiderFromTemplate(
  id: string,
  data: {
    name: string;
    target_url?: string;
    config_overrides?: Record<string, any>;
  },
  options?: { [key: string]: any }
): Promise<{ spider_id: string; spider_name: string }> {
  return request(`/api/v1/spider-templates/${id}/create-spider`, {
    method: "POST",
    data,
    ...(options || {}),
  });
}
