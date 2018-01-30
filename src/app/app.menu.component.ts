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
                  <ngx-dnd-container [model]="child.drop" [dropZones]="['builder-target']"
                                     [copy]="true"  (drag)="builderDrag($event)">
                    <ng-template let-item="model">
                    <i class="material-icons">{{child.icon}}</i>
                    <span class="menuitem-text">{{child.label}}</span>
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

  itemClick(event: Event, item: MenuItem, index: number)  {
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
      item.command({ originalEvent: event, item: item });
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

  builderDrag(e: any) {
    const item = e.value;
    item.data = item.inputType === 'number' ?
      (Math.random() * 100) | 0 :
      Math.random().toString(36).substring(20);
  }

  log(e: any) {
    console.log(e.type, e);
  }
}
