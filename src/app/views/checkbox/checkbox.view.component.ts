import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-checkbox-view',
    templateUrl: './checkbox.view.component.html'
})

export class CheckboxViewComponent {

  checkboxValues: any;

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
