import {
  Component, Input, OnInit, AfterViewInit, OnDestroy, ElementRef, Renderer, ViewChild, ViewContainerRef, ComponentRef,
  Compiler, ComponentFactory, NgModule, ComponentFactoryResolver
} from '@angular/core';
// 新增检测
import {AppModelService} from './app.model';

import {Observable} from 'rxjs/Rx';
import {trigger, state, style, transition, animate, keyframes} from '@angular/animations';
import {Location} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {MenuItem, Message} from 'primeng/primeng';
import {ConfirmationService} from 'primeng/primeng';
import {BlocklyComponent} from './blockly/blockly.component';
import {TextboxPropertyComponent} from './properties/textbox/textbox.property.component';
import {NumberPropertyComponent} from './properties/number/number.property.component';
import {CheckboxPropertyComponent} from './properties/checkbox/checkbox.property.component';
import {DropdownPropertyComponent} from './properties/dropdown/dropdown.property.component';
import {LabelPropertyComponent} from './properties/label/label.property.component';
import {ChooseObjectComponent} from './wiget/choose-object/choose-object.component';
import {DatePropertyComponent} from './properties/date/date.property.component';
import {RadioPropertyComponent} from './properties/radio/radio.property.component';
import {TextareaPropertyComponent} from './properties/textarea/textarea.property.component';
import {SectionPropertyComponent} from './properties/section/section.property.component';
import {ToolbarPropertyComponent} from './properties/toolbar/toolbar.property.component';
import {ButtonPropertyComponent} from './properties/button/button.property.component';
import {SubmitPropertyComponent} from './properties/submit/submit.property.component';
import {LoadPropertyComponent} from './properties/load/load.property.component';
import {ImagePropertyComponent} from './properties/image/image.property.component';
import {DataGridPropertyComponent} from './properties/data-grid/data-grid.property.component';
import {BindObjectViewsComponent} from './views/bindobject/bindobject.views.component';
import {NewPropertyComponent} from './properties/new/new.property.component';
import {DeployViewComponent} from './views/deploy/deploy.view.component';
import {SaveTemplateViewComponent} from './views/save-template/save-template.view.component';
import {DataSourceOptionsComponent} from './properties/data-source-options/data-source-options.component';
import {TabPropertyComponent} from './properties/tab/tab.property.component';
import {TabItemPropertyComponent} from './properties/tab/tab-item/tab-item.property.component';
import {FilePropertyComponent} from './properties/file/file.property.component';
import {FileSettingPropertyComponent} from './properties/file/setting/file.setting.property.component';
import {FromPropertyComponent} from './properties/form/form.property.component';
import {WindowPropertyComponent} from './properties/window/window.property.component';
import {EmptyPropertyComponent} from './properties/empty/empty.property.component';
import {NameService} from './service/name.service';
import {ConstantService} from './service/constantService';
import {SubjectService} from './service/subject.service';
import {Subscription} from 'rxjs/Subscription';
import {BlocklyJsComponent} from './blockly/blocklyJs.component';
import {ViewModeComponent} from './wiget/view-mode/view-mode.component';
import {ValidateService} from './service/validate.service';
import {BlocklyFactoryComponent} from './blockly/blocklyFactory.component';
import {ChooseboxPropertyComponent} from './properties/choosebox/choosebox.property.component';
import {SaveAsViewComponent} from './views/save-as/save-as.view.component';
import {SaveViewComponent} from './views/save/save.view.component';

import {ScriptLoaderService} from './util/script-loader.service';

import {HttpService} from './service/http.service';
import {NewFormViewComponent} from './views/new-form/new-form.view.component';

