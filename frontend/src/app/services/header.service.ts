import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private isOpenMenu$ = signal(false);

  get isOpenMenu() {
    return this.isOpenMenu$();
  }

  closeMenu() {
    this.isOpenMenu$.set(false);
  }

  openMenu() {
    this.isOpenMenu$.set(true);
  }
}
