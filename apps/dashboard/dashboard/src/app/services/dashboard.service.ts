/**
 * Calls the API for dashboard data, provider detail, latency history, and incidents.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



export interface ProviderDashboardRow {
  providerId: number;
  name: string;
  slug: string;

  status: "operational" | "degraded" | "down";

  trend: "up" | "down" | "stable";

  lastLatency: number | null;
  avgLatency3h: number | null;

  errorRate24h: number;
  uptime24h: number;
  incidents24h: number;

  avgResponseSize: number | null;
  lastCheckAt: string | null;
  primaryEndpointUrl: string | null;
}

export interface Incident {
  id: number;
  providerId: number;
  startAt: string | null;
  endAt: string | null;
  type: string; 
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface LatencyPoint {
  timestamp: string;
  latencyMs: number;
}


@Injectable({ providedIn: 'root' })
export class DashboardService {
  baseUrl = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ProviderDashboardRow[]> {
    return this.http.get<ProviderDashboardRow[]>(`${this.baseUrl}/dashboard`);
  }

  getOverview() {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard`);
  }

  getProvider(slug: string) {
    return this.http.get<ProviderDashboardRow>(`${this.baseUrl}/providers/${slug}`);
  }

  getIncidents(providerId: number) {
    return this.http.get<Incident[]>(`${this.baseUrl}/incidents/${providerId}`);
  }

  getLatencyHistory(
    slug: string,
    windowMinutes: number = 180,
    stepMinutes: number = 5
  ): Observable<LatencyPoint[]> {
    const params = {
      windowMinutes: String(windowMinutes),
      stepMinutes: String(stepMinutes),
    };

    return this.http.get<LatencyPoint[]>(
      `${this.baseUrl}/providers/${encodeURIComponent(slug)}/latency-history`,
      { params }
    );
  }
}