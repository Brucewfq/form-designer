import {Injectable} from '@angular/core';

/**
 * 常量数据的服务
 */
@Injectable()
export class ConstantService {

  // 广播和订阅用的事件的key常量对象
  public subKey: any;

  // 选择的视图模式的值
  public selectedViewMode: any;

  // 视图模式的选项值
  public viewModeOfForm: any[];

  // 默认视图选中值
  public defaultView = 'edit';

  // 数据类型
  public dataTypes: any[];

  // 数据处理类型
  public processTypes: any[];

  // 数据处理类型
  public editorTypes: any[];

  public dataMap: any = {};

  public MSG_SUCCESS = 'success';
  public MSG_WARN = 'warn';
  public MSG_ERROR = 'error';
  public MSG_INFO = 'info';

  public FORM_DATA = 'formData';

  dataTypeWithLists: any[] = [];
  dataTypeWithNode: any[] = [];
  dataTypeWithObject: any[] = [];

  public curRequestCode = 'getTemplate';

  // 构造方法
  constructor() {

    // 赋值
    this.subKey = {
      // tab 组件的事件key
      tabKey: 'tab',
      // dropdown 组件的事件key
      dropdownKey: 'dropdown',
      peanlKey: 'peanl',
      // 表单数据被改变以后触发
      FORM_DATA_CHANGE_EVENT_KEY: 'formDataChangeEventKey',
      selectedViewModeKey: 'selectedViewMode',
      smartDsChange: 'smartDsChange',
      serviceChange: 'serviceChange',
      nodeChoose: 'nodeChoose',
      SERVICE_NODE_SELECTED: 'serviceNodeSelected',
      INSPECTOR_NODE_SELECTED: 'inspectorNodeSelected',
      KEYBORAD_DIECTIVE_DELETE: 'KeyBoradDirectiveDelete',
      SELECTED_DATA_SOURCE: 'selectedDataSource',
      SHOW_MESSAGE: 'SHOW_MESSAGE',
      VIEW_MODE_CHANGE: 'viewModeChange',
      TARGET_BUILDER_TOOLS_CHANGE: 'targetBuilderToolsChange',
      CHECK_BOX_OPTIONS_CHANGE: 'checkBoxOptionsChange',
      LOAD_FORM_SUCCESS: 'loadFormSuccess',
      ALERT_MESSAGE: 'alertMessage',
      DELETE_SERVICE: 'deleteService',
      SHOW_LOGIN: 'showLogin',
      ADD_WINDOW: 'addWindow',
      GET_TEMPLATE: 'getTemplate',
      SET_EVENT: 'setEvent',
      COLUMNS_CHANGE: 'columnsChange',
      INIT_TAB_PANEL: 'initTabPanel',
      NEW_FORM: 'newForm',
      SAVE_DATA: 'saveData',
      SAVE: 'save',
      CREATE_SMART_DS: 'createSmartDs',
      PROPERTY_CHANGE: 'propertyChange',
      CLEAR_FORM: 'clearForm',
      SAVE_TO_LOCAL_STORAGE: 'saveToLocalStorage'
    };

    this.selectedViewMode = this.defaultView;
    this.viewModeOfForm = [
      {
        label: 'edit',
        value: 'edit'
      },
      {
        label: 'launch',
        value: 'launch'
      },
      {
        label: 'approval',
        value: 'approval'
      },
      {
        label: 'view',
        value: 'view'
      },
      {
        label: 'print',
        value: 'print'
      }
    ];
    this.dataTypes = [
      {
        label: 'String',
        value: 'String'
      },
      {
        label: 'Integer',
        value: 'Integer'
      },
      {
        label: 'Decimal',
        value: 'Decimal'
      },
      {
        label: 'DateTime',
        value: 'DateTime'
      }
    ];
    this.dataTypeWithLists = [
      {
        label: 'List',
        value: 'List'
      }
    ];
    this.dataTypeWithObject = [
      {
        label: 'String',
        value: 'String'
      },
      {
        label: 'Integer',
        value: 'Integer'
      }
    ];
    this.dataTypeWithNode = [
      {
        label: 'String',
        value: 'String'
      },
      {
        label: 'Integer',
        value: 'Integer'
      },
      {
        label: 'Decimal',
        value: 'Decimal'
      },
      {
        label: 'DateTime',
        value: 'DateTime'
      }
    ];

    this.processTypes = [
      {
        label: '空',
        value: ''
      },
      {
        label: 'count',
        value: 'count'
      },
      {
        label: 'sum',
        value: 'sum'
      }
    ];
    this.editorTypes = [
      {
        label: '',
        value: ''
      },
      {
        label: 'textfield',
        value: 'textfield'
      },
      {
        label: 'datefield',
        value: 'datefield'
      },
      {
        label: 'combo',
        value: 'combo'
      },
      {
        label: 'numberfield',
        value: 'numberfield'
      }
    ];
  }

  setSelectedViewMode(val: any) {
    this.selectedViewMode = val;
  }

  getSelectedViewMode(): any {
    return this.selectedViewMode;
  }

  setCurRequestCode(code: string) {
    this.curRequestCode = code;
  }

  getCurRequestCode(): any {
    return this.curRequestCode;
  }

  putData(key: string, data: any) {
    this.dataMap[key] = data;
  }

  getDataByKey(key: string): any {
    return this.dataMap[key];
  }
}
