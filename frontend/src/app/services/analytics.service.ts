import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '@app/environments';
import { Angulartics2 } from 'angulartics2';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private angulartics2 = inject(Angulartics2);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.initializeAnalytics();
  }

  private initializeAnalytics(): void {
    if (!environment.gaId || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadGtag(environment.gaId);

    // Track page views on route changes
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  trackEvent(action: string, properties?: Record<string, any>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const w: any = typeof window !== 'undefined' ? (window as any) : undefined;
    if (!w) {
      return;
    }

    // If gtag is available, send event immediately
    if (typeof w.gtag === 'function') {
      w.gtag('event', action, properties);
      return;
    }

    // If gtag is not yet loaded, wait for it
    const checkGtag = setInterval(() => {
      if (typeof w.gtag === 'function') {
        w.gtag('event', action, properties);
        clearInterval(checkGtag);
      }
    }, 100);

    // Stop checking after 5 seconds
    setTimeout(() => clearInterval(checkGtag), 5000);

    // Also emit to Angulartics2 for compatibility
    this.angulartics2.eventTrack.next({
      action,
      properties,
    });
  }

  trackPageView(path: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const w: any = typeof window !== 'undefined' ? (window as any) : undefined;
    if (w && typeof w.gtag === 'function') {
      // Send pageview directly to gtag if available
      w.gtag('config', environment.gaId, {
        page_path: path,
      });
    }

    // Also emit to Angulartics2 for compatibility
    this.angulartics2.pageTrack.next({
      path,
    });
  }

  private loadGtag(id: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const w: any = typeof window !== 'undefined' ? (window as any) : undefined;
    const d: Document | undefined = typeof document !== 'undefined' ? document : undefined;
    if (!w || !d) {
      return;
    }

    if (typeof w.gtag === 'function') {
      return;
    }

    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      w.dataLayer.push(arguments);
    };

    const script = d.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    d.head.appendChild(script);

    w.gtag('js', new Date());
    w.gtag('config', id);
  }
}
