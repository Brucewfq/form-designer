import {Component} from '@angular/core';

@Component({
    selector: 'app-number-property',
    templateUrl: './number.property.component.html'
})

export class NumberPropertyComponent {
    number = {};

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
