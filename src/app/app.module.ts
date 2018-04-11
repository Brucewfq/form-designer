import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';

import {AppRoutes} from './app.routes';
import 'rxjs/add/operator/toPromise';
import {StoreDevtoolsModule} from '@ngrx/store-devtools'; // 开发者工具
import {environment} from '../environments/environment';
import {StoreModule} from '@ngrx/store';

import {AccordionModule, ConfirmationService} from 'primeng/primeng';
import {AutoCompleteModule} from 'primeng/primeng';
import {BreadcrumbModule} from 'primeng/primeng';
import {ButtonModule} from 'primeng/primeng';
import {CalendarModule} from 'primeng/primeng';
import {CarouselModule} from 'primeng/primeng';
import {ChartModule} from 'primeng/primeng';
import {CheckboxModule} from 'primeng/primeng';
import {ChipsModule} from 'primeng/primeng';
import {CodeHighlighterModule} from 'primeng/primeng';
import {ConfirmDialogModule} from 'primeng/primeng';
import {ColorPickerModule} from 'primeng/primeng';
import {SharedModule} from 'primeng/primeng';
import {ContextMenuModule} from 'primeng/primeng';
import {DataGridModule} from 'primeng/primeng';
import {DataListModule} from 'primeng/primeng';
import {DataScrollerModule} from 'primeng/primeng';
import {DataTableModule} from 'primeng/primeng';
import {DialogModule} from 'primeng/primeng';
import {DragDropModule} from 'primeng/primeng';
import {DropdownModule} from 'primeng/primeng';
import {EditorModule} from 'primeng/primeng';
import {FieldsetModule} from 'primeng/primeng';
import {FileUploadModule} from 'primeng/primeng';
import {GalleriaModule} from 'primeng/primeng';
import {GMapModule} from 'primeng/primeng';
import {GrowlModule} from 'primeng/primeng';
import {InputMaskModule} from 'primeng/primeng';
import {InputSwitchModule} from 'primeng/primeng';
import {InputTextModule} from 'primeng/primeng';
import {InputTextareaModule} from 'primeng/primeng';
import {LightboxModule} from 'primeng/primeng';
import {ListboxModule} from 'primeng/primeng';
import {MegaMenuModule} from 'primeng/primeng';
import {MenuModule} from 'primeng/primeng';
import {MenubarModule} from 'primeng/primeng';
import {MessagesModule} from 'primeng/primeng';
import {MultiSelectModule} from 'primeng/primeng';
import {OrderListModule} from 'primeng/primeng';
import {OrganizationChartModule} from 'primeng/primeng';
import {OverlayPanelModule} from 'primeng/primeng';
import {PaginatorModule} from 'primeng/primeng';
import {PanelModule} from 'primeng/primeng';
import {PanelMenuModule} from 'primeng/primeng';
import {PasswordModule} from 'primeng/primeng';
import {PickListModule} from 'primeng/primeng';
import {ProgressBarModule} from 'primeng/primeng';
import {RadioButtonModule} from 'primeng/primeng';
import {RatingModule} from 'primeng/primeng';
import {ScheduleModule} from 'primeng/primeng';
import {SelectButtonModule} from 'primeng/primeng';
import {SlideMenuModule} from 'primeng/primeng';
import {SliderModule} from 'primeng/primeng';
import {SpinnerModule} from 'primeng/primeng';
import {SplitButtonModule} from 'primeng/primeng';
import {StepsModule} from 'primeng/primeng';
import {TabMenuModule} from 'primeng/primeng';
import {TabViewModule} from 'primeng/primeng';
import {TerminalModule} from 'primeng/primeng';
import {TieredMenuModule} from 'primeng/primeng';
import {ToggleButtonModule} from 'primeng/primeng';
import {ToolbarModule} from 'primeng/primeng';
import {TooltipModule} from 'primeng/primeng';
import {TreeModule} from 'primeng/primeng';
import {TreeTableModule} from 'primeng/primeng';
import {TreeDragDropService} from 'primeng/primeng';
import {NgxDnDModule} from '@swimlane/ngx-dnd';
import {NgxUIModule} from '@swimlane/ngx-ui';
import {SelectTreeModule} from './shared/tree/tree.module';

