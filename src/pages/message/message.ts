import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, Content } from 'ionic-angular';
import { $WebSocket, WebSocketSendMode } from 'angular2-websocket/angular2-websocket';
import { io } from 'socket.io-client'
import { ChatService } from '../../services/chat.service'
import { UserService } from '../../services/user.service'
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-message',
  templateUrl: 'message.html'
})
export class MessagePage {
  @ViewChild(Content) content: Content
  preSend = ''
  targetUser = null
  msgList = []
  promiseState = false //false：正常模式; true: 正在做promise
  promiseMsgs = []
  count = 0

  constructor(
    public navCtrl: NavController,
    private chatServer: ChatService,
    private params: NavParams,
    private userServer: UserService,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController
  ) {
    this.targetUser = this.params.get('targetUser')
    this.msgList = this.chatServer.msgList[this.targetUser.id]

    console.log("this.targetUser in MsgPage", this.targetUser)
    this.chatServer.msbCb = this.msbCb.bind(this)
    this.chatServer.onEndJustice = this.onEndJustice.bind(this)
    this.chatServer.onStartJustice = this.onStartJustice.bind(this)
    this.beginPromise = this.beginPromise.bind(this)
    this.createPromise = this.createPromise.bind(this)
    this.cancelPromise = this.cancelPromise.bind(this)
  }

  msbCb (newMessage) {
    console.log('newMessage', newMessage)
    this.msgList = this.chatServer.msgList[this.targetUser.id]
    if (this.promiseState === true) {
      this.promiseMsgs.push({
        from: newMessage.from,
        to: this.userServer.loginUser,
        msg: newMessage.content
      })
    }

    this.content.scrollToBottom(0)
  }

  onForce () {
    console.log('as1d6a')
    setTimeout(() => {
      this.content.scrollToBottom(0)
    }, 500)
  }

  sendMessage () {
    if (this.preSend.length < 1) {
      this.presentToast("没有内容要发送")
    } else {
      this.chatServer.sendMessage(
        this.userServer.accessToken,
        this.userServer.loginUser,
        this.targetUser.id,
        this.preSend
      )

      if (this.promiseState) {
        this.promiseMsgs.push({
          from: this.userServer.loginUser,
          to: this.targetUser.id,
          msg: this.preSend
        })
      }

      this.preSend = ''
      this.msgList = this.chatServer.msgList[this.targetUser.id]
      this.content.scrollToBottom(0)
    }
  }

  presentToast(str: string) {
    let toast = this.toastCtrl.create({
      message: str,
      duration: 1000,
      position: 'top'
    })
    toast.present();
  }

  beginPromise() {
    console.log('BeginPromise', this.promiseState)
    this.promiseMsgs = []
    this.promiseState = !this.promiseState
    this.chatServer.startPromise(
      this.userServer.accessToken,
      this.userServer.loginUser,
      this.targetUser.id
    )
  }

  onEndJustice(data) {
    // 2: promise-id , 3: promise-id, from: id, mode: ....
    console.log('on End Justice', data)
    const myPromiseId = data[this.userServer.loginUser.toString()]
    const targetPromiseId = data[this.targetUser.id]
    if (typeof myPromiseId !== 'undefined') {
      // create my own promise
      this.chatServer.createPromise(myPromiseId, this.userServer.loginUser, this.targetUser.id, this.promiseMsgs)
      // check target promise

      this.count = 0
      setTimeout(() => {
        this.checkPromise(targetPromiseId, myPromiseId)
      }, 2000)
    } else {
      this.presentToast('error in onEndJustice')
      console.error('error in onEndJustice')
    }
  }

  checkPromise(targetPromiseId, myPromiseId) {
    this.chatServer.checkPromise(targetPromiseId).then((res) => {
      console.log('checkPromise targetPromise ID res', res)
      // if (typeof res['result']['message'] !== 'undefined') {
      if (1) {
        this.chatServer.uploadPromise(
          myPromiseId,
          this.userServer.accessToken,
          this.userServer.loginUser,
          this.targetUser.id,
          this.promiseMsgs
        )
        this.promiseState = false
        this.presentToast('契约完成 ✅')
        this.promiseMsgs = []
      } else if (this.count < 3){
        this.count ++
        setTimeout(() => {
          this.checkPromise(targetPromiseId, myPromiseId)
        }, 2000)
      } else {
        this.count = 0
        this.presentToast('契约失败: 验证出错')
        console.warn('三次查询失败')
      }
    })
  }

  onStartJustice(data) {
    // from: id, mode: ....
    if (data.from == this.targetUser.id) {
      this.promiseMsgs = []
      this.promiseState = true
    } else {
      this.presentToast('对方没有在当前会话页面, 无法开始契约')
      console.error('对方没有在当前会话页面')
    }
  }

  createPromise() {
    this.promiseState = false
    if (this.promiseMsgs.length > 0) {
      this.chatServer.endPromise(
        this.userServer.accessToken,
        this.userServer.loginUser,
        this.targetUser.id
      )
      // this.chatServer.createPromise(this.userServer.loginUser, this.targetUser.id, this.promiseMsgs)
    } else {
      this.presentToast('没有内容进行契约')
      console.warn('No promise content')
    }

    // this.promiseMsgs = []
  }

  cancelPromise() {
    this.promiseState = false
    this.promiseMsgs = []
  }


  stopPromise() {
    let confirm = this.alertCtrl.create({
      title: '已经记录下你们的契言',
      message: '是否要公证这段对话？对话的内容将不会上传，请保留好。',
      buttons: [
        {
          text: '取消',
          handler: () => {
            console.log('取消契言')
            this.cancelPromise()
          }
        },
        {
          text: '契言',
          handler: () => {
            console.log('确认契言')
             this.createPromise()
          }
        }
      ]
    });
    confirm.present();
  }


}
