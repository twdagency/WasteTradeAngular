import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tab-container',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './tab-container.component.html',
  styleUrl: './tab-container.component.scss',
})
export class TabContainerComponent {
  @Output() back = new EventEmitter<void>();

  onBack() {
    this.back.emit();
  }
}
