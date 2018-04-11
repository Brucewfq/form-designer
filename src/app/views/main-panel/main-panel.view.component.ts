import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {AppComponent} from '../../app.component';

import {NameService} from '../../service/name.service';
import {SubjectService} from '../../service/subject.service';
import {ConstantService} from '../../service/constantService';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.view.component.html',
  styles: [`
    .showChild {
      border: 2px solid #9292e8;
      outline: none;
    }

    .section-wrap.error {
      border: 2px solid red;
      outline: none;
    }

    .gu-mirror .showChlid {
      border: none;
    }

    .enabled {
      border: 1px dashed gray;
      background-color: rgba(0, 0, 0, 0.1);
    }
  `]
})

export class MainPanelViewComponent implements OnInit, OnDestroy {

  @Input() targetBuilderTools: any;
  @Input() currentSelectView: any;
  @Input() pullCopyTemp: any;
  @Output() leftMenuDrop: EventEmitter<any> = new EventEmitter();
  @Output() perpareCopy: EventEmitter<any> = new EventEmitter();
  @Output() createHyperModule: EventEmitter<any> = new EventEmitter();
  @Output() regretBindSource: EventEmitter<any> = new EventEmitter();

  mainPanelSubscription: Subscription;

  Number: Number = 0;
  formMsg: any = {
    attr: {},
    children: [],
    class: 'wide',
    icon: '',
    inputType: 'form',
    name: 'form',
    parent: ''
  };

  constructor(private app: AppComponent,
              private nameService: NameService,
              private subjectService: SubjectService,
              private constantService: ConstantService) {
  };

  ngOnInit() {

    this.showProperty(this.targetBuilderTools[0]);
    // 订阅事件
    // this.registerSubject(this.constantService.subKey.KEYBORAD_DIECTIVE_DELETE);
    this.mainPanelSubscription = this.subjectService.getSubscribe(this.constantService.subKey.KEYBORAD_DIECTIVE_DELETE).subscribe(
      data => this.onKeyBoradDelete(data)
    );
  }

  ondeleteModel(e: any, model) {
    this.delete(model);
  }

  // 接收订阅事件
  onKeyBoradDelete(data: any) {
    this.leftMenuDrop.emit();
    this.app.showComponentProperty({inputType: ''});
  }

  drag(e: any) {
    this.log(e);
  }

  over(e: any) {
  }

  addNewVersion(e) {
    this.leftMenuDrop.emit(e);
  }

  // 设置模板信息
  setTemplateName(node: any) {
    if (!node) {
      return;
    }

    let nodeName = node.name;
    let date = new Date().getTime().toString();
    let random = Math.ceil(Math.random() * 999);
    node.name = nodeName.split('_')[0] + date.substring(0, date.length - 3) + random;

    // 如果是在组建内部拖动，那么不需要修改组建的名称
    node.attr.name = node.attr.name || this.nameService.getNames(node.inputType);

    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        this.setTemplateName(node.children[i]);
      }
    }
  }

  // 组建落入到画布中
  dropDown(e: any) {
    this.setTemplateName(e.value);
    this.leftMenuDrop.emit(e);
    this.showProperty(e.value);
    // 表单控件数据改变事件
    this.subjectService.broadcastData(this.constantService.subKey.FORM_DATA_CHANGE_EVENT_KEY, this.targetBuilderTools);
    this.focusForm();
    //
    this.subjectService.broadcastData(this.constantService.subKey.CREATE_SMART_DS, this.targetBuilderTools);
    this.subjectService.broadcastData(this.constantService.subKey.SAVE_TO_LOCAL_STORAGE, {});
    /*// 在localStorage中记录表单信息
    window.localStorage.setItem(this.constantService.FORM_DATA, JSON.stringify(this.targetBuilderTools));*/
  }

  // 从左侧拖入成功创建元素
  drop(e: any) {
    this.dropDown(e);
  }

  // 在画布内部组建之间拖动元素
  onInnerDrop(e: any) {
    this.dropDown(e);
  }

  // 执行删除控件，新增版本
  delete(model: any) {
    this.doDelete(model.name, this.targetBuilderTools);
    this.leftMenuDrop.emit();
    this.app.showComponentProperty({inputType: 'empty'});
    // 表单控件数据改变事件
    this.subjectService.broadcastData(this.constantService.subKey.FORM_DATA_CHANGE_EVENT_KEY, this.targetBuilderTools);
  }

  doDelete(name: string, datas: any[]) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        let child = datas[i];
        if (child.name === name) {
          return datas.splice(i, 1);
        } else {
          if (child.children && child.children.length > 0) {
            this.doDelete(name, child.children);
          }
        }
      }
    } else {
      return null;
    }
  }

  showProperty(model: any) {
    if (this.app.selectedViewMode === 'edit') {
      this.perpareCopy.emit(model);
      this.app.showComponentProperty(model);
    }
  }

  // 点击操作以备执行复制操作
  onClickToCopy(e: any, model: any) {
    this.showProperty(model);
    e.stopPropagation();
  }

  // 保持表单被选中状态并用以触发keydown事件
  focusForm() {
    document.getElementById('canNotBeModify').focus();
  }

  // 保存小模板到左侧template中
  saveAsTemplate(model: any) {
    this.app.showDialog({inputType: 'save-template', name: model.name});
  }

  log(e: any) {
    console.log(e.type);
  }

  out(e: any) {
    console.info(e);
  }

  // 构造选中整个表单
  clickBoard(e: any) {
    this.perpareCopy.emit(this.formMsg);
  }

  ngOnDestroy() {
    if (this.mainPanelSubscription) {
      this.mainPanelSubscription.unsubscribe();
    }
  }
}