import {AppComponent, AppSubMenuComponent} from './app.component';
import {AppSubMenuDndComponent} from './app.menu.component';
import {AppTopBarComponent} from './app.topbar.component';
import {AppFooterComponent} from './app.footer.component';

import {ScriptLoaderService} from './util/script-loader.service';
import {BlocklyComponent} from './blockly/blockly.component';
import {TextboxPropertyComponent} from './properties/textbox/textbox.property.component';
import {MainPanelViewComponent} from './views/main-panel/main-panel.view.component';
import {FormViewComponent} from './views/form/form.view.component';
import {WindowViewComponent} from './views/window/window.view.component';
import {SectionViewComponent} from './views/section/section.view.component';
import {SectionColsViewComponent} from './views/section-cols/section-cols.view.component';
import {ToolbarViewComponent} from './views/toolbar/toolbar.view.component';
import {ToolbarPropertyComponent} from './properties/toolbar/toolbar.property.component';
import {SectionColsAutoViewComponent} from './views/section-cols-auto/section-cols-auto.view.component'
import {TextboxViewComponent} from './views/textbox/textbox.view.component';
import {PropertyBottomWigetComponent} from './wiget/property-bottom/property-bottom.wiget.component';
import {PropertyBindWigetComponent} from './wiget/property-bind/property-bind.wiget.component';

import {InspectorComponent} from './wiget/inspector/inspector.component';
import {SelectEventWigetComponent} from './wiget/select-event/select-event.wiget.component';
import {SelectEventService} from './wiget/select-event/select-event.service.component';
import {NumberViewComponent} from './views/number/number.view.component';
import {NumberPropertyComponent} from './properties/number/number.property.component';
import {CheckboxViewComponent} from './views/checkbox/checkbox.view.component';
import {CheckboxPropertyComponent} from './properties/checkbox/checkbox.property.component';
import {DropdownViewComponent} from './views/dropdown/dropdown.view.component';
import {DropdownPropertyComponent} from './properties/dropdown/dropdown.property.component';
import {LabelViewComponent} from './views/label/label.view.component';
import {LabelPropertyComponent} from './properties/label/label.property.component';
import {ChooseObjectComponent} from './wiget/choose-object/choose-object.component';
import {MenuComponent} from './menu/menu.component';
import {DateViewComponent} from './views/date/date.view.component';
import {DatePropertyComponent} from './properties/date/date.property.component';
import {RadioViewComponent} from './views/radio/radio.view.component';
import {RadioPropertyComponent} from './properties/radio/radio.property.component';
import {TextareaViewComponent} from './views/textarea/textarea.view.component';
import {TextareaPropertyComponent} from './properties/textarea/textarea.property.component';
import {SectionPropertyComponent} from './properties/section/section.property.component';
import {ButtonViewComponent} from './views/button/button.view.component';
import {ButtonPropertyComponent} from './properties/button/button.property.component';
import {SubmitViewComponent} from './views/submit/submit.view.component';
import {SubmitPropertyComponent} from './properties/submit/submit.property.component';
import {ImagePropertyComponent} from './properties/image/image.property.component';
import {ImageViewComponent} from './views/image/image.view.component';
import {LoadPropertyComponent} from './properties/load/load.property.component';
import {DataGridViewComponent} from './views/data-grid/data-grid.view.component';
import {DataGridPropertyComponent} from './properties/data-grid/data-grid.property.component';
import {NewPropertyComponent} from './properties/new/new.property.component';
import {BindObjectViewsComponent} from './views/bindobject/bindobject.views.component';
import {BindsourceViewComponent} from './views/bindsource/bindsource.view.component';
import {DataSourceOptionsComponent} from './properties/data-source-options/data-source-options.component';
import {DeployViewComponent} from './views/deploy/deploy.view.component';
import {SaveTemplateViewComponent} from './views/save-template/save-template.view.component';
import {FromPropertyComponent} from './properties/form/form.property.component';
import {WindowPropertyComponent} from './properties/window/window.property.component';
import {TabPanelComponent} from './wiget/tab-panel/tab-panel.component';
import {DataGridColumnsPropertyComponent} from './properties/data-grid-columns/data-grid-columns.property.component';
import {EmptyPropertyComponent} from './properties/empty/empty.property.component';
import {ChooseboxViewComponent} from './views/choosebox/choosebox.view.component';
import {ChooseboxPropertyComponent} from './properties/choosebox/choosebox.property.component';
import {SaveAsViewComponent} from './views/save-as/save-as.view.component';
import {SaveViewComponent} from './views/save/save.view.component';

