import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-data-source-options',
  templateUrl: './data-source-options.component.html'
})

export class DataSourceOptionsComponent extends BaseComponent implements OnInit {

  editOptions: any[] = [];

  dataAttr: any;

  items: any[] = [];

  doCloseDialog() {
    this.closeDialog.emit();
  }

  addItem(): void {
    this.items.push(
      {
        label: '',
        value: ''
      }
    );
  }

  deleteItem(i: any): void {
    this.items.splice(i, 1);
  }

  clickFinish(options): void {
    if (options && options.length > 0) {
      if (this.isRepeat(options)) {
        this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
          severity: 'error',
          summary: 'display的值不能相同或者value的值不能相同!',
          detail: ''
        });
        return
      }

      for (let i = 0; i < options.length; i++) {
        if (options[i].label && options[i].value) {
          this.editOptions.push({
            label: options[i].label,
            value: options[i].value
          })
        }
      }

      if (this.dataAttr && this.dataAttr.dataSource) {
        this.dataAttr.dataSource.options = this.editOptions;
        const retData = {
          dataName: this.dataName,
          attr: this.dataAttr
        };

        this.editData.emit(retData);

        if (this.dataAttr && this.dataAttr.dataSource && this.dataAttr.dataSource.options) {
          this.subjectService.broadcastData(this.subKey.CHECK_BOX_OPTIONS_CHANGE, {
            path: this.dataAttr.bindPath,
            options: this.dataAttr.dataSource.options
          });
        }
      }
      //
      this.closeDialog.emit();
    }
  };

  //  检测输入的value值或者display值是否有重复
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

  ngOnInit() {
    if (this.dataModel && this.dataModel.attr) {
      this.dataAttr = this.dataModel.attr;
    }

    if (this.dataModel && this.dataModel.attr && this.dataModel.attr.dataSource && this.dataModel.attr.dataSource.options.length > 0) {
      this.items = this.dataModel.attr.dataSource.options
    } else {
      this.items = [
        {
          label: '',
          value: ''
        }
      ];
    }
  };
}
