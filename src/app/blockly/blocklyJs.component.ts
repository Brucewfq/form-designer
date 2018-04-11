import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ScriptLoaderService} from '../util/script-loader.service';
import {BaseComponent} from '../base/baseComponent';

@Component({
  selector: 'app-blockly',
  // templateUrl: './blockly.component.html'
  templateUrl: '../../../blockly-master/demos/code/blocklyIndex.html',
  styleUrls: ['../../../blockly-master/demos/code/blocklystyle.css']
})

export class BlocklyJsComponent extends BaseComponent implements OnInit {

  @Input() comps;

  @Input() eventName: any;

  defaultXml: any = '';

  items: any[] = [];

  displayDialog: Boolean = false;

  showWinDialog: Boolean = false;

  jsAreaShow: Boolean = false;

  chooseRestShow: Boolean = false;

  defaultTabTitle: any;

  selectedData: any;

  selectedObject: any;

  selectedRestNode: any;

  jsArea: any;

  scripts: any = {};

  restItems: any[] = [];

  restLabelDatas = [
    {
      label: '方法类别',
      data: {name: '方法类别'},
      children: []
    }
  ];

  createDatas(datas: any[], arr: any[], parentName) {
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const item: any = {};
      item.data = {};
      item.data.name = data.attr.name || '';
      item.data.fieldLabel = data.attr.fieldLabel || '';
      item.data.inputType = data.inputType || '';
      item.parentName = parentName;
      item.data.id = data.name || '';
      if (data.children) {
        item.children = [];
        this.createDatas(data.children, item.children, parentName);
      }
      arr.push(item);
    }
  }

  ngOnInit() {
    if (this.dataModel && this.dataModel.scripts) {
      this.scripts = this.dataModel.scripts;
      if (this.scripts[this.eventName + '_xml']) {
        this.defaultXml = this.dataModel.scripts[this.eventName + '_xml'];
      }
    }
    this._script.load(this, this.defaultXml);
    this.defaultTabTitle = 'Choose Component';
  }

  showChoose(type: any, value: any) {
    if (type === 'jsArea') {
      this.jsAreaShow = true;
      this.jsArea = value;
    } else if (type === 'rest') {
      this.chooseRestShow = true;
    } else if (type === 'showWin') {
      this.items = [];
      this.selectedData = null;
      if (this.comps && this.comps.length > 0) {
        // 取所有的window
        for (let i = 0; i < this.comps.length; i++) {
          if (this.comps[i].inputType === 'window' && this.comps[i].attr && this.comps[i].attr.name) {
            const win: any = {};
            win.name = this.comps[i].attr.name;
            win.title = this.comps[i].attr.title || '';
            win.id = this.comps[i].name || '';
            this.items.push(win);
          }
        }
      }
      this.showWinDialog = true;
    } else {
      this.items = [];
      this.selectedData = null;
      if (this.comps && this.comps.length > 0) {
        // 取form和window下面的所有子节点来创建数据
        for (let i = 0; i < this.comps.length; i++) {
          if (this.comps[i].attr
            && this.comps[i].children
            && this.comps[i].children.length > 0) {
            const cs = this.comps[i].children;
            this.createDatas(cs, this.items, this.comps[i].attr.name || '');
          }
        }
      }
      this.displayDialog = true;
    }

    this.getRestData();
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
      this._script.setVal('COMPID', this.selectedData);
      this.displayDialog = false;
    } else {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
        severity: 'error',
        summary: '没有选择节点',
        detail: ''
      });
    }
  }

  // nodeUnselect(e) {
  //   this._script.setVal('COMPID', this.selectedData);
  //   this.displayDialog = false;
  // }

  onRowSelect() {
    if (this.selectedData) {
      this._script.setVal('COMPID', {data: this.selectedData});
      this.showWinDialog = false;
    } else {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
        severity: 'error',
        summary: '没有选择节点',
        detail: ''
      });
    }
  }

  onRestNodeSelect() {
    if (this.selectedRestNode) {
      this.restItems = [];
      const param = {
        fields: [
          {
            'name': 'id'
          },
          {
            'name': 'nameSpace'
          },
          {
            'name': 'apiUrl'
          },
          {
            'name': 'methodFlag'
          },
          {
            'exp': '$',
            'name': 'apiDetail',
            'type': 'json'
          },
          {
            'exp': '$',
            'name': 'displayName',
            'type': 'json'
          },
          {
            'exp': '$',
            'name': 'description',
            'type': 'json'
          },
          {
            'name': 'service'
          },
          {
            'exp': '$',
            'name': 'rspParameters',
            'type': 'json'
          },
          {
            'exp': '$',
            'name': 'reqParameters',
            'type': 'json'
          }
        ],
        filter: ''
      };

      if (this.selectedRestNode.parent) {
        if (this.selectedRestNode.children.length === 0) {
          param.filter = 'methodFlag LIKE CONCAT(\'%\', \'' + this.selectedRestNode.basic.code + '\', \'%\')';
        } else {
          let filter = '';
          for (let i = 0; i < this.selectedRestNode.children.length; i++) {
            if (filter) {
              filter = filter + ' or ';
            }
            filter = filter + 'methodFlag LIKE CONCAT(\'%\', \'' + this.selectedRestNode.children[i].basic.code + '\', \'%\')'
          }

          param.filter = filter;
        }
      }

      this.httpService.getData('object/api/last/registryCenterObj/customQuery', param).then((res) => {
        if (res && res.data) {
          for (let i = 0; i < res.data.length; i++) {
            this.restItems.push({
              id: res.data[i].id,
              apiUrl: res.data[i].apiUrl,
              displayName: res.data[i].displayName,
              nameSpace: res.data[i].nameSpace,
              description: res.data[i].description,
              reqParameters: res.data[i].reqParameters,
              rspParameters: res.data[i].rspParameters,
              methodFlag: res.data[i].methodFlag,
              service: res.data[i].service,
              apiDetail: res.data[i].apiDetail
            })
          }
        }
      }).catch((err) => {
        if (err.status === 404) {
          this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
            severity: 'error',
            summary: 'API is ' + err.statusText,
            detail: '',
            id: ''
          });
        } else {
          this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
            severity: 'error',
            summary: err.statusText,
            detail: '',
            id: ''
          });
        }
      });
    }
  }

  doClickFinish() {
    // this.scripts[this.eventName] = this._script.getJsCode();
    this.scripts[this.eventName + '_xml'] = this._script.getXmlCode();
    const retData = {
      dataName: this.dataName,
      scripts: this.scripts
    };
    this.editData.emit(retData);
    this.closeDialog.emit();

    this.subjectService.broadcastData(this.subKey.SET_EVENT, this.scripts);
  }

  doAreaClickFinish() {
    this._script.setVal('NAME', this.jsArea);
    this.jsAreaShow = false;
  }

  doAreaCloseDialog() {
    this.jsAreaShow = false;
  }

  doRestClickFinish() {
    this._script.setVal('NAME', this.selectedObject);
    this.chooseRestShow = false;
  }

  doRestCloseDialog() {
    this.chooseRestShow = false;
  }

  docloseDialog() {
    this.closeDialog.emit();
  }

  getRestData() {
    this.httpService.getData('/object/api/dictHierarchyRel/listChildDictObjByDictObjId', {
        recursion: 1,
        aId: '786c227b-c694-40fb-b3d0-e9c2c4ad895c'
      }
    ).then(
      (res) => {
        this.restLabelTreeDataParse(res.data);
      }
    )
  }

  restLabelTreeDataParse(data: any[]) {
    const restData = data;
    this.restLabelDatas[0].children = [];

    for (let i = 0; i < restData.length; i++) {
      if (restData[i].ext.aId === '786c227b-c694-40fb-b3d0-e9c2c4ad895c') {
        this.restLabelDatas[0].children.push({label: restData[i].basic.name.zh_CN, basic: restData[i].basic, children: []});
        restData.splice(i, 1);
        i--;
      }
    }

    if (this.restLabelDatas[0].children.length > 0) {
      for (let j = 0; j < this.restLabelDatas[0].children.length; j++) {
        for (let k = 0; k < restData.length; k++) {
          if (restData[k].ext.aId === this.restLabelDatas[0].children[j].basic.id) {
            this.restLabelDatas[0].children[j].children.push({label: restData[k].basic.name.zh_CN, basic: restData[k].basic, children: []})
          }
        }
      }
    }
  }
}
