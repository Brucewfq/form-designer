import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-section-cols-view',
    templateUrl: './section-cols.view.component.html'
})

export class SectionColsViewComponent {

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
