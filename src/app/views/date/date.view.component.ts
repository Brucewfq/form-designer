import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../base/baseComponent';

@Component({
  selector: 'app-date-view',
  templateUrl: './date.view.component.html'
})

export class DateViewComponent extends BaseComponent implements OnInit {

  date: Date;

  es: any;

  invalidDates: Array<Date>;

  defaults: any = {
    fieldLabel: 'Date',
    labelAlign: 'left',
    format: 'Y-m-d',
    editable: true
  };

  ngOnInit() {
    if (this.model.attr) {
      this.beforeInitDefault(this.model, this.defaults);
    }

    this.es = {
      firstDayOfWeek: 1,
      dayNamesShort: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
      monthNamesShort: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
      today: 'today'
    };

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const prevMonth = (month === 0) ? 11 : month - 1;
    const prevYear = (prevMonth === 11) ? year - 1 : year;
    const nextMonth = (month === 11) ? 0 : month + 1;
    const nextYear = (nextMonth === 0) ? year + 1 : year;

    const invalidDate = new Date();
    invalidDate.setDate(today.getDate() - 1);
    this.invalidDates = [today, invalidDate];
  }
}
