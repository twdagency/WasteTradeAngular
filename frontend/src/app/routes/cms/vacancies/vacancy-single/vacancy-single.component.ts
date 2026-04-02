import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from 'app/services/cms.service';
import { SeoService } from 'app/services/seo.service';
import { CmsJob } from 'app/types/cms.types';
import { StrapiBlocksPipe } from 'app/share/pipes/strapi-blocks.pipe';
import { ROUTES } from 'app/constants/route.const';
import { FooterComponent } from 'app/layout/footer/footer.component';
import { Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-vacancy-single',
  standalone: true,
  imports: [CommonModule, RouterModule, StrapiBlocksPipe, FooterComponent],
  templateUrl: './vacancy-single.component.html',
  styleUrl: './vacancy-single.component.scss',
})
export class VacancySingleComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);
  private paramSub?: Subscription;

  job = signal<CmsJob | null>(null);
  loading = signal(true);
  notFound = signal(false);
  routes = ROUTES;

  ngOnInit(): void {
    this.paramSub = this.route.paramMap
      .pipe(switchMap((params) => {
        const slug = params.get('slug');
        this.loading.set(true);
        this.notFound.set(false);
        this.job.set(null);
        if (!slug) {
          this.notFound.set(true);
          this.loading.set(false);
          return [];
        }
        return this.cms.getJobBySlug(slug);
      }))
      .subscribe({
        next: (job) => {
          if (job) {
            this.job.set(job);
            this.seo.updateMetaTags({
              title: job.title,
              description: `${job.title} - ${job.location || 'Remote'} - ${job.type || 'Full Time'}`,
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
