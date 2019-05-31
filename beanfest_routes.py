from flask import url_for, render_template, request
from flask_socketio import SocketIO, emit
from app import app, socketio
from werkzeug.contrib.cache import SimpleCache
import random

players = []
cache = SimpleCache(default_timeout=0)

def get_cache():
    global players
    to_return = []
    for player in players:
        to_return.append(player.data())
    return to_return

class Position:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def set(self, x, y):
        self.x = x
        self.y = y
    
    def data(self):
        return {'x': self.x, 'y': self.y}

class Player:
    def __init__(self, player_id, username):
        self.player_id = player_id
        self.username = username
        init_x = random.randint(0, 201)/10 + 40
        init_y = random.randint(0, 201)/10 + 40
        self.position = Position(init_x, init_y)
        self.kills = 0
        self.health = 100
    
    def data(self):
        return {'player_id': self.player_id, 'username': self.username, 'position': self.position.data(), 'kills': self.kills, 'health': self.health}

@app.route('/beanfest')
def beanfest():
    return render_template('beanfest.html')

@socketio.on('need id', namespace='/beanfest')
def need_id(message):
    players.append(Player(request.sid, message['username']))
    emit('give id', players[len(players)-1].data())
    emit('init data', get_cache())

@socketio.on('disconnect', namespace='/beanfest')
def disconnect():
    for player in players:
        if player.player_id == request.sid:
            players.pop(player)
            emit('remove player', {'player_id': request.sid})
    