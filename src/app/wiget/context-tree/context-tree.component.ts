import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef, ViewChild} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-context-tree',
  templateUrl: './context-tree.component.html'
})
export class ContextTreeComponent extends BaseComponent implements OnInit {

  @Input() treeData;

  datas: any[];

  selectedData: any;

  items: any[];

  displayDialog = false;

  smartDs: any = {};

  nextNode: any = {};

  @ViewChild('cm', {read: ViewContainerRef}) contextMenu: ViewContainerRef;

  addData(data) {
    if (data.sign === 'data' && data.data && data.data.type !== 'List') {
      return;
    }
    this.nextNode.sign = 'data';
    this.displayDialog = true;
  }

  addFolder(data) {
    if (data.sign === 'data') {
      return;
    }
    this.nextNode.sign = 'folder';
    this.nextNode.cannotBind = true;
    this.displayDialog = true;
  }

  doClickFinish() {
    if (!this.selectedData.children) {
      this.selectedData.children = [];
    }

    const node: any = {};
    node.label = this.smartDs.name || '';
    node.path = this.selectedData.path + '.' + this.smartDs.name;
    node.data = {};
    node.data.name = this.smartDs.name || '';
    node.data.type = this.smartDs.type || '';
    node.data.validateFunc = this.smartDs.validateFunc || '';
    node.data.calculateFunc = this.smartDs.calculateFunc || '';
    node.sign = this.nextNode.sign || '';
    node.cannotBind = this.nextNode.cannotBind || '';
    this.selectedData.children.push(node);
    this.displayDialog = false;

    this.constantService.putData(this.subKey.smartDsChange, this.datas);
    this.subjectService.broadcastData(this.subKey.smartDsChange, this.datas);
  }

  docloseDialog() {
    this.displayDialog = false;
  }

  nodeSelect(e) {
    this.subjectService.broadcastData(this.subKey.nodeChoose, this.selectedData);
  }

  change(e) {
    if (e) {
      const top = e.originalEvent.target.offsetHeight + e.originalEvent.target.offsetTop + 'px';
      const left = e.originalEvent.target.offsetLeft + 'px';

      this.contextMenu.element.nativeElement.firstElementChild.setAttribute('style', 'top:' + top + ';left:' + left + ';display:block')
    }
  }

  onSubResult(key: string, data: any) {
    if (key === this.subKey.smartDsChange) {
      this.datas = data;
    }
  }

  ngOnInit() {

    this.items = [
      {label: 'Add Node', icon: 'fa-plus', command: (event) => this.addData(this.selectedData)},
      {label: 'Add Folder', icon: 'fa-plus', command: (event) => this.addFolder(this.selectedData)}
    ];
    if (this.treeData && this.treeData.length > 0) {
      this.datas = this.treeData;
    } else {
      this.datas = [
        {
          label: 'NebulogyContext',
          data: {name: 'NebulogyContext'},
          sign: 'folder',
          cannotBind: true,
          path: 'NebulogyContext',
          // expandedIcon: 'fa-folder-open-o',
          // collapsedIcon: 'fa-folder',
          children: [
            {
              cannotBind: true,
              data: {name: 'EmpInfo', type: '', validateFunc: '', calculateFunc: ''},
              label: 'EmpInfo',
              path: 'paiForm.EmpInfo',
              sign: 'folder',
              children: [
                {
                  cannotBind: true,
                  data: {name: 'Emp_Name', type: '', validateFunc: '', calculateFunc: ''},
                  label: 'Emp_Name',
                  path: 'paiForm.Emp_Name',
                  sign: 'data'
                },
                {
                  cannotBind: true,
                  data: {name: 'Emp_AD_Account', type: '', validateFunc: '', calculateFunc: ''},
                  label: 'Emp_AD_Account',
                  path: 'paiForm.Emp_AD_Account',
                  sign: 'data'
                },
                {
                  cannotBind: true,
                  data: {name: 'Emp_AD_Mail_Address', type: '', validateFunc: '', calculateFunc: ''},
                  label: 'Emp_AD_Mail_Address',
                  path: 'paiForm.Emp_AD_Mail_Address',
                  sign: 'data'
                },
                {
                  cannotBind: true,
                  data: {name: 'Emp_Code', type: '', validateFunc: '', calculateFunc: ''},
                  label: 'Emp_Code',
                  path: 'paiForm.Emp_Code',
                  sign: 'data'
                },
                {
                  cannotBind: true,
                  data: {name: 'Emp_Id', type: '', validateFunc: '', calculateFunc: ''},
                  label: 'Emp_Id',
                  path: 'paiForm.Emp_Id',
                  sign: 'data'
                },
                {
                  cannotBind: true,
                  data: {name: 'Emp_Gender', type: '', validateFunc: '', calculateFunc: ''},
                  label: 'Emp_Gender',
                  path: 'paiForm.Emp_Gender',
                  sign: 'data'
                },
                {
                  cannotBind: true,
                  data: {name: 'Emp_TelPhone', type: '', validateFunc: '', calculateFunc: ''},
                  label: 'Emp_TelPhone',
                  path: 'paiForm.Emp_TelPhone',
                  sign: 'data'
                },
                {
                  cannotBind: true,
                  data: {name: 'Org_Name', type: '', validateFunc: '', calculateFunc: ''},
                  label: 'Org_Name',
                  path: 'paiForm.Org_Name',
                  sign: 'data'
                },
                {
                  cannotBind: true,
                  data: {name: 'Org_Code', type: '', validateFunc: '', calculateFunc: ''},
                  label: 'Org_Code',
                  path: 'paiForm.Org_Code',
                  sign: 'data'
                }
              ]
            },
            {
              cannotBind: true,
              data: {name: 'Global_Variable', type: '', validateFunc: '', calculateFunc: ''},
              label: 'Global_Variable',
              path: 'paiForm.Global_Variable',
              sign: 'folder',
            }
          ]
        }
      ];
    }
  }
}
