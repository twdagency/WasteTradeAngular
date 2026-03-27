import { DatePipe, LowerCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { AuditTrailDetail } from 'app/models/admin/audit-trail.model';

@Component({
  selector: 'app-audit-trail-detail',
  templateUrl: './audit-trail-detail.component.html',
  styleUrls: ['./audit-trail-detail.component.scss'],
  imports: [MatTableModule, DatePipe, LowerCasePipe, TranslateModule],
})
export class AuditTrailDetailComponent implements OnInit {
  @Input() items: AuditTrailDetail[] = [];
  displayedColumns: string[] = ['time', 'nameOfUser', 'username', 'type', 'organisation', 'roleOfUser', 'action'];
  constructor() {}

  ngOnInit() {}
}
