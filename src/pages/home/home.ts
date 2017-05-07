import { Component } from '@angular/core'
import { App, NavController } from 'ionic-angular'
import { MessagePage } from '../message/message'
import { UserService } from '../../services/user.service'
import { User } from '../../models/User'
import { LandingPage } from '../landing/landing'
import { Dialogs } from '@ionic-native/dialogs'
import _ from 'lodash'
import { ChatService } from '../../services/chat.service'
import {isUndefined} from "ionic-angular/umd/util/util";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  user: User

  chatList = []
  /**{
    id: 1,
    avatar: 'assets/img/head.png',
    name: '哈哈哈',
    lastMessage: '最后的消息？',
    time: new Date()
  }, {
    id: 2,
    avatar: 'assets/img/head.png',
    name: '嘿嘿嘿',
    lastMessage: '最后的消息？',
    time: new Date()
  } */
  constructor(
    public navCtrl: NavController,
    private userService: UserService,
    private chatServer: ChatService,
    private appCtrl: App,
    private dialogs: Dialogs
  ) {
    this.loadUserInfo()
  }

  openMessage (chatId) {
    let targetUser = this.chatList.filter((chat) => {
      return chat.id === chatId
    })
    targetUser = targetUser.length > 0 ? targetUser[0] : undefined
    console.log('targetUser', targetUser)
    if (targetUser) {
      this.appCtrl.getRootNav().push(MessagePage, {
        targetUser
      })
    }
  }

  async loadUserInfo () {
    // this.user = await this.userService.getSelfInfo()
    // TODO: jst for develop
    // this.user = {
    //   id: 7,
    //   name: "chi",
    //   avatar: "chi"
    // }
    console.log(4)
    if (this.user === null) {
      this.dialogs.alert('登录信息失效，请重新登录！', '错误', '确认').then(() =>
        this.appCtrl.getRootNav().setRoot(LandingPage)
      )
    }
    await this.getChatList()
    console.log('this.chatList', this.chatList)
    await this.chatServer.wsi()
    setInterval(() => {
      this.chatServer.online(
        this.userService.accessToken,
        this.userService.loginUser
      )
    }, 3000)
  }

  async getChatList(refresher = undefined) {
    this.chatList = _.map(await this.userService.getFriendList(), (v, k) => {
      return _.assign(this.userService.userInfos[v], { lastMessage: 'Hello, world!', time: new Date() })
    })
    refresher ? refresher.complete() : 1
  }

}
