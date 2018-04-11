import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';
import {ImageService} from './image.property.component.service';

import {SubjectService} from '../../service/subject.service';
import {NameService} from '../../service/name.service';
import {ValidateService} from '../../service/validate.service';
import {ConstantService} from '../../service/constantService';
import {ConfirmationService} from 'primeng/primeng';
import {HttpService} from '../../service/http.service';
import {ScriptLoaderService} from '../../util/script-loader.service';
import {AppModelService} from '../../app.model'


interface FileReaderEventTarget extends EventTarget {
  result: string
}

interface FileReaderEvent extends Event {
  target: FileReaderEventTarget;

  getMessage(): string;
}

@Component({
  selector: 'app-image-property',
  templateUrl: './image.property.component.html',
  styles: [``],
  providers: [ImageService]
})

export class ImagePropertyComponent extends BaseComponent implements OnInit {

  image: any = {};

  msgs: any[] = [];

  imageDefaultSize: number = 1024 * 10 * 2000;

  selectedEvent: any = {};

  maxSize: any = {
    width: 200,
    height: 100
  };

  eventData: any[] = [
    {'name': 'Change', 'desc': 'set event', id: 1}
  ];

  imageSize: any = {
    width: '',
    height: ''
  };

  constructor(public subjectService: SubjectService,
              public constantService: ConstantService,
              public httpService: HttpService,
              public nameService: NameService,
              public _script: ScriptLoaderService,
              public validateService: ValidateService,
              public confirmationService: ConfirmationService,
              public imageService: ImageService,
              public appModelService: AppModelService) {
    super(subjectService, constantService, httpService, nameService, _script, validateService, confirmationService, appModelService);
  }

  get eventDatas() {
    const arr = this.getEventData(this.eventData);
    return arr;
  }

  ngOnInit() {
    if (this.dataModel && this.dataModel.attr) {
      this.image = this.deepCopy(this.dataModel.attr);
      this.imageSize.width = this.dataModel.attr.width || '200';
      this.imageSize.height = this.dataModel.attr.height || '100';
    }
    this.showInitValidate();
  }

  deepCopy(val: any) {
    const cache = [];
    const jsonStr = JSON.stringify(val, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    return JSON.parse(jsonStr);
  }

  chooseEvent(e) {
    if (this.selectedViewMode === 'edit') {
      this.showDialog.emit({inputType: 'app-blockly', name: this.dataName, key: this.selectedEvent.name});
    }
  };

  onChange(field?: string, type = {}) {
    const width = this.imageSize.width;
    const height = this.imageSize.height;

    const retData = {
      dataName: this.dataName,
      attr: this.image
    };
    if (!isNaN(parseInt(width, 10))) {
      retData.attr.width = width;
    } else {
      retData.attr.width = '';
    }

    if (!isNaN(parseInt(height, 10))) {
      retData.attr.height = height;
    } else {
      retData.attr.height = '30';
    }
    this.editData.emit(retData);

    if (field) {
      this.validate(field, this.image, type);
    }
  }

  // 选择图片
  onSelect(e) {
    const file = e.files[0];
    const that = this;
    if (file.type.indexOf('image') === 0) {
      if (file.size > this.imageDefaultSize) {
        this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
          severity: 'error',
          summary: '文件过大',
          detail: ''
        });
      } else {
        // 创建文件读取对象
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (d: FileReaderEvent) => {
          const src = d.target.result;
          that.getNatural(src, e, that);
        }
      }
    } else {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
        severity: 'error',
        summary: '格式不正确',
        detail: ''
      });
    }
  }

  // 获取图片的尺寸
  getNatural(src, e, that) {
    const newImage = new Image();
    newImage.src = src;
    newImage.onload = () => {
      // that.image.src = src;
      that.image.fileName = e.files[0].name;
      let {width, height} = newImage;
      // es6语法，属性别名
      const {width: maxWidth, height: maxHeight} = that.maxSize;
      width = width >= maxWidth ? maxWidth : width;
      height = height >= maxHeight ? maxHeight : height;
      that.imageSize.width = width;
      that.imageSize.height = height;
      that.onChange();
      that.upload(e);
    }
  }

  // 上传图片
  upload(e: any) {
    const formdata = new FormData();
    formdata.append('file', e.files[0]);

    this.imageService.uploadImage(formdata).then((res) => {
      const baseUrl = 'http://demo.k2software.com.cn:9090';
      this.image.src = res.thumbPath;
      this.image.realSrc = baseUrl + res.relativePath;
    }).catch((err) => {
      this.subjectService.broadcastData(this.subKey.ALERT_MESSAGE, {
        severity: 'error',
        summary: '上传失败',
        detail: ''
      });
    })
  }
}
