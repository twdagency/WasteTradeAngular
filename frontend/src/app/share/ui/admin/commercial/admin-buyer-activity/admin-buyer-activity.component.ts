import { Component } from '@angular/core';
import { PurchasesComponent } from 'app/routes/admin/live-active-table/purchases/purchases.component';

@Component({
  selector: 'app-admin-buyer-activity',
  imports: [PurchasesComponent],
  templateUrl: './admin-buyer-activity.component.html',
  styleUrl: './admin-buyer-activity.component.scss',
})
export class AdminBuyerActivityComponent {}
