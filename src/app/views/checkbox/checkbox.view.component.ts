import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
    selector: 'app-checkbox-view',
    templateUrl: './checkbox.view.component.html'
})

export class CheckboxViewComponent extends BaseComponent implements OnInit {

  defaults: any = {
    fieldLabel: 'CheckBox',
    labelAlign: 'left',
    editable: true
  };

  ngOnInit() {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }
  }
}
