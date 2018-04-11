import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';
import {Message} from 'primeng/primeng';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html'
})

export class MessageComponent extends BaseComponent implements OnInit {
  msgs: Message[] = [];

  ngOnInit() {
    this.registerSubject(this.subKey.SHOW_MESSAGE);
  }

  onSubResult(key: string, data: any) {
    if (key === this.subKey.SHOW_MESSAGE) {
      this.msgs = [];
      if (data instanceof Array) {
        for (let i = 0; i < data.length; i++) {
          this.msgs.push(data[i]);
        }
      } else {
        this.msgs.push(data);
      }
    }
  }
}
