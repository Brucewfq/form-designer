import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-textbox-view',
    templateUrl: './textbox.view.component.html'
})

export class TextboxViewComponent {

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
