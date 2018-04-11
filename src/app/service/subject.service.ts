import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SubjectService {

  private subjectMaps: { [key: string]: Subject<any> };

  broadcastData(key: string, data: any) {
    if (!key) {
      return;
    }
    if (!this.subjectMaps) {
      this.subjectMaps = {};
    }
    if (!this.subjectMaps[key]) {
      this.subjectMaps[key] = new Subject<any>();
    }
    this.subjectMaps[key].next(data);
  }

  getSubscribe(key: string): Observable<any> {
    if (!key) {
      return;
    }
    if (!this.subjectMaps) {
      this.subjectMaps = {};
    }
    if (!this.subjectMaps[key]) {
      this.subjectMaps[key] = new Subject<any>();
    }
    return this.subjectMaps[key].asObservable();
  }
}
