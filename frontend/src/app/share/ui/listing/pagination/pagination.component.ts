import { Component, computed, effect, EventEmitter, HostListener, Input, OnInit, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  imports: [MatButtonModule, MatIconModule, TranslateModule],
})
export class PaginationComponent implements OnInit {
  @Input() set pageNumber(val: number) {
    this.pageNumber$.set(val);
  }
  @Input() set totalCount(val: number) {
    this.totalCount$.set(val);
  }
  @Input() set size(val: number) {
    this.size$.set(val);
  }

  size$ = signal(10);
  @Output() pageChange = new EventEmitter();

  pages = signal<number[]>([]);
  isMobile = signal(false);
  totalCount$ = signal(0);
  pageNumber$ = signal(0);

  constructor() {
    effect(() => {
      this.updatePages();
    });
  }

  ngOnInit() {
    this.updatePages();
    this.checkMobile();
  }

  totalPage = computed(() => Math.ceil(this.totalCount$() / this.size$()));

  private updatePages(): void {
    const pages: number[] = [];
    const maxButtonsToShow = 3;
    const total = this.totalPage();
    const current = this.pageNumber$();

    if (total === 0) {
      this.pages.set([]);
      return;
    }

    if (total <= maxButtonsToShow + 2) {
      // Show all pages if not enough to need ellipsis
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1); // Always show first page

      let start = Math.max(2, current - Math.floor(maxButtonsToShow / 2));
      let end = Math.min(total - 1, current + Math.floor(maxButtonsToShow / 2));

      // Adjust if close to start or end
      if (current <= Math.ceil(maxButtonsToShow / 2)) {
        start = 2;
        end = maxButtonsToShow;
      } else if (current >= total - Math.floor(maxButtonsToShow / 2)) {
        start = total - maxButtonsToShow + 1;
        end = total - 1;
      }

      if (start > 2) {
        pages.push(-1); // Ellipsis
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < total - 1) {
        pages.push(-1); // Ellipsis
      }

      pages.push(total); // Always show last page
    }

    this.pages.set(pages);
  }

  onPageButtonClick(page: number): void {
    if (page >= 1 && page <= this.totalPage()) {
      this.pageChange.emit(page);
    }
  }

  onPreviousPage(): void {
    if (this.pageNumber$() > 1) {
      this.pageChange.emit(this.pageNumber$() - 1);
      this.updatePages();
    }
  }

  onNextPage(): void {
    if (this.pageNumber$() < this.totalPage()) {
      this.pageChange.emit(this.pageNumber$() + 1);
      this.updatePages();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  private checkMobile() {
    if (typeof window === 'undefined') {
      return;
    }

    this.isMobile.set(window.innerWidth < 768);
  }
}
