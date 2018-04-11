import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';

import 'rxjs/add/operator/toPromise';


@Injectable()
export class ImageService {

  private headers: Headers = new Headers({
    'Content-Type': undefined
  });
  private getImageUrl = 'http://demo.k2software.com.cn:30009/file-rest/api/file/upload';  // URL to web api

  constructor(private http: Http) {
  }

  uploadImage (params: any): Promise<any> {
    return this.http.post(
      this.getImageUrl,
      params
    ).toPromise()
      .then(response => response.json() as any[])
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