import {DataSourceComponent} from './wiget/data-source/data-source.component';

import {HoverDirective} from './directive/hover.directive';
import {KeyBoradDirective} from './directive/keyboard.directive';
import {ValidatorDirective} from './directive/validate.directive';

import {HttpService} from './service/http.service';
import {TabViewComponent} from './views/tab/tab.view.component';
import {TabItemViewComponent} from './views/tab/tab-item/tab-item.view.component';
import {TabPropertyComponent} from './properties/tab/tab.property.component';
import {TabItemPropertyComponent} from './properties/tab/tab-item/tab-item.property.component';
import {SubjectService} from './service/subject.service';
import {BaseComponent} from './base/baseComponent';
import {ConstantService} from './service/constantService';
import {FileViewComponent} from './views/file/file.view.component';
import {FilePropertyComponent} from './properties/file/file.property.component';
import {FileSettingPropertyComponent} from './properties/file/setting/file.setting.property.component';
import {MyService} from './app.service';
import {NameService} from './service/name.service';
import {ValidateService} from './service/validate.service';

// 管道函数
import {formatJsonPipe} from './wiget/pipe/formatJson.component'

import {SmartDsTreeComponent} from './wiget/smartDs-tree/smartDs-tree.component';
import {ServiceTreeComponent} from './wiget/service-tree/service-tree.component';
import {ContextTreeComponent} from './wiget/context-tree/context-tree.component';
import {BlocklyJsComponent} from './blockly/blocklyJs.component';
import {DataDictComponent} from './wiget/data-dict/data-dict.component';
import {MessageComponent} from './wiget/message/message.component';
import {ViewModeComponent} from './wiget/view-mode/view-mode.component';
import {LoadingComponent} from './wiget/loading/loading.component';
import {MultilingualComponent} from './wiget/multilingual/multilingual.component';
import {BlocklyFactoryComponent} from './blockly/blocklyFactory.component';
import {AppSubMenuViewComponent} from './views/sub-menu/sub-menu.view.component';
import {NewFormViewComponent} from './views/new-form/new-form.view.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutes,
    HttpModule,
    BrowserAnimationsModule,
    AccordionModule,
    AutoCompleteModule,
    BreadcrumbModule,
    ButtonModule,
    CalendarModule,
    CarouselModule,
    ChartModule,
    CheckboxModule,
    ChipsModule,
    CodeHighlighterModule,
    ConfirmDialogModule,
    ColorPickerModule,
    SharedModule,
    ContextMenuModule,
    DataGridModule,
    DataListModule,
    DataScrollerModule,
    DataTableModule,
    DialogModule,
    DragDropModule,
    DropdownModule,
    EditorModule,
    FieldsetModule,
    FileUploadModule,
    GalleriaModule,
    GMapModule,
    GrowlModule,
    InputMaskModule,
    InputSwitchModule,
    InputTextModule,
    InputTextareaModule,
    LightboxModule,
    ListboxModule,
    MegaMenuModule,
    MenuModule,
    MenubarModule,
    MessagesModule,
    MultiSelectModule,
    OrderListModule,
    OrganizationChartModule,
    OverlayPanelModule,
    PaginatorModule,
    PanelModule,
    PanelMenuModule,
    PasswordModule,
    PickListModule,
    ProgressBarModule,
    RadioButtonModule,
    RatingModule,
    ScheduleModule,
    SelectButtonModule,
    SlideMenuModule,
    SliderModule,
    SpinnerModule,
    SplitButtonModule,
    StepsModule,
    TabMenuModule,
    TabViewModule,
    TerminalModule,
    TieredMenuModule,
    ToggleButtonModule,
    ToolbarModule,
    TooltipModule,
    TreeModule,
    TreeTableModule,
    NgxDnDModule,
    NgxUIModule,
    SelectTreeModule,
    !environment.production ? StoreDevtoolsModule.instrument({maxAge: 50}) : []
  ],
  declarations: [
    formatJsonPipe,
    BaseComponent,
    AppComponent,
    AppTopBarComponent,
    AppFooterComponent,
    MenuComponent,
    AppSubMenuComponent,
    AppSubMenuDndComponent,
    BlocklyComponent,
    BlocklyJsComponent,
    ChooseObjectComponent,
    MainPanelViewComponent,
    PropertyBottomWigetComponent,
    PropertyBindWigetComponent,
    SelectEventWigetComponent,
    InspectorComponent,
    TextboxViewComponent,
    TextboxPropertyComponent,
    FormViewComponent,
    WindowViewComponent,
    SectionViewComponent,
    SectionColsViewComponent,
    ToolbarViewComponent,
    ToolbarPropertyComponent,
    SectionColsAutoViewComponent,
    SectionPropertyComponent,
    NumberViewComponent,
    NumberPropertyComponent,
    CheckboxViewComponent,
    CheckboxPropertyComponent,
    DropdownViewComponent,
    DropdownPropertyComponent,
    DateViewComponent,
    DatePropertyComponent,
    RadioViewComponent,
    RadioPropertyComponent,
    LabelViewComponent,
    LabelPropertyComponent,
    HoverDirective,
    KeyBoradDirective,
    ValidatorDirective,
    TextareaViewComponent,
    TextareaPropertyComponent,
    DataSourceComponent,
    ButtonViewComponent,
    ButtonPropertyComponent,
    SubmitViewComponent,
    SubmitPropertyComponent,
    LoadPropertyComponent,
    ImageViewComponent,
    ImagePropertyComponent,
    DataGridViewComponent,
    DataGridPropertyComponent,
    TabViewComponent,
    TabItemViewComponent,
    TabPropertyComponent,
    TabItemPropertyComponent,
    FileViewComponent,
    FilePropertyComponent,
    FileSettingPropertyComponent,
    NewPropertyComponent,
    BindObjectViewsComponent,
    DeployViewComponent,
    SaveTemplateViewComponent,
    DataGridColumnsPropertyComponent,
    EmptyPropertyComponent,
    FromPropertyComponent,
    WindowPropertyComponent,
    BindsourceViewComponent,
    DataSourceOptionsComponent,
    SmartDsTreeComponent,
    ServiceTreeComponent,
    ContextTreeComponent,
    TabPanelComponent,
    DataDictComponent,
    MessageComponent,
    ViewModeComponent,
    LoadingComponent,
    MultilingualComponent,
    BlocklyFactoryComponent,
    ChooseboxViewComponent,
    ChooseboxPropertyComponent,
    AppSubMenuViewComponent,
    SaveAsViewComponent,
    NewFormViewComponent,
    SaveViewComponent
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    ScriptLoaderService, SelectEventService, HttpService, SubjectService, ConstantService,
    MyService, NameService, MessageComponent, ValidateService, ConfirmationService, TreeDragDropService
  ],
  entryComponents: [DataSourceOptionsComponent, TextboxPropertyComponent,
    NumberPropertyComponent, CheckboxPropertyComponent, DropdownPropertyComponent,
    LabelPropertyComponent, ChooseObjectComponent, DatePropertyComponent, RadioPropertyComponent, ButtonPropertyComponent,
    LoadPropertyComponent, ImagePropertyComponent, DataGridViewComponent, DataGridPropertyComponent, NewPropertyComponent,
    BindObjectViewsComponent, DeployViewComponent, ChooseboxPropertyComponent, SaveAsViewComponent,
    DataGridColumnsPropertyComponent, EmptyPropertyComponent, BindsourceViewComponent, NewFormViewComponent,
    SubmitPropertyComponent, BlocklyComponent, BlocklyJsComponent, ToolbarPropertyComponent, SaveViewComponent,
    TextareaPropertyComponent, SectionPropertyComponent, TabPropertyComponent, TabItemPropertyComponent, BlocklyFactoryComponent,
    FilePropertyComponent, FileSettingPropertyComponent, FromPropertyComponent, WindowPropertyComponent, SaveTemplateViewComponent, ViewModeComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
