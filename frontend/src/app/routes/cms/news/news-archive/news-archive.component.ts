import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CmsService } from 'app/services/cms.service';
import { SeoService } from 'app/services/seo.service';
import { CmsArticle, CmsCategory, StrapiMeta } from 'app/types/cms.types';
import { ROUTES } from 'app/constants/route.const';
import { FooterComponent } from 'app/layout/footer/footer.component';
import { CmsHeaderComponent } from 'app/layout/cms-header/cms-header.component';

@Component({
  selector: 'app-news-archive',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, CmsHeaderComponent],
  templateUrl: './news-archive.component.html',
  styleUrl: './news-archive.component.scss',
})
export class NewsArchiveComponent implements OnInit {
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);

  articles = signal<CmsArticle[]>([]);
  categories = signal<CmsCategory[]>([]);
  meta = signal<StrapiMeta | null>(null);
  loading = signal(true);
  currentPage = signal(1);
  activeCategory = signal<string | undefined>(undefined);
  routes = ROUTES;

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: 'News',
      description: 'Stay up to date with the latest news from WasteTrade. Industry insights, company updates, and recycling news.',
    });
    this.loadCategories();
    this.loadArticles();
  }

  loadCategories(): void {
    this.cms.getArticleCategories().subscribe({
      next: (res) => this.categories.set(res.data),
    });
  }

  loadArticles(page = 1): void {
    this.loading.set(true);
    this.cms.getArticles(page, 12, this.activeCategory()).subscribe({
      next: (res) => {
        this.articles.set(res.data);
        this.meta.set(res.meta);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onCategoryChange(category?: string): void {
    this.activeCategory.set(category);
    this.loadArticles(1);
  }

  getImageUrl(article: CmsArticle): string {
    return this.cms.getImageUrl(article.featuredImage);
  }

  formatDate(article: CmsArticle): string {
    const dateStr = article.publishedDate || article.createdAt;
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  get totalPages(): number {
    return this.meta()?.pagination?.pageCount ?? 1;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadArticles(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
