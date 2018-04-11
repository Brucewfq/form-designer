import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-submit-view',
  templateUrl: './submit.view.component.html',
  styleUrls: ['./submit.view.component.scss']
})

export class SubmitViewComponent extends BaseComponent implements OnInit {
  defaults: any = {
    text: 'SAVE',
    width: 75,
    height: 30
  };

  ngOnInit() {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }
  }
}
