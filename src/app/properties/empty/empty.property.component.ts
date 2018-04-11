// 这是一个空的属性框
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-empty-property',
  template: `
    <div style="height:100%;overflow: auto">
      <p-tabView [styleClass]="property-container">
        <p-tabPanel headerStyleClass="tab-header-general">
        </p-tabPanel>
        <p-tabPanel headerStyleClass="tab-header-event">
        </p-tabPanel>
      </p-tabView>
    </div>
  `
})

export class EmptyPropertyComponent implements OnInit {
  ngOnInit() {
  }
}
