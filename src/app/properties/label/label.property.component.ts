import {Component} from '@angular/core';

@Component({
    selector: 'app-label-property',
    templateUrl: './label.property.component.html'
})

export class LabelPropertyComponent {
    label = {};

    dataTypes: any[];

    selectedDataType: any;
    divShow: boolean = false;
    constructor() {
      this.selectedDataType = 'String';
      this.dataTypes = [
        {label: 'String', value: 'String'},
        {label: 'Integer', value: 'Integer'},
        {label: 'Decimal', value: 'Decimal'},
        {label: 'Boolean', value: 'Boolean'},
        {label: 'GUID', value: 'GUID'},
        {label: 'DateTime', value: 'DateTime'},
        {label: 'Array', value: 'Array'}
      ];
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
