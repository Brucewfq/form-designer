import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-new-property',
  templateUrl: './new.property.component.html',
  styleUrls: [`./new.property.component.scss`]
})

export class NewPropertyComponent {
  @Output() doFinish = new EventEmitter();

  constructor() {
  }

  clickFinish(e: any) {
    // 清空当前对象 pullData pullIndex  pullCopyTemp pullCopyModel
    this.doFinish.emit([]);
  }
}
