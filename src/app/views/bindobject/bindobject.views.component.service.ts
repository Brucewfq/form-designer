import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';

import 'rxjs/add/operator/toPromise';


@Injectable()
export class BindObjectService {

  private headers: Headers = new Headers({
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  getCustomQueryUrl: string = 'http://demo.k2software.com.cn:30009/base-rest/api/commonObject/customQuery';

  constructor(private http: Http) {
  }

  getCustomQuery(term: any): Promise<any> {
    return this.http.post(
      this.getCustomQueryUrl,
      term,
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
