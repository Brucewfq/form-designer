import {Component, Input, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-data-grid-view',
  templateUrl: './data-grid.view.component.html'
})

export class DataGridViewComponent extends BaseComponent implements OnInit {

  items: any[];

  editable: boolean;

  showFooter = false;

  ngOnInit() {
    this.items = [
      {cloumnA: 'defaultData1', cloumnB: 1, cloumnC: 'A'},
      {cloumnA: 'defaultData2', cloumnB: 2, cloumnC: 'B'},
      {cloumnA: 'defaultData3', cloumnB: 3, cloumnC: 'C'}];
    this.onViewModeChange();
  }

  onViewModeChange(): void {
    if (this.model && this.model.attr && this.model.attr.readOnly && this.selectedViewMode) {
      this.model.attr.editable = !this.model.attr.readOnly[this.selectedViewMode];
    }
  }

  visible(data: any[]): Boolean {
    let returnValue: Boolean = true;
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] === this.selectedViewMode) {
          returnValue = false;
          break;
        } else {
          returnValue = true;
        }
      }
    } else {
      returnValue = false;
    }

    return returnValue;
  }
}
