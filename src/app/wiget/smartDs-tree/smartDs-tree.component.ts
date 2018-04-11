import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef, ViewChild} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-smart-tree',
  templateUrl: './smartDs-tree.component.html'
})
export class SmartDsTreeComponent extends BaseComponent implements OnInit {

  @Input() treeData;

  @Input() pullCopyTemp: any;

  // 当前组件绑定的smartDs
  @Input() curPomBindSmartDs: any;

  datas: any[];

  selectedData: any;

  items: any[];

  dataTypes: any[];

  displayDialog = false;

  smartDs: any = {};

  nextNode: any = {};

  curNode: any = {};

  isEdit: Boolean = false;

  @ViewChild('cm', {read: ViewContainerRef}) contextMenu: ViewContainerRef;

  addData(): void {
    this.smartDs.name = '';
    this.dataTypes = this.constantService.dataTypeWithNode;
    this.smartDs.type = 'String';

    this.nextNode.sign = 'data';
    this.msgs = [];
    this.displayDialog = true;

    this.curNode = {};
  }

  addList(): void {
    this.smartDs.name = '';
    this.dataTypes = this.constantService.dataTypeWithLists;
    this.smartDs.type = 'List';

    this.nextNode.sign = 'list';
    this.msgs = [];
    this.displayDialog = true;

    this.curNode = {};
  }


  addFolder(): void {
    this.smartDs.name = '';
    this.nextNode.sign = 'folder';
    this.nextNode.cannotBind = true;
    this.msgs = [];
    this.displayDialog = true;

    this.curNode = {};
  }

  addObject(): void {
    this.smartDs.name = '';
    this.dataTypes = [
      {
        label: 'Object',
        value: 'Object'
      }
    ];
    this.smartDs.type = 'Object';

    this.nextNode.sign = 'object';
    this.msgs = [];
    this.displayDialog = true;
  }

  addObjectNode(): void {
    this.smartDs.name = '';
    this.dataTypes = this.constantService.dataTypeWithObject;
    this.smartDs.type = 'String';

    this.nextNode.sign = 'data';
    this.msgs = [];
    this.displayDialog = true;
  }

  update(): void {
    if (this.datas && this.datas[0] && this.datas[0].children.length > 0) {
      const _this = this;
      this.doConfirm('当前smartDs有内容是否清空', function () {
        _this.SynchronizeTreeData();

        _this.constantService.putData(_this.subKey.smartDsChange, _this.datas);
        _this.subjectService.broadcastData(_this.subKey.smartDsChange, _this.datas);
      });
    } else {
      this.SynchronizeTreeData();

      this.constantService.putData(this.subKey.smartDsChange, this.datas);
      this.subjectService.broadcastData(this.subKey.smartDsChange, this.datas);
    }
  }

  // 同步生成SmartDs操作
  SynchronizeTreeData(): void {
    if (this.targetBuilderTools && this.targetBuilderTools[0] && this.targetBuilderTools[0].children.length > 0) {
      this.doDataRecurrence(this.targetBuilderTools[0].children, this.datas[0].children, 'NebulogyForm');
    } else {
      this.datas[0].children = this.targetBuilderTools[0].children;
    }
  }

