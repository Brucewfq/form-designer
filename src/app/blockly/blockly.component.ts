import {AfterViewChecked, AfterViewInit, Component, DoCheck, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppComponent} from '../app.component';
import {PropertyBottomWigetComponent} from '../wiget/property-bottom/property-bottom.wiget.component';

import {ScriptLoaderService} from '../util/script-loader.service';
import {BaseComponent} from '../base/baseComponent';

@Component({
  selector: 'app-blockly-bak',
  templateUrl: '../../../blockly-master/demos/code/index.html',
  styleUrls: ['../../../blockly-master/demos/code/blocklystyle.css']
})

export class BlocklyComponent extends BaseComponent implements OnInit, AfterViewInit {
  @Input() dataModel: any;
  @Input() dataName: any;
  @Input() eventName: any;
  @Input() initFormScript: any;

  @Output() editData = new EventEmitter();
  @Output() closeDialog = new EventEmitter();

  blockly: any;
  scripts: any = {};

  clickFinish() {
    if (!this.blockly) {
      alert('请输入一段代码');
      return
    }

    this.scripts[this.eventName] = this.blockly;

    const retData = {
      dataName: this.dataName,
      scripts: this.scripts
    };
    this.editData.emit(retData);
    this.closeDialog.emit();
  }

  docloseDialog() {
    this.closeDialog.emit();
  }

  ngOnInit() {
    if (this.dataModel && this.dataModel.scripts) {
      this.scripts = this.dataModel.scripts;
      if (this.eventName && this.scripts[this.eventName]) {
        this.blockly = this.dataModel.scripts[this.eventName];
      }
    } else {
      if (this.initFormScript) {
        this.blockly = this.initFormScript[this.eventName];
      }
    }
  }

  ngAfterViewInit() {
    // this._script.load();
  }
}
