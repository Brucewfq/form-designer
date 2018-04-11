import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-bind-source',
  templateUrl: './bindsource.view.component.html',
  styles: [`
    .deleteSource {
      display: none;
      position: absolute;
      width: 20px;
      height: 20px;
      background: url(../../assets/icons/delete-icon.svg) no-repeat top right;
      right: 0;
      top: 0;
    }

    .section-wrap:hover > .deleteSource {
      display: block;
    }

    .database {
      width: 100%;
      height: 30px;
      border-radius: 5px;
      background: none;
      background: url(../../../assets/icons/side-bar/bindsource.svg) no-repeat center;
      outline: none;
      border: none;
    }

    .text {
      width: 100%;
      height: 30px;
      overflow: hidden;
    }
  `]
})

export class BindsourceViewComponent implements OnInit {
  @Input() bindsource: any;
  @Output() changeBindSource = new EventEmitter<any>();
  @Output() changeCurrentSource = new EventEmitter<any>();
  @Output() onPerpareCopy = new EventEmitter<any>();

  types: any[] = ['bindsource'];

  constructor(private app: AppComponent) {
  }

  ngOnInit() {
  }

  changeBind(e: any) {
    let filter = e.inputType || e.value.inputType;
    this.filterBindSource(filter);
    if (filter.includes('bindsource')) {
      this.changeBindSource.emit(this.bindsource);
    }
  }

  filterBindSource(filter: string) {
    let isOnlyRoot = this.bindsource.findIndex((res) => res.onlyRoot);
    let bindBar = this.bindsource[isOnlyRoot].children;

    for (let i = 0; i < bindBar.length; i++) {
      let temp = bindBar[i].children;
      if (!temp[0].inputType.includes('bindsource')) {
        bindBar.splice(i, 1);
        break;
      }
    }
  }

  drop(e) {
    // 修改内部数据
    let isOnlyRoot = this.bindsource.findIndex((res) => res.onlyRoot);
    let bindBar = this.bindsource[isOnlyRoot].children;
    bindBar.push({
      'name': 'Section' + Math.ceil(Math.random() * 100),
      'children': [],
      'inputType': 'section',
      'icon': 'section',
      'class': 'wide'
    });
    e.value.name += Math.ceil(Math.random() * 99);
    bindBar[bindBar.length - 1].children.push(e.value);
    e.value.attr.dataSource.name = e.value.name;
    if (isOnlyRoot === 0) {
      this.bindsource = this.bindsource.splice(0, 1);
    } else if (isOnlyRoot > 0) {
      this.bindsource = this.bindsource.splice(1, 2);
    }
    this.doBind(e.value)
    // 修改外部数据
    this.changeBind(e);
  }

  onInnerDrop(e: any) {
    let isOnlyRoot = this.bindsource.findIndex((res) => res.onlyRoot);
    let bindBar = this.bindsource[isOnlyRoot].children;

    // 思路 1 覆盖
    // 思路 2 保持不变
    for (let i = 0; i < bindBar.length; i++) {
      if (bindBar[i].children.length > 1) {
        let temp = bindBar[i].children;
        // temp.splice(0,1);  // 覆盖
        temp.splice(1, temp.length);  // 保持不变
        break;
      }
    }
    this.doBind(e.value);
    this.changeBind(e);
  }

  over(e: any) {
    console.info('over')
  }

  out(e: any) {
    console.info('out')
  }

  delete(model: any) {
    this.doDelete(model.name, this.bindsource);
    this.checkEmpty();
    this.changeBind(model);
  }

  // 寻找空的盒子删除
  checkEmpty() {
    let isOnlyRoot = this.bindsource.findIndex((res) => res.onlyRoot);
    let bindBar = this.bindsource[isOnlyRoot].children;

    for (let i = 0; i < bindBar.length; i++) {
      if (bindBar[i].children.length === 0) {
        bindBar.splice(i, 1);
        break;
      }
    }
  }

  doDelete(name: string, datas: any[]) {
    if (datas && datas.length > 0) {
      for (let i = 0; i < datas.length; i++) {
        let child = datas[i];
        if (child.name === name) {
          datas.splice(i, 1);
          break;
        } else {
          if (child.children && child.children.length > 0) {
            this.doDelete(name, child.children);
            this.app.showComponentProperty({inputType: ''});
          }
        }
      }
    } else {
      return null;
    }
  }

  doBind(model: any) {
    // 数据绑定开始
    this.app.showComponentProperty(model);
    this.changeCurrentSource.emit(model);
    this.onPerpareCopy.emit(null);
  }
}
