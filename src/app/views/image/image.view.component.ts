import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-image-view',
  templateUrl: './image.view.component.html'
})

export class ImageViewComponent extends BaseComponent implements OnInit {

  defaults: any = {
    src: '/assets/image-upload.svg',
    width: '200',
    height: '100'
  }

  get getWidth() {
    const width = this.model.attr.width;
    if (width && !isNaN(parseInt(width, 10))) {
      return parseInt(width, 10) + 'px';
    } else {
      return this.defaults.width + 'px';
    }
  }

  get getHeight() {
    const height = this.model.attr.height;
    if (height && !isNaN(parseInt(height, 10))) {
      return parseInt(height, 10) + 'px';
    } else {
      return this.defaults.height + 'px';
    }
  }

  get getSrc() {
    const src = this.model.attr.realSrc;
    if (src) {
      return src;
    } else {
      return this.defaults.src;
    }
  }

  ngOnInit() {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }
  }
}
