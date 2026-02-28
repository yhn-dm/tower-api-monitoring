import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LatencyMiniChartComponent } from './latency-mini-chart.component';
import { LatencyPoint } from '../services/dashboard.service';

describe('LatencyMiniChartComponent', () => {
  let component: LatencyMiniChartComponent;
  let fixture: ComponentFixture<LatencyMiniChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatencyMiniChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LatencyMiniChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('linePath should be empty when data is null', () => {
    component.data = null;
    fixture.detectChanges();
    expect(component.linePath).toBe('');
  });

  it('linePath should be empty when data is empty array', () => {
    component.data = [];
    fixture.detectChanges();
    expect(component.linePath).toBe('');
  });

  it('areaPath should be empty when data is null', () => {
    component.data = null;
    fixture.detectChanges();
    expect(component.areaPath).toBe('');
  });

  it('areaPath should be empty when data is empty array', () => {
    component.data = [];
    fixture.detectChanges();
    expect(component.areaPath).toBe('');
  });

  it('linePath should produce path string when data has points', () => {
    component.data = [
      { timestamp: '2025-01-01T12:00:00Z', latencyMs: 20 },
      { timestamp: '2025-01-01T12:01:00Z', latencyMs: 40 },
      { timestamp: '2025-01-01T12:02:00Z', latencyMs: 30 },
    ];
    fixture.detectChanges();
    const path = component.linePath;
    expect(path).toContain('M');
    expect(path.length).toBeGreaterThan(0);
  });

  it('areaPath should produce path with Z close when data has points', () => {
    component.data = [
      { timestamp: '2025-01-01T12:00:00Z', latencyMs: 50 },
      { timestamp: '2025-01-01T12:01:00Z', latencyMs: 60 },
    ];
    fixture.detectChanges();
    const path = component.areaPath;
    expect(path).toContain('M');
    expect(path).toContain('Z');
  });

  it('gradientId should include suffix when gradientSuffix is set', () => {
    component.gradientSuffix = 'p1';
    fixture.detectChanges();
    expect(component.gradientId).toBe('miniGradient-p1');
  });

  it('gradientId should not include suffix when gradientSuffix is null', () => {
    component.gradientSuffix = null;
    fixture.detectChanges();
    expect(component.gradientId).toBe('miniGradient');
  });
});
