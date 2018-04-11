import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-data-grid-columns-property',
  templateUrl: './data-grid-columns.property.component.html'
})
export class DataGridColumnsPropertyComponent extends BaseComponent implements OnInit {

  @Output() closeColumnsDialog = new EventEmitter();

  @Input() viewModeList: any;

  @Input() columns: any;

  items: any[] = [];

  deleteItems: any[] = [];

  dataTypes: any[] = [];

  processTypes: any[] = [];

  editorTypes: any[] = [];

  visibleTypes: any[] = [];

  displayPanel = false;

  index: any;

  i = 0;

  dataSource: any;

  dataSourceTypes = [
    {label: 'Options', value: 'Options'},
    {label: 'Advanced', value: 'Advanced'},
    {label: 'DataDict', value: 'DataDict'},
  ];

  displayDialog: Boolean = false;

  comboColumnOptions: any[] = [{
    label: '',
    value: ''
  }];
  curColumn: any = {};

  init() {
    this.curColumn.dataSource = {};
    this.curColumn.dataSource.options = [];
    this.curColumn.dataSource.selectedDataSourceType = 'options';
  }

  onSetting() {
    this.displayDialog = true;
  }

  clickFinish() {
    if (this.comboColumnOptions && this.comboColumnOptions.length > 0) {
      if (this.isRepeat(this.comboColumnOptions)) {
        this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
          severity: 'error',
          summary: 'display的值不能相同或者value的值不能相同!',
          detail: ''
        });
        return
      }

      this.items[this.index].dataSource.options = [];
      for (let i = 0; i < this.comboColumnOptions.length; i++) {
        this.items[this.index].dataSource.options.push({
          label: this.comboColumnOptions[i].label,
          value: this.comboColumnOptions[i].value
        })
      }
    }

    this.displayDialog = false;
  };

  isRepeat(options) {
    let returnValue: Boolean = false;
    for (let i = 0; i < options.length; i++) {

      for (let k = 0; k < options.length - 1 - i; k++) {
        const display = options[i].label.trim().toLocaleLowerCase();
        const comparedDisplay = options[i + 1 + k].label.trim().toLocaleLowerCase();
        const value = options[i].value.trim().toLocaleLowerCase();
        const comparedValue = options[i + 1 + k].value.trim().toLocaleLowerCase();
        returnValue = display === comparedDisplay || value === comparedValue;
      }
    }

    return returnValue;
  }

  docloseDialog(): void {
    this.closeColumnsDialog.emit();
  }

  doCloseDialog() {
    this.displayDialog = false;
  }

  addComboOption(): void {
    this.comboColumnOptions.push(
      {
        label: '',
        value: ''
      }
    );
  }

  ngOnInit(): void {
    this.init();
    this.dataTypes = this.constantService.dataTypes;
    this.processTypes = this.constantService.processTypes;
    this.editorTypes = this.constantService.editorTypes;

    if (this.viewModeList) {
      this.visibleTypes = this.viewModeList;
    } else {
      this.visibleTypes = this.constantService.viewModeOfForm;
    }

    if (this.dataModel && this.dataModel.attr && this.dataModel.attr.columns) {
      for (let i = 0; i < this.dataModel.attr.columns.length; i++) {
        if (!this.dataModel.attr.columns[i].flex) {
          this.dataModel.attr.columns[i].flex = 1;
        }
      }
      this.items = this.dataModel.attr.columns;
      this.i = this.items.length;
    }
  }

  doClickFinish(): void {
    if (this.dataModel && this.dataModel.attr) {
      this.dataModel.attr.columns = this.items;
    }
    this.closeColumnsDialog.emit();
  }

  deleteItem(i: any): void {
    if (i === this.index) {
      this.displayPanel = false;
      this.index = this.items.length;
    }
    this.deleteItems.push(this.items[i]);
    this.items.splice(i, 1);
  }

  addItem(): void {
    if (this.deleteItems.length > 0) {
      this.items.push(this.deleteItems[0]);
      this.deleteItems.splice(0, 1);
    } else {
      this.items.push(
        {
          text: 'column' + this.i,
          dataIndex: 'newAttr' + this.i,
          type: 'String',
          editorType: 'textfield',
          summaryType: '',
          flex: 1,
          minWidth: 100,
          format: '',
          renderStr: '',
          visible: []
        });
      this.i++;
    }
  }

  showWin(index) {
    this.index = index;

    if (!this.items[index].dataSource) {
      this.items[index].dataSource = {};
    }

    this.curColumn = this.items[index];
    if (!this.curColumn.dataSource.selectedDataSourceType) {
      this.curColumn.dataSource.selectedDataSourceType = 'Options';
    }

    if (this.curColumn.dataSource.options) {
      this.comboColumnOptions = this.curColumn.dataSource.options;
    }
    this.displayPanel = true;
  }

  deleteDataBind() {
    delete this.items[this.index].dataSource;
    this.items[this.index].butVal = 'setting';
    this.displayPanel = false;
  }

  saveDataBind() {
    this.items[this.index].butVal = 'seted';
    this.displayPanel = false;
  }

  // 数据类型和编辑类型的联动
  onTypeChange(row, field) {
    if (row[field] === 'String' && row['editorType'] !== 'textfield') {
      row['editorType'] = 'textfield';
    } else if (row[field] === 'Integer' && row['editorType'] !== 'numberfield') {
      row['editorType'] = 'numberfield';
    } else if (row[field] === 'Decimal' && row['editorType'] !== 'numberfield') {
      row['editorType'] = 'numberfield';
    } else if (row[field] === 'DateTime' && row['editorType'] !== 'datefield') {
      row['editorType'] = 'datefield';
    }
  }

  onEditTypeChange(row, field) {
    if (row[field] === 'combo') {
      row['butVal'] = 'setting';
    } else {
      delete row['dataSource'];
      row['butVal'] = '';
    }
  }

  onSubResult(key, data) {
    debugger
    if (key === this.subKey.VIEW_MODE_CHANGE) {
      this.visibleTypes = data;
    }
  }
}
