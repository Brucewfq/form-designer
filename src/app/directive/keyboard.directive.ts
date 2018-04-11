import {Directive, ElementRef, HostListener, HostBinding, Input, OnInit} from '@angular/core';
import {NameService} from '../service/name.service';
import {SubjectService} from '../service/subject.service';
import {ConstantService} from '../service/constantService';

@Directive({
  selector: '[appControlKeyBoard]'
})

export class KeyBoradDirective implements OnInit {
  @Input() appControlKeyBoard: any;

  constructor(private el: ElementRef,
              private nameService: NameService,
              private subjectService: SubjectService,
              private constantService: ConstantService) {
  }

  ngOnInit() {
  }

  // 监听keyup事件
  @HostListener('keydown', ['$event']) onkeydown(event) {
    switch (event.keyCode) {
      case 46: // delete
        this.deleteModel();
        break;
      default:
        break;
    }
    event.stopPropagation();
  }

  private deleteModel() {
    const {model, targetBuilderTools} = this.appControlKeyBoard;
    this.delete(model, targetBuilderTools);
  }

  // 执行删除控件，新增版本
  private delete(model: any, targetBuilderTools) {
    this.doDelete(model.name, targetBuilderTools);
    // 表单控件数据改变事件
    this.subjectService.broadcastData(this.constantService.subKey.KEYBORAD_DIECTIVE_DELETE, targetBuilderTools);
  }

  // 找到元素删除对象
  private doDelete(name: string, datas: any[]) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        let child = datas[i];
        if (child.name === name) {
          return datas.splice(i, 1);
        } else {
          if (child.children && child.children.length > 0) {
            this.doDelete(name, child.children);
          }
        }
      }
    } else {
      return null;
    }
  }
}
