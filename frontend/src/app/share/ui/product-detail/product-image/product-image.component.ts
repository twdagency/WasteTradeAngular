import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  Input,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FallbackImageDirective } from '@app/directives';
import { register, SwiperContainer } from 'swiper/element/bundle';
// register Swiper custom elements
register();

@Component({
  selector: 'app-product-image',
  imports: [MatIconModule, FallbackImageDirective],
  templateUrl: './product-image.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './product-image.component.scss',
})
export class ProductImageComponent {
  @Input() images: string[] = [];
  @Input() featureImage: string = '';
  @Input() isAdminView: boolean = false;

  private readonly platformId = inject(PLATFORM_ID);
  swiperEl: SwiperContainer | undefined = undefined;

  slideIndex = signal(0);
  @ViewChild('swiperContainer') swiperContainer: ElementRef | undefined;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.swiperEl = this.swiperContainer?.nativeElement;
      if (this.swiperEl) {
        this.swiperEl.swiper.on('realIndexChange', (e) => {
          this.slideIndex.set(e.activeIndex);
        });
        this.swiperEl.initialize();
      }
    }
  }

  get fullSlideLength() {
    if (!this.swiperEl?.swiper?.slides?.length) {
      return 0;
    }

    return this.swiperEl.swiper.slides.length;
  }
}
