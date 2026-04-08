import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@app/environments';
import {
  CmsArticle,
  CmsJob,
  CmsMaterialLandingPage,
  CmsResource,
  StrapiResponse,
  StrapiSingleResponse,
} from 'app/types/cms.types';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CmsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.cmsUrl;

  // --- Articles ---

  getArticles(page = 1, pageSize = 25, category?: string): Observable<StrapiResponse<CmsArticle>> {
    let params = new HttpParams()
      .set('populate', '*')
      .set('sort[0]', 'publishedDate:desc')
      .set('sort[1]', 'createdAt:desc')
      .set('pagination[page]', page.toString())
      .set('pagination[pageSize]', pageSize.toString());

    if (category) {
      params = params.set('filters[category][name][$eq]', category);
    }

    return this.http.get<StrapiResponse<CmsArticle>>(`${this.baseUrl}/api/articles`, { params });
  }

  getArticleBySlug(slug: string): Observable<CmsArticle | null> {
    const params = new HttpParams()
      .set('filters[slug][$eq]', slug)
      .set('populate', '*');

    return this.http
      .get<StrapiResponse<CmsArticle>>(`${this.baseUrl}/api/articles`, { params })
      .pipe(map((res) => res.data?.[0] ?? null));
  }

  getArticleCategories(): Observable<StrapiResponse<{ id: number; documentId: string; name: string }>> {
    return this.http.get<StrapiResponse<{ id: number; documentId: string; name: string }>>(
      `${this.baseUrl}/api/categories`,
    );
  }

  // --- Jobs ---

  getJobs(page = 1, pageSize = 25): Observable<StrapiResponse<CmsJob>> {
    const params = new HttpParams()
      .set('sort', 'createdAt:desc')
      .set('pagination[page]', page.toString())
      .set('pagination[pageSize]', pageSize.toString());

    return this.http.get<StrapiResponse<CmsJob>>(`${this.baseUrl}/api/jobs`, { params });
  }

  getJobBySlug(slug: string): Observable<CmsJob | null> {
    const params = new HttpParams().set('filters[slug][$eq]', slug);

    return this.http
      .get<StrapiResponse<CmsJob>>(`${this.baseUrl}/api/jobs`, { params })
      .pipe(map((res) => res.data?.[0] ?? null));
  }

  // --- Resources ---

  getResources(page = 1, pageSize = 25, category?: string): Observable<StrapiResponse<CmsResource>> {
    let params = new HttpParams()
      .set('populate', '*')
      .set('sort', 'createdAt:desc')
      .set('pagination[page]', page.toString())
      .set('pagination[pageSize]', pageSize.toString());

    if (category) {
      params = params.set('filters[resourceCategory][$eq]', category);
    }

    return this.http.get<StrapiResponse<CmsResource>>(`${this.baseUrl}/api/resources`, { params });
  }

  getResourceBySlug(slug: string): Observable<CmsResource | null> {
    const params = new HttpParams()
      .set('filters[slug][$eq]', slug)
      .set('populate', '*');

    return this.http
      .get<StrapiResponse<CmsResource>>(`${this.baseUrl}/api/resources`, { params })
      .pipe(map((res) => res.data?.[0] ?? null));
  }

  // --- Material Landing Pages ---

  getMaterialLandingPages(page = 1, pageSize = 50): Observable<StrapiResponse<CmsMaterialLandingPage>> {
    const params = new HttpParams()
      .set('sort', 'title:asc')
      .set('pagination[page]', page.toString())
      .set('pagination[pageSize]', pageSize.toString());

    return this.http.get<StrapiResponse<CmsMaterialLandingPage>>(
      `${this.baseUrl}/api/material-landing-pages`,
      { params },
    );
  }

  getMaterialLandingPageBySlug(slug: string): Observable<CmsMaterialLandingPage | null> {
    const params = new HttpParams().set('filters[slug][$eq]', slug);

    return this.http
      .get<StrapiResponse<CmsMaterialLandingPage>>(`${this.baseUrl}/api/material-landing-pages`, { params })
      .pipe(map((res) => res.data?.[0] ?? null));
  }

  // --- Helpers ---

  getImageUrl(image: { url: string } | null | undefined): string {
    if (!image?.url) return '';
    if (image.url.startsWith('http')) return image.url;
    return `${this.baseUrl}${image.url}`;
  }
}
