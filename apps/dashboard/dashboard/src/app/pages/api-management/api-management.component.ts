import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/**
 * This page lets you add, edit, and delete providers and their endpoints (forms, validation, delete confirmations).
 */
import {
  ApiManagementService,
  Provider,
  Endpoint,
  CreateProviderPayload,
  CreateEndpointPayload,
  UpdateEndpointPayload,
  ApiError,
} from '../../services/api-management.service';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

@Component({
  selector: 'app-api-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-management.component.html',
})
export class ApiManagementComponent implements OnInit {
  providers: Provider[] = [];
  loading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  showProviderForm = false;
  providerForm: CreateProviderPayload = { slug: '', name: '', logoUrl: '' };
  providerFormErrors: Record<string, string> = {};
  providerSubmitting = false;

  endpointFormByProvider: Record<number, CreateEndpointPayload> = {};
  endpointFormErrors: Record<number, Record<string, string>> = {};
  endpointSubmitting: Record<number, boolean> = {};

  editingEndpoint: { endpoint: Endpoint; providerId: number } | null = null;
  editEndpointForm: UpdateEndpointPayload = {};
  editEndpointErrors: Record<string, string> = {};
  editEndpointSubmitting = false;

  confirmDeleteProvider: Provider | null = null;
  confirmDeleteEndpoint: { endpoint: Endpoint; providerId: number } | null = null;
  deleteProviderInProgress = false;
  deleteEndpointInProgress = false;

  expandedProviderId: number | null = null;

  constructor(private api: ApiManagementService) {}

  ngOnInit() {
    this.loadProviders();
  }

