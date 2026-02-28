import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiManagementComponent } from './api-management.component';
import { ApiManagementService } from '../../services/api-management.service';

describe('ApiManagementComponent', () => {
  let component: ApiManagementComponent;
  let fixture: ComponentFixture<ApiManagementComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiManagementComponent, HttpClientTestingModule],
      providers: [ApiManagementService],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiManagementComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should load providers', () => {
    const mockProviders = [
      { id: 1, slug: 'api1', name: 'API One', logoUrl: null, createdAt: '', updatedAt: '', endpoints: [] },
    ];
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/api-management/providers');
    req.flush(mockProviders);
    expect(component.loading).toBe(false);
    expect(component.providers).toEqual(mockProviders);
  });

  it('validateProviderForm should set errors for empty slug', () => {
    component.providerForm = { slug: '', name: 'A', logoUrl: '' };
    const valid = component.validateProviderForm();
    expect(valid).toBe(false);
    expect(component.providerFormErrors['slug']).toBeDefined();
  });

  it('validateProviderForm should accept valid slug and name', () => {
    component.providerForm = { slug: 'my-api', name: 'My API', logoUrl: '' };
    const valid = component.validateProviderForm();
    expect(valid).toBe(true);
    expect(Object.keys(component.providerFormErrors).length).toBe(0);
  });

  it('formatApiError should return message', () => {
    expect(component.formatApiError({ code: 'X', message: 'Something failed' })).toBe('Something failed');
  });
});
