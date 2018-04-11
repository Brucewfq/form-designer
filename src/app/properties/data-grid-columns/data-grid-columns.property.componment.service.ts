import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';

import 'rxjs/add/operator/toPromise';


@Injectable()
export class DataGridColumnsService {

  private headers: Headers = new Headers({
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  // http://192.168.1.132:30009/
  private getObjlistUrl = 'http://demo.k2software.com.cn:30009/object/api/last/';  // URL to web api
  constructor(private http: Http) {
  }

  getObjlist(term: String): Promise<any> {
    return this.http.post(
      this.getObjlistUrl + `${term}/attrs`,
      {},
      new RequestOptions({headers: this.headers})
    ).toPromise()
      .then(response => response.json() as any[])
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
