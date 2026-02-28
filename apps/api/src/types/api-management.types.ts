/**
 * Types for API Management: response shapes and business errors.
 */
export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export interface CreateProviderDto {
  slug: string;
  name: string;
  logoUrl?: string;
}

export interface UpdateProviderDto {
  name?: string;
  logoUrl?: string;
}

export interface CreateEndpointDto {
  url: string;
  method?: string;
  region?: string;
  description?: string;
  isEnabled?: boolean;
}

export interface UpdateEndpointDto {
  url?: string;
  method?: string;
  region?: string;
  description?: string;
  isEnabled?: boolean;
}

export interface ApiManagementErrorBody {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export type ApiManagementErrorCode =
  | "VALIDATION_ERROR"
  | "SLUG_ALREADY_EXISTS"
  | "NOT_FOUND"
  | "ENDPOINT_NOT_FOUND"
  | "PROVIDER_NOT_FOUND"
  | "SERVER_ERROR";
