import {Component, Output, EventEmitter, Input} from '@angular/core';

@Component({
  selector: 'app-wiget-property-bottom',
  template: `
    <div style="text-align: center;margin-top:16px;">
      <button pButton type="button" icon="fa-plus" label="Finish" class="ui-button-success" (click)="doFinish()"></button>
      <button pButton type="button" icon="fa-plus" label="Save As Quick Field" class="ui-button-info" (click)="doQuickFinish()"
              *ngIf="!dontShowQuick"></button>
      <button pButton type="button" icon="fa-close" label="Cancel" class="ui-button-info" (click)="closeDialog()"></button>
    </div>
  `
})

export class PropertyBottomWigetComponent {

  @Output()
  cFinish = new EventEmitter();

  @Output()
  cQuickFinish = new EventEmitter();

  @Output()
  docloseDialog = new EventEmitter();

  @Input()
  dontShowQuick: boolean = false;

  doFinish() {
    this.cFinish.emit();
  };

  doQuickFinish() {
    this.cQuickFinish.emit();
  };

  closeDialog() {
    this.docloseDialog.emit();
  };
}