  doDataRecurrence(targetBuilderTools: any[], smartTreeData: any[], path) {

    for (let i = 0; i < targetBuilderTools.length; i++) {
      const child = targetBuilderTools[i];
      const rexSection = /^section/g;
      const rexTab = /^tab/g;
      const rexToolBar = /^toolbar/g;

      if (rexSection.test(child.inputType.trim())
        || rexTab.test(child.inputType.trim())
        || rexToolBar.test(child.inputType.trim())) {

        for (let j = 0; j < smartTreeData.length; j++) {
          if (smartTreeData[j] && smartTreeData[j].data && smartTreeData[j].data.id === child.name) {
            smartTreeData.splice(j, 1);
          }
        }

        if (child.inputType === 'section-child') {
          if (child.children && child.children.length > 0) {
            this.doDataRecurrence(child.children, smartTreeData, path);
          }
        } else {
          const folder: any = {};
          folder.type = 'smartDs';
          folder.data = {};
          folder.data.name = child.attr.name;
          folder.data.type = 'folder';
          folder.data.id = child.name;

          folder.label = child.attr.name + '<' + folder.data.type + '>';
          folder.sign = 'folder';
          folder.path = path + '.' + child.attr.name;
          folder.cannotBind = true;
          folder.children = [];

          if (child.children && child.children.length > 0) {
            this.doDataRecurrence(child.children, folder.children, folder.path);
          }

          smartTreeData.push(folder);
        }
      } else {
        if (child.inputType !== 'data-grid') {
          const node: any = {};

          node.type = 'smartDs';
          node.path = path + '.' + child.attr.name;
          node.data = {};
          node.data.name = child.attr.name;
          node.data.id = child.name;

          if (child.inputType === 'datetime') {
            node.data.type = 'dateTime';
          } else if (child.inputType === 'number') {
            node.data.type = 'inter';
          } else if (child.inputType === 'checkbox') {
            node.data.type = 'Object';
          } else {
            node.data.type = 'String';
          }
          node.label = child.attr.name + '<' + node.data.type + '>';

          if (child.inputType === 'checkbox') {
            node.sign = 'object';
          } else {
            node.sign = 'data';
          }

          // 如果是checkbox组件，对应的options也需要生成
          if (child.inputType === 'checkbox'
            && child.attr.dataSource
            && child.attr.dataSource.options
            && child.attr.dataSource.options.length > 0) {
            node.children = [];
            const options = child.attr.dataSource.options;
            for (let j = 0; j < options.length; j++) {
              const objectNode: any = {};

              objectNode.path = node.path + '.' + options[j].value;
              objectNode.data = {};
              objectNode.data.name = options[j].value;
              objectNode.data.type = 'String';
              objectNode.data.label = options[j].label;
              objectNode.sign = 'data';
              objectNode.label = options[j].value + '<' + objectNode.data.type + '>';

              node.children.push(objectNode);
            }
          }

          // 给相应组件绑定smartDs
          if (child.inputType !== 'button' && child.inputType !== 'submit') {
            child.attr.bindPath = node.path;
          }
          //
          smartTreeData.push(node);
        } else {

          for (let k = 0; k < this.datas[0].children.length; k++) {
            if (this.datas[0].children[k] && this.datas[0].children[k].data && this.datas[0].children[k].data.id === child.name) {
              this.datas[0].children.splice(k, 1);
            }
          }

          const list: any = {};
          list.type = 'smartDs';
          list.data = {};
          list.data.name = child.attr.name + 'List';
          list.data.type = 'List';
          list.data.id = child.name;

          list.label = child.attr.name + 'List' + '<list>';
          list.sign = 'list';
          list.path = child.attr.name + 'List';
          list.cannotBind = true;
          list.children = [];
          //
          if (child.attr.columns && child.attr.columns.length > 0) {

            for (let k = 0; k < child.attr.columns.length; k++) {
              const objectNode: any = {};

              objectNode.path = list.path + '.' + child.attr.columns[k].dataIndex;
              objectNode.data = {};
              objectNode.data.name = child.attr.columns[k].dataIndex;
              objectNode.data.type = child.attr.columns[k].type;
              objectNode.sign = 'data';
              objectNode.label = child.attr.columns[k].dataIndex + '<' + objectNode.data.type + '>';

              list.children.push(objectNode);
            }
          }

          // 给相应组件绑定smartDs
          child.attr.bindPath = list.path;

          this.datas[0].children.push(list);
        }
      }
    }
  }

  edit(data): void {
    this.isEdit = true;
    this.nextNode = {};

    if (data.data) {
      this.smartDs.name = data.data.name;
      this.smartDs.type = data.data.type;
    } else {
      this.smartDs.name = '';
    }

    this.curNode.sign = data.sign;

    if (data.sign === 'list') {
      this.dataTypes = this.constantService.dataTypeWithLists;
    } else if (data.sign === 'data') {
      if (data.parent && data.parent.sign === 'object') {
        this.dataTypes = this.constantService.dataTypeWithObject;
      } else {
        this.dataTypes = this.constantService.dataTypeWithNode;
      }
    } else if (data.sign === 'object') {
      this.dataTypes = [
        {
          label: 'Object',
          value: 'Object'
        }
      ];
    }

    this.displayDialog = true;
  }

  delete(path: string): void {
    const that = this;
    this.doConfirm('是否确定删除本节点？（子节点也会被同时删除）', function () {
      if (that.datas && that.datas[0] && that.datas[0].children.length > 0 && path) {
        that.deleteSmartDs(that.datas[0].children, path);

        if (that.selectedData.sign === 'list') {
          that.unbundleSmartDs(that.selectedData.data.name);
        } else {
          that.unbundleSmartDs(path);
        }

        that.selectedData = {};
        that.subjectService.broadcastData(that.subKey.nodeChoose, that.selectedData);
        that.subjectService.broadcastData(that.subKey.smartDsChange, that.datas);
      }
    })
  }

