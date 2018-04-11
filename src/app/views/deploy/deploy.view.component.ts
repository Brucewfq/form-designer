// save deploy
import {Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import {HttpService} from '../../service/http.service';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-deploy-view',
  templateUrl: './deploy.view.component.html',
  styles: [`
    .property-item > h3.first {
      color: #000;
    }

    .success {
      color: green;
    }

    .error {
      color: red;
    }

    .required {
      color: red;
    }

  `]
})

export class DeployViewComponent extends BaseComponent implements OnInit {

  @Output() changeFormMsg = new EventEmitter<any>();

  // 获取表单保存信息
  @Input() formHostMsg: any;

  projectOptions: any[] = [];

  categoryOptions = [];

  requestDTO: any = {
    dataJsons: [],
    compJsons: [],
    serviceJsons: [],
    viewModels: [],
    initJsons: null,
    category: '',
    projectId: '',
    formName: '',
    id: '',
    subId: '',
    route: '',
    saveType: 1,
    formDesc: {
      zh_CN: '',
      en: ''
    },
    verDesc: {
      zh_CN: '',
      en: ''
    },
  };

  descStatus: Boolean = false;

  verDescStatus: Boolean = false;

  formDesc: any = {
    zh_CN: '',
    en: ''
  };

  verDesc: any = {
    zh_CN: '',
    en: ''
  };

  ngOnInit() {
    const {formName, verDesc, formDesc, route, subId, mainId} = this.formHostMsg;

    this.requestDTO.formName = formName;
    this.requestDTO.verDesc = verDesc;
    this.verDesc = verDesc;
    this.requestDTO.formDesc = formDesc;
    this.formDesc = formDesc;
    this.requestDTO.route = route;
    this.requestDTO.route = route;
    this.requestDTO.subId = subId;
    this.requestDTO.mainId = mainId;

    // 获取项目
    this.getData('26577a86-b61b-4e36-9ee7-519042939974', this.projectOptions, 'project', (res) => {
      if (this.formHostMsg.projectId) {
        this.requestDTO.projectId = this.formHostMsg.projectId;
      } else {
        if (res) {
          this.requestDTO.projectId = res.value;
        }
      }
    });
    // 获取项目分类
    this.getData('e6f598b5-2a58-4e60-bdfb-f5f606847f44', this.categoryOptions, 'category', (res) => {
      if (this.formHostMsg.category) {
        this.requestDTO.category = this.formHostMsg.category;
      } else {
        if (res) {
          this.requestDTO.category = res.value;
        }
      }
    });
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
            callback(options[0]);
          }
        }
      }
    )
  }

  saveDesc(e: any, formDesc) {
    this.descStatus = false;
    Object.assign(this.requestDTO, {formDesc});
  }

  saveVerDesc(e: any, verDesc) {
    this.verDescStatus = false;
    Object.assign(this.requestDTO, {verDesc});
  }

  change() {
    console.log(this.requestDTO);
  }

  setCheck(msg: any) {
    for (const i in msg) {
      if (msg.hasOwnProperty(i) && !msg[i]) {
        return {bool: false, key: i}
      }
    }
    return {bool: true, key: ''};
  }

  save(e: any, saveType) {
    const {formName, route, projectId, category} = this.requestDTO;
    const msg = this.setCheck({formName, route, projectId, category});

    if (!msg.bool) {
      if (msg.key === 'projectId') {
        this.showMessage('error', 'project is empty');
      } else {
        this.showMessage('error', '' + msg.key + '  is empty');
      }

      return
    }

    const that = this;
    this.subjectService.broadcastData(this.subKey.SAVE_DATA, {
      type: 'deploy',
      requestDTO: this.requestDTO,
      saveType: saveType,
      successCallback: function (res) {
        if (res.responseCode === '100') {
          that.subjectService.broadcastData(that.constantService.subKey.SHOW_MESSAGE, {
            severity: 'success',
            summary: 'draft deployed successfully',
            detail: '',
            id: ''
          });

          that.closeDialog.emit();
          // 发布成功后，清空当前表单
          that.subjectService.broadcastData(that.constantService.subKey.CLEAR_FORM, {});
          // that.changeFormHostMsg(res);
        } else {
          that.subjectService.broadcastData(that.constantService.subKey.SHOW_MESSAGE, {
            severity: 'error',
            summary: res.messageList[0].message,
            detail: '',
            id: ''
          });
        }
      }
    });
  }

  changeFormHostMsg(res) {
    const {formName, verDesc, formDesc, route, projectId, category} = this.requestDTO;

    this.changeFormMsg.emit([
      {key: 'formName', value: formName},
      {key: 'verDesc', value: verDesc},
      {key: 'formDesc', value: formDesc},
      {key: 'route', value: route},
      {key: 'projectId', value: projectId},
      {key: 'category', value: category},
      {key: 'mainId', value: res.masterId},
      {key: 'subId', value: res.subId}
    ]);
  }

  getFormCategory() {
    this.httpService.getData('object/api/last/dictItemObj/page', {
      pId: 'e6f598b5-2a58-4e60-bdfb-f5f606847f44'
    }).then(
      (res) => {
        for (let i = 0; i < res.dictItemObjList.length; i++) {
          this.categoryOptions.push({
            label: res.dictItemObjList[i].name.zh_CN,
            value: res.dictItemObjList[i].name.zh_CN
          });
        }

        if (this.formHostMsg.category) {
          this.requestDTO.category = this.formHostMsg.category;
        } else {
          this.requestDTO.category = this.categoryOptions[0].value;
        }
      }
    ).catch(
      (err) => {
      }
    )
  }
}


