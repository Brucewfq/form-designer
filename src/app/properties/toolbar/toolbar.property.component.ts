import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-toolbar-property',
  templateUrl: './toolbar.property.component.html'
})

export class ToolbarPropertyComponent extends BaseComponent implements OnInit {

  toolbar: any = {};

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
      attr: this.toolbar
    };
    this.editData.emit(retData);
    if (field) {
      this.validate(field, this.toolbar, type);
    }
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  ngOnInit() {
    this.registerSubject(this.subKey.SET_EVENT);

    if (this.dataModel && this.dataModel.attr) {
      this.toolbar = this.dataModel.attr;
    }
    if (!this.toolbar.name) {
      this.toolbar.name = this.nameService.getNames('form');
    }

    if (this.dataModel && this.dataModel.scripts) {
      this.checkEventName(this.eventDatas, this.dataModel.scripts);
    }

    this.showInitValidate();
  };

  onSubResult(key: string, data: any) {
    if (key === this.subKey.SET_EVENT) {
      this.checkEventName(this.eventDatas, data);
    }
  }
}
