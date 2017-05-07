import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { $WebSocket, WebSocketSendMode } from 'angular2-websocket/angular2-websocket';
import { io } from 'socket.io-client'
import { ChatService } from '../../services/chat.service'
import { UserService } from '../../services/user.service'
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';


@Component({
  selector: 'page-contract',
  templateUrl: 'contract.html'
})
export class ContractPage {
  promise = {}
  msgs = []
  myself: Number = 1

  constructor(
    public navCtrl: NavController,
    private chatServer: ChatService,
    private params: NavParams,
    private userServer: UserService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController
  ) {
    this.promise = this.params.get('promise')
    this.myself = this.userServer.loginUser
    // this.msgs = this.promise.data
    console.log(this.promise)
    //this.msgList = this.chatServer.msgList[this.targetUser.id]

  }


  underToast() {
    let toast = this.toastCtrl.create({
      message: '功能还在开发中，暂不可用……',
      duration: 3000
    });
    toast.present();
  }



}
