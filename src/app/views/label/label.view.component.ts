import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-label-view',
    templateUrl: './label.view.component.html'
})

export class LabelViewComponent {

  @Input() model: any;

  @Input() template: any;

  constructor() {

  };

  drop(e: any) {
    this.log(e);
  };

  log(e: any) {
    console.log(e.type, e);
  }
}
