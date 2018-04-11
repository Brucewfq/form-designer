import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-textbox-view',
  templateUrl: './textbox.view.component.html'
})

export class TextboxViewComponent extends BaseComponent implements OnInit {
  defaults: any = {
    fieldLabel: 'Textbox',
    editable: true,
    labelAlign: 'left'
  };
  ngOnInit() {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }
  }
}
