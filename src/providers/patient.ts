import { Http, Headers, URLSearchParams, RequestOptionsArgs } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Injectable()
export class Patient {

  constructor(public http: Http) {  }

  login(email) {
    let params: URLSearchParams = new URLSearchParams();
    params.set('email', email);

    //Header
    let headers = new Headers({
        'Content-Type': 'application/json'
    });

    var RequestOptions: RequestOptionsArgs = {
        url: "www.myapiurl.com",
        method: 'GET',
        search: params,
        headers: headers,
        body: null
    };

    return this.http.get("www.myapiurl.com", RequestOptions)
        .map(res => res.json())
        .do(data => data,
        err => { err });
}

}
