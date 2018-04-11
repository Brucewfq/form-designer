import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-dropdown-property',
  templateUrl: './dropdown.property.component.html'
})

export class DropdownPropertyComponent extends BaseComponent implements OnInit {
  dataSource: any[];

  dropdown: any = {};

  dataSourceTypes = [
    {label: 'Options', value: 'Options'},
    {label: 'Advanced', value: 'Advanced'},
    {label: 'DataDict', value: 'DataDict'},
  ];

  msgs: any[] = [];

  selectedEvent: any = {};

  displayDialog: Boolean = false;

  selectedData: any;

  treeData: any[] = [];

  // tab panel组件默认显示的title
  defaultTabTitle = 'smartDs';

  eventData = [
    {'name': 'Change', 'desc': 'set event', id: 1}
  ];

  get eventDatas() {
    const arr = this.getEventData(this.eventData);
    return arr;
  }

  init() {
    this.dropdown.dataSource = {};
    this.dropdown.dataSource.options = [];

    this.dropdown.dataSource.selectedDataSourceType = 'Options';

    this.dropdown.displayField = 'label';
    this.dropdown.valueField = 'value';
    this.dropdown.required = false;
    this.dropdown.editable = false;
  }

  onChange(field?: string, type = {}) {
    if (field) {
      this.validate(field, this.dropdown, type);
    }

    // 组件属性发生改变时，name发生改变时通知相应的smartDs同时修改;
    if (field && this.dropdown) {
      this.subjectService.broadcastData(this.constantService.subKey.PROPERTY_CHANGE, {id: this.dataName, model: this.dropdown});
    }
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  onSetting() {
    const retData = {
      dataName: this.dataName,
      attr: this.dropdown
    };

    this.editData.emit(retData);
    this.showDialog.emit({inputType: 'options', name: this.dataName});
  }

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
        this.dropdown.bindPath = this.selectedData.path;
        this.onChange();
        this.displayDialog = false;
      }
    }
  }

  doCloseDialog() {
    this.displayDialog = false;
  }

  ngOnInit() {
    if (this.dataModel && this.dataModel.attr) {
      if (!this.dataModel.attr.fieldLabel) {
        this.dataModel.attr.fieldLabel = 'Dropdown';
      }
      this.dropdown = this.dataModel.attr;
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
    } else if (key === this.subKey.nodeChoose) {
      this.selectedData = data;
    } else if (key === this.subKey.SET_EVENT) {
      this.checkEventName(this.eventDatas, data);
    }
  }
}
