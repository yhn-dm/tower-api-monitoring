/**
 * App routes: dashboard, provider detail, incidents, API management.
 */
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProviderComponent } from './pages/provider/provider.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  {
    path: 'providers/:slug',
    loadComponent: () =>
      import('./pages/provider/provider.component').then((m) => m.ProviderComponent),
  },
  {
    path: 'incidents',
    loadComponent: () =>
      import('./pages/incidents/incidents.component').then((m) => m.IncidentsComponent),
  },
  {
    path: 'api-management',
    loadComponent: () =>
      import('./pages/api-management/api-management.component').then((m) => m.ApiManagementComponent),
  },
];
