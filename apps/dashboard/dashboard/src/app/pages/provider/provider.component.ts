/**
 * Provider detail page: latency chart, incidents list, latency history from API.
 */
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DashboardService, ProviderDashboardRow, Incident, LatencyPoint } from '../../services/dashboard.service';
import { Chart, registerables, Plugin } from 'chart.js';

Chart.register(...registerables);



@Component({
  selector: 'app-provider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './provider.component.html',
})
export class ProviderComponent implements OnInit, AfterViewInit {

  provider!: ProviderDashboardRow;
  incidents: Incident[] = [];
  latencyHistory: LatencyPoint[] = [];
  loading = true;

  @ViewChild('latencyChart') latencyChartRef!: ElementRef<HTMLCanvasElement>;
  latencyChart!: Chart;

  constructor(
    private route: ActivatedRoute,
    private dash: DashboardService
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.dash.getProvider(slug).subscribe((data: ProviderDashboardRow) => {
      this.provider = data;

      this.dash.getLatencyHistory(slug, 300, 5).subscribe((history: LatencyPoint[]) => {
        this.latencyHistory = history;

        fetch(`http://localhost:3000/incidents/${data.providerId}`)
          .then(r => r.json())
          .then(inc => {
            this.incidents = inc;
            this.loading = false;

            setTimeout(() => this.renderLatencyChart(), 50);
          });
      });
    });
  }

  ngAfterViewInit() {}

renderLatencyChart() {
  if (!this.latencyChartRef) return;

  const ctx = this.latencyChartRef.nativeElement.getContext("2d");
  if (!ctx) return;

  const base = this.provider.avgLatency3h ?? 0;
  const last = this.provider.lastLatency ?? 0;

  let historyValues: number[];
  let labels: string[];

  if (this.latencyHistory && this.latencyHistory.length > 0) {
    historyValues = this.latencyHistory.map(p => p.latencyMs);

    // Labels like -5h/-4h/.../Now; we only show full hours on the axis to keep it readable.
    const lastTs = new Date(this.latencyHistory[this.latencyHistory.length - 1].timestamp).getTime();
    labels = this.latencyHistory.map((p, idx) => {
      const ts = new Date(p.timestamp).getTime();
      const diffMinutes = Math.round((lastTs - ts) / 60000);

      if (diffMinutes === 0 || idx === this.latencyHistory.length - 1) {
        return 'Now';
      }

      if (diffMinutes % 60 === 0) {
        const hours = diffMinutes / 60;
        return `-${hours}h`;
      }

      return '';
    });
  } else {
    historyValues = [
      base * 0.92,
      base * 0.95,
      base * 1.05,
      base * 1.12,
      last * 0.95,
      last
    ];
    labels = ["-5h", "-4h", "-3h", "-2h", "-1h", "Now"];
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, this.latencyChartRef.nativeElement.height || 256);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0.02)");

  const targetLatency = base || last;

  const targetLatencyLine: Plugin<'line'> = {
    id: 'target-latency-line',
    afterDraw: (chart) => {
      if (!targetLatency) return;
      const yScale = chart.scales['y'];
      if (!yScale) return;

      const y = yScale.getPixelForValue(targetLatency);
      const { ctx } = chart;
      const { left, right } = chart.chartArea;

      ctx.save();
      ctx.strokeStyle = 'hsl(215, 16%, 80%)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'hsl(215, 16%, 47%)';
      ctx.font = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('Target latency', right + 8, y);
      ctx.restore();
    },
  };

  this.latencyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Latency (ms)",
          data: historyValues,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          // line only; points show on hover
          pointRadius: 0,
          pointHitRadius: 8,
          pointHoverRadius: 5,
          pointBorderColor: "#fff",
          pointBackgroundColor: "rgb(59, 130, 246)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 10,
          borderWidth: 1,
          borderColor: "#0f172a"
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "hsl(215, 16%, 47%)", font: { size: 11 } }
        },
        y: {
          grid: { color: "rgba(148,163,184,0.2)" },
          beginAtZero: true,
          ticks: {
            color: "hsl(215, 16%, 47%)",
            font: { size: 11 }
          }
        }
      }
    },
    plugins: [targetLatencyLine]
  });
}

  formatDate(d: string | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleString();
  }

getDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";

  const s = new Date(start).getTime();
  const e = new Date(end).getTime();

  const diff = Math.max(0, e - s); 
  const min = Math.floor(diff / 60000);

  if (min < 1) return "less than a minute";
  if (min < 60) return `${min} min`;

  const h = Math.floor(min / 60);
  const r = min % 60;

  return `${h}h ${r}m`;
}


}


