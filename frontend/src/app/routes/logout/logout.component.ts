import { Component } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent {
  constructor(private authService: AuthService) {
    this.authService.logout();
  }
}
