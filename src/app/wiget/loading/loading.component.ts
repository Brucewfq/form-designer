import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef, ViewChild} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent extends BaseComponent implements OnInit {
  @Input() modal: string;

  ngOnInit() {

  }
}
