from flask import url_for, render_template
from flask_socketio import SocketIO, emit
from app import app, SocketIO

@app.route('/beanfest')
def beanfest():
    return render_template('beanfest.html')

@socketio.on('need id', namespace='/beanfest')
def need_id(message):
    socket.emit('give id', {player_id: request.sid})