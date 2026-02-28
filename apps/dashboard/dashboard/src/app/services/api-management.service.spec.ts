import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiManagementService } from './api-management.service';

describe('ApiManagementService', () => {
  let service: ApiManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiManagementService],
    });
    service = TestBed.inject(ApiManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProviders should GET /api-management/providers and return array', () => {
    const mockProviders = [{ id: 1, slug: 'test', name: 'Test', logoUrl: null, createdAt: '', updatedAt: '', endpoints: [] }];
    service.getProviders().subscribe((data) => {
      expect(data).toEqual(mockProviders);
    });
    const req = httpMock.expectOne('http://localhost:3000/api-management/providers');
    expect(req.request.method).toBe('GET');
    req.flush(mockProviders);
  });

  it('createProvider should POST and return data on success', () => {
    const payload = { slug: 'my-api', name: 'My API' };
    const mockProvider = { id: 1, slug: 'my-api', name: 'My API', logoUrl: null, createdAt: '', updatedAt: '' };
    service.createProvider(payload).subscribe((res) => {
      expect(res.data).toEqual(mockProvider);
      expect(res.error).toBeUndefined();
    });
    const req = httpMock.expectOne('http://localhost:3000/api-management/providers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockProvider);
  });

  it('createProvider should return error on 409', () => {
    const payload = { slug: 'dup', name: 'Dup' };
    const errorBody = { code: 'SLUG_ALREADY_EXISTS', message: 'Slug exists' };
    service.createProvider(payload).subscribe((res) => {
      expect(res.error).toBeDefined();
      expect(res.error?.code).toBe('SLUG_ALREADY_EXISTS');
    });
    const req = httpMock.expectOne('http://localhost:3000/api-management/providers');
    req.flush(errorBody, { status: 409, statusText: 'Conflict' });
  });

  it('deleteProvider should DELETE correct URL', () => {
    service.deleteProvider(42).subscribe((res) => {
      expect((res as any).error).toBeUndefined();
    });
    const req = httpMock.expectOne('http://localhost:3000/api-management/providers/42');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
