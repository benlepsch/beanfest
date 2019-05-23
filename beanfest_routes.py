from flask import url_for, render_template, request
from flask_socketio import SocketIO, emit
from app import app, socketio
from werkzeug.contrib.cache import SimpleCache

players = []
cache = SimpleCache(default_timeout=0)

def get_cache():
    full_cache = []
    for player in players:
        full_cache.append(cache.get(str(player)))
    return full_cache

@app.route('/beanfest')
def beanfest():
    return render_template('beanfest.html')

@socketio.on('need id', namespace='/beanfest')
def need_id(message):
    players.append(request.sid)
    cache.set(str(request.sid), { 'player_id': request.sid, 'username': message['username'], 'position': {'x': 0, 'y': 0}, 'kills': 0, 'health': 100 })
    emit('give id', {'player_id': request.sid})
    emit('init data', get_cache())