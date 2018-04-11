import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-form-property',
  templateUrl: './form.property.component.html'
})

export class FromPropertyComponent extends BaseComponent implements OnInit {

  section: any = {};

  selectedEvent: any = {};

  msgs: any[] = [];

  eventData = [
    {'name': 'Init', 'desc': 'set event', id: 1},
    {'name': 'Beforesubmit', 'desc': 'set event', id: 2},
    {'name': 'Submit', 'desc': 'set event', id: 3},
    {'name': 'Beforeaction', 'desc': 'set event', id: 4},
    {'name': 'Action', 'desc': 'set event', id: 5},
    {'name': 'Beforeinit', 'desc': 'set event', id: 6},
  ];

  get eventDatas() {
    const arr = this.getEventData(this.eventData);
    return arr;
  }

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.section
    };
    this.editData.emit(retData);
    if (field) {
      this.validate(field, this.section, type);
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
      this.section = this.dataModel.attr;
      if (!this.section.name) {
        this.section.name = this.nameService.getNames(this.dataModel.inputType);
      }
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
