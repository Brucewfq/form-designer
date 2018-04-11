import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-number-view',
  templateUrl: './number.view.component.html'
})

export class NumberViewComponent extends BaseComponent implements OnInit {
  defaults: any = {
    fieldLabel: 'Number',
    labelAlign: 'left',
    allowDecimals: true,
    editable: true
  };

  ngOnInit() {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }
  }
}
