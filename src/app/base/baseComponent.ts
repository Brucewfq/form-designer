import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {SubjectService} from '../service/subject.service';
import {ConstantService} from '../service/constantService';
import {HttpService} from '../service/http.service';
import {NameService} from '../service/name.service';
import {ScriptLoaderService} from '../util/script-loader.service';
import {ValidateService} from '../service/validate.service';
import {ConfirmationService, Message} from 'primeng/primeng';
import {AppModelService} from '../app.model';

/**
 * 组件基类，用来做一些通用处理
 */
@Component({
  selector: 'app-base',
  template: ''
})
export class BaseComponent implements OnDestroy {

  @Input() bindSource: any;

  // view控件中的传入数据
  @Input() model: any = {};

  @Input() targetBuilderTools: any = {};

  // view控件中的传入模板
  @Input() template: any;

  // 属性控件中的传入数据
  @Input() dataModel: any;

  // 属性控件中的传入组件的name
  @Input() dataName: string;

  @Input() currentSelectView: string;

  // 通知父组件打开Dialog的output
  @Output() showDialog = new EventEmitter<any>();

  // 通知父组件关闭Dialog的output
  @Output() closeDialog = new EventEmitter<any>();

  // 通知父组件值变更的output
  @Output() editData = new EventEmitter<any>();

  @Output() getCurrentObject = new EventEmitter<any>();

  // 通知控件树更改数据
  @Output() onNewVersionListener = new EventEmitter<any>();

  commonAttrs: any = {
    labelAligns: [
      {label: 'left', value: 'left'},
      {label: 'right', value: 'right'},
      {label: 'center', value: 'center'}
    ],
    fontWeight: [
      {label: 'normal', value: 'normal'},
      {label: 'bold', value: 'bold'}
    ],
    fontSize: [
      {label: 10, value: 10},
      {label: 12, value: 12},
      {label: 14, value: 14},
      {label: 18, value: 18},
      {label: 24, value: 24},
      {label: 32, value: 32},
      {label: 48, value: 48}
    ],
    layout: [
      {label: 'float', value: 'float'},
      {label: 'auto', value: 'auto'},
      {label: 'column', value: 'column'},
      {label: 'fit', value: 'fit'},
      {label: 'hbox', value: 'hbox'},
      {label: 'vbox', value: 'vbox'}
    ],
    dataFormat: [
      {label: 'Y-m-d', value: 'Y-m-d'},
      {label: 'y-m-d', value: 'y-m-d'},
      {label: 'Y/m/d', value: 'Y/m/d'},
      {label: 'y/m/d', value: 'y/m/d'},
      {label: 'm/d/Y', value: 'm/d/Y'},
      {label: 'm/d/y', value: 'm/d/y'},
      {label: 'c', value: 'c'}
    ]
  };
  // 当前选中的视图
  selectedViewMode: any;

  msgs: Message[] = [];

  // 事件订阅器
  subscription: Subscription;
  subscription_ViewChange: Subscription;

  // 广播和订阅用的事件的key常量对象
  public subKey: any;

