import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DashboardService, ProviderDashboardRow, Incident} from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';

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

      // fetch incidents
      fetch(`http://localhost:3000/incidents/${data.providerId}`)
        .then(r => r.json())
        .then(inc => {
          this.incidents = inc;
          this.loading = false;

          setTimeout(() => this.renderLatencyChart(), 50);
        });
    });
  }

  ngAfterViewInit() {}

renderLatencyChart() {
  if (!this.latencyChartRef) return;

  const ctx = this.latencyChartRef.nativeElement.getContext("2d");
  if (!ctx) return;

  const labels = ["-5h", "-4h", "-3h", "-2h", "-1h", "Now"];

  const base = this.provider.avgLatency3h ?? 0;
  const last = this.provider.lastLatency ?? 0;

  const history = [
    base * 0.92,
    base * 0.95,
    base * 1.05,
    base * 1.12,
    last * 0.95,
    last
  ];

  // gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.35)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

  this.latencyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Latency (ms)",
          data: history,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBorderColor: "#fff",
          pointBackgroundColor: "rgb(59, 130, 246)",
        },
      ],
    },
    options: {
      responsive: true,
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
          ticks: { color: "#64748b", font: { size: 12 } }
        },
        y: {
          grid: { color: "rgba(148,163,184,0.15)" },
          ticks: { color: "#64748b", font: { size: 12 } }
        }
      }
    }
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


