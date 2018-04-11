import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
    selector: 'app-label-view',
    templateUrl: './label.view.component.html'
})

export class LabelViewComponent extends BaseComponent implements OnInit {
  ngOnInit() {
    if (this.model.attr && !this.model.attr.fieldLabel) {
      this.model.attr.fieldLabel = 'Label';
    }
  }
}
