import {Component, EventEmitter, OnInit, Output, Input} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

declare var jQuery: any;

@Component({
    selector: 'app-tab-view',
    templateUrl: './tab.view.component.html',
    styles: [`
    `]
})
export class TabViewComponent extends BaseComponent implements OnInit {

  @Input() pullCopyTemp: any;
  @Output() innerDrop: EventEmitter<any> = new EventEmitter();
  @Output() showProperty: EventEmitter<any> = new EventEmitter();
  @Output() addNewVersion: EventEmitter<any> = new EventEmitter();

  isAdd: boolean = false;
  tabIndex: number =  0;
  parentArr: string[] = [];
  newTab: any = {
      name: 'tabitem',
      children: [],
      inputType: 'tabitem',
      icon: 'section',
      class: 'wide',
      isSubSection: false,
      attr: {
          name: 'tabitem',
          title: 'tabitem',
          visible: {},
          readOnly: {}
      }
  };

  ngOnInit() {
    // 监听事件
    this.registerSubject(this.subKey.INSPECTOR_NODE_SELECTED);
    if (this.model.children.length === 0) {
      let newTab = jQuery.extend(true, {}, this.newTab);
      this.model.children.push(newTab);
    }
  }

  // 获取所有父节点的name
  getNameList (data) {
    let nameArr = [];
    let temp = data;
    while (temp) {
      nameArr.push(temp.name);
      temp = temp.parent;
    }
    return nameArr;
  }

  // 订阅从控件树点击过来的事件
  onSubResult (key: string, data: any) {
   let nameArr = this.getNameList(data);
   setTimeout(() => {
      this.parentArr = nameArr
   }, 0)

   if (key === 'inspectorNodeSelected' && nameArr.includes(this.model.name)) {
    let index = this.model.children.findIndex((res) => nameArr.includes(res.name));
    if (index > -1) {
      this.tabIndex = index;
    }
   }
  }

  // 在section.view中拖动完毕
  drop(e: any) {
    this.innerDrop.emit(e);
  };

  onTabChange (e: any) {
   // 点击tab 设置 tab 的属性
    let last = this.model.children[e.index];
    if (last) {
      let name = last.name;
      this.showProperty.emit({inputType: 'tabitem', name});
      this.tabIndex = e.index;
    } else {
      // 新增tab时
      this.addNewTab(e);
    }
    e.originalEvent.cancelBubble = true;
  }

  // 新增tab
  addNewTab (e: any) {
    let len = this.model.children.length;
    if (e.index === len) {
      let newTab = jQuery.extend(true, {}, this.newTab);
      let unique = this.checkUnique();

      newTab.name+= '_' + new Date().getTime();
      newTab.attr.name += unique;
      newTab.attr.title += unique;

      this.model.children.push(newTab);
      this.addNewVersion.emit({});

      setTimeout(()=>{
        this.tabIndex = this.model.children.length - 1;
        this.showProperty.emit({inputType: 'tabitem', name: newTab.name});
      }, 0)
    }
  }

  // 检查唯一
  checkUnique () {
    let indexArr = [];
    this.model.children.forEach((res)=> {
       let temp = res.attr.name.split('tabitem')[1];
       if (temp && temp > 0) {
        let numStr = res.attr.name.split('tabitem')[1];
          indexArr.push(numStr)
       }
    });
    let numArr = indexArr.filter((s)=> !isNaN(s) );
    let index = 0;
    if (numArr.length > 0) {
      index = Math.max(...numArr) + 1;
    } else {
      index = 1;
    }
    return index;
  }

  checkEmpty (obj) {
    let bool = true;

    for(let i in obj) {
       bool = false
       break;
    }
    return bool;
  }

  onTabClose (e: any) {
    this.model.children.splice(e.index, 1);
    this.tabIndex = e.index - 1;
    this.addNewVersion.emit({});
  }
}
