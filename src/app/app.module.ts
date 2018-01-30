import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {AppRoutes} from './app.routes';
import 'rxjs/add/operator/toPromise';

import {AccordionModule} from 'primeng/primeng';
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
import {NgxDnDModule} from '@swimlane/ngx-dnd';
import {NgxUIModule} from '@swimlane/ngx-ui';

import {AppComponent, AppSubMenuComponent} from './app.component';
import {AppSubMenuDndComponent} from './app.menu.component';
import {AppTopBarComponent} from './app.topbar.component';
import {AppFooterComponent} from './app.footer.component';

import {ScriptLoaderService} from './util/script-loader.service';
import {BlocklyComponent} from './blockly/blockly.component';
import {MenuComponent} from './menu/menu.component';
import {TextboxPropertyComponent} from './properties/textbox/textbox.property.component';
import {MainPanelViewComponent} from './views/main-panel/main-panel.view.component';
import {SectionViewComponent} from './views/section/section.view.component';
import {SectionColsViewComponent} from './views/section-cols/section-cols.view.component';
import {TextboxViewComponent} from './views/textbox/textbox.view.component';
import {PropertyBottomWigetComponent} from './wiget/property-bottom/property-bottom.wiget.component';
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
import {HoverDirective} from './directive/hover.directive';

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
    NgxUIModule
  ],
  declarations: [
    AppComponent,
    AppTopBarComponent,
    AppFooterComponent,
    MenuComponent,
    AppSubMenuComponent,
    AppSubMenuDndComponent,
    BlocklyComponent,
    ChooseObjectComponent,
    MainPanelViewComponent,
    PropertyBottomWigetComponent,
    SelectEventWigetComponent,
    TextboxViewComponent,
    TextboxPropertyComponent,
    SectionViewComponent,
    SectionColsViewComponent,
    NumberViewComponent,
    NumberPropertyComponent,
    CheckboxViewComponent,
    CheckboxPropertyComponent,
    DropdownViewComponent,
    DropdownPropertyComponent,
    LabelViewComponent,
    LabelPropertyComponent,
    HoverDirective
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy}, ScriptLoaderService, SelectEventService
  ],
  entryComponents: [TextboxPropertyComponent, NumberPropertyComponent, CheckboxPropertyComponent
    , DropdownPropertyComponent, LabelPropertyComponent, ChooseObjectComponent, BlocklyComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
