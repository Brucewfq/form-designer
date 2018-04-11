import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-date-property',
  templateUrl: './date.property.component.html'
})

export class DatePropertyComponent extends BaseComponent implements OnInit {

  date: any = {};

  msgs: any[] = [];

  displayDialog: Boolean = false;

  treeData: any[] = [];

  selectedData: any;

  selectedEvent: any = {};

  // tab panel组件默认显示的title
  defaultTabTitle = 'smartDs';

  eventData = [
    {'name': 'Change', 'desc': 'set event', id: 1},
    {'name': 'focus', 'desc': 'set event', id: 2},
    {'name': 'Blur', 'desc': 'set event', id: 3},
  ];

  get eventDatas() {
    const arr = this.getEventData(this.eventData);
    return arr;
  }

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.date
    };
    this.editData.emit(retData);
    if (field) {
      this.validate(field, this.date, type);
    }

    // 组件属性发生改变时，name发生改变时通知相应的smartDs同时修改;
    if (field && this.date) {
      this.subjectService.broadcastData(this.constantService.subKey.PROPERTY_CHANGE, {id: this.dataName, model: this.date});
    }
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  showBind() {
    this.displayDialog = true;
  }

  doClickFinish() {
    if (this.selectedData) {
      if (this.selectedData.data && this.selectedData.data.type === 'DateTime') {
        this.date.bindPath = this.selectedData.path;
        this.onChange();
        this.displayDialog = false;
      } else {
        this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
          severity: 'error',
          summary: '只能绑定DateTime类型的属性',
          detail: ''
        });
        return;
      }
    }
  }

  doCloseDialog() {
    this.displayDialog = false;
  }

  ngOnInit() {
    this.selectedData = {};
    this.date.required = false;
    if (this.dataModel && this.dataModel.attr) {
      this.date = this.dataModel.attr;
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
