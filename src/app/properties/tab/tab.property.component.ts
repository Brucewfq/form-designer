import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-tab-property',
  templateUrl: './tab.property.component.html'
})

export class TabPropertyComponent extends BaseComponent implements OnInit {

  tab: any = {};

  msgs: any[] = [];

  tabPanelTitles: any[];

  selectedEvent: any = {};

  tabPositions = [
    {label: 'top', value: 'top'},
    {label: 'bottom', value: 'bottom'},
    {label: 'left', value: 'left'},
    {label: 'right', value: 'right'}
  ];

  display: Boolean = false;

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.tab
    };
    this.editData.emit(retData);

    if (field) {
      this.validate(field, this.tab, type);
    }
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  ngOnInit() {
    this.tabPanelTitles = [];
    if (this.dataModel && this.dataModel.attr) {
      this.tab = this.dataModel.attr;
      if (this.tab.tabItems && this.tab.tabItems.length > 0) {
        this.tabPanelTitles = this.tab.tabItems;
      }
    } else {
      this.tab = {};
    }
    this.showInitValidate();
  };
}
