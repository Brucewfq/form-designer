import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-section-cols-view',
  templateUrl: './section-cols.view.component.html'
})

export class SectionColsViewComponent extends BaseComponent implements OnInit {

  @Input() componentAttr: any;
  @Input() realModel: any;

  @Output() innerDrop: EventEmitter<any> = new EventEmitter();

  defaults: any = {
    title: '',
    layout: 'float',
    layoutColumns: 2,
    layoutGap: 5
  };

  drop(e: any) {
    // section-col组建内部拖动
    this.innerDrop.emit(e);
    this.log(e);
  };

  ngOnInit() {
    if (this.realModel.children && this.realModel.children.length === 3) {
      this.defaults.layoutColumns = 3;
    } else if (this.realModel.children && this.realModel.children.length === 4) {
      this.defaults.layoutColumns = 4;
    }

    if (this.realModel.attr) {
      this.beforeInitDefault(this.realModel, this.defaults);
    }
  }
}
