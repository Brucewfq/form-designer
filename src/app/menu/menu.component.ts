import {Component} from '@angular/core';
import {AppComponent} from '../app.component';

@Component({
    selector: 'app-menucomp',
    templateUrl: './menu.component.html'
})

export class MenuComponent {
    constructor(public app: AppComponent) {

    };
}
