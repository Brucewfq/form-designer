import {
  Component, Input, OnInit, AfterViewInit, OnDestroy, ElementRef, Renderer, ViewChild, ViewContainerRef, ComponentRef,
  Compiler, ComponentFactory, NgModule, ComponentFactoryResolver
} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Location } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { MenuItem } from 'primeng/primeng';
import {BlocklyComponent} from './blockly/blockly.component';
import {TextboxPropertyComponent} from './properties/textbox/textbox.property.component';
import {NumberPropertyComponent} from './properties/number/number.property.component';
import {CheckboxPropertyComponent} from './properties/checkbox/checkbox.property.component';
import {DropdownPropertyComponent} from './properties/dropdown/dropdown.property.component';
import {LabelPropertyComponent} from './properties/label/label.property.component';
import {ChooseObjectComponent} from './wiget/choose-object/choose-object.component';

declare var jQuery: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  componentRef: ComponentRef<any>;
  @ViewChild('compContainer', { read: ViewContainerRef }) container: ViewContainerRef;
  compMaps: {[key: string]: any} = {
    'app-textbox-property' : TextboxPropertyComponent,
    'app-number-property' : NumberPropertyComponent,
    'app-checkbox-property' : CheckboxPropertyComponent,
    'app-dropdown-property' : DropdownPropertyComponent,
    'app-label-property' : LabelPropertyComponent,
    'app-choose-object' : ChooseObjectComponent,
    'app-blockly' : BlocklyComponent
  };

    menuClick: boolean;

    menuButtonClick: boolean;

    topbarMenuButtonClick: boolean;

    topbarMenuClick: boolean;

    topbarMenuActive: boolean;

    activeTopbarItem: Element;

    layoutStatic: boolean = true;

    sidebarActive: boolean;

    mobileMenuActive: boolean;

    darkMenu: boolean;

    app: any = this;

    constructor(public renderer: Renderer, private resolver: ComponentFactoryResolver) { };

    display: boolean = false;

    showDialog (str) {
      this.display = true;
      this.container.clear();
      if (this.compMaps[str]) {
        const factory: ComponentFactory<any> =
          this.resolver.resolveComponentFactory(this.compMaps[str]);
        this.componentRef = this.container.createComponent(factory);
      }
      // this.componentRef.instance.type = type;
      if (this.componentRef.instance.doFinish) {
        this.componentRef.instance.doFinish.subscribe((res: any) => this.doFinish(res));
      }
    }

    doFinish (res) {
        if (res) {
          this.targetBuilderTools = res;
        }
        this.closeDialog ();
    }

    closeDialog () {
      this.display = false;
      let blocklyWidgetDiv = document.getElementsByClassName('blocklyWidgetDiv');
      let blocklyTooltipDiv = document.getElementsByClassName('blocklyTooltipDiv');
      if (blocklyWidgetDiv && blocklyWidgetDiv.length > 0) {
        for (let i = 0; i < blocklyWidgetDiv.length; i++) {
          // blocklyWidgetDiv[i].style.display = 'none';
          blocklyWidgetDiv[i].setAttribute('style','display:none;');
        }
      }
      if (blocklyTooltipDiv && blocklyTooltipDiv.length > 0) {
        for (let i = 0; i < blocklyTooltipDiv.length; i++) {
          //blocklyTooltipDiv[i].style.display = 'none';
          blocklyTooltipDiv[i].setAttribute('style','display:none;');
        }
      }
    }

    onWrapperClick() {
        if (!this.menuClick && !this.menuButtonClick) {
            this.mobileMenuActive = false;
        }

        if (!this.topbarMenuClick && !this.topbarMenuButtonClick) {
            this.topbarMenuActive = false;
            this.activeTopbarItem = null;
        }

        this.menuClick = false;
        this.menuButtonClick = false;
        this.topbarMenuClick = false;
        this.topbarMenuButtonClick = false;
    }

    onMenuButtonClick(event: Event) {
        this.menuButtonClick = true;

        if (this.isMobile()) {
            this.mobileMenuActive = !this.mobileMenuActive;
        }

        event.preventDefault();
    }

    onTopbarMobileMenuButtonClick(event: Event) {
        this.topbarMenuButtonClick = true;
        this.topbarMenuActive = !this.topbarMenuActive;
        event.preventDefault();
    }

    onTopbarRootItemClick(event: Event, item: Element) {
        this.showDialog('app-choose-object');
        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null;
        } else {
            this.activeTopbarItem = item;
        }

        event.preventDefault();
    }

    onTopbarMenuClick(event: Event) {
        this.topbarMenuClick = true;
    }

    onSidebarClick(event: Event) {
        this.menuClick = true;
    }

    onToggleMenuClick(event: Event) {
        this.layoutStatic = !this.layoutStatic;
    }

    isMobile() {
        return window.innerWidth < 640;
    }


    @Input() reset: boolean;

    model: any[];

    section: any = { name: 'Section', children: [], inputType: 'section', icon: 'section', class: 'wide' };

    layoutMenuScroller: HTMLDivElement;

    @ViewChild('layoutMenuScroller') layoutMenuScrollerViewChild: ElementRef;

    ngOnInit() {
        this.model = [
            // {label: 'Dashboard', icon: 'dashboard', routerLink: ['/']},
            {
                label: 'Containers', icon: 'settings', badge: '3',
                items: [
                    { label: 'Section', icon: 'view_quilt', drop : [
                      this.section
                    ] },
                    { label: '2-Column', icon: 'label', drop: [
                      { name: 'section-col-2', children: [this.section, this.section], inputType: 'section-cols', icon: 'section', class: 'wide'}
                      ]},
                    { label: '3-Column', icon: 'label_outline', drop: [
                      { name: 'section-col-3', children: [this.section, this.section, this.section], inputType: 'section-cols', icon: 'section', class: 'wide'}
                    ] }
                ]
            },
            {
                label: 'Basic Fields', icon: 'palette', badge: '5',
                items: [
                    { label: 'String', icon: 'flip_to-front', drop: [
                      { name: 'A Textbox', inputType: 'textbox', icon: 'field-text', class: 'half' }
                    ]},
                    { label: 'Number', icon: 'flip_to-front', drop: [
                      { name: 'A Number', inputType: 'number', icon: 'field-text', class: 'half' }
                    ]},
                    { label: 'Checkbox', icon: 'flip_to-front', drop: [
                      { name: 'A Checkbox', inputType: 'checkbox', icon: 'field-text', class: 'half' }
                    ]},
                    { label: 'Dropdown', icon: 'flip_to-front', drop: [
                      { name: 'A Dropdown', inputType: 'dropdown', icon: 'field-text', class: 'half' }
                    ]},
                    { label: 'Label', icon: 'flip_to-front', drop: [
                      { name: 'A Label', inputType: 'label', icon: 'field-text', class: 'half' }
                    ]}
                ]
            },

            { label: 'Utils', icon: 'build', routerLink: ['/utils'] }
        ];
    }

    ngAfterViewInit() {
        this.layoutMenuScroller = <HTMLDivElement>this.layoutMenuScrollerViewChild.nativeElement;

        setTimeout(() => {
            jQuery(this.layoutMenuScroller).nanoScroller({ flash: true });
        }, 10);
    }

    changeTheme(theme) {
        const themeLink: HTMLLinkElement = <HTMLLinkElement>document.getElementById('theme-css');
        themeLink.href = 'assets/theme/theme-' + theme + '.css';
    }

    changeLayout(theme) {
        const layoutLink: HTMLLinkElement = <HTMLLinkElement>document.getElementById('layout-css');
        layoutLink.href = 'assets/layout/css/layout-' + theme + '.css';
    }

    updateNanoScroll() {
        setTimeout(() => {
            jQuery(this.layoutMenuScroller).nanoScroller();
        }, 500);
    }

    ngOnDestroy() {
        jQuery(this.layoutMenuScroller).nanoScroller({ flash: true });
        this.componentRef.destroy();
    }


    sourceBuilderTools = [
      { name: 'Section', children: [], inputType: 'section', icon: 'section', class: 'wide' },
      { name: 'A String', inputType: 'string', icon: 'field-text', class: 'half' },
      { name: 'A Number', inputType: 'number', icon: 'field-numeric', class: 'half' }
    ];
    targetBuilderTools: any[] = [];
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

