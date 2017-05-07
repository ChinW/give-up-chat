from django.shortcuts import render
from models import User, Permiselist
from uuid import uuid4
from django.http import HttpResponse
import json
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
@csrf_exempt
def login(request):
    # username = request.POST.get('username')
    # password = request.POST.get('password')
    received_json_data = json.loads(request.body)
    username = received_json_data['username']
    password = received_json_data['password']
    if User.objects.filter(username=username):
        u = User.objects.get(username=username)
        if u.password == password:
            u.token = str(uuid4())
            u.save()
            response = HttpResponse(json.dumps({"error": 0, 'token': u.token, 'username': u.username, 'userid': u.id}),
                                    content_type="application/json")
            response['Access-Control-Allow-Origin'] = '*'
            return response
        else:
            response = HttpResponse(json.dumps({"error": 1, 'message': 'PASSWORD ERROR'}),
                                    content_type="application/json")
            response['Access-Control-Allow-Origin'] = '*'
            return response
    else:
        u = User.objects.create(username=username, password=password, token=str(uuid4()))
        u.save()
        response = HttpResponse(json.dumps({"error": 0, 'token': u.token, 'username': u.username, 'userid': u.id}),
                                content_type="application/json")
        response['Access-Control-Allow-Origin'] = '*'
        return response


@csrf_exempt
def list(request):
    userlist = User.objects.all().order_by('-id')
    data = {}
    for u in userlist:
        data[u.id] = u.username
    response = HttpResponse(json.dumps(data),
                            content_type="application/json")
    response['Access-Control-Allow-Origin'] = '*'
    return response


@csrf_exempt
def permiselist(request):
    userid = request.GET.get('userid')
    permiselist = Permiselist.objects.filter(userid=userid).all().order_by('-id')
    data = []
    for p in permiselist:
        data.append({'from': p.own_permiseid, 'to': p.opposite_permiseid, 'data': p.data, 'id': p.id,
                     'touserid': p.touserid_id})
    response = HttpResponse(json.dumps(data),
                            content_type="application/json")
    response['Access-Control-Allow-Origin'] = '*'
    return response


@csrf_exempt
def permiselist_post(request):
    received_json_data = json.loads(request.body)
    userid = received_json_data['userid']
    permiselist = Permiselist.objects.filter(userid=userid).all().order_by('-id')
    data = []
    for p in permiselist:
        data.append({'from': p.own_permiseid, 'to': p.opposite_permiseid, 'data': p.data, 'id': p.id,
                     'touserid': p.touserid_id})
    response = HttpResponse(json.dumps(data),
                            content_type="application/json")
    response['Access-Control-Allow-Origin'] = '*'
    return response
