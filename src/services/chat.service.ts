import { Injectable } from '@angular/core'
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage'
import _ from 'lodash'
import { Headers, Http } from '@angular/http'
import { sha256 } from './cryto.service.js'
import 'rxjs/add/operator/toPromise'

@Injectable()
export class ChatService {
  ws
  wsInit = false
  msgList = {}
  msbCb = null
  onStartJustice = null
  onEndJustice = null

  serverURI = 'http://121.201.14.180:80/'
  bcServer = 'http://148.100.93.134:7050/'
  bcBody = {
    "jsonrpc": "2.0",
    "method": "deploy",
    "params": {
      "type": 1,
      "chaincodeID":{
        "path":"mycc2",
        "name": "mycc2"
      },
      "ctorMsg": {
        "function":"init",
        "args":[]
      },
      "secureContext": "test_user0"
    },
    "id": 1
  }

  constructor (
    private http: Http,
    private secureStorage: SecureStorage
  ) {
    this.loadAllData()
  }

  wsi() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket("ws://121.201.14.180:80/") //148.100.92.120:8888/
      this.ws.onopen = () => {
        this.ws.onmessage = this.onMessage.bind(this)
        resolve()
      }
    })
  }

  async saveAllData () {
    try {
      let storage: SecureStorageObject = await this.secureStorage.create('qimsg')
      await storage.set('msgList', JSON.stringify(this.msgList))
    } catch (err) {

    }
  }

  async loadAllData () {
    try {
      let storage: SecureStorageObject = await this.secureStorage.create('qimsg')
      this.msgList = JSON.parse(await storage.get('msgList'))
    } catch (err) {

    }
  }

  online (token, userId) {
    let data = {
      mode: 'online',
      token: token,
      userid: userId
    }
    this.ws.send(JSON.stringify(data))
  }

  onMessage (ev) {
    let data = JSON.parse(ev.data)
    console.log('[On Msg]', data)

    if (data.mode === 'send') {
      let fromUser = data.from
      let content = data.content
      if (!this.msgList[fromUser]) this.msgList[fromUser] = []
      this.msgList[fromUser].push({
        mode: 'send',
        content: content,
        time: Date.now(),
        self: false
      })
      console.log(this.msgList[fromUser])
      this.saveAllData()
      if (typeof this.msbCb === 'function') {
        this.msbCb(data)
      }
    } else if (data.mode === 'endjustice') {
      if (typeof this.onEndJustice === 'function') {
        this.onEndJustice(data)
      }
    } else if (data.mode === 'startjustice') {
      if (typeof this.onStartJustice === 'function') {
        this.onStartJustice(data)
      }
    } else {
      console.error('Unresolved data mode', data.mode)
    }
  }

  sendMessage (token, userId, to, content) {
    let data = {
      mode: 'send',
      token: token,
      touserid: to,
      userid: userId,
      content: content,
      time: Date.now()
    }
    console.log(JSON.stringify(data))
    this.ws.send(JSON.stringify(data))
    if (!this.msgList[to]) this.msgList[to] = []
    this.msgList[to].push({
      mode: 'send',
      content: content,
      time: Date.now(),
      self: true
    })
    this.saveAllData()
    console.log(this.msgList[to])
  }

  startPromise(token, userID, to) {
    let data = {
      mode: 'startjustice',
      token: token,
      touserid: to,
      userid: userID,
      time: Date.now()
    }
    console.log('start justice', data)
    this.ws.send(JSON.stringify(data))
  }

  endPromise(token, userID, to) {
    let data = {
      mode: 'endjustice',
      token: token,
      touserid: to,
      userid: userID,
      time: Date.now()
    }
    this.ws.send(JSON.stringify(data))
  }

  uploadPromise(promiseID, token, userID, to, msgs) {
    let data = {
      mode: 'upload',
      token: token,
      touserid: to,
      userid: userID,
      promiseid: promiseID,
      data: JSON.stringify(msgs),
      time: Date.now()
    }
    this.ws.send(JSON.stringify(data))
  }

  checkPromise(targetPromiseID) {
    const sentBody = Object.assign({}, this.bcBody)
    sentBody.method = 'query'
    sentBody.params.ctorMsg.function = 'promiseID'
    sentBody.params.ctorMsg.args = [targetPromiseID]
    console.log('sentBody in checkPromise', sentBody)
    return fetch(`${this.bcServer}chaincode`, {
      method: 'post',
      body: JSON.stringify(sentBody)
    }).then( res => {
      console.log('res', res)
      return res.json().then(payload => {
        return payload
      })
    })
  }

  createPromise (promiseID, from, to, promise ) {
    // const promiseID = `P${from}__${to}__${Date.now()}`
    const sentBody = Object.assign({}, this.bcBody)
    sentBody.method = 'invoke'
    sentBody.params.ctorMsg.function = 'promise'
    const promiseContent = JSON.stringify(promise)
    const hash = sha256(promiseContent)
    sentBody.params.ctorMsg.args = [promiseID, from.toString(), to, promiseContent, hash]
    console.log('sentBody', sentBody)
    fetch(`${this.bcServer}chaincode`, {
      method: 'post',
      body: JSON.stringify(sentBody)
    })
    console.log('Created promise id is', promiseID)
  }

  fetchPromiseIDs(targetUserID): Promise<Array<any>> {
    return new Promise ((resolve, reject) => {
      this.http
        .get(`${this.serverURI}permiselist/?userid=${targetUserID}`)
        .toPromise()
        .then((res) => {
          let data = res.json()
          resolve(data)
        })
        .catch(reject)
    })
  }

}