@Component({
    /* tslint:disable:component-selector */
    selector: '[app-submenu]',
    /* tslint:enable:component-selector */
    template: `
            <ng-template ngFor let-child let-i="index" [ngForOf]="(root ? item : item.items)">
                <li [ngClass]="{'active-menuitem': isActive(i)}" [class]="child.badgeStyleClass">
                    <a [href]="child.url||'#'" (click)="itemClick($event,child,i)" *ngIf="!child.routerLink"
                       [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
                        (mouseenter)="hover=true" (mouseleave)="hover=false" class="ripplelink">
                        <i class="material-icons">{{child.icon}}</i>
                        <span class="menuitem-text">{{child.label}}</span>
                        <i class="material-icons layout-submenu-toggler" *ngIf="child.items">keyboard_arrow_down</i>
                        <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
                    </a>
    
                    <a (click)="itemClick($event,child,i)" *ngIf="child.routerLink"
                        [routerLink]="child.routerLink" routerLinkActive="active-menuitem-routerlink"
                       [routerLinkActiveOptions]="{exact: true}" [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
                        (mouseenter)="hover=true" (mouseleave)="hover=false" class="ripplelink">
                        <i class="material-icons">{{child.icon}}</i>
                        <span class="menuitem-text">{{child.label}}</span>
                        <i class="material-icons layout-submenu-toggler" *ngIf="child.items">>keyboard_arrow_down</i>
                        <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
                    </a>
                    <ul app-submenudnd [item]="child" *ngIf="child.items" [visible]="isActive(i)" [reset]="reset"
                        [@children]="isActive(i) ? 'visible' : 'hidden'"></ul>
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
export class AppSubMenuComponent {

    @Input() item: MenuItem;

    @Input() root: boolean;

    @Input() visible: boolean;

    _reset: boolean;

    activeIndex: number;

    hover: boolean;

    constructor(public app: AppComponent, public router: Router, public location: Location) { }

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
}
