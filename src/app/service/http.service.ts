import {Injectable} from '@angular/core';
import {Http, RequestOptions, Headers} from '@angular/http';
import {SubjectService} from './subject.service';
import {ConstantService} from './constantService';

@Injectable()
export class HttpService {

  isRequireToken: Boolean = false;

  private headers: Headers = new Headers({
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });

  private options = new RequestOptions({
    headers: this.headers
  });

  private urlPrefix: String = 'http://demo.k2software.com.cn:30009/';

  constructor(private http: Http, private subjectService: SubjectService, private constantService: ConstantService) {

  }

  getData(url, params) {
    const apiUrl = this.urlPrefix + url;
    const localStorage = window.localStorage;

    if (this.isRequireToken) {
      this.headers = new Headers({
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('PAI-token'),
        'Access-Control-Allow-Origin': '*'
      });

      this.options = new RequestOptions({
        headers: this.headers
      });
    }

    if (localStorage.getItem('PAI-token') && localStorage.getItem('PAI-account')) {
      return this.http.post(apiUrl, params, this.options)
        .toPromise()
        .then(response => {
          if (response.status === 200) {
            return response.json();
          } else if (response.status === 401 || response.status === 0) {
            this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
              severity: 'error',
              summary: 'Login date',
              detail: '',
              id: ''
            });

            this.subjectService.broadcastData(this.constantService.subKey.SHOW_LOGIN, {});
          } else {
            this.subjectService.broadcastData(this.constantService.subKey.SHOW_MESSAGE, {
              severity: 'error',
              summary: 'Request exception, unable to connect to server.',
              detail: '',
              id: ''
            });

            this.subjectService.broadcastData(this.constantService.subKey.SHOW_LOGIN, {});
          }
        }).catch(this.handleError);
    } else {
      const that = this;

      return new Promise(function (resolve, reject) {
        // Amock async action using setTimeout
        setTimeout(function () {
          that.subjectService.broadcastData(that.constantService.subKey.SHOW_MESSAGE, {
            severity: 'error',
            summary: 'Request exception, unable to connect to server.',
            detail: '',
            id: ''
          });
          that.subjectService.broadcastData(that.constantService.subKey.SHOW_LOGIN, {});
        }, 0);
      })
    }
  }

  getToken(url, params) {
    const apiUrl = this.urlPrefix + url;

    this.headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic Y3Foeno6d2hkc3Vuc29mdDgwMw=='
    });

    this.options = new RequestOptions({
      headers: this.headers
    });

    return this.http.post(apiUrl, params, this.options)
      .toPromise()
      .then(response => {
        return response.json();
      }).catch(this.handleError);
  }

  login(url, params, token) {
    const apiUrl = this.urlPrefix + url;

    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    });

    this.options = new RequestOptions({
      headers: this.headers
    });

    return this.http.post(apiUrl, params, this.options)
      .toPromise()
      .then(response => {
        return response.json();
      }).catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
