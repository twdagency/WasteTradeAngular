import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from 'app/services/cms.service';
import { SeoService } from 'app/services/seo.service';
import { CmsResource } from 'app/types/cms.types';
import { StrapiBlocksPipe } from 'app/share/pipes/strapi-blocks.pipe';
import { ROUTES } from 'app/constants/route.const';
import { FooterComponent } from 'app/layout/footer/footer.component';

@Component({
  selector: 'app-resource-single',
  standalone: true,
  imports: [CommonModule, RouterModule, StrapiBlocksPipe, FooterComponent],
  templateUrl: './resource-single.component.html',
  styleUrl: './resource-single.component.scss',
})
export class ResourceSingleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);

  resource = signal<CmsResource | null>(null);
  loading = signal(true);
  notFound = signal(false);
  routes = ROUTES;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.cms.getResourceBySlug(slug).subscribe({
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
  }

  getImageUrl(image: { url: string } | null | undefined): string {
    return this.cms.getImageUrl(image);
  }
}
