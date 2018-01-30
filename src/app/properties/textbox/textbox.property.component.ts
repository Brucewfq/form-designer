import {Component} from '@angular/core';

@Component({
    selector: 'app-textbox-property',
    templateUrl: './textbox.property.component.html'
})

export class TextboxPropertyComponent {
    textbox = {};

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
