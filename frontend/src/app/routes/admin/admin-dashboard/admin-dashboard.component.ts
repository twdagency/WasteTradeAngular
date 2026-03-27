import { Component } from '@angular/core';
import { AdminLayoutComponent } from 'app/layout/admin-layout/admin-layout.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [AdminLayoutComponent],
})
export class AdminDashboardComponent {}
