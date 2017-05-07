from channels import Group
from channels.sessions import channel_session
import json
from uuid import uuid4
from models import Permiselist, User


@channel_session
def ws_connect(message):
    # user = message['path'].strip('/')
    # print user
    # message.channel_session['user'] = user
    # Group(user).add(message.reply_channel)
    pass


@channel_session
def ws_receive(message):
    text = json.loads(message['text'])
    print text
    if text['mode'] == 'online':
        userid = text['userid']
        token = text['token']
        ### To-do
        message.channel_session['userid'] = userid
        Group(str(userid)).add(message.reply_channel)
    if text['mode'] == 'send':
        userid = text['userid']
        token = text['token']
        touserid = text['touserid']
        content = text['content']
        time = text['time']
        data = {'content': content, 'from': userid, 'time': time, 'mode': 'send'}
        Group(str(touserid)).send({'text': json.dumps(data)})
    if text['mode'] == 'startjustice':
        userid = text['userid']
        token = text['token']
        touserid = text['touserid']
        data = {'mode': 'startjustice', 'from': userid}
        Group(str(touserid)).send({'text': json.dumps(data)})
        data = {'mode': 'startjustice', 'from': touserid}
        Group(str(userid)).send({'text': json.dumps(data)})
    if text['mode'] == 'endjustice':
        userid = text['userid']
        token = text['token']
        touserid = text['touserid']
        data = {'mode': 'endjustice', userid: str(uuid4()), touserid: str(uuid4())}
        userid_i = User.objects.get(id=userid)
        touserid_i = User.objects.get(id=touserid)
        Permiselist.objects.create(userid=userid_i, touserid=touserid_i, own_permiseid=data[userid],
                                   opposite_permiseid=data[touserid])
        Permiselist.objects.create(userid=touserid_i, touserid=userid_i, own_permiseid=data[touserid],
                                   opposite_permiseid=data[userid])
        data['from'] = userid
        Group(str(touserid)).send({'text': json.dumps(data)})
        data['from'] = touserid
        Group(str(userid)).send({'text': json.dumps(data)})
    if text['mode'] == 'upload':
        userid = text['userid']
        token = text['token']
        permiseid = text['promiseid']
        data = text['data']
        p = Permiselist.objects.get(own_permiseid=permiseid)
        p.data = data
        p.save()


@channel_session
def ws_disconnect(message):
    userid = message.channel_session['userid']
    Group(str(userid)).discard(message.reply_channel)
