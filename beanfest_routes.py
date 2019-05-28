from flask import url_for, render_template, request
from flask_socketio import SocketIO, emit
from app import app, socketio
from werkzeug.contrib.cache import SimpleCache

players = []
cache = SimpleCache(default_timeout=0)

class Position:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def set(self, x, y):
        self.x = x
        self.y = y

class Player:
    def __init__(self, player_id, username):
        self.player_id = player_id
        self.username = username
        self.position = Position(0,0)
        self.kills = 0
        self.health = 100

@app.route('/beanfest')
def beanfest():
    return render_template('beanfest.html')

@socketio.on('need id', namespace='/beanfest')
def need_id(message):
    players.append(Player(request.sid, message['username']))
    emit('give id', players[len(players)-1])