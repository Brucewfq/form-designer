import {Component, Input} from '@angular/core';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.view.component.html'
})


export class MainPanelViewComponent {

  @Input() targetBuilderTools: any;

  constructor(private app: AppComponent) {

  };

  log(e: any) {
    console.log(e.type, e);
  };

  hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
  };

  addClass(obj, cls) {
    if (!this.hasClass(obj, cls)) {
      obj.className += ' ' + cls
    }
  };

  removeClass(obj, cls) {
    if (this.hasClass(obj, cls)) {
      const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      obj.className = obj.className.replace(reg, ' ');
    }
  }

  toggleClass(obj, cls) {
    if (this.hasClass(obj, cls)) {
      this.removeClass(obj, cls);
    } else {
      this.addClass(obj, cls);
    }
  }

  show(e) {
    console.log(e.target);
    console.log(e.type);
    this.toggleClass(e.target, 'active');
    //$(e.target).toggleClass('active', true);
  };

  hide(e) {
    console.log('hide');
    console.log(e.type);
    this.toggleClass(e.target, 'active');
    // $(e.target).toggleClass('active', true);
  }
}
