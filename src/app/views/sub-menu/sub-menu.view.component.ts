import {Component, OnInit} from '@angular/core';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-sub-menu-component',
  templateUrl: './sub-menu.view.component.html',
  styleUrls: ['./sub-menu.view.component.scss']
})
export class AppSubMenuViewComponent {
  constructor(public app: AppComponent) {

  }
}
