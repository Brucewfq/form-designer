import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {HttpService} from '../../service/http.service';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-save-template-view',
  templateUrl: './save-template.view.component.html'
})

export class SaveTemplateViewComponent extends BaseComponent implements OnInit {

  @Input() formHostMsg: any;

  @Input() dataModel: any;

  @Output() closeDialog = new EventEmitter();

  descStatus: Boolean = false;

  projectOptions: any[] = [];

  categoryOptions: any[] = [];

  // 绑定发送后台数据
  requestDTO: any = {
    TemplateName: '',
    description: '',
    lev: 1
    // category: ''
  };

  description: any = {
    zh_CN: '',
    en: ''
  };

  ngOnInit() {
    this.requestDTO.TemplateName = this.dataModel.attr.name;

    if (this.formHostMsg && this.formHostMsg.projectId) {
      this.requestDTO.projectId = this.formHostMsg.projectId;
    }
    // 获取项目
    this.getData('26577a86-b61b-4e36-9ee7-519042939974', this.projectOptions, 'project');
    // 获取模板分类
    this.getData('56c249b0-e48f-4631-979b-74b71bb8a728', this.categoryOptions, 'category');
  }

  getData(pId, options, type, callback?: any) {
    this.getFormItems(
      {pId: pId},
      (res) => {
        if (res && res.responseCode === '100' && res.dictItemObjList && res.dictItemObjList.length > 0) {
          for (let i = 0; i < res.dictItemObjList.length; i++) {
            if (type === 'project') {
              options.push({
                label: res.dictItemObjList[i].name.zh_CN,
                value: res.dictItemObjList[i].id
              });
            } else if (type === 'category') {
              options.push({
                label: res.dictItemObjList[i].name.zh_CN,
                value: res.dictItemObjList[i].name.zh_CN
              });
            }
          }

          if (callback) {
            callback();
          }
        }
      }
    )
  }

  saveDesc(e: any, description) {
    this.descStatus = false;
    Object.assign(this.requestDTO, {description});
  }

  // 点击保存成template
  saveTemplate() {
    this.dataModel.templateName = this.requestDTO.TemplateName;
    this.dataModel.attr.description = this.requestDTO.description;
    this.dataModel.lev = this.requestDTO.lev;
    //
    if (this.requestDTO.lev !== 2) {
      delete this.requestDTO.projectId
    } else {
      if (!this.requestDTO.projectId) {
        this.showMessage('error', '项目不能为空');

        return
      }
    }

    if (!this.requestDTO.category) {
      this.showMessage('error', 'category is empty');

      return
    }
    // 保存到服务端
    this.saveAsTemplate([this.dataModel]);
  }

  saveAsTemplate(obj: any) {
    const temp = this.filterParent(obj);
    if (temp.length === 0) {
      return
    }

    // 清除对象内部所有绑定的bindPath
    this.filterBindPath(temp[0]);

    // 构建template
    const templateCode = {
      label: 'Template',
      name: temp[0].templateName,
      isTemplate: true,
      iconUrl: '../assets/icons/template.svg',
      drop: [...temp]
    };

    const templateName = this.requestDTO.TemplateName;
    const description = this.requestDTO.description;
    const category = this.requestDTO.category;
    const lev = this.requestDTO.lev;

    const param = {
      templateName,
      icon: '',
      templateCode,
      description,
      lev
      // category
    };

    this.httpService.getData('base-rest/api/formTemplate', param).then((res) => {
      if (res.responseCode === '100') {
        this.addTemplateToSideBar(templateCode);
        this.closeDialog.emit();
      } else {
        this.subjectService.broadcastData(this.subKey.SHOW_MESSAGE, {
          severity: 'error',
          summary: res.messageList[0].message,
          detail: '',
          id: ''
        });
      }
    }).catch((err) => {
      this.closeDialog.emit();
    })
  }

  // 添加模板到左侧栏
  addTemplateToSideBar(templateCode) {
    this.model = this.appModelService.getModel();
    let templateIndex;
    if (this.requestDTO.lev === 1) {
      templateIndex = this.model.findIndex((res) => res.label === 'PrivateTemplate');
    } else if (this.requestDTO.lev === 0) {
      templateIndex = this.model.findIndex((res) => res.label === 'CommonTemplate');
    }
    this.model[templateIndex].items.push(templateCode);
    this.model[templateIndex].badge = this.model[templateIndex].items.length;
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
}
