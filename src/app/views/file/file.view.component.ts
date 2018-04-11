import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

declare var jQuery: any;
@Component({
    selector: 'app-file-view',
    templateUrl: './file.view.component.html',
    styles: [`
      :host /deep/ .file-component .ui-fileupload-buttonbar {
        background: #fff;
        border: none;
      }
      /*隐藏上传按钮*/
      :host /deep/ .file-component .ui-fileupload-choose + button {
        display: none;
      }
      /*按钮整体样式*/
      :host /deep/ .file-component .ui-fileupload-buttonbar .ui-button {
        background-color: #fff;
        color: #000;
      }
      :host /deep/ .file-component .ui-fileupload-buttonbar .ui-button:hover {
        background-color: #d6e6dc;
      }
      /*文件上传文件input框*/
      :host /deep/ .file-component .ui-fileupload-choose input[type=file] {
        width: 100%;
        height: 100%;
      }
      /*隐藏进度条*/
      :host /deep/ .file-component .ui-fileupload-content .ui-progressbar {
        height: 1px; 
      }
      /*单元格样式*/
      :host /deep/ .file-component .ui-fileupload-content .ui-fileupload-row>div {
        border: 1px solid #ccc;
        padding-left: 2em;
        padding-right: 2em;
      }
      /*删除按钮样式*/
      :host /deep/ .file-component .ui-fileupload-content .ui-button.ui-button-icon-only {
        border-radius: 0!important;
        background-color: rgba(0, 0, 0, 0.1);
        width:2em;
        height: 2em;
      }
      /*表格样式*/
      table tr:nth-child(odd) {
        background-color: #f4f4f4
      }
      table tr>td, table tr>th {
        padding: 0.25em 2em;
        height: 30px;
      }
    `]
})

export class FileViewComponent extends BaseComponent implements OnInit {
  files: any;
  @ViewChild('tabhead')
  tabhead: ElementRef;

  ngOnInit () {
    if (this.model.attr && !this.model.attr.size) {
      this.model.attr.size =  2 * 1024 * 1024;
    }
  }

  onSelect (e: any) {
    this.insertTabHead();
  }

  // 获取文件内其他的属性
  getFileAttr (e, attr) {
    console.info(e);
    let result = e[attr];
    if (attr === 'lastModified') {
      result = this.getLocalTime(result);
    }
    return result;
  }

  // 转化时间戳到时间格式
  getLocalTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
  }

  insertTabHead () {
    const el = this.tabhead.nativeElement;
    const top = jQuery(el.parentNode.parentNode.parentNode);
    setTimeout(() => {
      const target = top.find('.ui-fileupload-files>div:first');
      target.prepend(el);
    }, 0);
  }

  onRemove (e: any) {
    console.info('clear');
  }
}
