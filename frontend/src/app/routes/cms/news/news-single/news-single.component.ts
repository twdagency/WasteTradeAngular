import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from 'app/services/cms.service';
import { SeoService } from 'app/services/seo.service';
import { CmsArticle } from 'app/types/cms.types';
import { StrapiBlocksPipe } from 'app/share/pipes/strapi-blocks.pipe';
import { ROUTES } from 'app/constants/route.const';
import { FooterComponent } from 'app/layout/footer/footer.component';
import { CmsHeaderComponent } from 'app/layout/cms-header/cms-header.component';
import { Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-news-single',
  standalone: true,
  imports: [CommonModule, RouterModule, StrapiBlocksPipe, FooterComponent, CmsHeaderComponent],
  templateUrl: './news-single.component.html',
  styleUrl: './news-single.component.scss',
})
export class NewsSingleComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);
  private paramSub?: Subscription;

  article = signal<CmsArticle | null>(null);
  relatedArticles = signal<CmsArticle[]>([]);
  loading = signal(true);
  notFound = signal(false);
  routes = ROUTES;

  ngOnInit(): void {
    this.paramSub = this.route.paramMap
      .pipe(switchMap((params) => {
        const slug = params.get('slug');
        this.loading.set(true);
        this.notFound.set(false);
        this.article.set(null);
        this.relatedArticles.set([]);
        if (!slug) {
          this.notFound.set(true);
          this.loading.set(false);
          return [];
        }
        return this.cms.getArticleBySlug(slug);
      }))
      .subscribe({
        next: (article) => {
          if (article) {
            this.article.set(article);
            this.seo.updateMetaTags({
              title: article.title,
              description: article.excerpt || undefined,
              image: this.cms.getImageUrl(article.featuredImage) || undefined,
              type: 'article',
            });
            this.loadRelated(article);
          } else {
            this.notFound.set(true);
          }
          this.loading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  private loadRelated(article: CmsArticle): void {
    const category = article.category?.name;
    if (category) {
      this.cms.getArticles(1, 4, category).subscribe({
        next: (res) => {
          this.relatedArticles.set(res.data.filter((a) => a.id !== article.id).slice(0, 3));
        },
      });
    }
  }

  getImageUrl(image: { url: string } | null | undefined): string {
    return this.cms.getImageUrl(image);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
