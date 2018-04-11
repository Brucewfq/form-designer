import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
    selector: 'app-textarea-view',
    templateUrl: './textarea.view.component.html'
})

export class TextareaViewComponent extends BaseComponent implements OnInit {
  defaults: any = {
    fieldLabel: 'Textarea',
    rows: 3,
    editable: true,
    labelAlign: 'left'
  };
  ngOnInit() {
    if (this.model.attr) {
     this.beforeInitDefault(this.model, this.defaults);
    }
  }
}
