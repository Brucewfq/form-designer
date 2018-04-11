import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appValidator]'
})


export class ValidatorDirective {

  @Input() appValidator: any;

  constructor(private el: ElementRef) {
  }

  // 目前至检验require类型
  @HostListener('blur', ['$event']) onBlur(e) {
    const el = this.el.nativeElement;
    const style = this.caculatePosition(e);
    let msgs = this.appValidator.msgs;
    const field = this.appValidator.field;
    this.cleareMsgs(msgs);

    // 判断弹框类型
    if (el.value === '') {
      msgs.push({severity: 'warn', summary: field + ' is required', detail: '', style});
    }
    event.stopPropagation();
  }

  // 清空弹框内容
  private cleareMsgs(msgs) {
    msgs.splice(0, msgs.length);
  }

  // 计算弹框位置
  private caculatePosition(e: any) {
    const {offsetTop, offsetLeft, offsetHeight, offsetWidth} = e.srcElement;
    const disX = offsetWidth * (1.4 - 1);
    const position = {
      position: 'absolute',
      left: offsetLeft - disX + 'px',
      top: offsetTop + offsetHeight + 'px',
      width: offsetWidth * 1.4 + 'px'
    };
    return position;
  }
}
