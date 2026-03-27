import { Component, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { HeaderService } from 'app/services/header.service';
import { AvatarComponent } from '../common/avatar/avatar.component';
import { NotificationComponent } from '../common/notification/notification.component';
import { SidebarComponent } from '../common/sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, AvatarComponent, SidebarComponent, RouterModule, MatButton, NotificationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() isHaulier: boolean = false;

  constructor(public headerService: HeaderService) {}
}
