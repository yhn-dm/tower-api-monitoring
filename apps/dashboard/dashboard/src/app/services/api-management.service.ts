/**
 * HTTP client for creating, updating, and deleting providers and endpoints.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';

const BASE = 'http://localhost:3000/api-management';

export interface Provider {
  id: number;
  slug: string;
  name: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  endpoints?: Endpoint[];
}

export interface Endpoint {
  id: number;
  providerId: number;
  url: string;
  method: string;
  region: string;
  isEnabled: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderPayload {
  slug: string;
  name: string;
  logoUrl?: string;
}

export interface UpdateProviderPayload {
  name?: string;
  logoUrl?: string;
}

export interface CreateEndpointPayload {
  url: string;
  method?: string;
  region?: string;
  description?: string;
  isEnabled?: boolean;
}

export interface UpdateEndpointPayload {
  url?: string;
  method?: string;
  region?: string;
  description?: string;
  isEnabled?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class ApiManagementService {
  constructor(private http: HttpClient) {}

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${BASE}/providers`).pipe(
      catchError((err) => {
        console.error('api-management getProviders', err);
        return of([]);
      })
    );
  }

  getProviderById(id: number): Observable<Provider | null> {
    return this.http.get<Provider>(`${BASE}/providers/${id}`).pipe(
      catchError((err) => {
        console.error('api-management getProviderById', err);
        return of(null);
      })
    );
  }

  createProvider(payload: CreateProviderPayload): Observable<{ data?: Provider; error?: ApiError }> {
    return this.http.post<Provider>(`${BASE}/providers`, payload).pipe(
      map((data) => ({ data })),
      catchError((err) => {
        const body = (err.error || {}) as ApiError;
        return of({
          error: body.code ? body : { code: 'SERVER_ERROR', message: err.message || 'Request failed' },
        });
      })
    );
  }

  updateProvider(
    id: number,
    payload: UpdateProviderPayload
  ): Observable<{ data?: Provider; error?: ApiError }> {
    return this.http.put<Provider>(`${BASE}/providers/${id}`, payload).pipe(
      map((data) => ({ data })),
      catchError((err) => {
        const body = (err.error || {}) as ApiError;
        return of({
          error: body.code ? body : { code: 'SERVER_ERROR', message: err.message || 'Request failed' },
        });
      })
    );
  }

  deleteProvider(id: number): Observable<{ error?: ApiError }> {
    return this.http.delete(`${BASE}/providers/${id}`).pipe(
      map(() => ({})),
      catchError((err) => {
        const body = (err.error || {}) as ApiError;
        return of({
          error: body.code ? body : { code: 'SERVER_ERROR', message: err.message || 'Request failed' },
        });
      })
    );
  }

  createEndpoint(
    providerId: number,
    payload: CreateEndpointPayload
  ): Observable<{ data?: Endpoint; error?: ApiError }> {
    return this.http.post<Endpoint>(`${BASE}/providers/${providerId}/endpoints`, payload).pipe(
      map((data) => ({ data })),
      catchError((err) => {
        const body = (err.error || {}) as ApiError;
        return of({
          error: body.code ? body : { code: 'SERVER_ERROR', message: err.message || 'Request failed' },
        });
      })
    );
  }

  updateEndpoint(
    id: number,
    payload: UpdateEndpointPayload
  ): Observable<{ data?: Endpoint; error?: ApiError }> {
    return this.http.put<Endpoint>(`${BASE}/endpoints/${id}`, payload).pipe(
      map((data) => ({ data })),
      catchError((err) => {
        const body = (err.error || {}) as ApiError;
        return of({
          error: body.code ? body : { code: 'SERVER_ERROR', message: err.message || 'Request failed' },
        });
      })
    );
  }

  deleteEndpoint(id: number): Observable<{ error?: ApiError }> {
    return this.http.delete(`${BASE}/endpoints/${id}`).pipe(
      map(() => ({})),
      catchError((err) => {
        const body = (err.error || {}) as ApiError;
        return of({
          error: body.code ? body : { code: 'SERVER_ERROR', message: err.message || 'Request failed' },
        });
      })
    );
  }
}
