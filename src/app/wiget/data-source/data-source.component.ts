import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-data-source-property',
  templateUrl: './data-source.component.html'
})
export class DataSourceComponent extends BaseComponent implements OnInit {

  @Input() dataSourcePost: any = {};

  dataSource: any;

  dataSourceProperties: any[] = [];

  displayDialog: Boolean = false;

  selectedData: any = {};

  treeData: any[] = [];

  // tab panel组件默认显示的title
  defaultTabTitle = 'service';

  datas: any[];

  showBind() {
    this.displayDialog = true;
  }

  doClickFinish() {
    if (this.datas && this.datas[0] && this.datas[0].children.length === 0) {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: '请选择一个object', detail: ''});
      return;
    }

    if (!this.selectedData || this.selectedData.sign !== 'data') {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {severity: 'error', summary: '请选择一个object', detail: ''});
      return;
    }

    if (this.selectedData.data && this.selectedData.data.obj) {
      this.dataSourcePost.dataSource.bindData = {};
      this.dataSourcePost.dataSource.bindData.objectId = this.selectedData.data.obj.objectId;
      this.dataSourcePost.dataSource.bindData.objectName = this.selectedData.data.obj.objectName;
      this.dataSourcePost.dataSource.bindData.nameDesc = this.selectedData.data.obj.nameDesc;
      this.dataSourcePost.dataSource.bindData.path = this.selectedData.path;

      if (this.selectedData.data.obj.objectName) {
        this.requestObjectProperty(this.selectedData.data.obj.objectName);
      }
    }
    //
    this.doCloseDialog();
  }

  doCloseDialog() {
    this.displayDialog = false;
  }

  requestObjectProperty(objectName: string) {
    if (objectName) {
      const url = 'object/api/last/' + objectName + '/attrs';
      this.httpService.getData(url, {}).then((res) => {
        this.dataParse(res.attrs);
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
      });
    }
  }

  dataParse(data) {
    this.dataSourceProperties = [{
      label: 'id',
      value: 'id'
    }];
    for (let i = 0; i < data.length; i++) {
      this.dataSourceProperties.push({
        label: data[i].name,
        value: data[i].name
      })
    }
  }

  ngOnInit() {
    if (this.dataSourcePost.dataSource.selectedDataSourceType === 'Advanced') {
      this.dataSourcePost.dataSource.isLang = false;
    }

    if (this.dataSourcePost
      && this.dataSourcePost.dataSource
      && this.dataSourcePost.dataSource.bindData
      && this.dataSourcePost.dataSource.bindData.objectName) {
      this.requestObjectProperty(this.dataSourcePost.dataSource.bindData.objectName);
    }

    this.registerSubject(this.subKey.SERVICE_NODE_SELECTED);
    this.registerSubject(this.subKey.serviceChange);
  }

  onSubResult(key: string, data: any) {
    if (key === this.subKey.SERVICE_NODE_SELECTED) {
      this.selectedData = data;
    } else if (key === this.subKey.serviceChange) {
      this.datas = data;
    }
  }
}
