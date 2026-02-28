import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProviderComponent } from './provider.component';
import { DashboardService } from '../../services/dashboard.service';

describe('ProviderComponent', () => {
  let component: ProviderComponent;
  let fixture: ComponentFixture<ProviderComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderComponent, HttpClientTestingModule],
      providers: [
        DashboardService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'my-api' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should request provider and latency history via DashboardService', () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve([]) } as Response));
    fixture.detectChanges();
    const providerReq = httpMock.expectOne('http://localhost:3000/providers/my-api');
    const mockProvider = {
      providerId: 1,
      slug: 'my-api',
      name: 'My API',
      status: 'operational' as const,
      trend: 'stable' as const,
      lastLatency: 40,
      avgLatency3h: 45,
      errorRate24h: 0,
      uptime24h: 100,
      incidents24h: 0,
      avgResponseSize: 500,
      lastCheckAt: null,
      primaryEndpointUrl: 'https://api.example.com',
    };
    providerReq.flush(mockProvider);
    const historyReq = httpMock.expectOne((r) => r.url.includes('latency-history'));
    historyReq.flush([{ timestamp: '2025-01-01T12:00:00Z', latencyMs: 50 }]);
    expect(component.provider).toEqual(mockProvider);
  });
});