  deleteSmartDs(data, targetPath): void {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const child = data[i];
        if (child.path === targetPath) {
          data.splice(i, 1);
        } else {
          if (child.children && child.children.length > 0) {
            this.deleteSmartDs(child.children, targetPath);
          }
        }
      }
    }
  }

  // 解绑smartDs
  unbundleSmartDs(path): void {
    const node = this.getNodeByPath(path, this.targetBuilderTools);
    if (node) {
      node.attr.bindPath = '';
    }
  }

  // 修改smartDs类型为list的时候，同步修改主区域数据
  syncSmartDs(smartDs) {
    if (this.selectedData.parent.sign === 'list') {
      const node = this.getNodeByPath(this.selectedData.parent.path, this.targetBuilderTools);

      if (node) {
        for (let i = 0; i < node.attr.columns.length; i++) {
          if (node.attr.columns[i].dataIndex === smartDs.data.name) {
            node.attr.columns[i].dataIndex = this.smartDs.name;
            node.attr.columns[i].type = this.smartDs.type;

            if (this.smartDs.type === 'String' && node.attr.columns[i].editorType !== 'textfield') {
              node.attr.columns[i].editorType = 'textfield';
            } else if (this.smartDs.type === 'Integer' && node.attr.columns[i].editorType !== 'numberfield') {
              node.attr.columns[i].editorType = 'numberfield';
            } else if (this.smartDs.type === 'Decimal' && node.attr.columns[i].editorType !== 'numberfield') {
              node.attr.columns[i].editorType = 'numberfield';
            } else if (this.smartDs.type === 'DateTime' && node.attr.columns[i].editorType !== 'datefield') {
              node.attr.columns[i].editorType = 'datefield';
            }
          }
        }
      }
    } else if (this.selectedData.sign === 'list') {
      const node = this.getNodeByPath(this.selectedData.path, this.targetBuilderTools);
      if (node) {
        node.attr.bindPath = this.smartDs.name;
      }
    }
  }

  getNodeByPath(path, datas: any[]) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        const child = datas[i];
        if (child.attr && child.attr.bindPath === path) {
          return child;
        } else {
          if (child.children && child.children.length > 0) {
            const res = this.getNodeByPath(path, child.children);
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

  // 获取组件的bindPath中包含指定字段的集合
  modifyComponentPath(specificString: string, datas: any, newPath) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        const child = datas[i];
        const str = specificString + '.';
        const reg = new RegExp('^' + str, 'gim');

        if (child.attr && child.attr.bindPath && reg.test(child.attr.bindPath)) {
          child.attr.bindPath = child.attr.bindPath.replace(specificString, newPath);
        } else {
          if (child.children && child.children.length > 0) {
            this.modifyComponentPath(specificString, child.children, newPath);
          }
        }
      }
    }
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

  doClickFinish(): void {
    if (!this.smartDs.name) {
      const me = this;
      this.doConfirm('node name can not be empty', function () {
        me.showViewMessage(me.constantService.MSG_ERROR, 'node name can not be empty');
      });

      return
    }

    if (this.isEdit) {
      if (this.smartDs.name) {
        if (this.inspectSmartDsName(this.datas[0].children, this.smartDs.name)) {
          this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: 'name不能重复', detail: ''});
          return;
        }
      }

      // 修改smartDs
      const smartDs = this.doget(this.selectedData.path, this.datas);
      const oldPath = this.selectedData.path;

      // 同步修改已绑定类型为list的smartDs
      this.syncSmartDs(smartDs);

      smartDs.label = this.smartDs.name + '<' + this.smartDs.type + '>';
      smartDs.data.name = this.smartDs.name;
      smartDs.data.type = this.smartDs.type;


      if (smartDs.parent && smartDs.parent.path) {
        if (smartDs.sign === 'list') {
          smartDs.path = this.smartDs.name;
        } else {
          smartDs.path = smartDs.parent.path + '.' + this.smartDs.name;
        }
        if (smartDs.children && smartDs.children.length > 0) {
          this.modifySmartDsPath(smartDs.children, smartDs.path);
        }
      }

      if (smartDs.sign === 'data') {
        const node = this.getNodeByPath(oldPath, this.targetBuilderTools);

        if (node && node.attr.bindPath) {
          if (node.inputType === 'datetime' && this.smartDs.type !== 'DateTime') {
            this.showMessage(this.constantService.MSG_ERROR, '该组件的smartDs type 只能为DateTime');

            return;
          }
          node.attr.bindPath = smartDs.path;
          node.attr.name = smartDs.data.name;
        }
        // 同步修改组件的name，组件和smartDs的name保持一致
        this.modifyComponentByName(smartDs.data.id, this.targetBuilderTools, this.smartDs.name);
      } else if (smartDs.sign === 'list') {
        const node = this.getNodeByPath(oldPath, this.targetBuilderTools);
        if (node) {
          node.attr.bindPath = smartDs.path;
        }
      } else {
        this.modifyComponentPath(oldPath, this.targetBuilderTools, smartDs.path);
        // 同步修改组件的name，组件和smartDs的name保持一致
        this.modifyComponentByName(smartDs.data.id, this.targetBuilderTools, this.smartDs.name);
      }
      //
      this.displayDialog = false;
      this.isEdit = false;
    } else {
      // 新增smartDs
      if (!this.selectedData.children) {
        this.selectedData.children = [];
      }

      const node: any = {};

      if (this.nextNode.sign === 'folder') {
        node.label = (this.smartDs.name + '<folder>') || '';
      } else {
        node.label = (this.smartDs.name || '') + '<' + this.smartDs.type + '>';
      }

      if (this.nextNode.sign === 'list') {
        node.path = this.smartDs.name;
      } else {
        node.path = this.selectedData.path + '.' + this.smartDs.name;
      }
      node.data = {};
      node.data.name = this.smartDs.name || '';
      node.data.type = this.smartDs.type || '';
      node.data.validateFunc = this.smartDs.validateFunc || '';
      node.data.calculateFunc = this.smartDs.calculateFunc || '';
      node.sign = this.nextNode.sign || '';
      node.type = 'smartDs';
      node.cannotBind = this.nextNode.cannotBind || '';

      if (node.data.name) {
        if (this.inspectSmartDsName(this.datas[0].children, node.data.name)) {
          this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: 'name不能重复', detail: ''});
          return;
        }
      }

      //
      if (this.selectedData.sign === 'list') {
        const node = this.getNodeByPath(this.selectedData.path, this.targetBuilderTools);
        if (node) {
          if (!node.attr.columns) {
            node.attr.columns = [];
          }
          node.attr.columns.push({
            text: 'column' + node.attr.columns.length,
            dataIndex: this.smartDs.name,
            type: 'String',
            editorType: 'textfield',
            summaryType: '',
            flex: 1,
            minWidth: 100,
            format: '',
            renderStr: '',
            visible: []
          })
        }
      }

      this.selectedData.children.push(node);
      this.displayDialog = false;
      //
      this.expandAll([this.selectedData]);
      // 确认新增完smartDs后，默认选中新增的一项
      this.selectedData = this.doget(node.path, this.datas);
    }
    //
    this.constantService.putData(this.subKey.smartDsChange, this.datas);
    this.subjectService.broadcastData(this.subKey.smartDsChange, this.datas);
  }

  modifySmartDsPath(data, newPath) {

    if (data) {
      for (let i = 0; i < data.length; i++) {
        data[i].path = newPath + '.' + data[i].data.name;
        if (data[i].children && data[i].children.length > 0) {

          this.modifySmartDsPath(data[i].children, data[i].path);
        }
      }
    }
  }

  inspectSmartDsName(data: any[], name: string): Boolean {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const child = data[i];
        if (child.data.name === name) {
          return true;
        } else {
          if (child.children && child.children.length > 0) {
            const res = this.inspectSmartDsName(child.children, name);

            if (res) {
              return res;
            }
          }
        }
      }
    } else {
      return false;
    }
  }

  doCloseDialog(): void {
    this.displayDialog = false;
    this.isEdit = false;
  }

  nodeSelect(e): void {
    this.subjectService.broadcastData(this.subKey.nodeChoose, this.selectedData);
  }

  nodeDrop(e): void {
    console.log(e);
    // 1、拖动完成，先检查该smartDs的sign，如果是data，检查是否已绑定组件，如果是folder或者list，需要把其children的路径统一修改
    const dragSmartDs = e.dragNode;
    if (dragSmartDs.sign === 'data') {
      const node = this.getNodeByPath(dragSmartDs.path, this.targetBuilderTools);

      // 2、是=>解绑
      if (node) {
        node.attr.bindPath = '';
      }
    }
    // 3、解绑完后，修改该smartDs的path
    const smartDs = this.doget(dragSmartDs.path, this.datas);
    smartDs.path = e.dropNode.path + '.' + smartDs.data.name;

    if (dragSmartDs.sign === 'folder' || dragSmartDs.sign === 'object') {
      this.modifySmartDsPath(dragSmartDs.children, smartDs.path)
    } else if (dragSmartDs.sign === 'list') {
      if (e.dropNode.path === 'NebulogyForm') {
        smartDs.path = smartDs.data.name;
      }
      this.modifySmartDsPath(dragSmartDs.children, smartDs.path)
    }

    // 4、提示与之前绑定的组件解绑，请重新绑定
    this.showMessage(this.constantService.MSG_INFO, '之前绑定的组件解绑，请重新绑定');
    console.log(this.datas);
  }

  change(e): void {
    if (!e.node.parent) {
      this.items = [
        {label: 'Add Node', icon: 'fa-plus', command: (event) => this.addData()},
        {label: 'Add Folder', icon: 'fa-plus', command: (event) => this.addFolder()},
        {label: 'Add list', icon: 'fa-plus', command: (event) => this.addList()},
        {label: 'Add Object', icon: 'fa-plus', command: (event) => this.addObject()}
        // {label: 'Synchronize', icon: 'fa-plus', command: (event) => this.update()}
      ];
    } else {
      if (e.node.sign === 'data') {
        this.items = [
          {label: 'edit', icon: 'fa-plus', command: (event) => this.edit(this.selectedData)},
          {label: 'delete', icon: 'fa-close', command: (event) => this.delete(this.selectedData.path)}
        ];
      } else if (e.node.sign === 'list') {
        this.items = [
          {label: 'Add Node', icon: 'fa-plus', command: (event) => this.addData()},
          {label: 'edit', icon: 'fa-plus', command: (event) => this.edit(this.selectedData)},
          {label: 'delete', icon: 'fa-close', command: (event) => this.delete(this.selectedData.path)}
        ];
      } else if (e.node.sign === 'folder') {
        this.items = [
          {label: 'Add Node', icon: 'fa-plus', command: (event) => this.addData()},
          {label: 'Add Folder', icon: 'fa-plus', command: (event) => this.addFolder()},
          {label: 'Add Object', icon: 'fa-plus', command: (event) => this.addObject()},
          {label: 'edit', icon: 'fa-plus', command: (event) => this.edit(this.selectedData)},
          {label: 'delete', icon: 'fa-close', command: (event) => this.delete(this.selectedData.path)}
        ];
      } else if (e.node.sign === 'object') {
        this.items = [
          {label: 'Add Node', icon: 'fa-plus', command: (event) => this.addObjectNode()},
          {label: 'edit', icon: 'fa-plus', command: (event) => this.edit(this.selectedData)},
          {label: 'delete', icon: 'fa-close', command: (event) => this.delete(this.selectedData.path)}
        ];
      }
    }

    if (e) {
      let top;
      if (e.originalEvent.target.offsetParent.offsetParent) {
        top = e.originalEvent.screenY - e.originalEvent.target.offsetParent.offsetParent.offsetTop - 75 + 'px';
      } else {
        top = e.originalEvent.screenY - e.originalEvent.target.offsetParent.offsetTop - 55 + 'px';
      }

      const left = e.originalEvent.target.offsetLeft + 'px';

      this.contextMenu.element.nativeElement.firstElementChild.setAttribute('style', 'top:' + top + ';left:' + left + ';display:block')
    }
  }

  doget(path: string, datas: any[]) {
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

  checkSign() {
    if (this.isEdit) {
      return this.curNode && this.curNode.sign && this.curNode.sign === 'data';
    } else {
      return this.nextNode && this.nextNode.sign && this.nextNode.sign !== 'folder';
    }
  }

  onSubResult(key: string, data: any) {
    if (key === this.subKey.smartDsChange) {
      if (data && data.length > 0) {
        this.datas = data;
      } else {
        this.datas = [{
          label: 'NebulogyForm',
          data: {name: 'NebulogyForm'},
          sign: 'folder',
          cannotBind: true,
          path: 'NebulogyForm',
          type: 'smartDs',
          children: []
        }];
      }
    } else if (key === this.subKey.CHECK_BOX_OPTIONS_CHANGE) {
      if (data.path) {
        const smartDsOfObject = this.doget(data.path, this.datas);
        smartDsOfObject.children = this.createListNode(smartDsOfObject.path, data.options);
      }
    } else if (key === this.subKey.COLUMNS_CHANGE) {
      const list = this.doget(data.bindPath, this.datas);
      if (list) {
        list.children = this.createListNode(data.bindPath, data.columns);
        this.subjectService.broadcastData(this.subKey.smartDsChange, this.datas);
      }
    } else if (key === this.subKey.INIT_TAB_PANEL) {
      this.datas = [{
        label: 'NebulogyForm',
        data: {name: 'NebulogyForm'},
        sign: 'folder',
        cannotBind: true,
        path: 'NebulogyForm',
        type: 'smartDs',
        children: []
      }];
    } else if (key === this.subKey.CREATE_SMART_DS) {
      this.SynchronizeTreeData();

      this.expandAll(this.datas);

      this.constantService.putData(this.subKey.smartDsChange, this.datas);
      this.subjectService.broadcastData(this.subKey.smartDsChange, this.datas);
    } else if (key === this.subKey.PROPERTY_CHANGE) {
      if (data.model.bindPath) {
        const node = this.getNodeByPath(data.model.bindPath, this.targetBuilderTools);

        // 同步修改smartDs的名字和路径
        const smartDs = this.doget(data.model.bindPath, this.datas);

        if (smartDs) {
          smartDs.label = data.model.name + '<' + smartDs.data.type + '>';
          smartDs.data.name = data.model.name;
          smartDs.path = smartDs.parent.path + '.' + data.model.name;
        }

        if (node) {
          node.attr.bindPath = smartDs.path;
        }
      } else {
        if (data.id) {
          const smartDs = this.getSmartDsById(data.id, this.datas);
          const oldPath = smartDs.path;
          if (smartDs) {
            smartDs.label = data.model.name + '<' + smartDs.data.type + '>';
            smartDs.data.name = data.model.name;
            smartDs.path = smartDs.parent.path + '.' + data.model.name;
          }

          this.modifyComponentPath(oldPath, this.targetBuilderTools, smartDs.path);
        }
      }
    }
  }

  getSmartDsById(name: string, datas: any[]) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        const child = datas[i];
        if (child.data && child.data.id && child.data.id === name) {
          return child;
        } else {
          if (child.children && child.children.length > 0) {
            const res = this.getSmartDsById(name, child.children);
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

  modifyComponentByName(name: string, datas: any[], newName) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        const child = datas[i];
        if (child.name && child.name === name) {
          child.attr.name = newName;
        } else {
          if (child.children && child.children.length > 0) {
            this.modifyComponentByName(name, child.children, newName);
          }
        }
      }
    } else {
      return null;
    }
  }

  createListNode(path, data) {
    const result = [];

    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const node: any = {};

        node.path = path + '.' + data[i].dataIndex;
        node.data = {};
        node.data.name = data[i].dataIndex;
        node.data.type = data[i].type;
        node.sign = 'data';
        node.type = 'smartDs';
        node.label = data[i].dataIndex + '<' + node.data.type + '>';

        result.push(node);
      }
    }

    return result;
  }

  ngOnInit() {
    this.registerSubject(this.subKey.smartDsChange);
    this.registerSubject(this.subKey.CHECK_BOX_OPTIONS_CHANGE);
    this.registerSubject(this.subKey.COLUMNS_CHANGE);
    this.registerSubject(this.subKey.INIT_TAB_PANEL);
    this.registerSubject(this.subKey.CREATE_SMART_DS);
    this.registerSubject(this.subKey.PROPERTY_CHANGE);

    if (this.constantService.getDataByKey(this.subKey.TARGET_BUILDER_TOOLS_CHANGE)) {
      this.targetBuilderTools = this.constantService.getDataByKey(this.subKey.TARGET_BUILDER_TOOLS_CHANGE);
    }

    if (this.treeData && this.treeData.length > 0) {
      this.datas = this.treeData;
    } else {
      this.datas = [{
        label: 'NebulogyForm',
        data: {name: 'NebulogyForm'},
        sign: 'folder',
        cannotBind: true,
        path: 'NebulogyForm',
        type: 'smartDs',
        children: []
      }];
    }

    if (this.curPomBindSmartDs) {
      this.selectedData = this.doget(this.curPomBindSmartDs, this.datas);
      this.expandAll(this.datas);
    }
  }
}
