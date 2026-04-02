import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CmsService } from 'app/services/cms.service';
import { SeoService } from 'app/services/seo.service';
import { CmsResource, ResourceCategory, StrapiMeta } from 'app/types/cms.types';
import { ROUTES } from 'app/constants/route.const';
import { FooterComponent } from 'app/layout/footer/footer.component';

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'WasteTrade Guides',
  'Plastics',
  'Paper',
  'Metals',
  'Rubber',
  'Recycling',
  'Waste Logistics',
  'Environmental',
  'Regulations',
];

@Component({
  selector: 'app-resources-archive',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './resources-archive.component.html',
  styleUrl: './resources-archive.component.scss',
})
export class ResourcesArchiveComponent implements OnInit {
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);

  resources = signal<CmsResource[]>([]);
  meta = signal<StrapiMeta | null>(null);
  loading = signal(true);
  currentPage = signal(1);
  activeCategory = signal<string | undefined>(undefined);
  allCategories = RESOURCE_CATEGORIES;
  routes = ROUTES;

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: 'Resources',
      description: 'Find information about WasteTrade, our services, plastics, recycling and more here in our resources hub.',
    });
    this.loadResources();
  }

  loadResources(page = 1): void {
    this.loading.set(true);
    this.cms.getResources(page, 12, this.activeCategory()).subscribe({
      next: (res) => {
        this.resources.set(res.data);
        this.meta.set(res.meta);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onCategoryChange(category?: string): void {
    this.activeCategory.set(category);
    this.loadResources(1);
  }

  getImageUrl(resource: CmsResource): string {
    return this.cms.getImageUrl(resource.featuredImage);
  }

  get totalPages(): number {
    return this.meta()?.pagination?.pageCount ?? 1;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadResources(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