  constructor(public subjectService: SubjectService,
              public constantService: ConstantService,
              public httpService: HttpService,
              public nameService: NameService,
              public _script: ScriptLoaderService,
              public validateService: ValidateService,
              public confirmationService: ConfirmationService,
              public appModelService: AppModelService) {
    // 取service里面的常量赋值给自身属性
    this.subKey = constantService.subKey;
    // 先获取当前界面的视图模式
    this.selectedViewMode = constantService.getSelectedViewMode();
    // 订阅视图模式变更事件
    this.subscription_ViewChange = subjectService.getSubscribe(this.subKey.selectedViewModeKey).subscribe(
      data => this.onSelectedViewModeResult(data)
    );
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
   * 不需要被子类重写的方法，获取selectedViewMode的订阅结果
   * @param key
   * @param data
   */
  onSelectedViewModeResult(data: any) {
    this.selectedViewMode = data;
    this.onViewModeChange();
  }

  /**
   * 需要被子类重写
   * selectedViewMode变更以后调用
   */
  onViewModeChange(): void {
  }

  /**
   * 需要被子类重写的方法，获取事件key的订阅结果
   * @param key
   * @param data
   */
  onSubResult(key: string, data: any) {

  }

  /**
   * 组件销毁（注意，子类重写此方法时不要忘记取消事件订阅）
   * @param data
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscription_ViewChange) {
      this.subscription_ViewChange.unsubscribe();
    }
  }

  /**
   * 提示框
   * @param type (error,success)
   */
  showMessage(type: string, msg: string, title?: string, id?: string) {
    const data: Message = {
      severity: type,
      summary: (title || (type + ' message')),
      detail: msg,
      id: id
    };
    this.subjectService.broadcastData(this.subKey.SHOW_MESSAGE, data);
  }

  showMessages(datas: Message[]) {
    this.subjectService.broadcastData(this.subKey.SHOW_MESSAGE, datas);
  }

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

  // 推送多条信息
  showPropertyMessage(type: string, msg: any[], title?: string, id?: string) {
    this.msgs = [];
    const container = [];
    for (let i = 0; i < msg.length; i++) {
      const data = {
        severity: type,
        summary: (title || (type + ' message')),
        detail: msg[i].msg,
        id: id
      };
      container.push(data);
    }
    this.msgs.push(...container);
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

  /**
   * 验证字符规则
   * @param field 字段的名称
   * @param model 组建内部数据
   * @param {obj} 验证的种类
   * 1.验证种类有 非空验证 变量名合法 纯数字 重名<目前只针对attr.name>
   */
  validate(field: string,
           model: any,
           {
             required = true,
             variable = false,
             pureNumber = false,
             character = false,
             checkExistAttrName = false
           }) {
    const {dataModel, dataName} = this;
    const inputType = dataModel.inputType;
    const value = model[field];
    model.isValid = false;
    // 判断非空
    if (required && !this.validateService.required(value)) {
      this.showValidate('warn', field, ' is required');
      return;
    }

    // 判断特殊字符
    if (variable && !this.validateService.variable(value)) {
      const msg = ' can\'t be special charectar';
      this.showValidate('warn', field, msg);
      return;
    }

    // 判断是否为纯数字
    if (pureNumber && !this.validateService.pureNumber(value)) {
      const msg = ' number\'s only';
      this.showValidate('warn', field, msg);
      return;
    }

    // 判断是否为纯文本
    if (character && !this.validateService.character(value)) {
      const msg = ' character\'s only';
      this.showValidate('warn', field, msg);
      return;
    }

    // 判断重名
    if (checkExistAttrName) {
      this.nameService.checkExistAttrName(value, dataModel, this.targetBuilderTools);
      if (dataModel.isReapted) {
        const msg = ' can\'t be repeated';
        this.showValidate('warn', field, msg);
        delete dataModel.isReapted;
        return;
      } else {
        this.nameService.updateNameMap(dataModel.inputType, value);
        this.onNewVersionListener.emit();
      }
    }
    // 通过以上以后验证移除错误信息, 恢复正常颜色，清空显示框内容
    const validateKey = dataName + field;
    this.validateService.removeDataByKey(validateKey);

    // 如果当前组建没有错误了，那么删除该属性
    const errorList = this.validateService.getDataByName(dataName);
    if (errorList.length === 0) {
      delete model.isValid;
    } else {
      this.showValidate('warn', '', errorList[0].msg);
    }
    this.msgs = [];
  }

  // property初始调用用于显示错误验证信息
  showInitValidate() {
    const errorMsg: any[] = this.validateService.getDataByName(this.dataName);
    if (errorMsg.length > 0) {
      this.showPropertyMessage(this.validateService.ERROR, errorMsg);
    }
  }

  // 显示验证框
  showValidate(severity, field, msg) {
    msg = field + msg;
    const validateKey = this.dataName + field;
    switch (severity) {
      case 'success':
        this.showViewMessage(this.validateService.SUCCESS, msg);
        let timer = null;
        timer = setTimeout(() => {
          this.msgs = [];
        }, 2000);
        break;
      case 'warn':
        this.validateService.putData(validateKey, {msg, field});
        this.showViewMessage(this.validateService.ERROR, msg);
        break;
      default:
        break;
    }
  }

  // 初始化赋值
  beforeInitDefault(model: any, attrs: any) {
    for (const key in attrs) {
      // 当加载时已经有属性
      if (model.attr.hasOwnProperty(key)) {
        continue;
      }
      if (!model.attr[key]) {
        model.attr[key] = attrs[key];
      }
    }
  }

  //  成功设置事件之后，修改事件desc
  checkEventName(eventData, scripts): any {
    for (const key in scripts) {
      const eventName = key.substring(0, key.indexOf('_'));
      for (let i = 0; i < eventData.length; i++) {
        if (eventData[i].name === eventName) {
          eventData[i].desc = 'setted';
        }
      }
    }

    return eventData;
  }

  // 设置eventData
  getEventData(eventData) {
    const scripts = this.dataModel.scripts;
    for (let i = 0; i < eventData.length; i++) {
      const event = eventData[i].name;
      if (scripts && scripts[event]) {
        eventData[i].desc = 'setted';
      }
    }
    return eventData;
  }

  // 得到所有项目list
  getFormItems(param, successCallback?: any, errorCallback?: any): void {
    this.httpService.getData(
      'object/api/last/dictItemObj/page',
      param
    ).then(
      function (res) {
        if (successCallback) {
          successCallback(res);
        }
      }
    ).catch(
      (err) => {
        if (errorCallback) {
          errorCallback(err);
        }
      }
    )
  }

  /**
   * 记录日志
   * @param data
   */
  log(e: any) {
    //  console.log(e);
  }

  drop(e: any) {
    // this.log(e);
  };
}
