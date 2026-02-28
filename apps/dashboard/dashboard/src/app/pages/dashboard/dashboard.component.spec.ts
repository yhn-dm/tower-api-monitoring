import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [DashboardService],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loadDashboard should fetch dashboard and populate providers', () => {
    const mockRows = [
      {
        providerId: 1,
        slug: 'api1',
        name: 'API One',
        status: 'operational' as const,
        trend: 'stable' as const,
        lastLatency: 50,
        avgLatency3h: 48,
        errorRate24h: 0,
        uptime24h: 100,
        incidents24h: 0,
        avgResponseSize: 1024,
        lastCheckAt: null,
        primaryEndpointUrl: 'https://api.example.com',
      },
    ];
    component.loadDashboard();
    const req = httpMock.expectOne('http://localhost:3000/dashboard');
    req.flush(mockRows);
    expect(component.loading).toBe(false);
    expect(component.providers.length).toBe(1);
    expect(component.providers[0].slug).toBe('api1');
  });

  it('setFilter should update filter and recalc filtered', () => {
    component.filter = 'all';
    component.providers = [
      { id: '1', slug: 'p1', providerId: 1, providerName: 'P1', status: 'operational', lastLatency: 50, avgLatency3h: 48, latencyHistory: [], availability24h: 100, availability7d: 99, incidents24h: 0, lastCheckAt: null, primaryEndpointUrl: null },
    ];
    component.setFilter('down');
    expect(component.filter).toBe('down');
  });

  it('setSort should update sortKey and sortDirection', () => {
    component.setSort('name');
    expect(component.sortKey).toBe('name');
    expect(component.sortDirection).toBe('asc');
    component.setSort('name');
    expect(component.sortDirection).toBe('desc');
  });
});
