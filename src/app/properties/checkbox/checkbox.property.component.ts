import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-checkbox-property',
  templateUrl: './checkbox.property.component.html'
})

export class CheckboxPropertyComponent extends BaseComponent implements OnInit {

  checkbox: any = {};

  msgs: any[] = [];

  dataSourceTypes = [
    {label: 'Options', value: 'Options'},
    {label: 'Advanced', value: 'Advanced'}
  ];

  selectedData: any;

  selectedEvent: any = {};

  treeData: any[] = [];

  displayDialog: Boolean = false;

  // tab panel组件默认显示的title
  defaultTabTitle = 'smartDs';

  eventData = [
    {'name': 'Change', 'desc': 'set event', id: 1}
  ];

  get eventDatas() {
    return this.getEventData(this.eventData);
  }

  init() {
    this.checkbox.dataSource = {};
    this.checkbox.dataSource.options = [];

    this.checkbox.dataSource.selectedDataSourceType = 'Options';

    this.checkbox.displayField = 'label';
    this.checkbox.valueField = 'value';
  }

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.checkbox
    };
    this.editData.emit(retData);

    if (field) {
      this.validate(field, this.checkbox, type);
    }

    // 组件属性发生改变时，name发生改变时通知相应的smartDs同时修改;
    if (field && this.checkbox) {
      this.subjectService.broadcastData(this.constantService.subKey.PROPERTY_CHANGE, {id: this.dataName, model: this.checkbox});
    }
  }

  showBind() {
    this.displayDialog = true;
  }

  doClickFinish() {
    if (this.selectedData) {
      if (this.selectedData.data && this.selectedData.data.type === 'Object') {
        this.checkbox.bindPath = this.selectedData.path;

        this.syncSmartDsAndOptions(this.selectedData.path, this.treeData);
        //
        this.onChange();
        this.displayDialog = false;

      } else {
        this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: '只能绑定Object类型的属性', detail: ''});
      }
    }
  }

  doCloseDialog() {
    this.displayDialog = false;
  }

  onSetting() {
    const retData = {
      dataName: this.dataName,
      attr: this.checkbox
    };

    this.editData.emit(retData);
    this.showDialog.emit({inputType: 'options', name: this.dataName});
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  doGet(path: string, datas: any[]) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        const child = datas[i];
        if (child.path === path) {
          return child;
        } else {
          if (child.children && child.children.length > 0) {
            const res = this.doGet(path, child.children);
            if (res) {
              return res;
            }
          }
        }
      }
    } else {
      return null;
    }
  }

  syncSmartDsAndOptions(path, data) {
    const smartDs = this.doGet(path, data);
    if (smartDs && smartDs.children) {
      this.checkbox.dataSource.options = [];
      for (let i = 0; i < smartDs.children.length; i++) {
        this.checkbox.dataSource.options.push({
          label: smartDs.children[i].data.label ? smartDs.children[i].data.label : smartDs.children[i].data.name,
          value: smartDs.children[i].data.name
        })
      }
    }
  }

  ngOnInit() {
    if (this.dataModel && this.dataModel.attr) {
      this.checkbox = this.dataModel.attr;
    }

    if (this.dataModel && (!this.dataModel.attr || (this.dataModel.attr && !this.dataModel.attr.dataSource))) {
      this.init();
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
      // 当smartDs发生改变时，如果checkbox对象的smartDs也发生改变了，保持同步改变
      if (this.checkbox.bindPath) {
        this.syncSmartDsAndOptions(this.checkbox.bindPath, data);
      }
    } else if (key === this.subKey.nodeChoose) {
      this.selectedData = data;
    } else if (key === this.subKey.SET_EVENT) {
      this.checkEventName(this.eventDatas, data);
    }
  }
}
