import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';

@Component({
  selector: 'app-unsuccessful-search',
  templateUrl: './unsuccessful-search.component.html',
  styleUrls: ['./unsuccessful-search.component.scss'],
  imports: [MatIconModule, MatButtonModule, RouterModule, TranslateModule],
})
export class UnsuccessfulSearchComponent implements OnInit {
  @Input() type: 'sell' | 'wanted' = 'sell';

  readonly ROUTES = ROUTES_WITH_SLASH;

  ngOnInit() {}
}
