import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Storage} from '@ionic/storage';

import {LoginPage} from '../pages/login/login';
import {HomePage} from '../pages/home/home';

declare let cordova;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = LoginPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage) {
    this.storage.get('user').then(user => {
      console.log(user)
      if (user)
        this.rootPage = HomePage;
      else
        this.rootPage = LoginPage;
    });
    this.storage.get('token').then(token => {
      console.log(token)
    });

    if (!platform.is('ios') && !platform.is('android')) {
      const user = {
        "_id": "5a09b1d1dd596b5a0fa82adb",
        "updatedAt": "2017-12-01T03:36:55.443Z",
        "createdAt": "2017-11-13T14:53:05.637Z",
        "countryCode": 84,
        "phone": "+841638678364",
        "provider": "local",
        "__v": 0,
        "avatar": "http://54.255.249.122:8080/uploads/file-1510584965173.jpeg",
        "pushToken": "fcfc6b2adf34c88f77d0eb1943066014f00cda16b5fdaa93b64c522605e90a3e",
        "userPush": "b54a7b3d-e00b-455b-a471-d9407100b71a",
        "online": false,
        "socketId": "7ju6qaJnYiP8C1PNAAB2",
        "lastConnection": "2017-12-01T03:36:55.442Z",
        "color": "#6568B1",
        "hideInfo": false,
        "notification": true,
        "block": [],
        "active": true,
        "contacts": [],
        "role": "user",
        "name": "Loi Hoang"
      }

      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YTA5YjFkMWRkNTk2YjVhMGZhODJhZGIiLCJpYXQiOjE1MTIwMjI3NTMsImV4cCI6MTUxMjU0ODM1M30.EzkiW7hl8fgYWqApNQxeYkXTZNonuFaXP1evV6WVT-s'
      // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWYxNTY4ZjAzZjQ5MzkxMmUxYmIwMjIiLCJpYXQiOjE1MTIwNTAxMTcsImV4cCI6MTUxMjU3NTcxN30.hOoFnwvnPy87zFvl8W7G_hLext3hwv0G0seK43wzAOc'
      // const user = {
      //   "_id": "59f1568f03f493912e1bb022",
      //   "updatedAt": "2017-11-29T17:56:46.218Z",
      //   "createdAt": "2017-10-26T03:29:19.340Z",
      //   "countryCode": 84,
      //   "phone": "+841638678364",
      //   "provider": "local",
      //   "__v": 0,
      //   "online": false,
      //   "socketId": "YnOH6fELK_Bi7dKNAAGT",
      //   "avatar": "http://192.168.1.76:8080/uploads/file-1511335145127.jpeg",
      //   "pushToken": "fcfc6b2adf34c88f77d0eb1943066014f00cda16b5fdaa93b64c522605e90a3e",
      //   "userPush": "b54a7b3d-e00b-455b-a471-d9407100b71a",
      //   "lastConnection": "2017-11-29T17:56:46.217Z",
      //   "color": "#32ABB3",
      //   "hideInfo": false,
      //   "notification": true,
      //   "block": [],
      //   "active": true,
      //   "contacts": [],
      //   "role": "user",
      //   "name": "Loi Hoang"
      // }
      this.storage.set('user', user)
      this.storage.set('token', token)
    }

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      if (platform.is('ios')) {
        console.log('2222')
        cordova.plugins.iosrtc.registerGlobals();
        console.log( cordova.plugins.iosrtc)
        // load adapter.js
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "js/adapter-latest.js";
        script.async = false;
        document.getElementsByTagName("head")[0].appendChild(script);
      }
    });
  }
}

