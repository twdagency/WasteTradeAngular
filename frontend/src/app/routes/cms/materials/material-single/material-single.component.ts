import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from 'app/services/cms.service';
import { SeoService } from 'app/services/seo.service';
import { CmsMaterialLandingPage } from 'app/types/cms.types';
import { StrapiBlocksPipe } from 'app/share/pipes/strapi-blocks.pipe';
import { ROUTES } from 'app/constants/route.const';
import { FooterComponent } from 'app/layout/footer/footer.component';
import { CmsHeaderComponent } from 'app/layout/cms-header/cms-header.component';
import { Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-material-single',
  standalone: true,
  imports: [CommonModule, RouterModule, StrapiBlocksPipe, FooterComponent, CmsHeaderComponent],
  templateUrl: './material-single.component.html',
  styleUrl: './material-single.component.scss',
})
export class MaterialSingleComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);
  private paramSub?: Subscription;

  material = signal<CmsMaterialLandingPage | null>(null);
  loading = signal(true);
  notFound = signal(false);
  routes = ROUTES;

  ngOnInit(): void {
    this.paramSub = this.route.paramMap
      .pipe(switchMap((params) => {
        const slug = params.get('slug');
        this.loading.set(true);
        this.notFound.set(false);
        this.material.set(null);
        if (!slug) {
          this.notFound.set(true);
          this.loading.set(false);
          return [];
        }
        return this.cms.getMaterialLandingPageBySlug(slug);
      }))
      .subscribe({
        next: (page) => {
          if (page) {
            this.material.set(page);
            this.seo.updateMetaTags({
              title: page.title,
              description: page.seoDescription || undefined,
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
}
