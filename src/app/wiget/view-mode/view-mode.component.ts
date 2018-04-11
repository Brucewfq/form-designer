import {Component, OnInit, Input} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-view-mode',
  templateUrl: './view-mode.component.html'
})

export class ViewModeComponent extends BaseComponent implements OnInit {

  @Input() viewModeList: any;

  newViewMode: any;

  items: any[] = [];

  doCloseDialog() {
    this.closeDialog.emit();
  }

  addItem(): void {
    if (this.newViewMode) {
      // 验证输入的view mode不能与已经存在的重复
      if (this.viewModeList.length > 0) {
        for (let i = 0; i < this.viewModeList.length; i++) {

          if (this.viewModeList[i].label === this.newViewMode) {
            this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: '不能重复', detail: ''})
            return;
          }
        }
      }

      this.viewModeList.push(
        {
          label: this.newViewMode,
          value: this.newViewMode
        }
      );

      this.newViewMode = '';
    }
  }

  deleteItem(i: any): void {
    if (this.viewModeList[i].label === this.constantService.defaultView) {

      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
        severity: 'error',
        summary: this.constantService.defaultView + '模式不能删除',
        detail: ''
      });

      return;
    }
    this.viewModeList.splice(i, 1);
  }

  clickFinish() {
    this.subjectService.broadcastData(this.subKey.VIEW_MODE_CHANGE, this.viewModeList);
    this.closeDialog.emit()
  };

  //  检测输入的value值或者display值是否有重复
  isRepeat(options) {
    let returnValue: Boolean = false;

    for (let i = 0; i < options.length; i++) {

      for (let k = 0; k < options.length - 1 - i; k++) {
        const label = options[i].label.trim().toLocaleLowerCase();
        const comparedLabel = options[i + 1 + k].label.trim().toLocaleLowerCase();

        returnValue = label === comparedLabel;
      }
    }

    return returnValue;
  }

  ngOnInit() {
  };
}
