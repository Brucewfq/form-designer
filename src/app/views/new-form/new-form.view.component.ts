// save deploy
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-new-form-view',
  templateUrl: './new-form.view.component.html',
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

export class NewFormViewComponent extends BaseComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>();

  form = {
    name: '',
    projectId: '',
    category: ''
  };

  projectOptions: any[] = [];

  categoryOptions: any[] = [];

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

  createNewForm() {
    if (!this.form.projectId || !this.form.category) {
      this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
        severity: 'error',
        summary: 'project or category is empty',
        detail: '',
        id: ''
      });

      return;
    }

    let formIsEmpty = true;
    if (this.targetBuilderTools.length > 0) {
      for (let i = 0; i < this.targetBuilderTools.length; i++) {
        if (this.targetBuilderTools[i].children.length > 0) {
          formIsEmpty = false;
          break;
        }
      }
    }

    if (!formIsEmpty) {
      const that = this;
      this.doConfirm('当前表单不为空，新建之后将覆盖当前表单', function () {
        that.subjectService.broadcastData(that.subKey.NEW_FORM, that.form);
        that.closeDialog.emit();
      });
    } else {
      this.subjectService.broadcastData(this.subKey.NEW_FORM, this.form);
      this.closeDialog.emit();
    }

  }

  onchange() {
    // console.info(this.requestDTO);
  }
}


