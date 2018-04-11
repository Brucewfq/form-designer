import {Component, Input, Output, OnInit, EventEmitter, OnDestroy, ViewContainerRef, ViewChild} from '@angular/core';
import {AppComponent} from '../../app.component';

import {NameService} from '../../service/name.service';
import {SubjectService} from '../../service/subject.service';
import {ConstantService} from '../../service/constantService';
import {Subscription} from 'rxjs/Subscription';

declare var jQuery: any;

@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styles: [`

    #inspector {
      background-color: #ecf4f4;
    }

    #inspector .ui-tree .ui-treenode-label {
      display: block;
      padding: 0 27px;
      background-color: green;
      border: 1px solid red;
    }

    .detailMsg {
      display: inline-block;
      width: 134px;
      height: 27px;
      line-height: 27px;
      overflow: hidden;
      padding: 0 5px;
      color: #000;
      cursor: default;
    }

    .detailMsg:not(.detailDisable):hover {
      background-color: rgba(108, 188, 159, 0.5);
    }

    .detailSelected {
      background-color: #6CBC9F;
    }

    .detailDisable {
      width: 100%;
      border-right: 1px solid #ccc;
      background-color: #ccc;
    }
  `]
})

export class InspectorComponent implements OnInit, OnDestroy {
  @Input() selectedViewMode: any;

  @Input() targetBuilderTools: any;

  @Input() pullCopyTemp: any;

  inspectorSubscription: Subscription;

  addWindowSubscription: Subscription;

  createNewFormSubscription: Subscription;

  targetBuilderTools2: any;

  selectedFiles2: any;

  datas: any[];

  // 右键菜单的选项
  items: any[];

  @ViewChild('cm', {read: ViewContainerRef}) contextMenu: ViewContainerRef;

  constructor(private app: AppComponent,
              private nameService: NameService,
              private subjectService: SubjectService,
              private constantService: ConstantService) {
  }

  ngOnInit() {
    this.inspectorSubscription = this.subjectService.getSubscribe(this.constantService.subKey.FORM_DATA_CHANGE_EVENT_KEY).subscribe(
      data => this.changeInspectorTree(data)
    );

    this.addWindowSubscription = this.subjectService.getSubscribe(this.constantService.subKey.ADD_WINDOW).subscribe(
      data => this.addWindowHandle(data)
    );

    this.createNewFormSubscription = this.subjectService.getSubscribe(this.constantService.subKey.INIT_TAB_PANEL).subscribe(
      data => this.createNewForm()
    );

    this.changeInspectorTree(this.targetBuilderTools);
  }

  changeInspectorTree(data: any) {
    if (data) {
      this.datas = [];
      this.doDataRecurrence(data, this.datas);

      this.expandAll(this.datas);
    }
  }

  doDataRecurrence(targetBuilderTools: any[], smartTreeData: any[]) {
    for (let i = 0; i < targetBuilderTools.length; i++) {
      const child = targetBuilderTools[i];

      if (child.inputType === 'section-child') {
        if (child.children && child.children.length > 0) {
          this.doDataRecurrence(child.children, smartTreeData);
        }
      } else {
        const folder: any = {};
        folder.attr = child.attr;
        folder.inputType = child.inputType;
        folder.name = child.name;
        folder.label = child.attr.name;
        folder.children = [];

        folder.data = {};
        folder.data.name = child.attr.name;
        folder.data.id = child.name;

        if (child.children && child.children.length > 0) {
          this.doDataRecurrence(child.children, folder.children);
        }

        smartTreeData.push(folder);
      }
    }
  }

  // 展开smartDs树
  expandAll(data: any[]): void {
    data.forEach(node => {
      this.expand(node, true);
    });
  }

