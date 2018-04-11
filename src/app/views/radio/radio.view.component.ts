import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-radio-view',
  templateUrl: './radio.view.component.html',
  styles: [`
    .radio-container {
      height: 1.286em;
      line-height: 1.286em;
      padding: 7px;
      margin-bottom: 10px;
    }

    .radio-box {
      width: 1.286em;
      height: 1.286em;
      outline: 0;
      border-color: #757575;
      margin: 0;
      vertical-align: middle;
      margin-right: 5px;
    }
  `]
})

export class RadioViewComponent extends BaseComponent implements OnInit {
  defaults: any = {
    fieldLabel: 'Radio',
    labelAlign: 'left',
    editable: true
  };

  value: string;

  ngOnInit () {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }
  }

}
