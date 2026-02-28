/**
 * Main provider table with filters and sort; rows expand to show incidents and a mini latency chart.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardService, ProviderDashboardRow, LatencyPoint, Incident } from '../../services/dashboard.service';
import { LatencyMiniChartComponent } from '../../components/latency-mini-chart.component';

const RECENT_INCIDENTS_LIMIT = 5;

function normalizeIncidentType(raw: string): 'down' | 'degraded' {
  const t = (raw || '').toUpperCase();
  if (t === 'DOWN') return 'down';
  if (t === 'SLOW' || t === 'ERROR') return 'degraded';
  return 'down';
}

interface ProviderRow {
  id: string;
  slug: string;
  providerId: number;
  providerName: string;
  status: "operational" | "degraded" | "down";

  lastLatency: number;
  avgLatency3h: number;

  latencyHistory: number[];
  latencyHistoryReal?: LatencyPoint[];

  availability24h: number;
  availability7d: number;
  incidents24h: number;

  lastCheckAt: Date | string | null;
  primaryEndpointUrl: string | null;

  mutedUntil?: Date | null;

  recentIncidents?: Incident[];
  incidentsLoading?: boolean;
  incidentsError?: boolean;
}

function computeSLA7d(uptime24h: number): number {
  if (uptime24h >= 99.97) return uptime24h;
  if (uptime24h >= 99.5) return uptime24h - 0.01;
  if (uptime24h >= 98) return uptime24h - 0.5;
  return uptime24h - 1;
}

function generateHistory(avg: number, last: number): number[] {
  const history = [];
  for (let i = 0; i < 8; i++) {
    const drift = (last - avg) * (i / 8);
    const noise = (Math.random() - 0.5) * avg * 0.05;
    history.push(Math.max(1, avg + drift + noise));
  }
  return history;
}

function computeIncidents(status: "operational" | "degraded" | "down"): number {
  if (status === "operational") {
    return 0;
  }
  if (status === "degraded") {
    const base = Math.floor(Math.random() * 2) + 1;
    return base <= 0 ? 1 : base;
  }
  const rough = Math.floor(Math.random() * 5) + 3;
  return rough;
}



function computeTrend(last: number, avg: number): "up" | "down" | "stable" {
  if (last > avg * 1.12) return "up";
  if (last < avg * 0.9) return "down";
  return "stable";
}

function computeStatus(uptime: number): "operational" | "degraded" | "down" {
  if (uptime < 95) return "down";
  if (uptime < 99) return "degraded";
  return "operational";
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LatencyMiniChartComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

  providers: ProviderRow[] = [];
  filtered: ProviderRow[] = [];

  search: string = "";

  filter: "all" | "operational" | "degraded" | "down" = "all";

  loading = true;

  copyFeedbackProviderId: string | null = null;
  private copyFeedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  autoRefreshEnabled = false;
  autoRefreshIntervalMs = 60_000;
  readonly autoRefreshOptions = [
    { label: '30s', ms: 30_000 },
    { label: '60s', ms: 60_000 },
    { label: '2m', ms: 120_000 },
  ];
  private autoRefreshTimerId: ReturnType<typeof setTimeout> | null = null;

  totalProviders = 0;
  totalOperational = 0;
  totalDegraded = 0;
  totalDown = 0;
  averageUptime24h = 0;
  averageLatencyMs = 0;
  totalIncidents24h = 0;
  expandedRowId: string | null = null;
  openMenuId: string | null = null;

  sortKey: "name" | "status" | "lastLatency" | "avgLatency3h" | "uptime24h" | "uptime7d" | "incidents24h" | null = null;
  sortDirection: "asc" | "desc" | null = null;

  constructor(private dash: DashboardService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;

    this.dash.getDashboard().subscribe((rows: ProviderDashboardRow[]) => {

      this.providers = rows.map((row: ProviderDashboardRow): ProviderRow => {
        const status = row.status;
        const last = row.lastLatency ?? 0;
        const avg = row.avgLatency3h ?? 0;

        return {
          id: row.slug ?? String(row.providerId),
          slug: row.slug ?? String(row.providerId),
          providerId: row.providerId,
          providerName: row.name,
          status,

          lastLatency: last,
          avgLatency3h: avg,

          latencyHistory: generateHistory(avg, last),

          availability24h: row.uptime24h,
          availability7d: computeSLA7d(row.uptime24h),

          incidents24h: row.incidents24h,

          lastCheckAt: row.lastCheckAt,
          primaryEndpointUrl: (row as any).primaryEndpointUrl ?? null,
        };
      });

      this.recomputeSummary();
      this.applyFilters();
      this.loading = false;
      this.scheduleNextAutoRefresh();
    });
  }

  ngOnDestroy() {
    if (this.copyFeedbackTimeout) {
      clearTimeout(this.copyFeedbackTimeout);
      this.copyFeedbackTimeout = null;
    }
    this.clearAutoRefresh();
  }

  private clearAutoRefresh() {
    if (this.autoRefreshTimerId) {
      clearTimeout(this.autoRefreshTimerId);
      this.autoRefreshTimerId = null;
    }
  }

  private scheduleNextAutoRefresh() {
    if (!this.autoRefreshEnabled) return;
    this.clearAutoRefresh();
    this.autoRefreshTimerId = setTimeout(() => {
      this.autoRefreshTimerId = null;
      this.loadDashboard();
    }, this.autoRefreshIntervalMs);
  }

  setAutoRefresh(enabled: boolean) {
    this.autoRefreshEnabled = enabled;
    if (enabled) {
      this.scheduleNextAutoRefresh();
    } else {
      this.clearAutoRefresh();
    }
  }

  setAutoRefreshInterval(ms: number) {
    this.autoRefreshIntervalMs = ms;
    if (this.autoRefreshEnabled) {
      this.scheduleNextAutoRefresh();
    }
  }


  applyFilters() {
    const q = this.search.toLowerCase();

    this.filtered = this.providers.filter(provider =>
      (this.filter === "all" || provider.status === this.filter) &&
      provider.providerName.toLowerCase().includes(q)
    );

    this.applySorting();
  }

  setFilter(f: "all" | "operational" | "degraded" | "down") {
    this.filter = f;
    this.applyFilters();
  }

  setSort(key: "name" | "status" | "lastLatency" | "avgLatency3h" | "uptime24h" | "uptime7d" | "incidents24h") {
    if (this.sortKey === key) {
      if (this.sortDirection === "asc") {
        this.sortDirection = "desc";
      } else if (this.sortDirection === "desc") {
        this.sortKey = null;
        this.sortDirection = null;
      } else {
        this.sortDirection = "asc";
      }
    } else {
      this.sortKey = key;
      this.sortDirection = "asc";
    }

    this.applySorting();
  }

  private applySorting() {
    if (!this.sortKey || !this.sortDirection) {
      return;
    }

    const key = this.sortKey;
    const direction = this.sortDirection;

    this.filtered = [...this.filtered].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (key) {
        case "name":
          aVal = a.providerName.toLowerCase();
          bVal = b.providerName.toLowerCase();
          break;
        case "status":
          const order = { down: 0, degraded: 1, operational: 2 } as const;
          aVal = order[a.status];
          bVal = order[b.status];
          break;
        case "lastLatency":
          aVal = a.lastLatency;
          bVal = b.lastLatency;
          break;
        case "avgLatency3h":
          aVal = a.avgLatency3h;
          bVal = b.avgLatency3h;
          break;
        case "uptime24h":
          aVal = a.availability24h;
          bVal = b.availability24h;
          break;
        case "uptime7d":
          aVal = a.availability7d;
          bVal = b.availability7d;
          break;
        case "incidents24h":
          aVal = a.incidents24h;
          bVal = b.incidents24h;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  private recomputeSummary() {
    const total = this.providers.length;
    this.totalDegraded = this.providers.filter(provider => provider.status === "degraded").length;
    this.totalOperational = this.providers.filter(provider => provider.status === "operational").length;
    this.totalProviders = total;
    this.totalDown = this.providers.filter(provider => provider.status === "down").length;

    if (total === 0) {
      this.averageUptime24h = 0;
      this.averageLatencyMs = 0;
      this.totalIncidents24h = 0;
      return;
    }

    const sumUptime = this.providers.reduce((acc, p) => acc + (p.availability24h ?? 0), 0);
    this.averageUptime24h = +(sumUptime / total).toFixed(2);

    const sumLatency = this.providers.reduce((acc, p) => acc + (p.avgLatency3h ?? 0), 0);
    this.averageLatencyMs = +(sumLatency / total).toFixed(0);

    this.totalIncidents24h = this.providers.reduce((acc, p) => acc + (p.incidents24h ?? 0), 0);
  }


  sparkPath(points: number[]) {
    if (!points || points.length === 0) return "";

    const width = 64;
    const height = 20;
    const padding = 3;

    const max = Math.max(...points);
    const min = Math.min(...points);

    const normalized = points.map((v, i) => {
      const x = (i / (points.length - 1)) * width;
      const y =
        height - padding -
        ((v - min) / (max - min || 1)) * (height - padding * 2);
      return `${x},${y}`;
    });

    return "M" + normalized.join(" L ");
  }

  miniLinePath(points: number[]) {
    if (!points || points.length === 0) return "";

    const width = 64;
    const height = 24;
    const padding = 2;

    const positives = points.filter((p) => p > 0);
    const max = Math.max(...(positives.length ? positives : points));
    const min = Math.min(...(positives.length ? positives : points));
    const range = max - min || 1;

    const coords = points.map((v, i) => {
      const x = padding + (i / (points.length - 1)) * (width - padding * 2);
      const y =
        v === 0
          ? height - padding
          : height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    return "M" + coords.join(" L ");
  }

  miniAreaPath(points: number[]) {
    if (!points || points.length === 0) return "";

    const width = 64;
    const height = 24;
    const padding = 2;

    const positives = points.filter((p) => p > 0);
    const max = Math.max(...(positives.length ? positives : points));
    const min = Math.min(...(positives.length ? positives : points));
    const range = max - min || 1;

    const pts = points.map((v, i) => {
      const x = padding + (i / (points.length - 1)) * (width - padding * 2);
      const y =
        v === 0
          ? height - padding
          : height - padding - ((v - min) / range) * (height - padding * 2);
      return { x, y };
    });

    const line = pts.map((p) => `${p.x},${p.y}`).join(" L ");
    const first = pts[0];
    const last = pts[pts.length - 1];

    return `M${first.x},${height} L ${line} L ${last.x},${height} Z`;
  }

  toLatencyPoints(values: number[]): LatencyPoint[] {
    if (!values || values.length === 0) return [];
    const now = Date.now();
    const stepMs = (3 * 60 * 60 * 1000) / Math.max(1, values.length - 1);
    return values.map((v, index) => ({
      timestamp: new Date(now - (values.length - 1 - index) * stepMs).toISOString(),
      latencyMs: Math.max(0, Math.round(v)),
    }));
  }

  sparkLastPoint(points: number[]): { x: number; y: number } {
    if (!points || points.length === 0) return { x: 64, y: 10 };

    const width = 64;
    const height = 20;
    const padding = 3;

    const max = Math.max(...points);
    const min = Math.min(...points);
    const last = points[points.length - 1];

    const x = width;
    const y =
      height - padding -
      ((last - min) / (max - min || 1)) * (height - padding * 2);

    return { x, y };
  }

  toggleExpand(provider: ProviderRow, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    const isOpening = this.expandedRowId !== provider.id;
    this.expandedRowId = isOpening ? provider.id : null;

    if (isOpening && !provider.latencyHistoryReal) {
      this.dash.getLatencyHistory(provider.slug).subscribe({
        next: (history) => {
          provider.latencyHistoryReal = history;
        },
        error: () => {},
      });
    }

    if (isOpening && provider.recentIncidents === undefined && !provider.incidentsLoading) {
      this.loadRecentIncidents(provider);
    }
  }

  loadRecentIncidents(provider: ProviderRow) {
    provider.incidentsLoading = true;
    provider.incidentsError = false;
    delete provider.recentIncidents;
    this.dash.getIncidents(provider.providerId).subscribe({
      next: (data: any[]) => {
        const normalized = data
          .map((i: any) => ({
            ...i,
            type: normalizeIncidentType(i.type || ''),
          }))
          .sort((a, b) => {
            const aStart = new Date(a.startAt || a.createdAt || 0).getTime();
            const bStart = new Date(b.startAt || b.createdAt || 0).getTime();
            return bStart - aStart;
          })
          .slice(0, RECENT_INCIDENTS_LIMIT);
        provider.recentIncidents = normalized;
        provider.incidentsLoading = false;
      },
      error: () => {
        provider.incidentsError = true;
        provider.incidentsLoading = false;
      },
    });
  }

  getRecentIncidents(provider: ProviderRow): Incident[] {
    return provider.recentIncidents ?? [];
  }

  toggleMenu(provider: ProviderRow, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === provider.id ? null : provider.id;
  }

  timeAgo(date: Date | string | null): string {
    if (!date) return "—";
    const d = new Date(date);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);

    if (diffSec < 5) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;

    const min = Math.floor(diffSec / 60);
    if (min < 60) return `${min}m ago`;

    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;

    const dDays = Math.floor(h / 24);
    return `${dDays}d ago`;
  }

  getCopyEndpointText(provider: ProviderRow): string {
    if (provider.primaryEndpointUrl) return provider.primaryEndpointUrl;
    return provider.providerName;
  }

  onCopyEndpoint(provider: ProviderRow, event: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();
    const text = this.getCopyEndpointText(provider);

    const showFeedback = () => {
      this.copyFeedbackProviderId = provider.id;
      if (this.copyFeedbackTimeout) clearTimeout(this.copyFeedbackTimeout);
      this.copyFeedbackTimeout = setTimeout(() => {
        this.copyFeedbackProviderId = null;
        this.copyFeedbackTimeout = null;
      }, 2000);
    };

    const showFallback = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) showFeedback();
      } catch {
        prompt('Copy manually:', text);
      }
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(showFeedback).catch(showFallback);
    } else {
      showFallback();
    }
  }

  isMuted(provider: ProviderRow): boolean {
    if (!provider.mutedUntil) return false;
    return new Date(provider.mutedUntil) > new Date();
  }

  onMuteAlerts(provider: ProviderRow, event: MouseEvent) {
    event.stopPropagation();
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    provider.mutedUntil = oneHourFromNow;
    this.closeMenu();
  }

  closeMenu() {
    this.openMenuId = null;
  }

  
}