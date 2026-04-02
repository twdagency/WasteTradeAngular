import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from 'app/services/cms.service';
import { SeoService } from 'app/services/seo.service';
import { CmsResource } from 'app/types/cms.types';
import { StrapiBlocksPipe } from 'app/share/pipes/strapi-blocks.pipe';
import { ROUTES } from 'app/constants/route.const';
import { FooterComponent } from 'app/layout/footer/footer.component';
import { CmsHeaderComponent } from 'app/layout/cms-header/cms-header.component';
import { Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-resource-single',
  standalone: true,
  imports: [CommonModule, RouterModule, StrapiBlocksPipe, FooterComponent, CmsHeaderComponent],
  templateUrl: './resource-single.component.html',
  styleUrl: './resource-single.component.scss',
})
export class ResourceSingleComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);
  private paramSub?: Subscription;

  resource = signal<CmsResource | null>(null);
  loading = signal(true);
  notFound = signal(false);
  routes = ROUTES;

  ngOnInit(): void {
    this.paramSub = this.route.paramMap
      .pipe(switchMap((params) => {
        const slug = params.get('slug');
        this.loading.set(true);
        this.notFound.set(false);
        this.resource.set(null);
        if (!slug) {
          this.notFound.set(true);
          this.loading.set(false);
          return [];
        }
        return this.cms.getResourceBySlug(slug);
      }))
      .subscribe({
        next: (resource) => {
          if (resource) {
            this.resource.set(resource);
            this.seo.updateMetaTags({
              title: resource.title,
              description: resource.excerpt || undefined,
              image: this.cms.getImageUrl(resource.featuredImage) || undefined,
            });
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

  getImageUrl(image: { url: string } | null | undefined): string {
    return this.cms.getImageUrl(image);
  }
}
