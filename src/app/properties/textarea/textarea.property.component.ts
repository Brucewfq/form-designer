import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-textarea-property',
  templateUrl: './textarea.property.component.html'
})

export class TextareaPropertyComponent extends BaseComponent implements OnInit {

  textarea: any = {};

  msgs: any[] = [];

  selectedEvent: any = {};

  displayDialog: Boolean = false;

  selectedData: any;

  treeData: any[] = [];

  // tab panel组件默认显示的title
  defaultTabTitle = 'smartDs';

  eventData = [
    {'name': 'Change', 'desc': 'set event', id: 1},
    {'name': 'Focus', 'desc': 'set event', id: 2},
    {'name': 'Blur', 'desc': 'set event', id: 3}
  ];

  get eventDatas() {
    return this.getEventData(this.eventData);
  }

  init() {
    this.textarea.required = false;
  }

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.textarea
    };

    if (!isNaN(parseInt(retData.attr.rows))) {
      retData.attr.rows = parseInt(retData.attr.rows);
    } else {
      retData.attr.rows = 3;
    }
    this.editData.emit(retData);

    if (field) {
      this.validate(field, this.textarea, type);
    }

    // 组件属性发生改变时，name发生改变时通知相应的smartDs同时修改;
    if (field && this.textarea) {
      this.subjectService.broadcastData(this.constantService.subKey.PROPERTY_CHANGE, {id: this.dataName, model: this.textarea});
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
        this.textarea.bindPath = this.selectedData.path;
        this.onChange();
        this.displayDialog = false;
      }
    }
  }

  doCloseDialog() {
    this.displayDialog = false;
  }

  ngOnInit() {
    this.selectedData = {};
    this.init();
    if (this.dataModel && this.dataModel.attr) {
      this.textarea = this.dataModel.attr;
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
