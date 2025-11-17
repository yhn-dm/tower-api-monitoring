import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProviderComponent } from './pages/provider/provider.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  {
  path: 'providers/:slug',
  loadComponent: () =>
    import('./pages/provider/provider.component').then(m => m.ProviderComponent)
}

];
