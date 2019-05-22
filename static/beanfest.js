/*
    this needs to
    1) set up the socket
    2) bring the user to a 'menu' like in agario
    3) after they pick a name and skin they click 'play' which THEN initializes their player
    4) set up the game board and player icons by %
    while (playing) {
        handle movement (player and projectiles)
        handle firing
        handle object collisions
        update killfeed
        if the player zooms out, resize the page
        on (player death) {
            send death to server
            send remove player to server
            exit to menu
        }
    }
*/

var screen_height, screen_width;
var socket;
var initZoom;
const player = {}; //store each player in an object of { player_id: player_id, username: username, pos: {x: 0, y: 0}, health: 100, kills: 0}

var loaded = false;
var first = true;

function getPercent(px, width) {
    if (width) {
        return (100 * px / screen_width) + 'px';
    }
    return (100 * px / screen_height) + 'px';
}

$(document).ready(function() {
    screen_height = $(window).height();
    screen_width = $(window).width();
    initZoom = window.devicePixelRatio;

    socket = io.connect('http://' + document.domain + ':' + location.port + '/beanfest');
    showMenu();
});

function showMenu() {
    let menu = document.getElementById('menu');
	menu.style.display = 'block';
	menu.style.height = '70%';
	menu.style.width = '50%';
	menu.style.top = screen_height/2 - menu.clientHeight/2 + 'px';
	menu.style.left = screen_width/2 - menu.clientWidth/2 + 'px';

	let logo = document.getElementById('beanfest_logo');
	logo.style.width = '100%';

	let username = document.getElementById('username');
	username.style.left = screen_width/2 - menu.clientWidth/2 - username.clientWidth/2 + 'px';

	let playbtn = document.getElementById('playbutton');
	playbtn.style.left = screen_width/2 - menu.clientWidth/2 - playbtn.clientWidth/2 + 'px';
	playbtn.style.top = '80%';
}

function play() {
    if (document.getElementById('username').value == '') {
        document.getElementById('error').style.color = 'red';
        return;
    }

    player.username = document.getElementById('username').value;
    socket.emit('need id', {});

    // request player id from server
    // hide menu, load in background
    // receive data from server and load in other players
    // startGame()
}

function makeBackground() {
    let background = document.createElement('img');
    background.src = "{{ url_for('static', filename='bean_map.png') }}";
    background.style.width = getPercent(10000, true);
    background.style.height = getPercent(10000, false);
}

//runs the game at a specified fps
//dont touch i dont know how it works
let fpsInterval, then, startTime, elapsed;
function startGame(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    runGame();
}

function runGame() {
    requestAnimationFrame(runGame);
    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        
    }
}