  loadProviders() {
    this.loading = true;
    this.errorMessage = null;
    this.api.getProviders().subscribe({
      next: (list) => {
        this.loading = false;
        if (Array.isArray(list)) {
          this.providers = list;
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load providers.';
        this.loading = false;
      },
    });
  }

  private setSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = null), 4000);
  }

  private setError(msg: string) {
    this.errorMessage = msg;
  }

  private clearMessages() {
    this.errorMessage = null;
    this.successMessage = null;
  }

  openProviderForm() {
    this.showProviderForm = true;
    this.providerForm = { slug: '', name: '', logoUrl: '' };
    this.providerFormErrors = {};
  }

  cancelProviderForm() {
    this.showProviderForm = false;
    this.providerFormErrors = {};
  }

  validateProviderForm(): boolean {
    const e: Record<string, string> = {};
    if (!this.providerForm.slug?.trim()) {
      e['slug'] = 'Slug is required.';
    } else {
      if (!SLUG_PATTERN.test(this.providerForm.slug.trim().toLowerCase())) {
        e['slug'] = 'Slug: lowercase, digits and hyphens only.';
      }
      if (this.providerForm.slug.length > 64) e['slug'] = 'Max 64 characters.';
    }
    if (!this.providerForm.name?.trim()) {
      e['name'] = 'Name is required.';
    } else if (this.providerForm.name.length > 128) {
      e['name'] = 'Max 128 characters.';
    }
    this.providerFormErrors = e;
    return Object.keys(e).length === 0;
  }

  submitProvider() {
    if (this.providerSubmitting || !this.validateProviderForm()) return;
    this.providerSubmitting = true;
    this.clearMessages();
    const payload: CreateProviderPayload = {
      slug: this.providerForm.slug.trim().toLowerCase(),
      name: this.providerForm.name.trim(),
      logoUrl: this.providerForm.logoUrl?.trim() || undefined,
    };
    this.api.createProvider(payload).subscribe({
      next: (res) => {
        this.providerSubmitting = false;
        if (res.error) {
          this.setError(this.formatApiError(res.error));
          if (res.error.details) {
            const flat: Record<string, string> = {};
            for (const [k, v] of Object.entries(res.error.details)) {
              flat[k] = Array.isArray(v) ? v.join(' ') : String(v);
            }
            this.providerFormErrors = flat;
          }
          return;
        }
        this.setSuccess('Provider created.');
        this.cancelProviderForm();
        this.loadProviders();
      },
      error: () => {
        this.providerSubmitting = false;
        this.setError('Error while creating.');
      },
    });
  }

  confirmDeleteProviderModal(p: Provider) {
    this.confirmDeleteProvider = p;
  }

  cancelDeleteProvider() {
    this.confirmDeleteProvider = null;
  }

  deleteProvider() {
    if (!this.confirmDeleteProvider || this.deleteProviderInProgress) return;
    this.deleteProviderInProgress = true;
    this.clearMessages();
    const id = this.confirmDeleteProvider.id;
    this.api.deleteProvider(id).subscribe({
      next: (res) => {
        this.deleteProviderInProgress = false;
        this.confirmDeleteProvider = null;
        if ((res as any).error) {
          this.setError(this.formatApiError((res as any).error));
          return;
        }
        this.setSuccess('Provider deleted.');
        this.loadProviders();
      },
      error: () => {
        this.deleteProviderInProgress = false;
        this.setError('Error while deleting.');
      },
    });
  }

  getEndpointForm(providerId: number): CreateEndpointPayload {
    if (!this.endpointFormByProvider[providerId]) {
      this.endpointFormByProvider[providerId] = {
        url: '',
        method: 'GET',
        region: 'global',
        description: '',
        isEnabled: true,
      };
    }
    return this.endpointFormByProvider[providerId];
  }

  toggleProvider(p: Provider) {
    const id = Number(p.id);
    this.expandedProviderId = this.expandedProviderId === id ? null : id;
    this.editingEndpoint = null;
  }

  isProviderExpanded(p: Provider): boolean {
    return this.expandedProviderId !== null && this.expandedProviderId === Number(p.id);
  }

  validateEndpointForm(providerId: number): boolean {
    const form = this.getEndpointForm(providerId);
    const e: Record<string, string> = {};
    try {
      if (!form.url?.trim()) e['url'] = 'URL is required.';
      else new URL(form.url);
    } catch {
      e['url'] = 'Invalid URL.';
    }
    if (form.method && !HTTP_METHODS.includes(form.method.toUpperCase())) {
      e['method'] = 'Invalid method.';
    }
    this.endpointFormErrors[providerId] = e;
    return Object.keys(e).length === 0;
  }

  addEndpoint(p: Provider) {
    const providerId = p.id;
    if (this.endpointSubmitting[providerId] || !this.validateEndpointForm(providerId)) return;
    const form = this.getEndpointForm(providerId);
    this.endpointSubmitting[providerId] = true;
    this.clearMessages();
    const payload: CreateEndpointPayload = {
      url: form.url.trim(),
      method: (form.method || 'GET').toUpperCase(),
      region: form.region?.trim() || 'global',
      description: form.description?.trim() || undefined,
      isEnabled: form.isEnabled ?? true,
    };
    this.api.createEndpoint(providerId, payload).subscribe({
      next: (res) => {
        this.endpointSubmitting[providerId] = false;
        if (res.error) {
          this.setError(this.formatApiError(res.error));
          if (res.error.details) {
            const flat: Record<string, string> = {};
            for (const [k, v] of Object.entries(res.error.details)) {
              flat[k] = Array.isArray(v) ? v.join(' ') : String(v);
            }
            this.endpointFormErrors[providerId] = flat;
          }
          return;
        }
        this.setSuccess('Endpoint added.');
        this.endpointFormByProvider[providerId] = {
          url: '',
          method: 'GET',
          region: 'global',
          description: '',
          isEnabled: true,
        };
        this.endpointFormErrors[providerId] = {};
        this.loadProviders();
      },
      error: () => {
        this.endpointSubmitting[providerId] = false;
        this.setError('Error while adding.');
      },
    });
  }

  startEditEndpoint(ep: Endpoint, providerId: number) {
    this.editingEndpoint = { endpoint: ep, providerId };
    this.editEndpointForm = {
      url: ep.url,
      method: ep.method,
      region: ep.region,
      description: ep.description ?? '',
      isEnabled: ep.isEnabled,
    };
    this.editEndpointErrors = {};
  }

  cancelEditEndpoint() {
    this.editingEndpoint = null;
    this.editEndpointErrors = {};
  }

  validateEditEndpoint(): boolean {
    const e: Record<string, string> = {};
    if (this.editEndpointForm.url !== undefined) {
      if (!this.editEndpointForm.url?.trim()) e['url'] = 'URL is required.';
      else {
        try {
          new URL(this.editEndpointForm.url);
        } catch {
          e['url'] = 'Invalid URL.';
        }
      }
    }
    if (
      this.editEndpointForm.method !== undefined &&
      !HTTP_METHODS.includes(this.editEndpointForm.method.toUpperCase())
    ) {
      e['method'] = 'Invalid method.';
    }
    this.editEndpointErrors = e;
    return Object.keys(e).length === 0;
  }

  saveEndpoint() {
    if (!this.editingEndpoint || this.editEndpointSubmitting) return;
    if (!this.validateEditEndpoint()) return;
    this.editEndpointSubmitting = true;
    this.clearMessages();
    const id = this.editingEndpoint.endpoint.id;
    const payload: UpdateEndpointPayload = {
      url: this.editEndpointForm.url?.trim(),
      method: this.editEndpointForm.method?.toUpperCase(),
      region: this.editEndpointForm.region?.trim() || 'global',
      description: this.editEndpointForm.description?.trim() || undefined,
      isEnabled: this.editEndpointForm.isEnabled,
    };
    this.api.updateEndpoint(id, payload).subscribe({
      next: (res) => {
        this.editEndpointSubmitting = false;
        if (res.error) {
          this.setError(this.formatApiError(res.error));
          if (res.error.details) {
            const flat: Record<string, string> = {};
            for (const [k, v] of Object.entries(res.error.details)) {
              flat[k] = Array.isArray(v) ? v.join(' ') : String(v);
            }
            this.editEndpointErrors = flat;
          }
          return;
        }
        this.setSuccess('Endpoint updated.');
        this.cancelEditEndpoint();
        this.loadProviders();
      },
      error: () => {
        this.editEndpointSubmitting = false;
        this.setError('Error while updating.');
      },
    });
  }

  confirmDeleteEndpointModal(ep: Endpoint, providerId: number) {
    this.confirmDeleteEndpoint = { endpoint: ep, providerId };
  }

  cancelDeleteEndpoint() {
    this.confirmDeleteEndpoint = null;
  }

  deleteEndpoint() {
    if (!this.confirmDeleteEndpoint || this.deleteEndpointInProgress) return;
    this.deleteEndpointInProgress = true;
    this.clearMessages();
    const id = this.confirmDeleteEndpoint.endpoint.id;
    this.api.deleteEndpoint(id).subscribe({
      next: (res) => {
        this.deleteEndpointInProgress = false;
        this.confirmDeleteEndpoint = null;
        if ((res as any).error) {
          this.setError(this.formatApiError((res as any).error));
          return;
        }
        this.setSuccess('Endpoint deleted.');
        this.loadProviders();
      },
      error: () => {
        this.deleteEndpointInProgress = false;
        this.setError('Error while deleting.');
      },
    });
  }

  isEditing(ep: Endpoint): boolean {
    return this.editingEndpoint?.endpoint.id === ep.id;
  }

  formatApiError(err: ApiError): string {
    if (err.details) {
      const parts = Object.entries(err.details).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
      return parts.length ? parts.join(' ') : err.message;
    }
    return err.message;
  }

  readonly httpMethods = HTTP_METHODS;
}
