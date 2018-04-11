import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BaseComponent} from '../../../base/baseComponent';

@Component({
  selector: 'app-tab-item-view',
  templateUrl: './tab-item.view.component.html'
})

export class TabItemViewComponent extends BaseComponent implements OnInit {

  @Input() componentAttr: any;
  @Input() readOnly: any;
  @Output() dropAddVersion: EventEmitter<any> = new EventEmitter();

  buttonShow: boolean;
  judgeTab: boolean = true;

  dropped(e: any) {
    // 在section.view中拖动完毕
    this.dropAddVersion.emit(e);
  };

  judge (e: any) {
    const isTab = e.value.inputType !== 'tab';
    this.judgeTab = isTab;
  }
  ngOnInit() {}
}