declare var jQuery: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AppModelService],
  animations: [
    trigger('fade', [
      state('in', style({transform: 'translateX(0)'})), // 默认平移0
      state('out', style({transform: 'translateX(100%)'})), // 默认平移0

      transition('in => out', animate('300ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('out => in', animate('300ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  componentRef: ComponentRef<any>;
  @ViewChild('compContainer', {read: ViewContainerRef}) container: ViewContainerRef;
  @ViewChild('blocklyContainer', {read: ViewContainerRef}) blocklyContainer: ViewContainerRef;
  compMaps: { [key: string]: any } = {
    'textbox': TextboxPropertyComponent,
    'number': NumberPropertyComponent,
    'checkbox': CheckboxPropertyComponent,
    'dropdown': DropdownPropertyComponent,
    'label': LabelPropertyComponent,
    'datetime': DatePropertyComponent,
    'radio': RadioPropertyComponent,
    'section': SectionPropertyComponent,
    'toolbar': ToolbarPropertyComponent,
    'section-cols': SectionPropertyComponent,
    'tab': TabPropertyComponent,
    'tabitem': TabItemPropertyComponent,
    'file': FilePropertyComponent,
    'fileSetting': FileSettingPropertyComponent,
    'app-choose-object': ChooseObjectComponent,
    'app-blockly-bak': BlocklyComponent,
    'app-blockly': BlocklyJsComponent,
    'textarea': TextareaPropertyComponent,
    'button': ButtonPropertyComponent,
    'submit': SubmitPropertyComponent,
    'load': LoadPropertyComponent,
    'image': ImagePropertyComponent,
    'data-grid': DataGridPropertyComponent,
    'new': NewPropertyComponent,
    'bindObject': BindObjectViewsComponent,
    'deploy': DeployViewComponent,
    'save-template': SaveTemplateViewComponent,
    'form': FromPropertyComponent,
    'window': WindowPropertyComponent,
    'options': DataSourceOptionsComponent,
    'empty': EmptyPropertyComponent,
    'view-mode': ViewModeComponent,
    'app-factory': BlocklyFactoryComponent,
    'choosebox': ChooseboxPropertyComponent,
    'save-as': SaveAsViewComponent,
    'new-form': NewFormViewComponent,
    'save': SaveViewComponent
  };

  menuClick: boolean;

  menuButtonClick: boolean;

  topbarMenuButtonClick: boolean;

  topbarMenuClick: boolean;

  topbarMenuActive: boolean;

  activeTopbarItem: Element;

  layoutStatic: boolean = true;

  sidebarActive: boolean;

  mobileMenuActive: boolean;

  darkMenu: boolean;

  app: any = this;

  subscription: Subscription;

  @Input() reset: boolean;

  model: any[];
  modelType: string;

  // 表单视图模式下拉内容和选中的模式
  selectedViewMode: any;
  viewModeOfForm: any[] = [];

  // 表单信息
  formHostMsg: any = {
    formName: '',
    formVersion: '',
    formDesc: {
      zh_CN: '',
      en: ''
    },
    verDesc: {
      zh_CN: '',
      en: ''
    },
    mainId: '',
    subId: '',
    route: ''
  };

  mainId: any;  // 主表id
  subId: any;   // 子表Id

  smartDs: any = [];
  serviceData: any = [];

  formRoute: any;
  formDesc: any;
  formVerDesc: any;

  // 显示控件属性框
  displayComponentProperty: Boolean = false;
  display = false;
  displayLogin: Boolean = false;

  section: any;

  layoutMenuScroller: HTMLDivElement;

  /*新增全局状态保持*/
  pullData: any[] = [];

  pullCopyTemp: any = {};

  pullCopyModel: any = {};

  pullIndex: number = 0;

  targetBuilderTools: any[] = [];
  currentSelectView: string = '';

  // 右侧service-tree数据
  serviceTreeSource: any[] = [];

  bindsource: any[] = [];

  // 表单对象
  initForm: any = {
    'name': 'form',
    'children': [],
    'inputType': 'form',
    'icon': 'form',
    'class': 'wide',
    'attr': {
      'visible': {},
      'readOnly': {}
    }
  };

  // window对象
  initWindow: any = {
    'name': 'window',
    'children': [],
    'inputType': 'window',
    'icon': 'window',
    'class': 'wide',
    'attr': {
      'visible': {},
      'readOnly': {}
    }
  };

  // 表单事件初始化字段
  initFormScript: any;

  msgs: Message[] = [];

  growlMsgs: Message[] = [];

  // user info
  password: any;
  username: any;

  //
  sidebarItems = [
    {label: 'Toolbox', icon: ''},
    {label: 'Setting', icon: ''}
  ];

  activeItem: any;

  requestDTO: any;

  @ViewChild('layoutMenuScroller') layoutMenuScrollerViewChild: ElementRef;

  constructor(public renderer: Renderer,
              private resolver: ComponentFactoryResolver,
              private appModelService: AppModelService,
              private nameService: NameService,
              private constantService: ConstantService,
              private subjectService: SubjectService,
              private httpService: HttpService,
              private validateService: ValidateService,
              private  scriptLoaderService: ScriptLoaderService,
              private confirmationService: ConfirmationService) {
  };

  ngOnInit() {
    // 注册订阅事件
    this.registerSubject(this.constantService.subKey.smartDsChange);
    this.registerSubject(this.constantService.subKey.serviceChange);
    this.registerSubject(this.constantService.subKey.VIEW_MODE_CHANGE);
    this.registerSubject(this.constantService.subKey.INSPECTOR_NODE_SELECTED);
    this.registerSubject(this.constantService.subKey.LOAD_FORM_SUCCESS);
    this.registerSubject(this.constantService.subKey.ALERT_MESSAGE);
    this.registerSubject(this.constantService.subKey.SHOW_LOGIN);
    this.registerSubject(this.constantService.subKey.NEW_FORM);
    this.registerSubject(this.constantService.subKey.SAVE_DATA);
    this.registerSubject(this.constantService.subKey.SAVE);
    this.registerSubject(this.constantService.subKey.CLEAR_FORM);
    this.registerSubject(this.constantService.subKey.SAVE_TO_LOCAL_STORAGE);

    // 获取左侧菜单数据
    this.model = this.appModelService.getModel();

    // 默认包裹一层form控件
    this.targetBuilderTools = [jQuery.extend(true, {}, this.initForm)];
    this.serviceTreeSource = [jQuery.extend(true, {}, this.initForm)];

    // 初始赋值当前窗口
    this.currentSelectView = this.initForm.name;

    this.bindsource = [{
      onlyRoot: true,
      children: [],
      class: 'wide',
      data: '',
      icon: 'section',
      inputType: 'section-cols',
      name: 'section-col'
    }];
    // 初始化表单基本信息，表单名、版本号、视图模式
    this.initFormViewModel({});
    this.getComponentTemplate();
    // 左边的sidebar 默认选中toolbox
    this.activeItem = this.sidebarItems[0];

    // 刚进入页面时，检查localStorage中是否有异常未保存的表单数据，如果有提醒用户是否恢复之前的数据
    const formData = JSON.parse(window.localStorage.getItem(this.constantService.FORM_DATA));
    if (formData) {
      const that = this;
      this.doConfirm('是否恢复之前的数据', function () {
        that.reload(formData);
      }, function () {
        that.clearLocalStorage();
      });
    }
  }

  // 获取当前操作的 form 或 window
  selectCurrentView(data) {
    const whiteList = ['form', 'window'];
    const nameArr = [];
    let temp = data;
    while (temp) {
      nameArr.push(temp.name);
      temp = temp.parent;
    }
    this.currentSelectView = nameArr.pop();
  }

  // 获取表单模板数据
  getComponentTemplate(target?: any) {
    const that = target ? target : this;
    if (!that.constantService.getDataByKey(that.constantService.subKey.GET_TEMPLATE)) {
      that.constantService.putData(that.constantService.subKey.GET_TEMPLATE, that.getComponentTemplate);
      that.constantService.setCurRequestCode(that.constantService.subKey.GET_TEMPLATE);
    }

    that.httpService.getData('base-rest/api/formTemplate/specificWithPage', {}).then((res) => {
      if (res.responseCode === '100') {
        const privateFormTemplateList = [];
        const commonFormTemplateList = [];
        for (let i = 0; i < res.formTemplateList.length; i++) {
          const tempModel = res.formTemplateList[i].templateCode;

          if (res.formTemplateList[i].lev === 1) {
            privateFormTemplateList.push(tempModel);
          } else if (res.formTemplateList[i].lev === 0) {
            commonFormTemplateList.push(tempModel);
          }
        }

        that.model.push({
          label: 'PrivateTemplate',
          icon: 'settings',
          badge: privateFormTemplateList.length,
          items: privateFormTemplateList
        });

        that.model.push({
          label: 'CommonTemplate',
          icon: 'settings',
          badge: commonFormTemplateList.length,
          items: commonFormTemplateList
        });
      } else {
        if (res.messageList && res.messageList.length > 0) {
          that.subjectService.broadcastData(that.constantService.subKey.SHOW_MESSAGE, {
            severity: 'error',
            summary: res.messageList[0].message,
            detail: '',
            id: ''
          });
        }
      }
    }).catch((err) => {
    })
  }

  setServiceData(data: any) {
    this.serviceData = [];
    this.doSelf(this.serviceData, data);
  }

  setSmartDs(data: any) {
    this.smartDs = [];
    this.doSelf(this.smartDs, data);
  }

  doSelf(arr, ds) {
    for (let i = 0; i < ds.length; i++) {
      const d: any = {};
      d.label = ds[i].label;
      d.path = ds[i].path;
      d.sign = ds[i].sign;
      d.data = ds[i].data;
      if (ds[i].children && ds[i].children.length > 0) {
        d.children = [];
        this.doSelf(d.children, ds[i].children);
      }
      arr.push(d);
    }
  }

  // 弹出框公用方法
  showDialog(model) {
    const str = model.inputType;

    this.display = true;
    this.blocklyContainer.clear();
    this.modelType = str;

    if (this.compMaps[str]) {
      const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(this.compMaps[str]);
      this.componentRef = this.blocklyContainer.createComponent(factory);
      this.setInputOutput(model.name);
      if (model.key) {
        this.componentRef.instance.eventName = model.key;
        const modelData = this.getDataBy(model.name);

        this.modelType = modelData.attr.name ? modelData.attr.name : modelData.name + '_' + model.key;
      }
    }
  }

  // 弹出右侧属性框
  showComponentProperty(model) {
    const str = model.inputType;
    this.displayComponentProperty = true;
    this.container.clear();
    if (this.compMaps[str]) {
      const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(this.compMaps[str]);
      this.componentRef = this.container.createComponent(factory);
      this.setInputOutput(model.name);
    }
  }

  // 保存时修改表单名称
  changeFormMsg(list) {
    list.forEach((res) => this.formHostMsg[res.key] = res.value);
  }

  setInputOutput(str) {
    if (str) {
      this.componentRef.instance.dataModel = this.getDataBy(str);
      this.componentRef.instance.dataName = str;
      this.componentRef.instance.dataMenuModel = this.model;
    }
    this.componentRef.instance.comps = this.targetBuilderTools;

    this.componentRef.instance.formHostMsg = this.formHostMsg;
    this.componentRef.instance.bindSource = this.bindsource;
    this.componentRef.instance.targetBuilderTools = this.targetBuilderTools;
    this.componentRef.instance.initFormScript = this.initFormScript;
    this.componentRef.instance.pullCopyTemp = this.pullCopyTemp;
    this.componentRef.instance.viewModeList = this.viewModeOfForm;
    this.componentRef.instance.currentSelectView = this.currentSelectView;

    // 注册动态组建的执行根组建事件名称
    const eventList: string[] = [
      'doFinish',
      'editData',
      'showDialog',
      'getCurrentObject',
      'changeCurrentObject',
      'getAllBindSource',
      'closeDialog',
      'getPullMessage',
      'getCurrDataBy',
      'changeFormMsg',
      'onAddNewVersion',
      'onNewVersionListener'
    ];

    // 注册动态组建的执行根组建的方法
    for (let i = 0; i < eventList.length; i++) {
      const event = eventList[i];
      if (this.componentRef.instance[event]) {
        this.componentRef.instance[event].subscribe((res: any) => this[event](res));
      }
    }
  }

  doFinish(res) {
    if (res) {
      this.targetBuilderTools = res;
      // 调用服务进行设置值
      this.nameService.setNamesMap(this.targetBuilderTools);
      this.onNewVersionListener();
    }
    this.closeDialog();
  }

  editData(res) {
    if (res && (res.attr || res.scripts)) {
      const data: any = this.getDataBy(res.dataName);
      if (data) {
        if (res.attr) {
          data.attr = res.attr;
        }
        if (res.scripts) {
          data.scripts = res.scripts;
        }
        if (res.attr && res.attr.name) {
          this.nameService.updateNameMap(data.inputType, res.attr.name);
        }
      }

      if (res.dataName === 'form') {
        this.initFormScript = res.scripts;
      }
    }
  }

  closeDialog() {
    this.display = false;
    this.displayComponentProperty = false;

    const blocklyWidgetDiv = document.getElementsByClassName('blocklyWidgetDiv');
    const blocklyTooltipDiv = document.getElementsByClassName('blocklyTooltipDiv');
    if (blocklyWidgetDiv && blocklyWidgetDiv.length > 0) {
      for (let i = 0; i < blocklyWidgetDiv.length; i++) {
        blocklyWidgetDiv[i].setAttribute('style', 'display: none;');
      }
    }
    if (blocklyTooltipDiv && blocklyTooltipDiv.length > 0) {
      for (let i = 0; i < blocklyTooltipDiv.length; i++) {
        blocklyTooltipDiv[i].setAttribute('style', 'display: none;');
      }
    }
  }

  // 发布 或 点击预览时调用
  getPullMessage(res: any) {
    res.mainId = this.formHostMsg.mainId;
    res.subId = this.formHostMsg.subId;
    res.verDesc = this.formHostMsg.verDesc;
    res.formDesc = this.formHostMsg.formDesc;
    res.compJsons = this.targetBuilderTools;
    res.dataJsons = this.smartDs;
    res.serviceJsons = this.serviceData;
    res.viewModels = this.viewModeOfForm.slice(1);

    res.project = this.formHostMsg.project;
    res.category = this.formHostMsg.category;

    if (this.targetBuilderTools[0].scripts) {
      res.initJsons = {
        [this.selectedViewMode]: {
          init: this.targetBuilderTools[0].scripts
        }
      }
    }
    return res;
  }

  getCurrDataBy(res: any) {
    res.data = this.getDataBy(res.name);
  }

  // 返回指定组建
  getDataBy(name: string) {
    return this.doget(name, this.targetBuilderTools);
  }

  // 获取指定组件
  doget(name: string, datas: any[]) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        const child = datas[i];
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

  builderDrag(e: any) {
    const item = e.value;
    item.data = item.inputType === 'number' ? (Math.random() * 100) | 0 :
      Math.random().toString(36).substring(20);
  }

  log(e: any) {
    console.log(e.type, e);
  }

  onWrapperClick() {
    if (!this.menuClick && !this.menuButtonClick) {
      this.mobileMenuActive = false;
    }

    if (!this.topbarMenuClick && !this.topbarMenuButtonClick) {
      this.topbarMenuActive = false;
      this.activeTopbarItem = null;
    }

    this.menuClick = false;
    this.menuButtonClick = false;
    this.topbarMenuClick = false;
    this.topbarMenuButtonClick = false;
  }

  onMenuButtonClick(event: Event) {
    this.menuButtonClick = true;

    if (this.isMobile()) {
      this.mobileMenuActive = !this.mobileMenuActive;
    }

    event.preventDefault();
  }

  onTopbarMobileMenuButtonClick(event: Event) {
    this.topbarMenuButtonClick = true;
    this.topbarMenuActive = !this.topbarMenuActive;
    event.preventDefault();
  }

  // 成功新增控件版本号++
  onLeftMenuDrop() {
    this.onAddNewVersion(this.targetBuilderTools);
  }

  // 新增版本
  onAddNewVersion(res) {
    const len = this.pullData.length;
    const temp = jQuery.extend(true, [], res);
    this.pullData.splice(this.pullIndex + 1, len, temp);
    this.pullIndex = this.pullData.length - 1;
    this.onNewVersionListener();
  }

  // 通知右侧树形控件
  onNewVersionListener() {
    this.subjectService.broadcastData(this.constantService.subKey.FORM_DATA_CHANGE_EVENT_KEY, this.targetBuilderTools);
  }

  // main-panel中调用
  onRegretBindSource() {
    this.onTopbarUndoClick('');
    this.pullData.pop();
  }

  // 撤销操作
  onTopbarUndoClick(type: String) {
    if (this.pullIndex > 0) {
      const pre = this.pullData[this.pullIndex];
      const current = this.pullData[--this.pullIndex];
      this.targetBuilderTools = current;

      // 比较前一版本与当前版本长度
      if (pre.length > current.length) {
        const preIndex = pre.findIndex((res) => res.name === this.currentSelectView);
        this.currentSelectView = pre[preIndex - 1].name;
      }
    } else {
      const initForm = jQuery.extend(true, {}, this.initForm);
      this.targetBuilderTools = [initForm];
      this.pullIndex = -1;
      this.currentSelectView = initForm.name;
    }
  }

  // 重写操作
  onTopbarRedoClick(type: String) {
    if (this.pullIndex < this.pullData.length - 1) {
      this.targetBuilderTools = this.pullData[++this.pullIndex];
    } else {
    }
  }

  // 点击main-panel中的控件保存当前model
  onPerpareCopy(model: any) {
    this.pullCopyTemp = model;
  }

  // 执行copy操作
  onTopbarCopyClick(type: String) {
    this.pullCopyModel = jQuery.extend(true, {}, this.pullCopyTemp);
  }

  // 执行粘贴操作
  onTopbarPasteClick(type: String) {
    const blackList = ['section', 'section-col-2', 'section-col-3', 'section-col-4', 'data-grid', 'tab', 'file'];
    const canNotPaste = ['form', 'window', 'tabitem'];

    const isEmpty = !this.isEmptyObj(this.pullCopyModel);
    const isCanPaste = !canNotPaste.includes(this.pullCopyModel.inputType);
    const isSubsection = this.pullCopyModel.isSubSection; // 是否是子section

    if (isEmpty && isCanPaste && !isSubsection) {
      const isInBlackList = blackList.findIndex((res) => this.pullCopyModel.name.startsWith(res)) > -1;
      const temp = this.filterParent(this.pullCopyModel);
      const tamp = '_' + new Date().getTime();
      temp.name = temp.name.split('_')[0] + tamp;

      const currentViewIndex = this.targetBuilderTools.findIndex((res) => res.name === this.currentSelectView);
      const container = this.targetBuilderTools[currentViewIndex];
      // 黑名单中元素必须有section包裹
      if (!isInBlackList) {
        const section = jQuery.extend(true, {}, this.initForm);
        temp.attr.name = this.nameService.getNames(temp.inputType);
        section.name = 'section' + tamp;
        section.inputType = 'section';
        section.icon = 'section';
        section.attr.name = this.nameService.getNames(section.inputType);
        section.children = [temp];
        container.children.push(section);
      } else {
        // 递归修改name, 已经attrName
        const modifyName = (node: any) => {
          if (!node) {
            return;
          }
          const name = node.name.split('_')[0];
          const tamp = new Date().getTime().toString().substring(0, 10);
          const rand = Math.ceil(Math.random() * 999);
          node.name = name + tamp + rand;
          node.attr.name = this.nameService.getNames(node.inputType);

          if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
              modifyName(node.children[i]);
            }
          }
        };
        modifyName(temp);
        container.children.push(temp);
      }

      this.onLeftMenuDrop();
    }
  }

  // 过滤所有元素内的bindPath
  filterBindPath(node: any) {
    if (!node) {
      return;
    }

    if (node.attr.bindPath) {
      node.attr.bindPath = '';
    }

    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        this.filterBindPath(node.children[i]);
      }
    }
  }

  // 深拷贝对象 过滤parent
  filterParent(val: any) {
    const cache = [];
    const jsonStr = JSON.stringify(val, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    return JSON.parse(jsonStr);
  }

  createTimeTamp(top: number = 999) {
    const time = new Date().getTime().toString();
    const random = Math.ceil(Math.random() * top);
    return time.substring(0, 7) + random;
  }

  // 新增一个window
  createNewWindow() {
    const initForm = jQuery.extend(true, {}, this.initWindow);
    const nameId = initForm.inputType + '_' + this.createTimeTamp();
    initForm.name = nameId;
    initForm.attr.name = this.nameService.getNames('window');

    // 当前的显示其他的隐藏
    initForm.attr.visible[this.selectedViewMode] = true;
    this.currentSelectView = nameId;
    this.targetBuilderTools.push(initForm);
    for (let i = 0; i < this.targetBuilderTools.length; i++) {

      const temp = this.targetBuilderTools[i];
      if (initForm.name !== temp.name) {
        temp.attr.visible[this.selectedViewMode] = false;
      }
    }
    this.showComponentProperty(initForm);
    this.onLeftMenuDrop();
    //
    this.subjectService.broadcastData(this.constantService.subKey.ADD_WINDOW, initForm);
  }

  // 顶部控件事件分发
  onTopbarRootItemClick(event: Event, item: Element, type: String) {
    this.activeTopbarItem = this.activeTopbarItem === item ? null : item;

    switch (type) {
      case 'window':
        this.createNewWindow();
        break;
      case 'undo':
        this.onTopbarUndoClick(type);
        this.onNewVersionListener();
        break;
      case 'redo':
        this.onTopbarRedoClick(type);
        this.onNewVersionListener();
        break;
      case 'copy':
        this.onTopbarCopyClick(type);
        break;
      case 'paste':
        this.onTopbarPasteClick(type);
        break;
      case 'save':
        this.targetBuilderTools = this.scriptLoaderService.changeXmlToJs(this.targetBuilderTools);
        this.beforeSaveDraft(() => {
          if (!this.formHostMsg.projectId || !this.formHostMsg.category) {
            this.showDialog({inputType: 'save', name: 'save'});

            return
          } else {
            this.subjectService.broadcastData(this.constantService.subKey.SAVE, this.formHostMsg);
          }
        });
        break;
      case 'save-as':
        this.targetBuilderTools = this.scriptLoaderService.changeXmlToJs(this.targetBuilderTools);
        this.beforeSaveDraft((data) => {
          this.showDialog({inputType: 'save-as', name: 'saveAs'});
        });
        break;
      case 'save-template':
        this.showDialog({inputType: 'save-template', name: this.targetBuilderTools[0].name});
        break;
      case 'load':
        this.currentSelectView = this.initForm.name;
        this.showDialog({inputType: 'load'});
        break;
      case 'deploy':
        this.targetBuilderTools = this.scriptLoaderService.changeXmlToJs(this.targetBuilderTools);
        this.beforeSaveDraft((data) => {
          this.showDialog({inputType: 'deploy', name: 'deploy'});
        });
        break;
      case 'preview': // 预览
        this.targetBuilderTools = this.scriptLoaderService.changeXmlToJs(this.targetBuilderTools);
        this.beforeSaveDraft(() => {
          this.previewDraft();
        });
        break;
      case 'new': // 新建表单
        this.showDialog({inputType: 'new-form', name: 'new-form'});
        break;
      default:
        console.error('新功能有待添加，敬请稍后');
        break;
    }
    event.preventDefault();
  }

  // 保存表单
  saveDraft(data) {
    const saveType = 0;
    const tamp = new Date().getTime().toString().substring(0, 10);

    let {formName, route} = this.formHostMsg;

    if (formName === '' || !formName) {
      formName = tamp;
      data.formName = formName;
      this.changeFormMsg([{key: 'formName', value: formName}]);
    }

    if (route === '' || !route) {
      route = tamp;
      data.route = route;
      this.changeFormMsg([{key: 'route', value: route}]);
    }

    // 调用保存的公用方法
    const that = this;
    this.saveData({
      type: 'save',
      requestDTO: data,
      saveType: saveType,
      successCallback: function (res) {
        if (res.responseCode !== '100' && (!res.subId || !res.masterId)) {
          const messages = [];
          for (let i = 0; i < res.messageList.length; i++) {
            messages.push({
              severity: 'error',
              summary: res.messageList[i].message,
              detail: '',
              id: ''
            })
          }
          //
          that.subjectService.broadcastData(that.constantService.subKey.SHOW_MESSAGE, messages);
        } else {
          // 提示保存成功
          that.subjectService.broadcastData(that.constantService.subKey.SHOW_MESSAGE, {
            severity: 'success',
            summary: 'draft saved successfully',
            detail: '',
            id: ''
          });

          // 修改表单信息
          that.changeFormMsg([
            {key: 'mainId', value: res.masterId},
            {key: 'subId', value: res.subId}
          ]);
        }
      }
    });
  }

  // 预览表单
  previewDraft() {
    const saveType = 3;
    const callback = (res: any) => {
      const responseCode = res.responseCode;
      const previewUrl = res.previewUrl;
      if (previewUrl && responseCode === '100') {
        const baseUrl = 'http://demo.k2software.com.cn:30009/base-rest/';
        const viewModel = this.selectedViewMode === 'edit' ? 'launch' : this.selectedViewMode;
        const url = baseUrl + previewUrl.replace('${viewName}', viewModel);
        window.open(url);
      } else {
        if (res.messageList && res.messageList.length > 0) {
          this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
            severity: 'error',
            summary: res.messageList[0].message,
            detail: '',
            id: ''
          });
        }
      }
    };
    this.preview(saveType, callback);
  }

  // 执行草稿
  preview(saveType, callback) {
    const tamp = new Date().getTime().toString().substring(0, 10);
    const messageList = this.getPullMessage({});

    const {
      formDesc = {
        zh_CN: 'preview',
        en: 'preview'
      }, verDesc, compJsons, dataJsons, viewModels, initJsons, serviceJsons, mainId, subId
    } = messageList;

    let {formName, route} = this.formHostMsg;

    if (formName === '') {
      formName = tamp;
      this.changeFormMsg([{key: 'formName', value: formName}]);
    }

    if (route === '') {
      route = tamp;
      this.changeFormMsg([{key: 'route', value: route}]);
    }

    // 解析数据
    this.httpService.getData('base-rest/api/formDesigner/save', {
      formName,
      route,
      saveType,
      id: mainId,
      subId: subId,
      compJsons,
      dataJsons,
      viewModels,
      serviceJsons,
      initJsons,
      formDesc,
      verDesc
    }).then((res) => {
      callback(res);
    }).catch((err) => {
      let excute = '';
      switch (saveType) {
        case 0:
          excute = 'save';
          break;
        case 3:
          excute = 'preview';
          break;
        default:
          break;
      }

      this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
        severity: 'error',
        summary: 'draft ' + excute + ' error',
        detail: '',
        id: ''
      });
    })
  }

  onTopbarMenuClick(event: Event) {
    this.topbarMenuClick = true;
  }

  onSidebarClick(event: Event) {
    this.menuClick = true;
  }

  onToggleMenuClick(event: Event) {
    this.layoutStatic = !this.layoutStatic;
  }

  isMobile() {
    return window.innerWidth < 640;
  }

  // 判断json对象是否为空
  isEmptyObj(obj: any) {
    for (const i in obj) {
      return false;
    }
    return true;
  }

  ngAfterViewInit() {
    this.layoutMenuScroller = <HTMLDivElement>this.layoutMenuScrollerViewChild.nativeElement;

    setTimeout(() => {
      jQuery(this.layoutMenuScroller).nanoScroller({flash: true});
    }, 10);
  }

  changeTheme(theme) {
    const themeLink: HTMLLinkElement = <HTMLLinkElement>document.getElementById('theme-css');
    themeLink.href = 'assets/theme/theme-' + theme + '.css';
  }

  changeLayout(theme) {
    const layoutLink: HTMLLinkElement = <HTMLLinkElement>document.getElementById('layout-css');
    layoutLink.href = 'assets/layout/css/layout-' + theme + '.css';
  }

  updateNanoScroll() {
    setTimeout(() => {
      jQuery(this.layoutMenuScroller).nanoScroller();
    }, 500);
  }

  // 初始化表单视图模式
  initFormViewModel(data) {
    this.viewModeOfForm = this.constantService.viewModeOfForm;

    if (data && data.selectedViewMode) {
      this.selectedViewMode = data.selectedViewMode;
    } else {
      this.selectedViewMode = this.constantService.defaultView;
    }
  }

  onSelectView() {
    this.constantService.setSelectedViewMode(this.selectedViewMode);
    this.subjectService.broadcastData(this.constantService.subKey.selectedViewModeKey, this.selectedViewMode);
  }

  // 显示添加视图模式弹框
  showEditViewMode() {
    this.showDialog({inputType: 'view-mode'});
  }

  // 接受事件并处理
  setViewModeList(data: any) {
    this.viewModeOfForm = data;
  }

  // 获取不符合要求的组件并执行一个回调
  beforeSaveDraft(success?: any, error?: any) {
    const data = this.getErrorComponent(this.validateService.dataMap, this.targetBuilderTools);
    if (data) {
      if (error) {
        error(data);
      } else {
        this.showViewMessage(this.validateService.ERROR, data.node.name + data.msg.msg);
      }
    } else {
      success();
    }
  }

  // 获取不符合要求的组件
  getErrorComponent(map, data) {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const child = data[i];
        const errList = this.validateService.gatherDataMapKeys(child.name);
        const first = errList[0];
        if (map[first] && first) {
          return {
            node: child,
            msg: map[first]
          };
        } else {
          if (child.children && child.children.length > 0) {
            const res = this.getErrorComponent(map, child.children);
            if (res) {
              return res;
            }
          }
        }
      }
    }
  }

  // 提示单条信息
  showViewMessage(type: string, msg: string, title?: string, id?: string) {
    this.msgs = [];
    const data: Message = {
      severity: type,
      summary: (title || (type + ' message')),
      detail: msg,
      id: id
    };
    this.msgs.push(data);
  }


  // 成功load表单处理
  loadFormSuccess(data) {
    if (data && data.compJsons) {
      this.targetBuilderTools = data.compJsons;
      // 调用服务进行设置值
      this.nameService.setNamesMap(this.targetBuilderTools);
      this.onNewVersionListener();
      // 初始化viewModels
      if (data.viewModels) {
        data.viewModels.unshift({
          label: 'edit',
          value: 'edit'
        });

        this.setViewModeList(data.viewModels);
      } else {
        this.setViewModeList(this.constantService.viewModeOfForm);
      }

      this.showComponentProperty({inputType: 'form', name: 'form'});
    }
    this.closeDialog();
  }

  // 提示信息
  alertFrame(data) {
    this.growlMsgs = [];
    this.growlMsgs.push(data);
  }

  // 显示登录框
  showLoginDialog(data) {
    this.displayLogin = true;
  }

  // login
  login() {
    const that = this;
    if (this.username && this.password) {
      this.httpService.getToken(
        'paicoreuaa/oauth/token',
        'grant_type=password&username=' + this.username + '&password=' + this.password
      ).then(
        (res) => {
          if (res && res.access_token) {
            // 写入localStorage
            window.localStorage.setItem('PAI-token', JSON.stringify(res));
            window.localStorage.setItem('PAI-language', 'zh_CN');
            window.localStorage.setItem('PAI-theme', 'PAI_theme');
            // 执行登录操作
            that.httpService.login('paicoreuaa/api/login', {
              userName: that.username,
              password: that.password,
              clientType: ''
            }, res.access_token).then(
              (data) => {
                if (data.responseCode === '100') {
                  //
                  window.localStorage.setItem('PAI-account', JSON.stringify(data));
                  that.displayLogin = false;
                  // 执行上一次没有执行的操作
                  const fun = that.constantService.getDataByKey(that.constantService.getCurRequestCode());
                  if (fun) {
                    fun(that);
                  }
                } else {
                  this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
                    severity: 'error',
                    summary: '登陆失败,' + data.messageList[0].message,
                    detail: '',
                    id: ''
                  });
                }
              }
            )
          } else {
            this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
              severity: 'error',
              summary: 'Login failure, unable to connect to server.',
              detail: '',
              id: ''
            });
          }
        }
      ).catch(
        (err) => {
          this.loginErrorHandle(err._body);
        }
      )
    } else {
      this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
        severity: 'error',
        summary: 'username is empty or password is empty',
        detail: '',
        id: ''
      });
    }
  }

  loginErrorHandle(errorMessage) {
    if (errorMessage) {
      const errorJson = JSON.parse(errorMessage);
      if (errorJson.error === 'invalid_grant') {
        if (errorJson.error_description === 'Bad credentials') {
          //  用户名或密码错误
          this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
            severity: 'error',
            summary: '登陆错误,用户名或密码错误!',
            detail: '',
            id: ''
          });
        } else if (errorJson.error_description.indexOf('expired') !== -1) {
          // 验证码过期!
          this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
            severity: 'error',
            summary: '登陆错误, 验证码过期!',
            detail: '',
            id: ''
          });
        } else {
          //  登陆错误
          this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
            severity: 'error',
            summary: '登陆错误' + errorJson.error_description,
            detail: '',
            id: ''
          });
        }
      } else if (errorJson.error === 'Unauthorized') {
        // 授权码错误
        this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
          severity: 'error',
          summary: '登陆错误,授权码错误!',
          detail: '',
          id: ''
        });
      } else if (errorJson.error === 'access_denied') {
        // 拒绝访问
        this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
          severity: 'error',
          summary: '登陆错误,拒绝访问!',
          detail: '',
          id: ''
        });
      } else if (errorJson.responseCode === 300) {
        // 登陆错误
        this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
          severity: 'error',
          summary: '登陆错误' + errorJson.messageList[0].message,
          detail: '',
          id: ''
        });
      } else {
        // 登陆错误
        this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
          severity: 'error',
          summary: '登陆错误' + errorJson.error_description,
          detail: '',
          id: ''
        });
      }
    } else {
      // 未连接到服务器或当前服务未启动
      this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
        severity: 'error',
        summary: '登陆错误,未连接到服务器或当前服务未启动',
        detail: '',
        id: ''
      });
    }
  }

  // 左边sidebar选中触发
  tabItemSelect(e) {
    this.activeItem = {
      label: e.target.innerText,
      icon: ''
    };
  }

  // 新建表单
  createNewForm(data) {
    // 新建表单前，先把之前的数据清空到初始状态
    this.targetBuilderTools = [];

    // 初始化viewModel
    this.initFormViewModel({});
    // 初始化表单信息
    this.initFromInfo(data);
  }

  /**
   * 弹出确认框
   * @param {string} msg 消息
   * @param ok 确定的回调函数
   * @param no 取消的回调函数
   * @param {string} title 标题
   */
  doConfirm(msg: string, ok: any, no?: any, title?: string) {
    this.confirmationService.confirm({
      message: msg,
      header: title || 'Confirmation',
      icon: 'fa fa-question-circle',
      accept: ok,
      reject: no
    });
  }

  // 初始化表单基本信息
  initFromInfo(data) {
    this.formHostMsg = {
      formName: data && data.name ? data.name : '',
      formVersion: '',
      formDesc: {
        zh_CN: '',
        en: ''
      },
      verDesc: {
        zh_CN: '',
        en: ''
      },
      mainId: '',
      subId: '',
      route: '',
      projectId: data && data.projectId ? data.projectId : '',
      category: data && data.category ? data.category : ''
    };

    this.initForm = {
      'name': 'form',
      'children': [],
      'inputType': 'form',
      'icon': 'form',
      'class': 'wide',
      'attr': {
        'visible': {},
        'readOnly': {}
      }
    };

    // 表单命名
    if (data && data.name) {
      this.initForm.attr.name = data.name;
    } else {
      this.initForm.attr.name = this.nameService.getNames('form');
    }

    // 初始化右上角tab-panel
    this.subjectService.broadcastData(this.constantService.subKey.INIT_TAB_PANEL, {});

    // 初始化表单数据
    this.targetBuilderTools.push(this.initForm);

    // 初始化右下角属性栏
    this.showComponentProperty(this.initForm);
  }

  /**
   * 根据key注册订阅事件
   * @param {string} key
   */
  registerSubject(key: string) {
    this.subscription = this.subjectService.getSubscribe(key).subscribe(
      data => this.onSubResult(key, data)
    );
  }

  /**
   * 获取事件key的订阅结果
   * @param key
   * @param data
   */
  onSubResult(key, data) {

    switch (key) {
      case this.constantService.subKey.smartDsChange:

        this.setSmartDs(data);
        break;
      case this.constantService.subKey.serviceChange:

        this.setServiceData(data);
        break;
      case this.constantService.subKey.VIEW_MODE_CHANGE:

        this.setViewModeList(data);
        break;
      case this.constantService.subKey.INSPECTOR_NODE_SELECTED:

        this.selectCurrentView(data);
        break;
      case this.constantService.subKey.LOAD_FORM_SUCCESS:

        this.loadFormSuccess(data);
        break;
      case this.constantService.subKey.ALERT_MESSAGE:

        this.alertFrame(data);
        break;
      case this.constantService.subKey.SHOW_LOGIN:

        this.showLoginDialog(data);
        break;
      case this.constantService.subKey.NEW_FORM:

        this.createNewForm(data);
        break;
      case this.constantService.subKey.SAVE_DATA: // 保存服务端；

        this.saveData(data);
        break;
      case this.constantService.subKey.SAVE: // 表单没有project、category时触发的订阅；

        this.saveDraft(data);
        break;
      case this.constantService.subKey.CLEAR_FORM:

        this.clearForm(data);
        break;
      case this.constantService.subKey.SAVE_TO_LOCAL_STORAGE:
        this.saveToLocalStorage(data);
        break;
    }
  }

  // 清空当前表单
  clearForm(data) {
    this.createNewForm(data);
    this.subjectService.broadcastData(this.constantService.subKey.FORM_DATA_CHANGE_EVENT_KEY, this.targetBuilderTools);
  };

  //
  saveToLocalStorage(data) {
    const requestDTO: any = {};

    requestDTO.formDesc = this.formHostMsg.formDesc;
    requestDTO.compJsons = this.targetBuilderTools;
    requestDTO.dataJsons = this.smartDs;
    requestDTO.serviceJsons = this.serviceData;

    if (this.targetBuilderTools[0].scripts) {
      requestDTO.initJsons = {
        [this.selectedViewMode]: {
          init: this.targetBuilderTools[0].scripts
        }
      }
    }
    const {formName, route, verDesc, compJsons, formDesc, dataJsons, viewModels, initJsons, serviceJsons} = requestDTO;

    window.localStorage.setItem(this.constantService.FORM_DATA, JSON.stringify({
      formName,
      route,
      verDesc,
      compJsons,
      formDesc,
      dataJsons,
      viewModels,
      initJsons,
      serviceJsons
    }))
  }

  //
  clearLocalStorage() {
    window.localStorage.removeItem(this.constantService.FORM_DATA);
  }

  //
  reload(formData) {
    const {curVer, formName, id, formDesc, route, projectId, category} = formData;

    if (formData.dataJsons) {
      this.constantService.putData(this.constantService.subKey.smartDsChange, formData.dataJsons);
      this.subjectService.broadcastData(this.constantService.subKey.smartDsChange, formData.dataJsons);
    } else {
      this.constantService.putData(this.constantService.subKey.smartDsChange, []);
      this.subjectService.broadcastData(this.constantService.subKey.smartDsChange, []);
    }

    if (formData.serviceJsons) {
      this.constantService.putData(this.constantService.subKey.serviceChange, formData.serviceJsons);
      this.subjectService.broadcastData(this.constantService.subKey.serviceChange, formData.serviceJsons);
    } else {
      this.constantService.putData(this.constantService.subKey.serviceChange, []);
      this.subjectService.broadcastData(this.constantService.subKey.serviceChange, []);
    }
    // load 当前选中表单默认选中整个表单属性
    this.subjectService.broadcastData(this.constantService.subKey.LOAD_FORM_SUCCESS, formData);

    // TODO initJsons的通知
    this.onAddNewVersion(formData.compJsons);
    this.changeFormMsg(
      [
        {key: 'formName', value: formName},
        {key: 'formVersion', value: curVer},
        {key: 'verDesc', value: formData.verDesc},
        {key: 'formDesc', value: formDesc},
        {key: 'mainId', value: id},
        {key: 'subId', value: formData.id},
        {key: 'route', value: route},
        {key: 'projectId', value: projectId},
        {key: 'category', value: category}
      ]
    );
  }

  //
  saveData(data) {
    this.requestDTO = data.requestDTO;

    this.requestDTO.saveType = data.saveType;
    this.requestDTO.mainId = this.formHostMsg.mainId;
    this.requestDTO.subId = this.formHostMsg.subId;
    this.requestDTO.verDesc = this.formHostMsg.verDesc;
    this.requestDTO.formDesc = this.formHostMsg.formDesc;
    this.requestDTO.compJsons = this.targetBuilderTools;
    this.requestDTO.dataJsons = this.smartDs;
    this.requestDTO.serviceJsons = this.serviceData;
    this.requestDTO.viewModels = this.viewModeOfForm.slice(1);

    this.formHostMsg.projectId = this.requestDTO.projectId;
    this.formHostMsg.category = this.requestDTO.category;

    // 另存为是主子表ID设为空
    if (data.type === 'save-as') {
      this.requestDTO.mainId = '';
      this.requestDTO.subId = '';
    }

    if (this.targetBuilderTools[0].scripts) {
      this.requestDTO.initJsons = {
        [this.selectedViewMode]: {
          init: this.targetBuilderTools[0].scripts
        }
      }
    }

    this.saveToServer(data.saveType, this.requestDTO, data.successCallback);
  }

  // 保存、发布、另存为三个功能数据保存至服务端
  saveToServer(saveType: number, requestDTO: any, successCallback?: any, errorCallback?: any) {

    const {formName, route, verDesc, compJsons, formDesc, dataJsons, viewModels, initJsons, serviceJsons, projectId, category} = requestDTO;
    const {mainId = '', subId = ''} = requestDTO;

    const param = {
      formName,
      route,
      saveType,
      id: mainId,
      subId: subId,
      compJsons,
      dataJsons,
      serviceJsons,
      viewModels,
      initJsons,
      formDesc,
      verDesc,
      projectId,
      category
    };

    this.httpService.getData('base-rest/api/formDesigner/save', param)
      .then((res) => {
        // 如果保存成功，清除之前保存的localStorage;
        if (res.responseCode === '100') {
          this.clearLocalStorage();
        }

        if (successCallback) {
          successCallback(res);
        }
      }).catch((err) => {
      if (errorCallback) {
        errorCallback(err);
      }
    })
  }

  ngOnDestroy() {
    jQuery(this.layoutMenuScroller).nanoScroller({flash: true});

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.componentRef.destroy();
  }
}

