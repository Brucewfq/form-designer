import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-section-view',
    templateUrl: './section.view.component.html'
})

export class SectionViewComponent {

  @Input() model: any;

  @Input() template: any;

  buttonShow: boolean;

  constructor() {

  };

  drop(e: any) {
    this.log(e);
  };

  log(e: any) {
    console.log(e.type, e);
  }
}
