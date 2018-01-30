import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-dropdown-view',
    templateUrl: './dropdown.view.component.html'
})

export class DropdownViewComponent {

  options: any[];

  selectedOption: any;

  @Input() model: any;

  @Input() template: any;

  constructor() {
    this.options = [
      {label: 'Option 1', value: 'Option 1'},
      {label: 'Option 2', value: 'Option 2'},
      {label: 'Option 3', value: 'Option 3'}
    ];
  };

  drop(e: any) {
    this.log(e);
  };

  log(e: any) {
    console.log(e.type, e);
  }
}
