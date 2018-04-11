import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appControlContainer]'
})
export class HoverDirective {

  constructor(private el: ElementRef) {
  }

  @HostListener('mouseover') onMouseOver() {
    const el = this.el.nativeElement;
    this.toggleClass(el, 'active');
    event.stopPropagation();
  }

  @HostListener('mouseout') onMouseOut() {
    const el = this.el.nativeElement;
    this.toggleClass(el, 'active');
    event.stopPropagation();
  }

  private hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
  };

  private addClass(obj, cls) {
    if (!this.hasClass(obj, cls)) {
      obj.className += ' ' + cls
    }
  };

  private removeClass(obj, cls) {
    if (this.hasClass(obj, cls)) {
      const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      obj.className = obj.className.replace(reg, ' ');
    }
  }

  private toggleClass(obj, cls) {
    if (this.hasClass(obj, cls)) {
      this.removeClass(obj, cls);
    } else {
      this.addClass(obj, cls);
    }
  }
}
