import {Component, Output, EventEmitter, Input} from '@angular/core';
import {AppComponent} from '../../app.component';

@Component({
    selector: 'app-wiget-property-bottom',
    template: `
      <button pButton type="button" icon="fa-check" label="Finish" class="ui-button-success"  (click)="doFinish()"></button>
      <button pButton type="button" icon="fa-plus" label="Save As Quick Field" class="ui-button-info"  (click)="doQuickFinish()" *ngIf="!dontShowQuick"></button>
      <button pButton type="button" icon="fa-close" label="Cancel" class="ui-button-info" (click)="app.closeDialog()"></button>
    `
})

export class PropertyBottomWigetComponent {

    @Output()
    cFinish = new EventEmitter();

    @Output()
    cQuickFinish = new EventEmitter();

    @Input()
    dontShowQuick: boolean = false;

    constructor(private app: AppComponent) {

    };

    doFinish () {
      this.cFinish.emit();
    };

    doQuickFinish () {
      this.cQuickFinish.emit();
    };
}
