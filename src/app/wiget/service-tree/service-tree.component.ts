import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef, ViewChild} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-service-tree',
  templateUrl: './service-tree.component.html'
})
export class ServiceTreeComponent extends BaseComponent implements OnInit {

  @Input() treeData;

  // 当前组件绑定的service
  @Input() curPomBindService: any;

  datas: any[];

  selectedData: any;

  selectedObject: any;

  // 右键菜单的选项
  items: any[];

  displayDialog = false;

  service: any = {};

  nextNode: any = {};

  isEdit: Boolean = false;

  @ViewChild('cm', {read: ViewContainerRef}) contextMenu: ViewContainerRef;

  change(e): void {
    if (!e.node.parent) {
      this.items = [
        {label: 'Add service', icon: 'fa-plus', command: (event) => this.addService(this.selectedData)}
      ];
    } else {
      if (!e.node.children) {
        return;
      }

      this.items = [
        {label: 'edit service', icon: 'fa-plus', command: (event) => this.edit(this.selectedData)},
        {label: 'delete service', icon: 'fa-close', command: (event) => this.deleteService(this.selectedData)},
      ];
    }

    if (e) {
      const top = e.originalEvent.target.offsetHeight + e.originalEvent.target.offsetTop + 'px';
      const left = e.originalEvent.target.offsetLeft + 'px';

      this.contextMenu.element.nativeElement.firstElementChild.setAttribute('style', 'top:' + top + ';left:' + left + ';display:block')
    }
  }

  addService(data): void {
    if (data.sign === 'data' && data.data && data.data.type !== 'List') {
      return;
    }
    this.nextNode.sign = 'data';
    this.displayDialog = true;
  }

  edit(data): void {
    this.isEdit = true;
    this.service.name = data.data.name;
    this.displayDialog = true;
  }

  deleteService(node): void {
    const that = this;
    this.doConfirm('是否确定删除本节点？', function () {
      if (that.datas[0] && that.datas[0].children.length > 0 && node) {
        for (let i = 0; i < that.datas[0].children.length; i++) {
          if (that.datas[0].children[i].path === node.path) {
            that.datas[0].children.splice(i, 1);
          }
        }

        that.unbundleService(node.data.obj.objectId);

        that.selectedData = null;
        that.subjectService.broadcastData(that.subKey.SERVICE_NODE_SELECTED, that.selectedData);
        that.subjectService.broadcastData(that.subKey.serviceChange, that.datas);
        that.subjectService.broadcastData(that.subKey.DELETE_SERVICE, null);
      }
    })
  }

  // 解绑service
  unbundleService(objectId): void {
    const node = this.getNodeByKey(objectId, this.targetBuilderTools);
    if (node) {
      node.attr.dataSource.bindData = {};
      node.attr.dataSource.selectedDataSourceType = 'Options';
      node.attr.displayField = 'label';
      node.attr.valueField = 'value';
    }
  }

