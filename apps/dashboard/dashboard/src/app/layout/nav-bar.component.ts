/**
 * Top nav: links to Dashboard, Incidents, and API Management.
 */
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-card border-b border-border">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between h-14">
          <div class="flex items-center gap-8">
            <a
              routerLink="/"
              routerLinkActive="text-foreground"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-2 text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-activity w-5 h-5 text-chart-line"
              >
                <path
                  d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
                ></path>
              </svg>
              <span class="font-semibold">API Monitor</span>
            </a>
            <nav class="flex items-center gap-6 text-sm font-medium">
              <a
                routerLink="/"
                routerLinkActive="text-foreground"
                [routerLinkActiveOptions]="{ exact: true }"
                class="text-muted-foreground hover:text-foreground transition-colors"
              >
                API Monitor
              </a>
              <a
                routerLink="/incidents"
                routerLinkActive="text-foreground"
                class="text-muted-foreground hover:text-foreground transition-colors"
              >
                Incidents
              </a>
              <a
                routerLink="/api-management"
                routerLinkActive="text-foreground"
                class="text-muted-foreground hover:text-foreground transition-colors"
              >
                API Management
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class NavBarComponent {}

