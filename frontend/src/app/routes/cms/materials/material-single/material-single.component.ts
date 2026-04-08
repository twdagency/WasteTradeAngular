import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CmsService } from 'app/services/cms.service';
import { SeoService } from 'app/services/seo.service';
import { CmsMaterialLandingPage, StrapiHeadingBlock } from 'app/types/cms.types';
import { StrapiBlocksPipe } from 'app/share/pipes/strapi-blocks.pipe';
import { FooterComponent } from 'app/layout/footer/footer.component';
import { CmsHeaderComponent } from 'app/layout/cms-header/cms-header.component';
import { addLanguagePrefix } from 'app/utils/language.utils';
import { Subscription, switchMap } from 'rxjs';

interface SectionLink {
  id: string;
  label: string;
}

@Component({
  selector: 'app-material-single',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    StrapiBlocksPipe,
    FooterComponent,
    CmsHeaderComponent,
  ],
  templateUrl: './material-single.component.html',
  styleUrl: './material-single.component.scss',
})
export class MaterialSingleComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);
  private readonly scroller = inject(ViewportScroller);
  private paramSub?: Subscription;

  material = signal<CmsMaterialLandingPage | null>(null);
  loading = signal(true);
  notFound = signal(false);

  sectionLinks = computed<SectionLink[]>(() => {
    const m = this.material();
    if (!m?.content) return [];
    return m.content
      .filter((block): block is StrapiHeadingBlock => block.type === 'heading' && (block as StrapiHeadingBlock).level === 2)
      .map((block, i) => {
        const label = block.children?.map((c: any) => c.text || '').join('') || `Section ${i + 1}`;
        return { id: `section-${i}`, label };
      });
  });

  ctaLabel = computed(() => {
    const m = this.material();
    if (!m) return 'Sell Your Material';
    const cat = m.materialCategory || 'Plastic';
    return `Sell Your ${cat} Material`;
  });

  ctaBulkLabel = computed(() => {
    const m = this.material();
    const cat = m?.materialCategory || 'Plastic';
    return `GET THE BEST PRICE FOR YOUR BULK ${cat.toUpperCase()} - 3 TONNES+`;
  });

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
              description: page.seoDescription || page.heroSubtitle || undefined,
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

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navigateToRegister(): void {
    this.router.navigateByUrl(addLanguagePrefix('/create-account'));
  }

  navigateToSell(): void {
    this.router.navigateByUrl(addLanguagePrefix('/sell'));
  }
}
