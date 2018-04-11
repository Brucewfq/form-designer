import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-button-property',
  templateUrl: './button.property.component.html'
})

export class ButtonPropertyComponent extends BaseComponent implements OnInit {

  button: any = {};

  msgs: any[] = [];

  selectedEvent: any = {};

  eventData = [
    {'name': 'Click', 'desc': 'set event', id: 2}
  ];

  get eventDatas() {
    return this.getEventData(this.eventData);
  }

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.button
    };

    this.editData.emit(retData);

    if (field) {
      this.validate(field, this.button, type);
    }
  }

  clickFinish() {
    const retData = {
      dataName: this.dataName,
      attr: this.button
    };
    this.editData.emit(retData);
  };

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  ngOnInit() {
    this.registerSubject(this.subKey.SET_EVENT);
    if (this.dataModel && this.dataModel.attr) {
      this.button = this.dataModel.attr;
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
