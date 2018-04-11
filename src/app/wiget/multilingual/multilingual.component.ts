import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-multilingual',
  templateUrl: './multilingual.component.html',
  styleUrls: ['./multilingual.component.scss']
})

export class MultilingualComponent extends BaseComponent implements OnInit {
  @Input() visible: Boolean;
  @Input() top: Number;
  @Output() doClose = new EventEmitter();

  items = [
    {
      label: 'Chinese',
      value: ''
    },
    {
      label: 'English',
      value: ''
    }
  ];

  doClickFinish() {
    this.doClose.emit();
  }

  doCloseDialog() {
    this.doClose.emit();
  }

  ngOnInit() {
  }
}