  getNodeByKey(objectId, datas: any[]): any {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        const child = datas[i];
        if (child.attr
          && child.attr.dataSource
          && child.attr.dataSource.bindData
          && child.attr.dataSource.bindData.objectId === objectId) {
          return child;
        } else {
          if (child.children && child.children.length > 0) {
            const res = this.getNodeByKey(objectId, child.children);
            if (res) {
              return res;
            }
          }
        }
      }
    } else {
      return null;
    }
  }

  expandAll(): void {
    this.datas.forEach(node => {
      this.expandRecursive(node, true);
    });
  }

  // 展开service树
  expandRecursive(node, isExpand: boolean): void {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  doClickFinish(): void {
    if (!this.selectedObject) {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: '请选择一个object', detail: ''});
      return;
    }

    for (let i = 0; i < this.datas[0].children.length; i++) {
      const child = this.datas[0].children[i];
      if (child.data.name === this.service.name) {
        this.service.name = this.nameService.getNames(this.service.name);
      }
    }

    // 获取选取的object属性
    if (this.selectedObject.objectName) {
      const url = 'object/api/last/' + this.selectedObject.objectName + '/attrs';
      this.httpService.getData(url, {}).then((res) => {
        this.dataParse(res.attrs);
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
      })
    }
  }

  doCloseDialog(): void {
    this.isEdit = false;
    this.displayDialog = false;
  }

  nodeSelect(e): void {
    this.subjectService.broadcastData(this.subKey.SERVICE_NODE_SELECTED, this.selectedData);
  }

  dataParse(data): void {
    if (!this.selectedData.children) {
      this.selectedData.children = [];
    }

    const node: any = {};
    node.type = 'service';
    node.label = this.service.name || '';
    node.path = this.selectedData.path + '.' + this.service.name;
    node.data = {};
    node.data.name = this.service.name || '';
    node.data.obj = {};
    node.data.obj.objectId = this.selectedObject.objectId || '';
    node.data.obj.objectName = this.selectedObject.objectName || '';
    node.data.obj.nameDesc = this.selectedObject.nameDesc || '';
    node.sign = this.nextNode.sign || '';
    node.cannotBind = this.nextNode.cannotBind || '';
    node.children = [{
      cannotBind: true,
      data: {name: 'id', type: 'String', validateFunc: '', calculateFunc: ''},
      label: 'id<string>',
      sign: 'property'
    }];

    // 遍历选中的object，获取其属性
    for (let i = 0; i < data.length; i++) {
      let desc: String = '';
      if (data[i].attrDesc && data[i].attrDesc.length > 0) {
        for (let k = 0; k < data[i].attrDesc.length; k++) {
          if (data[i].attrDesc[k].key === 'zh_CN') {
            desc = data[i].attrDesc[k].value;
          }
        }
      } else {
        if (data[i].nameDesc && data[i].nameDesc.length > 0) {
          for (let j = 0; j < data[i].nameDesc.length; j++) {
            if (data[i].nameDesc[j].key === 'zh_CN') {
              desc = data[i].nameDesc[j].value;
            }
          }
        }
      }

      node.children.push({
        cannotBind: true,
        data: {name: data[i].name, type: data[i].dataType, validateFunc: '', calculateFunc: ''},
        label: data[i].name + '<' + data[i].dataType + '>' + '--' + desc,
        sign: 'property'
      })
    }

    if (this.isEdit) {
      const service = this.doget(this.selectedData.path, this.datas);

      service.label = this.service.name;
      service.data = {};
      service.data.name = this.service.name;
      service.path = service.parent.path + '.' + this.service.name;
      service.children = node.children;

      this.displayDialog = false;
      this.isEdit = false;
    } else {
      this.selectedData.children.push(node);

      // 确认新增完service后，默认选中新增的一项
      this.selectedData = this.doget(node.path, this.datas);

      // expand tree
      this.expandAll();

      this.displayDialog = false;
    }

    this.constantService.putData(this.subKey.serviceChange, this.datas);
    this.subjectService.broadcastData(this.subKey.serviceChange, this.datas);

    this.subjectService.broadcastData(this.subKey.SERVICE_NODE_SELECTED, this.selectedData);

    this.subjectService.broadcastData(this.subKey.SAVE_TO_LOCAL_STORAGE, this.targetBuilderTools);
  }

  doget(path: string, datas: any[]): any {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        const child = datas[i];
        if (child.path === path) {
          return child;
        } else {
          if (child.children && child.children.length > 0) {
            const res = this.doget(path, child.children);
            if (res) {
              return res;
            }
          }
        }
      }
    } else {
      return null;
    }
  }

  getServiceById(id: string, datas: any[]): any {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        const child = datas[i];
        if (child.data && child.data.obj && child.data.obj.objectId === id) {
          return child;
        } else {
          if (child.children && child.children.length > 0) {
            const res = this.getServiceById(id, child.children);
            if (res) {
              return res;
            }
          }
        }
      }
    } else {
      return null;
    }
  }

  ngOnInit() {
    this.registerSubject(this.subKey.serviceChange);
    this.registerSubject(this.subKey.SELECTED_DATA_SOURCE);
    this.registerSubject(this.subKey.INIT_TAB_PANEL);

    if (this.treeData && this.treeData.length > 0) {
      this.datas = this.treeData;
    } else {
      this.datas = [
        {
          label: 'NebulogyService',
          data: {},
          sign: 'folder',
          cannotBind: true,
          path: 'NebulogyService',
          type: 'service',
          children: []
        }
      ];
    }

    if (this.curPomBindService && this.curPomBindService.objectId) {
      this.selectedData = this.getServiceById(this.curPomBindService.objectId, this.datas);
      this.expandAll();
    }
  }

  onSubResult(key: string, data: any) {
    if (key === this.subKey.serviceChange) {
      this.datas = data;
      if (data && data.length) {
        this.datas = data;
      } else {
        this.datas = [
          {
            label: 'NebulogyService',
            data: {},
            sign: 'folder',
            cannotBind: true,
            path: 'NebulogyService',
            type: 'service',
            children: []
          }
        ]
      }
    } else if (key === this.subKey.SELECTED_DATA_SOURCE) {
      this.service.name = data.objectName;
    } else if (key === this.subKey.INIT_TAB_PANEL) {
      this.datas = [{
        label: 'NebulogyService',
        data: {},
        sign: 'folder',
        cannotBind: true,
        path: 'NebulogyService',
        type: 'service',
        children: []
      }];
    }
  }
}
