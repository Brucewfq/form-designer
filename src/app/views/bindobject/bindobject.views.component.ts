import {Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import {BindObjectService} from './bindobject.views.component.service';
import {SubjectService} from '../../service/subject.service';
import {ConstantService} from '../../service/constantService';

interface ObjectDatas {
  objectName: string;
  objectId: string;
}

@Component({
  selector: 'app-bind-object',
  templateUrl: './bindobject.views.component.html',
  styles: [``],
  providers: [BindObjectService]
})

export class BindObjectViewsComponent implements OnInit {
  objectDatas: ObjectDatas[] = [];

  @Input() selectedObject: any;

  @Output() selectedObjectChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private bindObjectService: BindObjectService, private subjectService: SubjectService, private constantService: ConstantService) {
  }

  ngOnInit() {
    this.bindObjectService.getCustomQuery({
      'fields': [{
        'name': 'objectId'
      }, {
        'name': 'objectName'
      }, {
        'exp': '$.zh_CN',
        'name': 'nameDesc',
        'type': 'json'
      }],
      'filter': ''
    }).then((res) => {
      let stack = [];
      for (let i = 0; i < res.data.length; i++) {
        let {objectName, objectId, nameDesc} = res.data[i];
        stack.push({
          objectName,
          objectId,
          nameDesc
        })
      }
      this.objectDatas = stack;
    }).catch((err) => {
      console.info('Error', err);
    })
  }

  onRowSelect(e) {
    this.selectedObjectChange.emit(this.selectedObject);
    this.subjectService.broadcastData(this.constantService.subKey.SELECTED_DATA_SOURCE, this.selectedObject);
  };

  onRowUnselect(e) {

  }
}
