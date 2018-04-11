import {Component, Output, EventEmitter} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-toolbar-view',
  templateUrl: './toolbar.view.component.html',
  styles: [`
    :host /deep/ .toolbarStyle .ngx-dnd-container {
      flex-wrap: wrap;
      display: flex;
      border: 1px dashed #00abff !important;
    }
  `]
})

export class ToolbarViewComponent extends BaseComponent {

  @Output() innerDrop: EventEmitter<any> = new EventEmitter();

  judgeBtn: Boolean = true;

  drop(e: any) {
    const whiteList = ['button', 'submit'];
    this.judgeBtn = whiteList.includes(e.value.inputType);

    if (!this.judgeBtn) {
      this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
        severity: 'warn',
        summary: 'The container can only be dragged into the buttons component.',
        detail: '',
        id: ''
      });

      this.judgeBtn = true;
      return
    }

    // section-col组建内部拖动
    this.innerDrop.emit(e);
    this.log(e);
  };

  judge(e: any) {
    const whiteList = ['button', 'submit'];

    this.judgeBtn = whiteList.includes(e.value.inputType);
    if (!this.judgeBtn) {
      this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
        severity: 'warn',
        summary: 'The container can only be dragged into the buttons component.',
        detail: '',
        id: ''
      });
    }
  }
}
