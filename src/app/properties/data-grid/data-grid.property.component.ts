import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-data-grid-property',
  templateUrl: './data-grid.property.component.html',
})

export class DataGridPropertyComponent extends BaseComponent implements OnInit {

  @Input() viewModeList: any;

  dataGrid: any = {};

  msgs: any[] = [];

  selectedEvent: any = {};

  displayDialog: Boolean = false;

  showColumnsDialog: Boolean = false;

  treeData: any[] = [];

  selectedData: any;

  // tab panel组件默认显示的title
  defaultTabTitle = 'smartDs';

  eventData = [
    {'name': 'Itemclick', 'desc': 'set event', id: 1},
    {'name': 'Cellclick', 'desc': 'set event', id: 2},
    {'name': 'Datachanged', 'desc': 'set event', id: 3}
  ];

  get eventDatas() {
    const arr = this.getEventData(this.eventData);
    return arr;
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  }

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.dataGrid
    };
    this.editData.emit(retData);

    if (field) {
      this.validate(field, this.dataGrid, type);
    }
  }

  showColumns() {
    this.showColumnsDialog = true;
  }

  closeColumns() {
    // 同步修改
    if (!this.dataGrid.dataSource) {
      this.subjectService.broadcastData(this.subKey.COLUMNS_CHANGE, this.dataGrid);
    }

    this.showColumnsDialog = false;
  }

  showBind() {
    this.constantService.putData(this.subKey.TARGET_BUILDER_TOOLS_CHANGE, this.targetBuilderTools);
    this.subjectService.broadcastData(this.subKey.TARGET_BUILDER_TOOLS_CHANGE, this.targetBuilderTools);

    this.displayDialog = true;
  }

  doClickFinish() {
    if (this.selectedData) {
      if (this.selectedData.type !== 'service') {
        if (this.selectedData.data && this.selectedData.data.type !== 'List') {
          this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: 'dataGrid需要绑定list类型的属性', detail: ''});
          return;
        } else {
          const attrs = this.selectedData.children;
          if (attrs && attrs.length > 0) {
            this.structureColumn(attrs);

            if (this.dataGrid.dataSource) {
              delete this.dataGrid.dataSource;
            }
          } else {
            this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: 'list对象中没有属性', detail: ''});
            return;
          }
        }
      } else {
        const attrs = this.selectedData.children;
        if (attrs && attrs.length > 0) {
          this.structureColumn(attrs);
          // 绑定数据源bindData
          this.dataGrid.dataSource = {};
          this.dataGrid.dataSource.bindData = {};
          this.dataGrid.dataSource.bindData.objectId = this.selectedData.data.obj.objectId;
          this.dataGrid.dataSource.bindData.objectName = this.selectedData.data.obj.objectName;
          this.dataGrid.dataSource.bindData.nameDesc = this.selectedData.data.obj.nameDesc;
          this.dataGrid.dataSource.bindData.path = this.selectedData.path;

          //
          this.dataGrid.editable = false;
        } else {
          this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: 'list对象中没有属性', detail: ''});
          return;
        }
      }
    } else {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: '没有选中对象', detail: ''});
      return;
    }
  }

  structureColumn(attrs: any[]) {
    this.dataGrid.columns = [];
    for (let i = 0; i < attrs.length; i++) {
      const column: any = {};
      column.text = attrs[i].data.name;
      column.dataIndex = attrs[i].data.name;
      column.flex = 1;
      column.minWidth = 100;
      column.editable = true;
      column.type = attrs[i].data.type;
      if (column.type === 'String' && column.editorType !== 'textfield') {
        column.editorType = 'textfield';
      } else if (column.type === 'Integer' && column.editorType !== 'numberfield') {
        column.editorType = 'numberfield';
      } else if (column.type === 'Decimal' && column.editorType !== 'numberfield') {
        column.editorType = 'numberfield';
      } else if (column.type === 'DateTime' && column.editorType !== 'datefield') {
        column.editorType = 'datefield';
      } else if (column.type === 'Json') {
        column.needJsonRender = true;
      }
      this.dataGrid.columns.push(column);
    }
    // 绑定的路径（dataGrid只绑定list的name不绑定path）
    this.dataGrid.bindPath = this.selectedData.data.name;

    this.onChange();
    this.displayDialog = false;
  }

  doCloseDialog() {
    this.displayDialog = false;
  }

  ngOnInit() {
    this.selectedData = {};
    if (!this.viewModeList) {
      this.viewModeList = this.constantService.viewModeOfForm;
    }

    this.treeData = this.constantService.getDataByKey(this.subKey.smartDsChange);

    this.registerSubject(this.subKey.nodeChoose);
    this.registerSubject(this.subKey.SERVICE_NODE_SELECTED);
    this.registerSubject(this.subKey.smartDsChange);
    this.registerSubject(this.subKey.DELETE_SERVICE);

    this.showInitValidate();
    if (this.dataModel && this.dataModel.attr) {
      this.dataGrid = this.dataModel.attr;
    }
  }

  onSubResult(key: string, data: any) {
    if (key === this.subKey.smartDsChange) {
      this.treeData = data;
    } else if (key === this.subKey.nodeChoose || key === this.subKey.SERVICE_NODE_SELECTED) {
      this.selectedData = data;
    } else if (key === this.subKey.DELETE_SERVICE) {
      if (this.dataGrid.dataSource) {
        this.dataGrid.bindPath = '';
        delete this.dataGrid.dataSource;
        delete this.dataGrid.displayField;
        delete this.dataGrid.valueField;
      }
    }
  }
}
