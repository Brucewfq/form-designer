import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-button-view',
  templateUrl: './button.view.component.html',
  styleUrls: ['./button.view.component.scss']
})

export class ButtonViewComponent extends BaseComponent implements OnInit {
  defaults: any = {
    text: 'BUTTON',
    width: 75,
    height: 30
  };

  ngOnInit() {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }
  }
}
