import {Component} from '@angular/core';

@Component({
    selector: 'app-checkbox-property',
    templateUrl: './checkbox.property.component.html'
})

export class CheckboxPropertyComponent {
    checkbox = {};

    divShow: boolean = false;
    constructor() {

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
