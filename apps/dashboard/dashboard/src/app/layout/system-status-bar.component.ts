/**
 * Shows overall status, how many incidents are ongoing, and average latency from the dashboard.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, type ProviderDashboardRow } from '../services/dashboard.service';

type ProviderStatus = 'operational' | 'degraded' | 'down';

interface SystemStatusState {
  label: string;
  textClass: string;
  bgClass: string;
  ongoingIncidents: number;
  avgLatency: number;
}

@Component({
  selector: 'app-system-status-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-b" [ngClass]="state.bgClass">
      <div class="max-w-7xl mx-auto px-6">
        <div class="h-8 flex items-center gap-2 text-xs">
          <span class="uppercase tracking-wide text-slate-500">
            System status:
          </span>
          <span [ngClass]="state.textClass">{{ state.label }}</span>
          <span class="text-slate-300">•</span>
          <span class="text-slate-600">
            {{ state.ongoingIncidents }} ongoing incident{{ state.ongoingIncidents !== 1 ? 's' : '' }}
          </span>
          <span class="text-slate-300">•</span>
          <span class="text-slate-600">
            Avg latency:
            <span class="font-medium text-slate-700">{{ state.avgLatency }}ms</span>
          </span>
        </div>
      </div>
    </div>
  `,
})
export class SystemStatusBarComponent implements OnInit {
  state: SystemStatusState = {
    label: 'Operational',
    textClass: 'text-status-operational font-semibold',
    bgClass: 'bg-muted/50 border-border',
    ongoingIncidents: 0,
    avgLatency: 0,
  };

  constructor(private dashboard: DashboardService) {}

  ngOnInit(): void {
    this.dashboard.getDashboard().subscribe((rows: ProviderDashboardRow[]) => {
      if (!rows || rows.length === 0) {
        return;
      }

      const hasDown = rows.some((p) => p.status === 'down');
      const hasDegraded = rows.some((p) => p.status === 'degraded');

      let label: string;
      let textClass: string;
      let bgClass: string;

      if (hasDown) {
        label = 'Down';
        textClass = 'text-status-down font-semibold';
        bgClass = 'bg-red-50 border-red-100';
      } else if (hasDegraded) {
        label = 'Degraded';
        textClass = 'text-status-degraded font-semibold';
        bgClass = 'bg-orange-50 border-orange-100';
      } else {
        label = 'Operational';
        textClass = 'text-status-operational font-semibold';
        bgClass = 'bg-muted/50 border-border';
      }

      const avgLatency = Math.round(
        rows.reduce((sum, p) => sum + (p.avgLatency3h ?? p.lastLatency ?? 0), 0) / rows.length
      );

      const ongoingIncidents = rows.reduce((sum, p) => sum + (p.incidents24h ?? 0), 0);

      this.state = {
        label,
        textClass,
        bgClass,
        avgLatency,
        ongoingIncidents,
      };
    });
  }
}

