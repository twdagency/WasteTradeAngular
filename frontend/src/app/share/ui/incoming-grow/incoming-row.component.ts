import { Component, Input, output } from '@angular/core';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-incoming-row',
  imports: [TranslateModule, TranslatePipe],
  templateUrl: './incoming-row.component.html',
  styleUrl: './incoming-row.component.scss',
})
export class IncomingRowComponent {
  @Input() items: any;
  @Input() submitting: boolean = false;
  approve = output<void>();
  reject = output<void>();
}
