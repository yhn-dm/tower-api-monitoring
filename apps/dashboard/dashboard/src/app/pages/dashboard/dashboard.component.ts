import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardService, ProviderDashboardRow } from '../../services/dashboard.service';


interface FrontProviderRow {
  providerName: string;
  status: "operational" | "degraded" | "down";

  lastLatency: number;
  avgLatency3h: number;

  latencyHistory: number[];

  availability24h: number;
  availability7d: number;
  incidents24h: number;

  lastCheckAt: Date | string | null; 
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
  if (status === "operational") return 0;
  if (status === "degraded") return Math.floor(Math.random() * 2) + 1;
  return Math.floor(Math.random() * 5) + 3; // down
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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  providers: FrontProviderRow[] = [];
  filtered: FrontProviderRow[] = [];

  search: string = "";

  filter: "all" | "operational" | "degraded" | "down" = "all";

  loading = true;

  constructor(private dash: DashboardService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;

    this.dash.getDashboard().subscribe((rows: ProviderDashboardRow[]) => {

      this.providers = rows.map((r: ProviderDashboardRow): FrontProviderRow => {

        const status = computeStatus(r.uptime24h);
        const last = r.lastLatency ?? 0;
        const avg = r.avgLatency3h ?? 0;

        return {
          providerName: r.name,
          status,      

          lastLatency: last,
          avgLatency3h: avg,

          latencyHistory: generateHistory(avg, last),

          availability24h: r.uptime24h,
          availability7d: computeSLA7d(r.uptime24h),

          incidents24h: computeIncidents(status),

          lastCheckAt: r.lastCheckAt
        };

      });

      this.applyFilter();
      this.loading = false;
    });
  }


  applyFilter() {
    const q = this.search.toLowerCase();

    this.filtered = this.providers.filter(p =>
      (this.filter === "all" || p.status === this.filter) &&
      p.providerName.toLowerCase().includes(q)
    );
  }

setFilter(f: "all" | "operational" | "degraded" | "down") {
  this.filter = f;
  this.applyFilter();
}


  sparkPath(points: number[]) {
    if (!points || points.length === 0) return "";

    const max = Math.max(...points);
    const min = Math.min(...points);

    const normalized = points.map((v, i) => {
      const x = (i / (points.length - 1)) * 64;
      const y = 20 - ((v - min) / (max - min || 1)) * 20;
      return `${x},${y}`;
    });

    return "M" + normalized.join(" L ");
  }

  timeAgo(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 1000 / 60);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return `${h}h ago`;
}

  
}