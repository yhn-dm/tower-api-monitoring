import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IncidentsComponent } from './incidents.component';
import { DashboardService, Incident } from '../../services/dashboard.service';

describe('IncidentsComponent', () => {
  let component: IncidentsComponent;
  let fixture: ComponentFixture<IncidentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IncidentsComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [DashboardService],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('normalizeType should map DOWN to down', () => {
    expect(IncidentsComponent.normalizeType('DOWN')).toBe('down');
  });

  it('normalizeType should map SLOW and ERROR to degraded', () => {
    expect(IncidentsComponent.normalizeType('SLOW')).toBe('degraded');
    expect(IncidentsComponent.normalizeType('ERROR')).toBe('degraded');
  });

  it('isResolved should return true when endAt is set', () => {
    const incident: Incident = {
      id: 1,
      providerId: 1,
      startAt: '',
      endAt: '2025-01-01T12:00:00Z',
      type: 'down',
      message: '',
      createdAt: '',
      updatedAt: '',
    };
    expect(component.isResolved(incident)).toBe(true);
  });

  it('isResolved should return false when endAt is null', () => {
    const incident: Incident = {
      id: 1,
      providerId: 1,
      startAt: '',
      endAt: null,
      type: 'down',
      message: '',
      createdAt: '',
      updatedAt: '',
    };
    expect(component.isResolved(incident)).toBe(false);
  });

  it('setFilter should update filter value', () => {
    component.setFilter('down');
    expect(component.filter).toBe('down');
    component.setFilter('all');
    expect(component.filter).toBe('all');
  });

  it('setStatusFilter should update statusFilter', () => {
    component.setStatusFilter('resolved');
    expect(component.statusFilter).toBe('resolved');
  });

  it('severityStats should compute down and degraded counts', () => {
    component.incidents = [
      { id: 1, providerId: 1, startAt: '', endAt: null, type: 'down', message: '', createdAt: '', updatedAt: '' },
      { id: 2, providerId: 1, startAt: '', endAt: null, type: 'degraded', message: '', createdAt: '', updatedAt: '' },
      { id: 3, providerId: 1, startAt: '', endAt: null, type: 'down', message: '', createdAt: '', updatedAt: '' },
    ];
    const stats = component.severityStats;
    expect(stats.down).toBe(2);
    expect(stats.degraded).toBe(1);
    expect(stats.total).toBe(3);
  });
});
