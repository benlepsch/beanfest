from flask import url_for, render_template, request
from flask_socketio import SocketIO, emit
from app import app, socketio
from werkzeug.contrib.cache import SimpleCache
import random

sids = []
players = {}

def get_cache():
    global players, sids
    to_return = []
    for player in sids:
        to_return.append(players[player].data())
    return to_return

class Position:
    def __init__(self):
        self.x = random.randint(0, 201)/10 + 40
        self.y = random.randint(0, 201)/10 + 40
    
    def set(self, x, y):
        self.x = x
        self.y = y
    
    def data(self):
        return {'x': self.x, 'y': self.y}

class Player:
    def __init__(self, player_id, username):
        self.player_id = player_id
        self.username = username
        self.position = Position()
        self.kills = 0
        self.health = 100
    
    def data(self):
        return {'player_id': self.player_id, 'username': self.username, 'position': self.position.data(), 'kills': self.kills, 'health': self.health}

@app.route('/beanfest')
def beanfest():
    return render_template('beanfest.html')

@socketio.on('need id', namespace='/beanfest')
def need_id(message):
    sids.append(request.sid)
    players[request.sid] = Player(request.sid, message['username'])
    emit('give id', players[request.sid].data())
    emit('init data', get_cache())

@socketio.on('recieve data', namespace='/beanfest')
def recieve_data(message): 
    global players
    
    try:
        players[request.sid].position.x = message['position']['x']
        players[request.sid].position.y = message['position']['y']
    except:
        pass

    emit('new data', players[request.sid].data(), broadcast=True)
    


@socketio.on('disconnect', namespace='/beanfest')
def disconnect():
    try:
        players.pop(request.sid)
        sids.remove(request.sid)
        emit('remove player', { 'player_id': request.sid }, broadcast=True)
    except:
        pass
    