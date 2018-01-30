import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';

@Injectable()
export class SelectEventService {

  constructor(private http: Http) {}

  getEvents(parentType: string) {
    return this.http.get('assets/DB/events.json')
      .toPromise()
      .then(res => <any[]> res.json().data)
      .then(data => {
        return data;
      });
  }
}
