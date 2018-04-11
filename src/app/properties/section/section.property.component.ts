import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-section-property',
  templateUrl: './section.property.component.html'
})


export class SectionPropertyComponent extends BaseComponent implements OnInit {
  section = {};

  msgs: any[] = [];

  selectedEvent: any = {};

  displayMultilingual: Boolean = false;

  top: Number;

  showMultilingual(event) {
    this.top = event.srcElement.offsetTop - 200;
    this.displayMultilingual = true;
  }

  closeMultilingual() {
    this.displayMultilingual = false;
  }

  onChange(field?: string, type = {}) {
    if (field) {
      this.validate(field, this.section, type);
    }

    // 组件属性发生改变时，name发生改变时通知相应的smartDs同时修改;
    if (field && this.section) {
      console.log(this.dataName)
      this.subjectService.broadcastData(this.constantService.subKey.PROPERTY_CHANGE, {id: this.dataName, model: this.section});
    }
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  ngOnInit() {
    if (this.dataModel && this.dataModel.attr) {
      this.section = this.dataModel.attr;
    }
    this.showInitValidate();
  };
}
