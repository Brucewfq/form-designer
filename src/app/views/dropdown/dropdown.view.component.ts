import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-dropdown-view',
  templateUrl: './dropdown.view.component.html'
})

export class DropdownViewComponent extends BaseComponent implements OnInit {

  options: any[];

  selectedOption: any;

  ngOnInit() {

    if (this.model.attr && !this.model.attr.fieldLabel) {
      this.model.attr.fieldLabel = 'Dropdown';
    }
    this.options = [
      {label: 'Option 1', value: '1'},
      {label: 'Option 2', value: '2'},
      {label: 'Option 3', value: '3'}
    ];
  }
}
