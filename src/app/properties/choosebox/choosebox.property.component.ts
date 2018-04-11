import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';
import {ValidateService} from '../../service/validate.service';

@Component({
  selector: 'app-choosebox-property',
  templateUrl: './choosebox.property.component.html'
})

export class ChooseboxPropertyComponent extends BaseComponent implements OnInit {

  chooseBox: any = {
    name: ''
  };
  // 控件原有的名称
  componentName: string;
  msgs: any[] = [];
  selectedEvent: any = {};

  selectedData: any;

  treeData: any[] = [];

  // tab panel组件默认显示的title
  defaultTabTitle = 'smartDs';

  eventData = [
    {'name': 'Triggerclick', 'desc': 'set event', id: 1},
    {'name': 'Change', 'desc': 'set event', id: 2},
    {'name': 'Clear', 'desc': 'set event', id: 3}
  ];

  get eventDatas() {
    return this.getEventData(this.eventData);
  }

  display: Boolean = false;
  displayDialog: Boolean = false;

  // 如果field不传则不做验证，否则默认做非空验证
  onChange(field?: string, type = {}) {
    if (field) {
      this.validate(field, this.chooseBox, type);
    }

    // 组件属性发生改变时，name发生改变时通知相应的smartDs同时修改;
    if (field && this.chooseBox) {
      this.subjectService.broadcastData(this.constantService.subKey.PROPERTY_CHANGE, {id: this.dataName, model: this.chooseBox});
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
      if (this.selectedData.data &&
        (this.selectedData.data.type === 'Object'
          || this.selectedData.data.type === 'List'
          || this.selectedData.data.type === 'DateTime')) {
        this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
          severity: 'error',
          summary: '不能绑定list、DateTime、Object类型的属性',
          detail: ''
        });
        return;
      } else {
        this.chooseBox.bindPath = this.selectedData.path;
        this.displayDialog = false;
      }
    }
  }

  doCloseDialog() {
    this.displayDialog = false;
  }

  ngOnInit() {
    this.selectedData = {};
    if (this.dataModel && this.dataModel.attr) {
      this.chooseBox = this.dataModel.attr;
      this.componentName = this.dataModel.attr.name;
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
