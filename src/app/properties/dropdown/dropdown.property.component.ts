import {Component} from '@angular/core';

@Component({
    selector: 'app-dropdown-property',
    templateUrl: './dropdown.property.component.html'
})

export class DropdownPropertyComponent {
    dropdown: any;

    selectedColumn: any;

    selectedDataSourceType: any;

    selectedType: any;

    columns: any[];

    dataSourceTypes: any[];

    reqTypes: any[];

    divShow: boolean = false;
    constructor() {
      this.selectedColumn = '3';
      this.columns = [
        {label: '2', value: '2'},
        {label: '3', value: '3'},
        {label: '4', value: '4'}
      ];

      this.selectedDataSourceType = '1';
      this.dataSourceTypes = [
        {label: 'Options', value: '1'},
        {label: 'Advanced', value: '2'}
      ];

      this.selectedType = 'GET';
      this.reqTypes = [
        {label: 'GET', value: 'GET'},
        {label: 'POST', value: 'POST'}
      ];

      this.dropdown = {
        options: 'Option 1   Option 2   Option 3'
      }
    };

    clickFinish () {
      alert('clickFinish');
    };

    clickQuickFinish () {
      alert('clickQuickFinish');
    };

    chooseEvent (e) {
      if (e) {
        this.divShow = true;
      } else {
        this.divShow = false;
      }
    };
}