@Component({
  /* tslint:disable:component-selector */
  selector: '[app-submenu]',
  /* tslint:enable:component-selector */
  template: `
    <ng-template ngFor let-child let-i="index" [ngForOf]="(root ? item : item.items)">
      <li [ngClass]="{'active-menuitem': isActive(i)}" [class]="child.badgeStyleClass">
        <a [href]="child.url||'#'" (click)="itemClick($event,child,i)" *ngIf="!child.routerLink"
           [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
           (mouseenter)="hover=true" (mouseleave)="hover=false" class="ripplelink">
          <i class="material-icons">{{child.icon}}</i>
          <span class="menuitem-text">{{child.label}}</span>
          <i class="material-icons layout-submenu-toggler" *ngIf="child.items">keyboard_arrow_down</i>
          <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
        </a>
        <a (click)="itemClick($event,child,i)" *ngIf="child.routerLink"
           [routerLink]="child.routerLink" routerLinkActive="active-menuitem-routerlink"
           [routerLinkActiveOptions]="{exact: true}" [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
           (mouseenter)="hover=true" (mouseleave)="hover=false" class="ripplelink">
          <i class="material-icons">{{child.icon}}</i>
          <span class="menuitem-text">{{child.label}}</span>
          <i class="material-icons layout-submenu-toggler" *ngIf="child.items">>keyboard_arrow_down</i>
          <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
        </a>
        <ul app-submenudnd [item]="child" *ngIf="child.items" [visible]="isActive(i)" [reset]="reset"
            [@children]="isActive(i) ? 'visible' : 'hidden'"></ul>
      </li>
    </ng-template>
  `,
  animations: [
    trigger('children', [
      state('visible', style({
        height: '*'
      })),
      state('hidden', style({
        height: '0px'
      })),
      transition('visible => hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('hidden => visible', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class AppSubMenuComponent {

  @Input() item: MenuItem;

  @Input() root: boolean;

  @Input() visible: boolean;

  _reset: boolean;

  activeIndex: number;

  hover: boolean;

  constructor(public app: AppComponent, public router: Router, public location: Location) {
  }

  itemClick(event: Event, item: MenuItem, index: number) {
    // avoid processing disabled items
    if (item.disabled) {
      event.preventDefault();
      return true;
    }

    // activate current item and deactivate active sibling if any
    if (item.routerLink || item.items || item.command || item.url) {
      this.activeIndex = (this.activeIndex === index) ? null : index;
    }

    // execute command
    if (item.command) {
      item.command({originalEvent: event, item: item});
    }

    // prevent hash change
    if (item.items || (!item.url && !item.routerLink)) {
      event.preventDefault();
    }

    // hide menu
    if (!item.items) {
      if (this.app.isMobile()) {
        this.app.sidebarActive = false;
        this.app.mobileMenuActive = false;
      }
    }
  }

  isActive(index: number): boolean {
    return this.activeIndex === index;
  }

  @Input() get reset(): boolean {
    return this._reset;
  }

  set reset(val: boolean) {
    this._reset = val;
  }
}

