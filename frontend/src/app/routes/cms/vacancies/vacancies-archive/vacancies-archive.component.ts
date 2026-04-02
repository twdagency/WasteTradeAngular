import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CmsService } from 'app/services/cms.service';
import { SeoService } from 'app/services/seo.service';
import { CmsJob, StrapiMeta } from 'app/types/cms.types';
import { ROUTES } from 'app/constants/route.const';
import { FooterComponent } from 'app/layout/footer/footer.component';
import { CmsHeaderComponent } from 'app/layout/cms-header/cms-header.component';

@Component({
  selector: 'app-vacancies-archive',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, CmsHeaderComponent],
  templateUrl: './vacancies-archive.component.html',
  styleUrl: './vacancies-archive.component.scss',
})
export class VacanciesArchiveComponent implements OnInit {
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);

  jobs = signal<CmsJob[]>([]);
  meta = signal<StrapiMeta | null>(null);
  loading = signal(true);
  currentPage = signal(1);
  routes = ROUTES;

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: 'Vacancies',
      description: 'Explore career opportunities at WasteTrade. Join our team and make a real contribution to sustainability and the circular economy.',
    });
    this.loadJobs();
  }

  loadJobs(page = 1): void {
    this.loading.set(true);
    this.cms.getJobs(page, 12).subscribe({
      next: (res) => {
        this.jobs.set(res.data);
        this.meta.set(res.meta);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get totalPages(): number {
    return this.meta()?.pagination?.pageCount ?? 1;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadJobs(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
