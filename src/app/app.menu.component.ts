import {Component, Input, OnInit, AfterViewInit, OnDestroy, ElementRef, Renderer, ViewChild} from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {MenuItem} from 'primeng/primeng';
import {AppComponent} from './app.component';

@Component({
  /* tslint:disable:component-selector */
  selector: '[app-submenudnd]',
  /* tslint:enable:component-selector */
  template: `
    <ng-template ngFor let-child let-i="index" [ngForOf]="(root ? item : item.items)">
      <li [ngClass]="{'active-menuitem': isActive(i)}" [class]="child.badgeStyleClass">
        <ngx-dnd-container [model]="child.drop"
                           [dropZones]="setSection(child)"
                           [copy]="true" (drag)="builderDrag($event, child)" (drop)="builderDrop($event)">
          <ng-template let-item="model">
            <!--<i class="material-icons">{{child.icon}}</i>-->

            <!-- 新增template-->
            <img class="menuitem-icons" src="{{child.iconUrl}}" alt="" *ngIf='!child.isTemplate'>
            <img class="menuitem-icons" src="{{child.iconUrl}}" alt="" *ngIf='child.isTemplate'>
            <span class="menuitem-text" *ngIf='child.isTemplate'>{{child.name}}</span>
            <span class="menuitem-text" *ngIf='child.label==="Tab"'>{{child.label}}</span>
            <span class="menuitem-text" *ngIf='child.label==="file"'>{{child.label}}</span>
          </ng-template>
        </ngx-dnd-container>
      </li>
    </ng-template>
  `,
  animations: [
    trigger('children', [
      state('visible', style({
        height: '*'
      })),
      state('hidden', style({
        height: '0px'
      })),
      transition('visible => hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('hidden => visible', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class AppSubMenuDndComponent {

  @Input() item: MenuItem;

  @Input() root: boolean;

  @Input() visible: boolean;

  _reset: boolean;

  activeIndex: number;

  hover: boolean;

  constructor(public app: AppComponent, public router: Router, public location: Location) {
  }

  itemClick(event: Event, item: MenuItem, index: number) {
    // avoid processing disabled items
    if (item.disabled) {
      event.preventDefault();
      return true;
    }

    // activate current item and deactivate active sibling if any
    if (item.routerLink || item.items || item.command || item.url) {
      this.activeIndex = (this.activeIndex === index) ? null : index;
    }

    // execute command
    if (item.command) {
      item.command({originalEvent: event, item: item});
    }

    // prevent hash change
    if (item.items || (!item.url && !item.routerLink)) {
      event.preventDefault();
    }

    // hide menu
    if (!item.items) {
      if (this.app.isMobile()) {
        this.app.sidebarActive = false;
        this.app.mobileMenuActive = false;
      }
    }
  }

  isActive(index: number): boolean {
    return this.activeIndex === index;
  }

  @Input() get reset(): boolean {
    return this._reset;
  }

  set reset(val: boolean) {
    this._reset = val;
  }

  builderDrag(e: any, child: any) {
    // 增加检查遍历混合组建名称是否重复
    let temp = child.drop;
    let tamp = '_' + new Date().getTime().toString()
    let nameArr = e.value.name.split('_');
    e.value.name = nameArr[0] + tamp;

    // 针对section-2 section-3 section-4 的子节点做二次处理
    if (e.value.name.includes('section') || e.value.name.includes('tab')) {
      for (let i  = 0; i < e.value.children.length; i++) {
          let name = e.value.children[i].name;
          let newName = name.substring(0, name.length-3) + Math.ceil(Math.random()*999);
          e.value.children[i].name = newName;
      }
    }
  }

  bulderOver (e: any) {
    console.info(e)
  }

  checkName(item) {
    if (this.app.getDataBy(item.name)) {

      item.name = item.inputType + new Date().getTime();
      this.checkName(item);
    }
  }

  log(e: any) {
    console.log(e.type, e);
  }

 /**
  * section和grid允许拖动到表单里，其余的控件只能拖到section里面
  * @param child 控件子节点
  */
  setSection(child: any): any {
    if(child.label === 'Section'
      || child.label === '2-Column'
      || child.label === '3-Column'
      || child.label === '4-Column'
      || child.label === 'Template'
      || child.label === 'Tab'
      || child.label === 'data-grid'
      || child.label === 'toolbar'
      || child.label === 'file'
      || child.label === 'tree-grid') {
        return ['builder-target', 'builder-target-section'];
      }
      else {
        return ['builder-target-section'];
      }
  }
}
