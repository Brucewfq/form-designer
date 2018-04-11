import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-choosebox-view',
  templateUrl: './choosebox.view.component.html'
})

export class ChooseboxViewComponent extends BaseComponent implements OnInit {
  defaults: any = {
    fieldLabel: 'Choosebox',
    editable: true,
    labelAlign: 'left'
  };

  ngOnInit() {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }
  }
}
