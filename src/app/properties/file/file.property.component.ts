import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-file-property',
  templateUrl: './file.property.component.html'
})

export class FilePropertyComponent extends BaseComponent implements OnInit {

  file = {};

  msgs: any[] = [];

  bindDataSourceProperties: any[] = [];

  selectedEvent: any = {};

  display: Boolean = false;

  kb: number = 1024 * 10;

  mb: number = 1024 * 1024;
  fileSize: any[] = [
    {label: '50kb', value: 50 * this.kb},
    {label: '100kb', value: 100 * this.kb},
    {label: '200kb', value: 200 * this.kb},
    {label: '500kb', value: 500 * this.kb},
    {label: '1M', value: this.mb},
    {label: '2M', value: 2 * this.mb}
  ];

  get getSize() {
    const size = this.dataModel.attr.size;
    const index = this.fileSize.findIndex((res) => res.value === size);
    return index;
  }

  onChange(field?: string, type = {}) {
    const retData = {
      dataName: this.dataName,
      attr: this.file
    };
    this.editData.emit(retData);
    if (field) {
      this.validate(field, this.file, type);
    }
  }

  chooseEvent(e) {
    this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
  };

  dataParse(data, objectName) {
    for (let i = 0; i < data.length; i++) {
      this.bindDataSourceProperties.push({
        label: objectName + '.' + data[i].name,
        value: {
          objectId: data[i].id,
          name: objectName,
          property: data[i].name
        }
      })
    }
  }

  setting(e: any) {
    this.onChange();
    this.showDialog.emit({inputType: 'fileSetting', name: this.dataName});
  }

  ngOnInit() {
    if (this.dataModel && this.dataModel.attr) {
      this.file = this.dataModel.attr;
    }
    this.showInitValidate();
  };
}
