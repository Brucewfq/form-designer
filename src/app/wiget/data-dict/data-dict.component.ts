import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef, ViewChild} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-data-dict',
  templateUrl: './data-dict.component.html'
})

export class DataDictComponent extends BaseComponent implements OnInit {
  @Input() dataDictPost: any = {};

  dataDictProperties: any[] = [];

  displayDialog: Boolean = false;

  selectedDict: any;

  objectDatas: any = [];


  dataDictTree = [
    {
      label: '数据字典',
      data: {name: '数据字典'},
      children: []
    }
  ];

  showDataDict() {
    this.displayDialog = true;
  }

  doCloseDialog() {
    this.displayDialog = false;
  }

  doClickFinish() {
    if (!this.selectedDict) {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: '请选择一项', detail: ''});
      return
    }

    if (!this.selectedDict.basic || this.selectedDict.basic.id === '00000000-0000-0000-0000-000000000000') {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: '选择的项目无效，请重新选择', detail: ''});
      return
    }

    if (!this.dataDictPost.dataSource.dataDict) {
      this.dataDictPost.dataSource.dataDict = {};
    }
    this.dataDictPost.dataSource.dataDict.id = this.selectedDict.basic.id;
    this.dataDictPost.dataSource.dataDict.name = this.selectedDict.basic.name;

    this.doCloseDialog();
  }

  onRowSelect() {
  }

  getDictData() {
    // http://demo.k2software.com.cn:30009/object/api/dictHierarchyRel/listChildDictObjByDictObjId
    const url = 'object/api/dictHierarchyRel/listChildDictObjByDictObjId';
    const language = window.localStorage.getItem('PAI-language');
    let exp = '$';

    if (language) {
      exp = '$.' + language;
    }

    this.httpService.getData(url, {
        recursion: 1,
        objFields: [{
          'exp': exp,
          'name': 'name',
          'type': 'json'
        },
          {
            'name': 'id'
          }, {
            'name': 'code'
          }
        ],
        'relFields': [{
          'name': 'aId'
        }],
        'aId': '00000000-0000-0000-0000-000000000000'
      }
    ).then(res => {
      if (res && res.data) {
        this.dataParse(res.data);
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

  dataParse(data: any[]) {

    const result = {};

    for (let j = 0; j < data.length; j++) {
      const aId = data[j].ext.aId;
      if (result[aId]) {
        result[aId][data[j].basic.id] = data[j];
      } else {
        result[aId] = {};
        result[aId][data[j].basic.id] = data[j];
      }
    }

    this.createTreeData(result);
  }

  createTreeData(result) {
    const data = [];

    for (const key in result['00000000-0000-0000-0000-000000000000']) {
      const item = result['00000000-0000-0000-0000-000000000000'][key];
      const node = {
        label: item.basic.name,
        data: {name: item.basic.name, type: '', validateFunc: '', calculateFunc: ''},
        children: []
      };

      const object = this.assembleTreeData(item, node, result);
      data.push(object)
    }
    this.dataDictTree[0].children = data;
    this.expandAll(this.dataDictTree);
  }

  assembleTreeData(item, node, result) {
    if (result[item.basic.id]) {
      for (const key in result[item.basic.id]) {
        const a = {
          label: result[item.basic.id][key].basic.name,
          data: {name: result[item.basic.id][key].basic.name, type: '', validateFunc: '', calculateFunc: ''},
          basic: result[item.basic.id][key].basic,
          children: []
        };

        node.children.push(a);
        if (result[key]) {
          this.assembleTreeData(result[item.basic.id][key], a, result)
        }
      }
    } else {
      node.children.push({
        label: item.basic.name,
        data: {name: item.basic.name, type: '', validateFunc: '', calculateFunc: ''},
        basic: item.basic,
        children: []
      });
    }

    return node;
  }

  onRestNodeSelect() {

  }

  // 展开smartDs树
  expandAll(data: any[]): void {
    data.forEach(node => {
      this.expandRecursive(node, true);
    });
  }

  expandRecursive(node, isExpand: boolean): void {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  ngOnInit() {
    this.getDictData();
  }
}
