import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-submit-property',
  templateUrl: './submit.property.component.html'
})

export class SubmitPropertyComponent extends BaseComponent implements OnInit {

  submit: any = {};

  msgs: any[] = [];

  selectedEvent: any = {};

  options: any = [];

  selectedData: any;

  treeData: any[] = [];

  // tab panel组件默认显示的title
  defaultTabTitle = 'smartDs';

  eventData = [
    {'name': 'Submit', 'desc': 'set event', id: 1}
  ];

  get eventDatas() {
    return this.getEventData(this.eventData);
  }

  clickFinish() {
    const retData = {
      dataName: this.dataName,
      attr: this.submit
    };
    this.editData.emit(retData);
  };

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.submit
    };
    this.editData.emit(retData);

    if (field) {
      this.validate(field, this.submit, type);
    }
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  ngOnInit() {
    this.selectedData = {};
    if (this.dataModel && this.dataModel.attr) {
      this.submit = this.dataModel.attr;
    }

    if (this.dataModel && this.dataModel.scripts) {
      this.checkEventName(this.eventDatas, this.dataModel.scripts);
    }

    this.treeData = this.constantService.getDataByKey(this.subKey.smartDsChange);
    this.registerSubject(this.subKey.nodeChoose);
    this.registerSubject(this.subKey.smartDsChange);
    this.registerSubject(this.subKey.SET_EVENT);
    this.showInitValidate();
  };

  onSubResult(key: string, data: any) {
    if (key === this.subKey.smartDsChange) {
      this.treeData = data;
    } else if (key === this.subKey.nodeChoose) {
      this.selectedData = data;
    } else if (key === this.subKey.SET_EVENT) {
      this.checkEventName(this.eventDatas, data);
    }
  }
}
