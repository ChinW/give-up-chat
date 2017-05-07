import { Component } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { ChatService } from '../../services/chat.service'
import { UserService } from '../../services/user.service'
import { ContractPage } from '../contract/contract';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  promises = []
  friendListIndex = {}

  constructor(
    public navCtrl: NavController,
    private chatServer: ChatService,
    private params: NavParams,
    private userServer: UserService,
    private appCtrl: App
  ) {
    this.friendListIndex = this.userServer.friendListIndex
    this.fetchPromises()
  }

  fetchPromises(refresher = undefined) {
    this.chatServer.fetchPromiseIDs(this.userServer.loginUser).then(res => {
      console.log('result', res)
      this.promises = res
      this.summaryPromises()
      refresher ? refresher.complete() : 1
    })
  }

  summaryPromises() {
    this.promises.map((promise) => {
      promise.data = promise.data ? JSON.parse(promise.data) : []
      const summary = promise.data.map((msg) => {
        return msg.msg
      })
      promise.summary = summary.join(';')
    })
    console.log('summaryPromises', this.promises)
  }

  openContract(promise) {
      this.appCtrl.getRootNav().push(ContractPage, {
        promise
      })
  }


}
