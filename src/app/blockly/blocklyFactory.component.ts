import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ScriptLoaderService} from '../util/script-loader.service';
import {BaseComponent} from '../base/baseComponent';

@Component({
  selector: 'app-factory',
  // templateUrl: './blockly.component.html'
  templateUrl: '../../../blockly-master/demos/blockfactory/index.html',
  styleUrls: ['../../../blockly-master/demos/blockfactory/blockfactory.css']
})

export class BlocklyFactoryComponent extends BaseComponent implements OnInit, AfterViewInit {

  @Input() comps;

  @Input() eventName: any;

  defaultXml: any = '';

  items: any[] = [];

  displayDialog: Boolean = false;

  jsAreaShow: Boolean = false;

  defaultTabTitle: any;

  selectedData: any;

  jsArea: any;

  scripts: any = {};

  createDatas(datas: any[], arr: any[]) {
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const item: any = {};
      item.data = {};
      item.data.name = data.attr.name || '';
      item.data.fieldLabel = data.attr.fieldLabel || '';
      item.data.inputType = data.inputType || '';
      item.data.id = data.name || '';
      if (data.children) {
        item.children = [];
        this.createDatas(data.children, item.children);
      }
      arr.push(item);
    }
  }

  ngOnInit() {
    if (this.dataModel && this.dataModel.scripts) {
      this.scripts = this.dataModel.scripts;
    }

    this._script.loadFactory(this, this.defaultXml);
    this.defaultTabTitle = 'Choose Component';
    if (this.comps && this.comps.length > 0) {
      //  除去表单以后的所有组件
      const cs = this.comps[0].children;
      if (cs && cs.length > 0) {
        this.createDatas(cs, this.items);
      }

    }
  }

  showChoose(type: any, value: any) {
    if (type === 'jsArea') {
      this.jsAreaShow = true;
      this.jsArea = value;
    } else {
      this.displayDialog = true;
    }
  }

  nodeSelect(e) {
    const block = this._script.getNowBlock();

    if (block.type === 'component_setValue'
      || block.type === 'component_getValue') {
      const type = this.selectedData.data.inputType;

      if (type !== 'checkbox'
        && type !== 'dropdown'
        && type !== 'number'
        && type !== 'textarea'
        && type !== 'textbox'
        && type !== 'datatime'
        && type !== 'radio') {
        this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
          severity: 'error',
          summary: '该组件不能被赋值或取值',
          detail: ''
        });

        return;
      }
    }
    if (this.selectedData) {
      this._script.setVal('NAME', this.selectedData);
      this.displayDialog = false;
    } else {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
        severity: 'error',
        summary: '没有选择节点',
        detail: ''
      });
    }
  }

  nodeUnselect(e) {
    this._script.setVal('NAME', this.selectedData);
    this.displayDialog = false;
  }

  doClickFinish() {
    this.scripts[this.eventName] = this._script.getJsCode();
    this.scripts[this.eventName + '_xml'] = this._script.getXmlCode();
    const retData = {
      dataName: this.dataName,
      scripts: this.scripts
    };
    this.editData.emit(retData);
    this.closeDialog.emit();
  }

  doAreaClickFinish() {
    this._script.setVal('NAME', this.jsArea);
    this.jsAreaShow = false;
  }

  doAreaCloseDialog() {
    this.jsAreaShow = false;
  }

  docloseDialog() {
    this.closeDialog.emit();
  }

  ngAfterViewInit() {
    if (this.dataModel && this.dataModel.scripts && this.dataModel.scripts[this.eventName + '_xml']) {
      this.defaultXml = this.dataModel.scripts[this.eventName + '_xml'];
      this._script.loadXml(this.defaultXml);
    }
  }
}
