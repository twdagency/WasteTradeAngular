import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-share-listing',
  templateUrl: './share-listing.component.html',
  styleUrl: './share-listing.component.scss',
  imports: [MatButtonModule, TranslateModule],
})
export class ShareListingComponent {
  router = inject(Router);
  @Input() title: string = 'Check out this listing';

  get url() {
    return window.location.href;
  }

  shareToFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.url)}`;
    window.open(url, '_blank');
  }

  shareToLinkedIn() {
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${this.url}&title=${encodeURIComponent(this.title)}`;
    window.open(url, '_blank');
  }

  shareByEmail() {
    const url = `mailto:?subject=${encodeURIComponent(this.title)}&body=${encodeURIComponent(this.url)}`;
    window.open(url, '_blank');
  }

  shareToTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.title)}&url=${encodeURIComponent(this.url)}`;
    window.open(url, '_blank');
  }

  shareToWhatsApp() {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(this.title + ' ' + this.url)}`;
    window.open(url, '_blank');
  }
}
