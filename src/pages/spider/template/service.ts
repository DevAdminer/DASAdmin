import { request } from "@umijs/max";

/** 字段映射项（与后端 fieldMapping JSON 一致） */
export interface FieldMapping {
  source_field: string;
  target_field: string;
  field_type?:
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

/** 配置参数项（configSchema 元素） */
export interface ConfigSchemaItem {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "select" | "json" | "textarea";
  required?: boolean;
  default?: any;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

/** 模板来源类型 */
export type SpiderSourceType = "html" | "rss" | "json_api" | "playwright";

/** 爬虫模板响应（后端 to_camel_dict 输出 camelCase） */
export interface SpiderTemplateItem {
  uid: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  sourceType: SpiderSourceType;
  icon?: string;
  tags?: string[];
  isBuiltin: number;
  usageCount: number;
  status: number;
  version?: string;
  sortOrder?: number;
  codeTemplate?: string;
  configSchema?: ConfigSchemaItem[];
  fieldMapping?: FieldMapping[];
  spiderCount: number;
  createdAt: string;
  updatedAt: string;
}
/** 模板对象（兼容别名） */
export type SpiderTemplateResponse = SpiderTemplateItem;

/** 列表响应 */
export interface SpiderTemplateListResponse {
  msg: string;
  status: string;
  data: {
    page: number;
    pageSize: number;
    list: SpiderTemplateItem[];
  };
}

/** 新建模板参数 */
export interface SpiderTemplateCreate {
  name: string;
  code: string;
  description?: string;
  category?: string;
  sourceType: SpiderSourceType;
  icon?: string;
  codeTemplate?: string;
  configSchema?: ConfigSchemaItem[];
  fieldMapping?: FieldMapping[];
  tags?: string[];
}

/** 从模板创建爬虫 */
export interface CreateSpiderFromTemplate {
  templateUid: string;
  name: string;
  code: string;
  config?: Record<string, any>;
  fieldMapping?: FieldMapping[];
}

/** 爬虫模板 API（对齐后端 /api/spider/template/*） */
export async function listSpiderTemplates(
  data?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    category?: string;
    sourceType?: SpiderSourceType;
    scope?: "all" | "builtin" | "mine";
    status?: number;
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
  uid: string,
  options?: { [key: string]: any }
): Promise<{ msg: string; status: string; data: SpiderTemplateItem }> {
  return request("/api/spider/template/detail", {
    method: "GET",
    params: { uid },
    ...(options || {}),
  });
}

/** 创建/操作类统一响应（后端 ok_msg 格式） */
export interface ActionResponse {
  msg: string;
  status: string;
}

export async function createSpiderTemplate(
  data: SpiderTemplateCreate,
  options?: { [key: string]: any }
): Promise<ActionResponse> {
  return request("/api/spider/template/create", {
    method: "POST",
    data,
    ...(options || {}),
  });
}

export async function updateSpiderTemplate(
  uid: string,
  data: Partial<SpiderTemplateCreate> & { status?: number },
  options?: { [key: string]: any }
): Promise<ActionResponse> {
  return request("/api/spider/template/update", {
    method: "POST",
    data: { uid, ...data },
    ...(options || {}),
  });
}

export async function deleteSpiderTemplate(
  uid: string,
  options?: { [key: string]: any }
): Promise<ActionResponse> {
  return request("/api/spider/template/delete", {
    method: "POST",
    data: { uid },
    ...(options || {}),
  });
}

/** 保存字段映射 */
export async function saveFieldMapping(
  uid: string,
  fieldMapping: FieldMapping[],
  options?: { [key: string]: any }
): Promise<ActionResponse> {
  return request("/api/spider/template/fieldMapping", {
    method: "POST",
    data: { uid, fieldMapping },
    ...(options || {}),
  });
}

/** 保存配置参数 Schema */
export async function saveConfigSchema(
  uid: string,
  configSchema: ConfigSchemaItem[],
  options?: { [key: string]: any }
): Promise<ActionResponse> {
  return request("/api/spider/template/config", {
    method: "POST",
    data: { uid, configSchema },
    ...(options || {}),
  });
}

/** 从模板创建爬虫 */
export async function createSpiderFromTemplate(
  data: CreateSpiderFromTemplate,
  options?: { [key: string]: any }
): Promise<ActionResponse> {
  return request("/api/spider/template/createSpider", {
    method: "POST",
    data,
    ...(options || {}),
  });
}
