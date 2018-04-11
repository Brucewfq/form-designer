import {Component, Input, OnInit} from '@angular/core';
import {BaseComponent} from '../../../base/baseComponent';
@Component({
  selector: 'app-file-setting-property',
  templateUrl: './file.setting.property.component.html',
  styles: [``]
})

export class FileSettingPropertyComponent extends BaseComponent implements OnInit {
  @Input() dataModel: any;
  kb: number = 1024 * 10;
  mb: number = 1024 * 1024
  requestDTO: any = {};

  fileSize: any[] = [
    {label: '50kb', value: 50 * this.kb},
    {label: '200kb', value: 200 * this.kb},
    {label: '100kb', value: 100 * this.kb},
    {label: '500kb', value: 500 * this.kb},
    {label: '1M', value: 1 * this.mb},
    {label: '2M', value: 2 * this.mb}
  ];

  ngOnInit () {
    this.requestDTO.size = this.dataModel.attr.size;
    this.requestDTO.type = this.dataModel.attr.type;
  }

  finish (e: any) {
    this.dataModel.attr.size = this.requestDTO.size;
    this.dataModel.attr.type = this.requestDTO.type;
    this.closeDialog.emit();
  }

  cancel (e: any) {
    this.closeDialog.emit();
  }
}