  expand(node, isExpand: boolean): void {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expand(childNode, isExpand);
      });
    }
  }

  addWindowHandle(data) {
    this.pullCopyTemp = data;
  }

  createNewForm() {
    this.targetBuilderTools2 = [{
      'name': 'form',
      'children': [],
      'inputType': 'form',
      'icon': 'form',
      'class': 'wide',
      'attr': {
        'visible': {},
        'readOnly': {}
      }
    }];

    this.pullCopyTemp = this.targetBuilderTools2[0];
  }

  change(e): void {
    if (e.node.inputType !== 'window') {
      return
    }
    this.items = [
      {label: 'delete window', icon: 'fa-close', command: (event) => this.deleteWindow(e.node)},
    ];

    if (e) {
      const top = e.originalEvent.target.offsetHeight + e.originalEvent.target.offsetTop + 'px';
      const left = e.originalEvent.target.offsetLeft + 'px';

      this.contextMenu.element.nativeElement.firstElementChild.setAttribute('style', 'top:' + top + ';left:' + left + ';display:block')
    }
  }

  deleteWindow(node) {

    for (let i = 0; i < this.targetBuilderTools.length; i++) {
      if (this.targetBuilderTools[i].name === node.name) {
        this.targetBuilderTools.splice(i, 1);
      }
    }

    this.targetBuilderTools2 = this.targetBuilderTools;
    this.pullCopyTemp = this.targetBuilderTools[0];
    this.checkModel(this.pullCopyTemp);
  }

  ngOnDestroy() {
    if (this.inspectorSubscription) {
      this.inspectorSubscription.unsubscribe();
    }
    if (this.addWindowSubscription) {
      this.addWindowSubscription.unsubscribe();
    }
    if (this.createNewFormSubscription) {
      this.createNewFormSubscription.unsubscribe();
    }
  }

  nodeSelect() {
    this.pullCopyTemp = this.selectedFiles2;
  }

  checkModel(model: any) {
    // 判断是否点击的是isSub
    if (model.inputType === 'section-child') {
      this.app.showComponentProperty({inputType: 'empty'});
    } else {
      if (model.inputType === 'window') {
        this.app.showComponentProperty({...model, inputType: 'window'});
      } else {
        this.app.showComponentProperty(model);
      }
    }

    const currNode = this.getDataBy(model.name);
    const parentsArr = this.getNameList(model, 'name');
    const inputTypeArr = this.getNameList(model, 'inputType');
    if (inputTypeArr.includes('tab')) {
      currNode.parentsArr = parentsArr;
    }

    this.app.onPerpareCopy(currNode);
    this.expandRecursive(model, true);
    this.subjectService.broadcastData(this.constantService.subKey.INSPECTOR_NODE_SELECTED, model);
  }

  // 获取所有父节点的name
  getNameList(data, attr) {
    const nameArr = [];
    let temp = data;
    while (temp) {
      nameArr.push(temp[attr]);
      temp = temp.parent;
    }
    return nameArr;
  }

  private expandRecursive(node: any, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  // display readonly
  doExcute(e, key: string, node: any) {
    const viewModel = this.selectedViewMode;

    // 该控件初始visible字段没有viewModel这个属性  默认把该属性值设为true
    if (key === 'visible' && !node.attr[key].hasOwnProperty(viewModel)) {
      node.attr[key][viewModel] = true;
    }

    const bool = node.attr[key][viewModel] = !node.attr[key][viewModel];
    const currNode = this.getDataBy(node.name);
    // 改变控件树
    this.traverseTree(node, key, bool);
    // 改变中间区域
    this.traverseTree(currNode, key, bool);
  }

  // 递归操作
  traverseTree(node, key, bool) {
    if (!node) return;
    const viewModel = this.selectedViewMode;
    if (node.attr[key]) {
      node.attr[key][viewModel] = bool;
    }

    if (node.children && node.children.length > 0) {
      let i = 0;
      for (i = 0; i < node.children.length; i++) {
        this.traverseTree(node.children[i], key, bool);
      }
    }
  }

  getDataBy(name: string) {
    return this.doget(name, this.targetBuilderTools);
  }

  doget(name: string, datas: any[]) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        let child = datas[i];
        if (child.name === name) {
          return child;
        } else {
          if (child.children && child.children.length > 0) {
            const res = this.doget(name, child.children);
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
}
