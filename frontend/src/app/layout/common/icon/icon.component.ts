import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-icon',
  imports: [MatIconModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  @Input({ required: true }) iconName = 'question_mark';
  @Input({}) className = '';
  @Input({}) iconClassName = '';
  @Input({}) backgroundColor = '#1d1d1b';
}
