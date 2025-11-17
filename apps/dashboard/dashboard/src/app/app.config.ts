import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    // Voici la partie cruciale pour réparer les erreurs
    importProvidersFrom(
      CommonModule,   // pipes: number, date, titlecase + ngClass
      FormsModule,    // ngModel
      RouterModule    // routerLink
    )
  ]
};
