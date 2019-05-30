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
const player = { player_id: '' }; //store each player in an object of { player_id: player_id, username: username, pos: {x: 0, y: 0}, health: 100, kills: 0}

const initSpeed = 5;
var speed = initSpeed;
const keys = {};

var loaded = false;
var first = true;

var game_running = false;

var onLoop = 0;

window.onkeydown = function(e) {
    let key = e.keyCode ? e.keyCode : e.which;
    keys[key] = true;
}

window.onkeyup = function() {
    let key = e.keyCode ? e.keyCode : e.which;
    keys[key] = false;
}

function getPercent(px, width) {
    if (width) {
        return (100 * px / screen_width) + '%';
    }
    return (100 * px / screen_height) + '%';
}

function waitForId() {
    if (player.player_id == '') {
        requestAnimationFrame(waitForId);
    } else {
        return;
    }
}

$(document).ready(function() {
    screen_height = $(window).height();
    screen_width = $(window).width();
    initZoom = window.devicePixelRatio;

    socket = io.connect('http://' + document.domain + ':' + location.port + '/beanfest');

    socket.on('give id', (msg) => {
        console.log('working');
        player.player_id = msg.player_id;
        player.position = msg.position;
        player.kills = 0;
        player.health = 100;
    });

    socket.on('init data', (msg) => {
        for (let i = 0; i < msg.length; i++) {
            updatePlayer(msg[i]);
        }
    });

    socket.on('remove player', (msg) => {
        document.getElementById('players').removeChild(document.getElementById(msg.player_id));
    });

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
        return;
    }

    player.username = document.getElementById('username').value;

    if (player.player_id == '') {
        socket.emit('need id', { username: player.username });
        waitForId();
    }

    document.getElementById('menu').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    //run the game loop 150 times a second but only request server data 30 times
    //this is to move the bullets super fast
    game_running = true;
    startGame(150);
    // request player id from server
    // hide menu, load in background
    // receive data from server and load in other players
    // startGame()
}

function load_background() {
    loaded = true;
}

function updatePlayer(data) {
    let updating = document.getElementById(data.player_id.toString());
    if (updating == undefined || updating == null) {
        createPlayer(data);
        updating = document.getElementById(data.player_id.toString());
    }

    let player_icon = updating.getElementsByClassName('player_icon')[0];

    let username = updating.getElementsByClassName('username')[0];

    if (data.player_id == player.player_id) { //it's the client's player
        player_icon.style.left = getPercent((screen_width/2 - player_icon.clientWidth/2), true);
        player_icon.style.top = getPercent((screen_height/2 - player_icon.clientHeight/2), false);
    } else {

    }
    
    username.style.left = player_icon.style.left;
    username.style.top = parseInt(player_icon.style.top) + parseInt(player_icon.clientHeight) + 'px';
}

function createPlayer(data) {
    let new_player = document.createElement('div');
    new_player.setAttribute('id', data.player_id.toString());

    let player_icon = document.createElement('div');
    player_icon.classList.add('player_icon');
    player_icon.style.width = getPercent(40, true);
    player_icon.style.height = getPercent(40, false);

    let username = document.createElement('div');
    username.classList.add('username');
    username.style.height = getPercent(35, false);
    username.innerHTML = data.username; 

    document.getElementById('players').appendChild(new_player);
    new_player.appendChild(player_icon);
    new_player.appendChild(username);
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
        
        onLoop += 1;
        if (onLoop == 4) {
            //request/send server data here
            onLoop = 0;
        }
        //move bullets here
        if (loaded) {
            if (first) {
                document.getElementById('loading').style.display = 'none';
                let background = document.getElementById('background');
                background.style.display = 'block';
                background.style.width = getPercent(10000, true);
                background.style.height = getPercent(10000, false);
                first = false;
            }
        }
    }
}