import {Component, Output, EventEmitter} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-section-cols-auto-view',
  templateUrl: './section-cols-auto.view.component.html',
  styles: [`
    :host /deep/ .toolbarStyle .ngx-dnd-container {
      flex-wrap: wrap;
      display: flex
    }
  `]
})

export class SectionColsAutoViewComponent extends BaseComponent {

  @Output() innerDrop: EventEmitter<any> = new EventEmitter();

  judgeBtn: boolean = true;

  drop(e: any) {
    // section-col组建内部拖动
    this.innerDrop.emit(e);
    this.log(e);
  };

  judge(e: any) {
    const whiteList = ['button', 'submit'];
    const isInList = whiteList.includes(e.value.inputType);
    this.judgeBtn = isInList;
  }
}
