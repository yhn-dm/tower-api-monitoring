import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDashboard should GET /dashboard and return array', () => {
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
        lastCheckAt: new Date().toISOString(),
        primaryEndpointUrl: 'https://api.example.com',
      },
    ];
    service.getDashboard().subscribe((data) => {
      expect(data).toEqual(mockRows);
    });
    const req = httpMock.expectOne('http://localhost:3000/dashboard');
    expect(req.request.method).toBe('GET');
    req.flush(mockRows);
  });

  it('getProvider should GET /providers/:slug', () => {
    const slug = 'my-api';
    const mockProvider = {
      providerId: 1,
      slug,
      name: 'My API',
      status: 'operational' as const,
      trend: 'stable' as const,
      lastLatency: 30,
      avgLatency3h: 35,
      errorRate24h: 0,
      uptime24h: 100,
      incidents24h: 0,
      avgResponseSize: 500,
      lastCheckAt: null,
      primaryEndpointUrl: 'https://api.example.com',
    };
    service.getProvider(slug).subscribe((data) => {
      expect(data).toEqual(mockProvider);
    });
    const req = httpMock.expectOne(`http://localhost:3000/providers/${slug}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProvider);
  });

  it('getIncidents should GET /incidents/:providerId', () => {
    const providerId = 1;
    const mockIncidents = [
      {
        id: 1,
        providerId,
        startAt: '2025-01-01T00:00:00Z',
        endAt: null,
        type: 'DOWN',
        message: 'Outage',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];
    service.getIncidents(providerId).subscribe((data) => {
      expect(data).toEqual(mockIncidents);
    });
    const req = httpMock.expectOne(`http://localhost:3000/incidents/${providerId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockIncidents);
  });

  it('getLatencyHistory should GET with windowMinutes and stepMinutes params', () => {
    const slug = 'my-api';
    const mockHistory = [
      { timestamp: '2025-01-01T12:00:00Z', latencyMs: 40 },
      { timestamp: '2025-01-01T12:05:00Z', latencyMs: 45 },
    ];
    service.getLatencyHistory(slug, 180, 5).subscribe((data) => {
      expect(data).toEqual(mockHistory);
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url.startsWith('http://localhost:3000/providers/') &&
        r.url.includes('latency-history') &&
        r.params.get('windowMinutes') === '180' &&
        r.params.get('stepMinutes') === '5'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });
});
