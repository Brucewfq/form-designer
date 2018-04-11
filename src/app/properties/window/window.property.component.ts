import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-window-property',
  templateUrl: './window.property.component.html'
})

export class WindowPropertyComponent extends BaseComponent implements OnInit {

  window: any = {};

  selectedEvent: any = {};

  msgs: any[] = [];

  eventData = [
    {'name': 'Init', 'desc': 'set event', id: 3}
  ];

  get eventDatas() {
    return this.getEventData(this.eventData);
  }

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.window
    };
    this.editData.emit(retData);
    if (field) {
      this.validate(field, this.window, type);
    }
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  ngOnInit() {
    if (this.dataModel && this.dataModel.attr) {
      this.window = this.dataModel.attr;
    }

    if (!this.window.width) {
      this.window.width = 300;
    }

    if (!this.window.height) {
      this.window.height = 300;
    }

    if (!this.window.title) {
      this.window.title = this.window.name;
    }

    this.showInitValidate();
  };
}
