import { Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { NotiItem } from 'app/types/notification';

@Component({
  selector: 'app-notification-item',
  imports: [MatIcon, IconComponent],
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.scss',
})
export class NotificationItemComponent {
  noti = input<NotiItem | undefined>();
  read = output();
  unread = output();

  onItemClick() {
    if (!this.noti()?.read) {
      this.read.emit();
    }
  }

  onIconOrTitleClick(event: Event) {
    if (this.noti()?.read) {
      event.stopPropagation();
      this.unread.emit();
    }
  }
}
