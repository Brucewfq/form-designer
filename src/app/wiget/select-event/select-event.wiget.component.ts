import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {SelectEventService} from './select-event.service.component';

@Component({
    selector: 'app-wiget-select-event',
    template: `
      <h3 class="first">Please select an event</h3>
      <p-dropdown [options]="ops" [(ngModel)]="selectedOption" placeholder="Select a Options" (onChange)="change($event);" [style]="{'width':'150px'}"></p-dropdown>
    `
})

export class SelectEventWigetComponent implements OnInit{

    ops: any[];

  selectedOption: any;

    @Input()
    parentType: string;

    @Output()
    chooseOk: EventEmitter<any> = new EventEmitter();

    constructor(private svc: SelectEventService) {

    };

    ngOnInit(): void {
      this.svc.getEvents(this.parentType).then(events => this.success(events));
    };

    success (events) {
      this.ops = events;
    }

    change($event) {
      this.chooseOk.emit(this.selectedOption);
    };
}
