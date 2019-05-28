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
var scaleX, scaleY;
var socket;
var initZoom;
const player = { player_id: '' }; //store each player in an object of { player_id: player_id, username: username, pos: {x: 0, y: 0}, health: 100, kills: 0}

var loaded = false;
var first = true;

var onLoop = 0;

function getPercent(px, width) {
    if (width) {
        return (100 * px / screen_width) + 'px';
    }
    return (100 * px / screen_height) + 'px';
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
        scaleX = getPercent(10000, true);
        scaleY = getPercent(10000, false);

        socket.emit('need id', { username: player.username });
        waitForId();
    }

    document.getElementById('menu').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    //run the game loop 150 times a second but only request server data 30 times
    //this is to move the bullets super fast
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
    let player = document.getElementById(data.player_id.toString());
    if (player == undefined || player == null) {
        createPlayer(data);
        player = document.getElementById(data.player_id.toString());
    }

    let player_icon = player.getElementsByClassName('player_icon')[0];

    let username = player.getElementsByClassName('username')[0];
}

function createPlayer(data) {
    let player = document.createElement('div');
    player.setAttribute('id', data.player_id.toString());

    let player_icon = document.createElement('div');
    player_icon.classList.add('player_icon');

    let username = document.createElement('div');
    username.classList.add('username');
    username.innerHTML = data.username; 
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
                //set up game
            }
            //update
        }
    }
}