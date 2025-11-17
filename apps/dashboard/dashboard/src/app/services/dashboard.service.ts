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


@Injectable({ providedIn: 'root' })
export class DashboardService {
  baseUrl = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ProviderDashboardRow[]> {
    return this.http.get<ProviderDashboardRow[]>(`${this.baseUrl}/dashboard`);
  }

    getOverview() {
    return this.http.get<any[]>('http://localhost:3000/dashboard');
  }

getProvider(slug: string) {
  return this.http.get<ProviderDashboardRow>(`${this.baseUrl}/providers/${slug}`);
}

getIncidents(providerId: number) {
  return this.http.get<Incident[]>(`${this.baseUrl}/incidents/${providerId}`);
}



}