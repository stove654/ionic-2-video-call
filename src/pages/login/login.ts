import { Component } from '@angular/core';
import { Config } from '../../app/app.config';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { LoadingController } from 'ionic-angular'
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {HomePage} from "../home/home";

declare let AccountKitPlugin:any;

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  constructor(public http: Http, public loadingCtrl: LoadingController, private storage: Storage, public navCtrl: NavController) {

  }

  login () {

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    AccountKitPlugin.loginWithPhoneNumber({
      useAccessToken: false,
      facebookNotificationsEnabled: true,
      initialPhoneNumber: ['', '']
    }, (response) => {

      this.http.post(Config.url + Config.api.login, {
        code: response.code
      }).map(res => res.json())
        .subscribe(response => {
          console.log('response', response);
          loading.dismiss();
          this.storage.set('user', response.user).then(() => {
            this.navCtrl.push(HomePage);
          });
          this.storage.set('token', response.token);
        })

    }, (err) => {
      loading.dismiss();
      console.log('err', err)
    })
  }


}
