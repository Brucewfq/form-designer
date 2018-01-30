import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-number-view',
    templateUrl: './number.view.component.html'
})

export class NumberViewComponent {

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
