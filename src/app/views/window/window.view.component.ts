import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-window-view',
  templateUrl: './window.view.component.html',
  styles: [``]
})

export class WindowViewComponent extends BaseComponent implements OnInit {

  @Input() readOnly: any;
  @Input() componentAttr: any;
  @Input() pullCopyTemp: any;
  @Output() innerDrop: EventEmitter<any> = new EventEmitter();
  @Output() ondeleteModel: EventEmitter<any> = new EventEmitter();

  defaults: any = {
    width: 300,
    height: 300
  };

  isCanDelete: Boolean = false;

  drop(e: any) {
    // 在section.view中拖动完毕
    this.innerDrop.emit(e);
    this.log(e);
  };

  // 获取当前的编辑模式
  get isViewEidt() {
    return this.selectedViewMode === 'edit';
  }

  ngOnInit() {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }
  }

  // 监听键盘事件，删除控件
  ondelete(e: any) {
    if (this.isViewEidt && this.isCanDelete) {
      let ev = e || window.event;
      switch (e.keyCode) {
        case 46: // delete
          // 编辑模式下表单范围内执行删除操作（不能删除form表单）
          if (!this.pullCopyTemp.name.includes('form')) {
            this.ondeleteModel.emit(this.pullCopyTemp);
          }
          break;
        default:
          break;
      }
    }
  }
}
