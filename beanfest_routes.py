from flask import url_for, render_template
from flask_socketio import SocketIO, emit
from app import app, SocketIO
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
    emit('give id', {player_id: request.sid})
    emit('init data', get_cache())