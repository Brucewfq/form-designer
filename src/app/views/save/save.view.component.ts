// save deploy
import {Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-save-view',
  templateUrl: './save.view.component.html',
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

export class SaveViewComponent extends BaseComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>();

  projectOptions: any[] = [];

  categoryOptions: any[] = [];

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
    saveType: 0,
    formDesc: {
      zh_CN: '',
      en: ''
    },
    verDesc: {
      zh_CN: '',
      en: ''
    },
  };

  formDesc: any = {
    zh_CN: '',
    en: ''
  };

  verDesc: any = {
    zh_CN: '',
    en: ''
  };


  ngOnInit() {
    // 获取项目
    this.getData('26577a86-b61b-4e36-9ee7-519042939974', this.projectOptions, 'project');
    // 获取项目分类
    this.getData('e6f598b5-2a58-4e60-bdfb-f5f606847f44', this.categoryOptions, 'category');
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

  setCheck(msg: any) {
    for (const i in msg) {
      if (msg.hasOwnProperty(i) && !msg[i]) {
        return {key: i, bool: false}
      }
    }
    return {bool: true, key: ''};
  }


  save() {
    const {projectId, category} = this.requestDTO;
    const msg = this.setCheck({projectId, category});

    if (!msg.bool) {
      if (msg.key === 'projectId') {
        this.showMessage('error', 'project is empty');
      } else {
        this.showMessage('error', '' + msg.key + '  is empty');
      }

      return
    }

    this.subjectService.broadcastData(this.subKey.SAVE, this.requestDTO);
    this.closeDialog.emit();
  }
}


