import {Component, OnInit, Input} from '@angular/core';
import {BaseComponent} from '../../../base/baseComponent';

@Component({
  selector: 'app-tab-item-property',
  templateUrl: './tab-item.property.component.html'
})


export class TabItemPropertyComponent extends BaseComponent implements OnInit {
  tabItem: any = {};

  msgs: any[] = [];

  eventData = [
    {'name': 'Init', 'desc': 'set event', id: 1},
    {'name': 'Change', 'desc': 'set event', id: 2},
    {'name': 'Close', 'desc': 'set event', id: 3}
  ];

  selectedEvent: any = {};

  ngOnInit() {
    if (this.dataModel && this.dataModel.attr) {
      this.tabItem = this.dataModel.attr;
    }
    this.showInitValidate();
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  }

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.tabItem
    };
    this.editData.emit(retData);
    if (field) {
      this.validate(field, this.tabItem, type);
    }
    this.onNewVersionListener.emit();
  }
}

