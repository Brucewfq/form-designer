import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-section-view',
  templateUrl: './section.view.component.html'
})

export class SectionViewComponent extends BaseComponent implements OnInit {

  @Input() componentAttr: any;
  @Input() readOnly: any;
  @Input() realModel: any;
  @Output() innerDrop: EventEmitter<any> = new EventEmitter();

  defaults: any = {
    title: '',
    layout: 'float',
    layoutColumns: 1,
    layoutGap: 5
  };

  drop(e: any) {
    this.innerDrop.emit(e);
  };

  ngOnInit() {
    if (this.realModel.attr) {
      this.beforeInitDefault(this.realModel, this.defaults);
    }
  }
}
