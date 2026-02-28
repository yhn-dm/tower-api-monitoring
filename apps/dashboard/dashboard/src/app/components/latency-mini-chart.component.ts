/**
 * Small SVG line chart from latency points; you can optionally draw a reference line.
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LatencyPoint } from '../services/dashboard.service';

@Component({
  selector: 'app-latency-mini-chart',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full h-full',
  },
  template: `
    <svg
      *ngIf="data && data.length; else empty"
      viewBox="0 0 64 22"
      class="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stop-color="hsl(var(--chart-line))"
            stop-opacity="0.3"
          ></stop>
          <stop
            offset="40%"
            stop-color="hsl(var(--chart-line))"
            stop-opacity="0.18"
          ></stop>
          <stop
            offset="75%"
            stop-color="hsl(var(--chart-line))"
            stop-opacity="0.09"
          ></stop>
          <stop
            offset="100%"
            stop-color="hsl(var(--chart-line))"
            stop-opacity="0.03"
          ></stop>
        </linearGradient>
      </defs>

      <line
        *ngIf="referenceY !== null"
        x1="0"
        [attr.y1]="referenceY"
        x2="64"
        [attr.y2]="referenceY"
        stroke="hsl(var(--border))"
        stroke-width="0.75"
        stroke-opacity="0.7"
        stroke-dasharray="3 3"
        vector-effect="non-scaling-stroke"
      ></line>

      <path
        [attr.d]="areaPath"
        [attr.fill]="'url(#' + gradientId + ')'"
        fill-opacity="0.6"
        stroke="none"
      ></path>

      <path
        [attr.d]="linePath"
        fill="none"
        stroke="hsl(var(--chart-line))"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      ></path>
    </svg>

    <ng-template #empty>
      <div class="w-full h-full bg-muted/10"></div>
    </ng-template>
  `,
})
export class LatencyMiniChartComponent {
  @Input() data: LatencyPoint[] | null = null;
  @Input() gradientSuffix: string | null = null;
  @Input() thresholdMs?: number;

  private readonly width = 64;
  private readonly height = 22;
  private readonly paddingX = 0;
  private readonly paddingY = 0;

  get gradientId(): string {
    return `miniGradient${this.gradientSuffix ? '-' + this.gradientSuffix : ''}`;
  }

  get linePath(): string {
    const pts = this.projectedSmoothed();
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;

    let d = `M${pts[0].x},${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const xc = (p0.x + p1.x) / 2;
      const yc = (p0.y + p1.y) / 2;
      d += ` Q${p0.x},${p0.y} ${xc},${yc}`;
    }

    const last = pts[pts.length - 1];
    d += ` T${last.x},${last.y}`;

    return d;
  }

  get areaPath(): string {
    const pts = this.projectedSmoothed();
    if (pts.length === 0) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    const baselineY = this.height;
    const line = pts.map((p) => `${p.x},${p.y}`).join(' L ');
    return `M${first.x},${baselineY} L ${line} L ${last.x},${baselineY} Z`;
  }

  get referenceY(): number | null {
    const pts = this.data;
    if (!pts || pts.length === 0) return null;
    const values = pts.map((p) => p.latencyMs).filter((v) => v > 0);
    if (!values.length) return null;
    const avg =
      this.thresholdMs ??
      values.reduce((a, v) => a + v, 0) / Math.max(1, values.length);

    const { min, max } = this.extents();
    const range = max - min || 1;
    const inner = this.height;
    const baseline = this.height;

    const y = baseline - ((avg - min) / range) * inner;
    return Math.max(0, y - this.height * 0.1);
  }

  private projected(): { x: number; y: number }[] {
    const pts = this.data;
    if (!pts || pts.length === 0) return [];

    const { min, max } = this.extents();
    const range = max - min || 1;
    const inner = this.height;
    const baseline = this.height;

    return pts.map((p, index) => {
      const x =
        this.paddingX +
        (index / Math.max(1, pts.length - 1)) *
          (this.width - this.paddingX * 2);
      const value = p.latencyMs;
      const y =
        value === 0
          ? baseline
          : baseline - ((value - min) / range) * inner;
      return { x, y };
    });
  }

  private projectedSmoothed(): { x: number; y: number }[] {
    const base = this.projected();
    if (base.length <= 1) return base;

    const targetPoints = 100;
    const result: { x: number; y: number }[] = [];

    for (let i = 0; i < targetPoints; i++) {
      const t = i / (targetPoints - 1);
      const pos = t * (base.length - 1);
      const idx = Math.floor(pos);
      const frac = pos - idx;

      const p0 = base[idx];
      const p1 = base[Math.min(idx + 1, base.length - 1)];

      const x = p0.x + (p1.x - p0.x) * frac;
      const y = p0.y + (p1.y - p0.y) * frac;

      result.push({ x, y });
    }

    return result;
  }

  private extents(): { min: number; max: number } {
    const pts = this.data;
    if (!pts || pts.length === 0) return { min: 0, max: 1 };
    const values = pts.map((p) => p.latencyMs).filter((v) => v > 0);
    if (!values.length) return { min: 0, max: 1 };

    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const span = rawMax - rawMin || 1;

    const min = Math.max(0, rawMin - span * 0.5);
    const max = rawMax;

    return { min, max: max === min ? min + 1 : max };
  }
}

