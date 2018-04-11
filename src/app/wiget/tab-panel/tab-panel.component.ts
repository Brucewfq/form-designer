import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-tab-panel',
  templateUrl: 'tab-panel.component.html'
})

export class TabPanelComponent extends BaseComponent implements OnInit {

  // 是否显示控件树
  @Input() isShowTree: Boolean = true;

  // 是否显示smartDs
  @Input() isShowSmartDs: Boolean = true;

  // 是否显示service
  @Input() isShowService: Boolean = true;

  // 是否显示local
  @Input() isShowContext: Boolean = true;

  // 表单控件的json数据
  @Input() targetBuilderTools: any;

  // smartDs数据
  @Input() smartDsData: any;

  // 默认显示的tab title
  @Input() defaultTabTitle: any;

  @Input() serviceTreeSource: any;

  @Input() pullCopyTemp: any;

  @Input() treeData: any;

  // 当前组件绑定的smartDs
  @Input() curPomBindSmartDs: any;

  // 当前组件绑定的service
  @Input() curPomBindService: any;

  serviceDatas: any;

  // 当前选中的tab
  selectedTab: String = 'componentTree';

  //
  handleChange(e) {
    if (e) {
      this.selectedTab = e.originalEvent.srcElement.innerText;
    }
  }

  ngOnInit() {
    this.serviceDatas = this.constantService.getDataByKey(this.subKey.serviceChange);
    this.registerSubject(this.subKey.serviceChange);

    this.smartDsData = this.constantService.getDataByKey(this.subKey.smartDsChange);
    this.registerSubject(this.subKey.smartDsChange);

    this.registerSubject(this.subKey.TARGET_BUILDER_TOOLS_CHANGE);
    if (this.defaultTabTitle) {
      this.selectedTab = this.defaultTabTitle;
    }
  }

  onSubResult(key: string, data: any) {
    if (key === this.subKey.serviceChange) {
      this.serviceDatas = data;
    } else if (key === this.subKey.smartDsChange) {
      this.smartDsData = data;
    } else if (key === this.subKey.TARGET_BUILDER_TOOLS_CHANGE) {
      this.targetBuilderTools = data;
    }
  }
}
