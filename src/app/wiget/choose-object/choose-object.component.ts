import {Component, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'app-choose-object',
    templateUrl: './choose-object.component.html'
})

export class ChooseObjectComponent {

    @Output()
    doFinish = new EventEmitter();

    objectDatas: any[];

    selectedObject: any;

    msgs: any[];

    constructor() {
      this.objectDatas = [
        {id : '1', name : 'objectAAA', nameDec : '对象AAA', ver : '0.0.1', type : '表单对象', args : [
          {name : 'id', dataType : 'string', description : '主键', ref : ''},
          {name : 'name', dataType : 'string', description : '姓名', ref : ''},
          {name : 'age', dataType : 'int', description : '年龄', ref : ''}
        ]},
        {id : '2', name : 'objectBBB', nameDec : '对象BBB', ver : '0.0.2', type : '表单对象', args : [
          {name : 'id', dataType : 'string', description : '主键', ref : ''},
          {name : 'name', dataType : 'string', description : '姓名', ref : ''},
          {name : 'age', dataType : 'int', description : '年龄', ref : ''}
        ]},
        {id : '3', name : 'objectCCC', nameDec : '对象CCC', ver : '0.0.1', type : '主对象', args : [
          {name : 'id', dataType : 'string', description : '主键', ref : ''},
          {name : 'name', dataType : 'string', description : '姓名', ref : ''},
          {name : 'age', dataType : 'int', description : '年龄', ref : ''}
        ]}
      ]
    };

    clickFinish () {
      if (this.selectedObject) {
        if (this.selectedObject.args) {
          let sourceJson = this.createChild(this.selectedObject.args);
          this.doFinish.emit(sourceJson);
        } else {
          // TODO object没有属性
          this.doFinish.emit();
        }
      } else {
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: 'Error Message', detail: '没有选择Object'});
      }
    };

    createChild (args) {
      let reArrs = [
        {
          "name": "section-col-2",
          "children": [
            {
              "name": "Section",
              "children": [
                {
                  "name": "A Textbox",
                  "inputType": "textbox",
                  "icon": "field-text",
                  "class": "half",
                  "data": ""
                }
              ],
              "inputType": "section",
              "icon": "section",
              "class": "wide"
            },
            {
              "name": "Section",
              "children": [
                {
                  "name": "A Number",
                  "inputType": "number",
                  "icon": "field-text",
                  "class": "half",
                  "data": 8
                }
              ],
              "inputType": "section",
              "icon": "section",
              "class": "wide"
            }
          ],
          "inputType": "section-cols",
          "icon": "section",
          "class": "wide",
          "data": ""
        },
        {
          "name": "section-col-2",
          "children": [
            {
              "name": "Section",
              "children": [
                {
                  "name": "A Checkbox",
                  "inputType": "checkbox",
                  "icon": "field-text",
                  "class": "half",
                  "data": ""
                }
              ],
              "inputType": "section",
              "icon": "section",
              "class": "wide"
            },
            {
              "name": "Section",
              "children": [],
              "inputType": "section",
              "icon": "section",
              "class": "wide"
            }
          ],
          "inputType": "section-cols",
          "icon": "section",
          "class": "wide",
          "data": ""
        }
      ];

      return reArrs;
    };

    onRowSelect (e) {

    };

    onRowUnselect (e) {

    };
}
