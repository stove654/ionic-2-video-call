import { Component, NgZone } from '@angular/core';
import { Config } from '../../app/app.config';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { LoadingController, AlertController, Platform } from 'ionic-angular'
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import io  from 'socket.io-client';


declare let navigator:any;
declare let RTCPeerConnection:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  users = [];
  user = {
    _id: ''
  };
  receiveUser = {
    _id: ''
  };
  localStream = null;
  remoteStream = null;


  peerConnection = null;
  platform = null;
  isOpenCall = false;

  constructor(platform: Platform, public http: Http, private storage: Storage, public alertCtrl: AlertController, private _ngZone: NgZone) {
    this.storage.get('user').then((user) => {
      this.user = user;
      console.log(this.user)
    });
    this.platform = platform;
    this.http.get(Config.url + Config.api.user).map(res => res.json())
      .subscribe(response => {
        this.users = response;
        console.log('response', this.users);
      })
    const socket = io(Config.url, {
      path: '/socket.io-client'
    });

    socket.on('webrtc:save', (message) => {
      if (message.status == 2 && this.user._id == message.to._id) {
        console.log('22222222222')
        this.gotMessageFromServer(message);
      }

      if (message.status == 3 && this.user._id == message.to._id) {
        console.log('close')
        this.closeCallUser(true)
      }

      if (message.status == 1 && this.user._id == message.to._id) {

        let prompt = this.alertCtrl.create({
          title: 'Login',
          message: message.from.name + " Calling you...",
          buttons: [
            {
              text: 'Cancel',
              handler: data => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Ok',
              handler: data => {
                this.startCallUser(message.from, true)
              }
            }
          ]
        });
        prompt.present();
      }

    });
  }

  startCallUser (user, isConnecting) {
    console.log(user, isConnecting)
    this.receiveUser = user;

    let self = this;
    navigator.webkitGetUserMedia({
      video: true,
      audio: true
    }, function (stream) {
      self.localStream = stream;
      self.localStream.src = window.URL.createObjectURL(stream);
      self.isOpenCall = true;
      self._ngZone.run(() => { console.log('Outside Done!'); });
      if (!isConnecting) {
        console.log('222')
        self.http.post(Config.url + Config.api.webrtc, {
          to: user,
          status: 1,
          from: self.user,
          option: {
            audio: true,
            video: true
          },
        }).subscribe(res => {
          console.log('res', res);
        })
      } else {
        self.connect(true)
      }
    }, function (e) {
      console.log('No live audio input: ' + e);
    });
  }

  connect (isCaller) {
    const peerConnectionConfig = {
      'iceServers': [{"url": "stun:global.stun.twilio.com:3478?transport=udp"}, {
        "url": "turn:global.turn.twilio.com:3478?transport=udp",
        "username": "e629fa3355694f374ee6f2a3965145310c5580a248f90639f2f0e3b827430fdd",
        "credential": "yGja4Uopjvr/aVeRrjUIX2l0I6IJjcEeUxSUAZilvXQ="
      }, {
        "url": "turn:global.turn.twilio.com:3478?transport=tcp",
        "username": "e629fa3355694f374ee6f2a3965145310c5580a248f90639f2f0e3b827430fdd",
        "credential": "yGja4Uopjvr/aVeRrjUIX2l0I6IJjcEeUxSUAZilvXQ="
      }, {
        "url": "turn:global.turn.twilio.com:443?transport=tcp",
        "username": "e629fa3355694f374ee6f2a3965145310c5580a248f90639f2f0e3b827430fdd",
        "credential": "yGja4Uopjvr/aVeRrjUIX2l0I6IJjcEeUxSUAZilvXQ="
      }]

    };
    let self = this;


    this.peerConnection = new RTCPeerConnection(peerConnectionConfig);
    this.peerConnection.onicecandidate = (event) => self.gotIceCandidate(event);
    this.peerConnection.onaddstream = (stream) => self.gotRemoteStream(stream);
    this.peerConnection.addStream(this.localStream);
    this._ngZone.run(() => { console.log('Outside Done!'); });
    if (isCaller) {
      this.peerConnection.createOffer().then((des) => self.createdDescription(des)).catch(this.errorHandler);
      self._ngZone.run(() => { console.log('Outside Done!'); });
    }

  };

  gotMessageFromServer (message) {
    let self = this;
    if (!this.peerConnection) this.connect(false);

    var signal = message;
    // Ignore messages from ourself
    if (signal.to._id == this.receiveUser._id) return;

    if (signal.sdp) {
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function () {
        // Only create answers in response to offers
        if (signal.sdp.type == 'offer') {
          self.peerConnection.createAnswer().then(self.createdDescription).catch(self.errorHandler);
          self._ngZone.run(() => { console.log('Outside Done!'); });
        }
      }).catch(this.errorHandler);
    } else if (signal.ice) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(self.errorHandler);
    }
  }

  gotIceCandidate (event) {
    if (event.candidate != null) {
      console.log(event)
      this.http.post(Config.url + Config.api.webrtc, {
        ice: event.candidate,
        to: this.receiveUser,
        status: 2
      }).subscribe(res => {
        console.log('res', res);
      })
    }
  }

  gotRemoteStream(event) {
    this.remoteStream = event.stream;
    this.remoteStream.src = window.URL.createObjectURL(event.stream);
    this._ngZone.run(() => { console.log('Outside Done!'); });
  }


  createdDescription(description) {
    console.log('111111', this.peerConnection)
    let self = this;
    this.peerConnection.setLocalDescription(description).then(function () {

      self.http.post(Config.url + Config.api.webrtc, {
        sdp: self.peerConnection.localDescription,
        to: self.receiveUser,
        status: 2
      }).subscribe(res => {
        console.log('res', res);
      })
    }).catch(self.errorHandler);
  }

  errorHandler (error) {
    console.log(error);
  }

  stopMediaTrack (stream) {
    stream.getTracks().forEach(function (track) {
      track.stop();
    })
    stream = null;
    this._ngZone.run(() => { console.log('Outside Done!'); });

  };

  closeCallUser (isStop) {
    this.isOpenCall = false
    if (this.platform.is('ios')) {
      this.localStream.stop();
      this.localStream = null;
      if (this.remoteStream) {
        this.remoteStream.stop();
        this.remoteStream = null;
      }
    } else {
      this.stopMediaTrack(this.localStream);
      if (this.remoteStream) {
        this.stopMediaTrack(this.remoteStream);
      }

    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this._ngZone.run(() => { console.log('Outside Done!'); });

    if (!isStop) {
      this.http.post(Config.url + Config.api.webrtc, {
        to: this.receiveUser,
        status: 3,
        from: this.user
      }).subscribe(res => {
        console.log('res', res);
      })
    }

  };


}
