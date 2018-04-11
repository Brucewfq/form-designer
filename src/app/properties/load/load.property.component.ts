import {Component, EventEmitter, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-load-property',
  templateUrl: './load.property.component.html',
  styles: [`
    .headerMsg {
      font-size: 16px;
      display: inline-block;
      margin-top: 2px
    }

    .ui-widget-header > input {
      height: 30px;
    }

    .boxer {
      width: 100%;
      height: 360px;
      overflow: auto;
    }

    .warning {
      margin-left: 15px;
      font-size: 12px;
      color: red
    }
  `]
})

export class LoadPropertyComponent extends BaseComponent implements OnInit {
  @Output() doFinish = new EventEmitter();

  @Output() changeFormMsg = new EventEmitter();

  @Output() onAddNewVersion = new EventEmitter();

  formList: any[] = [];

  formDatas = [
    {
      label: 'project',
      data: {name: 'project'},
      children: [
        {
          label: 'default',
          data: {name: 'default'},
          id: '',
          sign: 'folder',
          children: []
        }
      ]
    }
  ];

  selectedVersion: any;

  selectedForm: any;

  items: any[] = [];

  displayDialog: Boolean = false;

  project = {
    name: '',
    description: ''
  };

  displayMultilingual: Boolean = false;

  top: Number;

  @ViewChild('cm', {read: ViewContainerRef}) contextMenu: ViewContainerRef;

  showMultilingual(event) {
    this.top = event.srcElement.offsetTop - 200;
    this.displayMultilingual = true;
  }

  closeMultilingual() {
    this.displayMultilingual = false;
  }

