import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appFallbackImage]',
})
export class FallbackImageDirective {
  @Input() appFallbackImage: string | undefined;

  @HostListener('error', ['$event.target'])
  onError(img: HTMLImageElement) {
    if (img.src !== this.appFallbackImage && this.appFallbackImage) {
      img.src = this.appFallbackImage;
    } else {
      img.src = '/assets/images/default-fallback-image.png';
    }
  }
}
