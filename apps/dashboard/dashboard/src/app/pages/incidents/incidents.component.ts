/**
 * Lists all incidents with filters and URL sync; shows severity stats.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DashboardService, Incident } from '../../services/dashboard.service';

const STATUS_VALUES = ['all', 'ongoing', 'resolved'] as const;
const FILTER_VALUES = ['all', 'down', 'degraded'] as const;

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './incidents.component.html',
})
export class IncidentsComponent implements OnInit, OnDestroy {
  loading = true;
  incidents: Incident[] = [];

  filter: 'all' | 'down' | 'degraded' = 'all';
  statusFilter: 'all' | 'ongoing' | 'resolved' = 'ongoing';
  providerFilter: string | null = null;

  private queryParamsSubscription: ReturnType<ActivatedRoute['queryParams']['subscribe']> | null = null;

  constructor(
    private dash: DashboardService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  static normalizeType(raw: string): 'down' | 'degraded' {
    const t = (raw || '').toUpperCase();
    if (t === 'DOWN') return 'down';
    if (t === 'SLOW' || t === 'ERROR') return 'degraded';
    return 'down';
  }

  ngOnInit() {
    this.applyQueryParams(this.route.snapshot.queryParams);
    if (this.route.snapshot.queryParamMap.get('status') == null) {
      this.syncUrlToFilters(true);
    }

    this.queryParamsSubscription = this.route.queryParams.subscribe((params) => {
      this.applyQueryParams(params);
    });

    fetch('http://localhost:3000/incidents')
      .then((r) => r.json())
      .then((data: Incident[]) => {
        this.incidents = data.map((i: any) => ({
          ...i,
          type: IncidentsComponent.normalizeType(i.type || ''),
        }));
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  ngOnDestroy() {
    this.queryParamsSubscription?.unsubscribe();
  }

  private applyQueryParams(params: Record<string, string | undefined>) {
    const status = params['status'];
    if (status && STATUS_VALUES.includes(status as any)) {
      this.statusFilter = status as 'all' | 'ongoing' | 'resolved';
    }
    const filter = params['filter'];
    if (filter !== undefined && FILTER_VALUES.includes(filter as any)) {
      this.filter = filter as 'all' | 'down' | 'degraded';
    }
    const provider = params['provider'];
    this.providerFilter = provider != null && provider !== '' ? provider : null;
  }

  private syncUrlToFilters(replaceUrl = false) {
    const queryParams: Record<string, string | null> = {
      status: this.statusFilter,
      filter: this.filter === 'all' ? null : this.filter,
      provider: this.providerFilter,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  setFilter(value: 'all' | 'down' | 'degraded') {
    this.filter = value;
    this.syncUrlToFilters();
  }

  setStatusFilter(value: 'all' | 'ongoing' | 'resolved') {
    this.statusFilter = value;
    this.syncUrlToFilters();
  }

  isResolved(incident: Incident): boolean {
    return incident.endAt != null && incident.endAt !== '';
  }

  toggleProviderFilter(providerName: string) {
    this.providerFilter =
      this.providerFilter === providerName ? null : providerName;
    this.syncUrlToFilters();
  }

  clearProviderFilter() {
    this.providerFilter = null;
    this.syncUrlToFilters();
  }

  get recentIncidentsCount(): number {
    return this.incidents.filter((incident) => {
      const baseDate = incident.startAt || incident.createdAt;
      if (!baseDate) {
        return false;
      }
      const ts = new Date(baseDate).getTime();
      return Date.now() - ts < 24 * 60 * 60 * 1000;
    }).length;
  }

  getProviderLabel(incident: Incident): string {
    const anyIncident = incident as any;
    if (anyIncident.provider && anyIncident.provider.name) {
      return anyIncident.provider.name;
    }
    return `Provider #${incident.providerId}`;
  }

  get filteredIncidents(): Incident[] {
    let result = this.incidents;

    if (this.filter !== 'all') {
      result = result.filter((i) => i.type === this.filter);
    }
    if (this.statusFilter === 'ongoing') {
      result = result.filter((i) => !this.isResolved(i));
    } else if (this.statusFilter === 'resolved') {
      result = result.filter((i) => this.isResolved(i));
    }
    if (this.providerFilter) {
      result = result.filter(
        (i: any) => i.provider && i.provider.name === this.providerFilter
      );
    }

    result = [...result].sort((a, b) => {
      const aRes = this.isResolved(a);
      const bRes = this.isResolved(b);
      if (aRes !== bRes) return aRes ? 1 : -1;
      const aStart = new Date(a.startAt || a.createdAt || 0).getTime();
      const bStart = new Date(b.startAt || b.createdAt || 0).getTime();
      if (bStart !== aStart) return bStart - aStart;
      return (a.type || "").localeCompare(b.type || "");
    });
    return result;
  }

  get uniqueProviders(): string[] {
    const names = new Set<string>();
    (this.incidents as any[]).forEach((i) => {
      if (i.provider && i.provider.name) {
        names.add(i.provider.name);
      }
    });
    return Array.from(names).sort();
  }

  get severityStats() {
    const down = this.incidents.filter((i) => i.type === 'down').length;
    const degraded = this.incidents.filter((i) => i.type === 'degraded').length;
    const total = down + degraded;
    return {
      down,
      degraded,
      total,
      downPercent: total > 0 ? (down / total) * 100 : 0,
      degradedPercent: total > 0 ? (degraded / total) * 100 : 0,
    };
  }

  get ongoingCount(): number {
    return this.incidents.filter((i) => !this.isResolved(i)).length;
  }

  get resolvedCount(): number {
    return this.incidents.filter((i) => this.isResolved(i)).length;
  }
}