  clickFinish(e) {
    if (this.selectedVersion) {
      if (this.targetBuilderTools[0] && this.targetBuilderTools[0].children && this.targetBuilderTools[0].children.length > 0) {
        const that = this;
        this.doConfirm('当前表单不为空，是否覆盖当前表单', function () {
          that.getData(0);
        }, function () {
        });
      } else {
        this.getData(0);
      }
    } else {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
        severity: 'error',
        summary: '请选择一个版本',
        detail: ''
      });
    }
  }

  getData(isOver) {
    // 获取选定编辑的版本信息
    this.httpService.getData('base-rest/api/formDesigner/toEdit', {
      'formDesignerId': this.selectedVersion.formDesignerId,
      'formDesignerInfoId': this.selectedVersion.id,
      'isOver': isOver
    }).then((res) => {
      this.loadForm(res);
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

  loadForm(res) {
    // 当validate=1时  弹出确认框，用户点击确认后，再次请求，并修改参数isOver=1;
    if (res.validate === 1) {
      const that = this;
      this.doConfirm('之前已有其他版本正在编辑中，是否覆盖之前编辑的临时数据', function () {
        that.getData(1);
      })
    } else if (res.validate === 0) {
      const {curVer, formName, id, formDesc, route, projectId, category} = res.masterDTO;
      console.log(res);
      if (res.subDTO.dataJsons) {
        this.constantService.putData(this.constantService.subKey.smartDsChange, res.subDTO.dataJsons);
        this.subjectService.broadcastData(this.constantService.subKey.smartDsChange, res.subDTO.dataJsons);
      } else {
        this.constantService.putData(this.constantService.subKey.smartDsChange, []);
        this.subjectService.broadcastData(this.constantService.subKey.smartDsChange, []);
      }

      if (res.subDTO.serviceJsons) {
        this.constantService.putData(this.constantService.subKey.serviceChange, res.subDTO.serviceJsons);
        this.subjectService.broadcastData(this.constantService.subKey.serviceChange, res.subDTO.serviceJsons);
      } else {
        this.constantService.putData(this.constantService.subKey.serviceChange, []);
        this.subjectService.broadcastData(this.constantService.subKey.serviceChange, []);
      }
      // load 当前选中表单默认选中整个表单属性
      this.subjectService.broadcastData(this.subKey.LOAD_FORM_SUCCESS, res.subDTO);

      // TODO initJsons的通知
      this.onAddNewVersion.emit(res.subDTO.compJsons);
      this.changeFormMsg.emit(
        [
          {key: 'formName', value: formName},
          {key: 'formVersion', value: curVer},
          {key: 'verDesc', value: res.subDTO.verDesc},
          {key: 'formDesc', value: formDesc},
          {key: 'mainId', value: id},
          {key: 'subId', value: res.subDTO.id},
          {key: 'route', value: route},
          {key: 'projectId', value: projectId},
          {key: 'category', value: category}
        ]
      );
    }
  }

  onFromSelect() {

    if (this.selectedForm && this.selectedForm.sign === 'folder') {
      this.getFormListData(this.selectedForm);
    } else if (this.selectedForm && this.selectedForm.sign === 'data') {
      this.selectedForm.infos.sort(this.sortBy('ver', true));
      this.formList = this.selectedForm.infos;
    } else {
      this.formList = [];
    }
  }

  /**
   * @param attr 用来比较的属性
   * @param isRev 是否升序
   * @returns {(a, b) => number}
   */
  sortBy(attr: string, isRev: Boolean) {
    let rev;
    if (isRev === undefined) {
      rev = 1;
    } else {
      rev = (isRev) ? 1 : -1;
    }

    return function (a, b) {
      a = a[attr];
      b = b[attr];
      if (a < b) {
        return rev * -1;
      }
      if (a > b) {
        return rev * 1;
      }
      return 0;
    }
  }

  getFormList(data, selectedForm) {
    selectedForm.children = [];

    for (let i = 0; i < data.length; i++) {
      selectedForm.children.push({
        label: data[i].formName,
        infos: data[i].infos,
        sign: 'data'
      });
    }
    // 展开树
    this.expandAll([selectedForm]);
  }

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

  doCloseDialog() {
    this.closeDialog.emit();
  }

  change(e): void {
    this.items = [
      {label: 'new project', icon: 'fa-plus', command: (event) => this.createNewItem()},
      {label: 'new form', icon: 'fa-plus', command: (event) => this.createNewForm()},
    ];

    if (e) {
      const top = e.originalEvent.target.offsetHeight + e.originalEvent.target.offsetTop + 'px';
      const left = e.originalEvent.target.offsetLeft + 'px';

      this.contextMenu.element.nativeElement.firstElementChild.setAttribute('style', 'top:' + top + ';left:' + left + ';display:block')
    }
  }

  createNewItem() {
    this.displayDialog = true;
  }

  createNewForm() {
    // 弹出新建表单界面
    this.showDialog.emit({inputType: 'new-form', name: 'new-form'});
  }

  doClickFinish() {
    // 保存新建项目到服务端
    this.httpService.getData('object/api/last/dictItemObj', {
      'code': 'string',
      'name': {
        en: '',
        zh_CN: this.project.name
      },
      'description': {
        en: '',
        zh_CN: this.project.description
      },
      'pId': '26577a86-b61b-4e36-9ee7-519042939974'
    }).then(
      (res) => {
        // 保存成功后，重新查询数据；
        if (res.responseCode === '100') {
          this.getFormProject();
        }
      }
    ).catch((err) => {
      this.errorHandle(err);
    });
    this.displayDialog = false;
  }

  // 获取指定项目下的所有表单
  getFormListData(selectedForm) {
    // 获取版本list
    this.httpService.getData(
      'base-rest/api/formDesigner/loadBypage?orderBy=createdDate desc',
      {projectId: selectedForm.id}
    ).then((res) => {
      if (res.commonDesignerList && res.commonDesignerList.length > 0) {
        this.getFormList(res.commonDesignerList, selectedForm);
      }
    }).catch((err) => {
      this.errorHandle(err);
    });
  }

  errorHandle(err) {
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
  }

  getFormProject() {
    this.getFormItems(
      {pId: '26577a86-b61b-4e36-9ee7-519042939974'},
      (res) => {
        if (res && res.responseCode === '100' && res.dictItemObjList && res.dictItemObjList.length > 0) {
          for (let i = 0; i < res.dictItemObjList.length; i++) {
            this.formDatas[0].children.push(
              {
                label: res.dictItemObjList[i].name.zh_CN,
                data: {name: res.dictItemObjList[i].name.zh_CN},
                id: res.dictItemObjList[i].id,
                sign: 'folder',
                children: []
              }
            )
          }
          this.expandAll(this.formDatas);
        } else {
          const messages = [];
          for (let i = 0; i < res.messageList.length; i++) {
            messages.push({
              severity: 'error',
              summary: res.messageList[i].message,
              detail: '',
              id: ''
            })
          }
          this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, messages);
        }
      },
      (err) => {
        this.errorHandle(err);
      }
    )
  }

  ngOnInit() {
    this.getFormProject();
    // this.getFormListData(this.formDatas[0]);
  }
}
