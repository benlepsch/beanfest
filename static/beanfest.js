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
var initData;
const player = { player_id: '' }; //store each player in an object of { player_id: player_id, username: username, pos: {x: 0, y: 0}, health: 100, kills: 0}

const initSpeed = 5;
var speed = initSpeed;
const keys = {};

var game_running = false;

var onLoop = 0;

window.onkeydown = function(e) {
    let key = e.keyCode ? e.keyCode : e.which;
    if (!game_running && key == 13) {
        play();
    } else {
        keys[key] = true;
    }
}

window.onkeyup = function(e) {
    if (!game_running) {
        return;
    }
    let key = e.keyCode ? e.keyCode : e.which;
    keys[key] = false;
}

function getPercent(px, width) {
    if (width) {
        return (100 * px / screen_width) + '%';
    }
    return (100 * px / screen_height) + '%';
}

$(document).ready(function() {
    screen_height = $(window).height();
    screen_width = $(window).width();
    initZoom = window.devicePixelRatio;

    socket = io.connect('http://' + document.domain + ':' + location.port + '/bbeanfest');

    socket.on('give id', (msg) => {
        console.log('working');
        player.player_id = msg.player_id;
        player.position = msg.position;
        player.kills = 0;
        player.health = 100;
    });

    socket.on('init data', (msg) => {
        console.log('set init data');
        initData = msg;
        document.getElementById('menu').style.display = 'none';

        //run the game loop 150 times a second but only request server data 30 times
        //this is to move the bullets super fast
        game_running = true;
        startGame(150);
    });

    socket.on('new data', (msg) => updatePlayer(msg));

    socket.on('remove player', (msg) => {
        document.getElementById('players').removeChild(document.getElementById(msg.player_id.toString()));
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
        document.getElementById('error').style.color = 'red';
        return;
    }

    player.username = document.getElementById('username').value;

    if (player.player_id == '') {
        socket.emit('need id', { username: player.username });
        console.log('waiting for id');
    } else {

        document.getElementById('menu').style.display = 'none';
        //run the game loop 150 times a second but only request server data 30 times
        //this is to move the bullets super fast
        game_running = true;
        startGame(150);
    }
    // request player id from server
    // hide menu, load in background
    // receive data from server and load in other players
    // startGame()
}

function load_background() {
    document.getElementById('playbutton').innerHTML = 'Play!';
    document.getElementById('playbutton').onclick = play;
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
        let background = document.getElementById('background');
        /*
            position is {x, y}
            as percentages of the background image
            multiply percentage by background image width/height to get where it is
            then add the background left/top position already to get where it is relative to your screen
        */
        player_icon.style.left = data.position.x/100 * parseFloat(getPercent(parseFloat(background.clientWidth), true)) + parseFloat(background.style.left) + '%';
        player_icon.style.top = data.position.y/100 * parseFloat(getPercent(parseFloat(background.clientHeight), false)) + parseFloat(background.style.top) + '%';
    }
    
    username.style.left = parseFloat(player_icon.style.left) + parseFloat(getPercent(parseFloat(player_icon.clientWidth)/2, true)) + '%';
    username.style.top = parseFloat(player_icon.style.top) + parseFloat(getPercent(player_icon.clientHeight, false)) + parseFloat(getPercent(4, false)) + '%';
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
    username.style.width = '0%';
    username.innerHTML = data.username; 

    document.getElementById('players').appendChild(new_player);
    new_player.appendChild(player_icon);
    new_player.appendChild(username);
}

function checkKeys() {
    let x_change = 0;
    let y_change = 0;

    if (keys[16]) {
        //shift
        speed = initSpeed * 2;
    } else {
        speed = initSpeed;
    }

    if (keys[87]) {
        //w
        y_change += speed;
    }
    if (keys[83]) {
        //s
        y_change -= speed;
    }
    if (keys[65]) {
        //a
        x_change += speed;
    }
    if (keys[68]) {
        //d
        x_change -= speed;
    }

    let background = document.getElementById('background');
    background.style.left = parseFloat(background.style.left) + parseFloat(getPercent(x_change, true)) + '%';
    background.style.top = parseFloat(background.style.top) + parseFloat(getPercent(y_change, false)) + '%';

    let player_icons = document.getElementById('players').getElementsByClassName('player_icon');
    let usernames = document.getElementById('players').getElementsByClassName('username');

    for (let i = 0; i < player_icons.length; i++) {
        if (player_icons[i].parentNode.id != player.player_id) {
            player_icons[i].style.left = parseFloat(player_icons[i].style.left) + parseFloat(getPercent(x_change, true)) + '%';
            player_icons[i].style.top = parseFloat(player_icons[i].style.top) + parseFloat(getPercent(y_change, false)) + '%';
        }
        if (usernames[i].parentNode.id != player.player_id) {
            usernames[i].style.left = parseFloat(usernames[i].style.left) + parseFloat(getPercent(x_change, true)) + '%';
            usernames[i].style.top = parseFloat(usernames[i].style.top) + parseFloat(getPercent(y_change, false)) + '%';
        }
    }
}

//runs the game at a specified fps
//dont touch i dont know how it works
let fpsInterval, then, startTime, elapsed;
function startGame(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;

    //initialize background position
    let background = document.getElementById('background');
    background.style.display = 'block';
    background.style.width = getPercent(10000, true);
    background.style.height = getPercent(10000, false);
    
    //set background position
    //-72 x 1300 z (for minecraft not beanfest)
    let b_x, b_y;
    b_x = player.position.x/100 * parseFloat(background.style.width) - parseFloat(getPercent(screen_width/2, true));
    b_y = player.position.y/100 * parseFloat(background.style.height) - parseFloat(getPercent(screen_height/2, false));
    b_x *= -1;
    b_y *= -1;

    background.style.left = b_x + '%';
    background.style.top = b_y + '%';

    //initialize all players
    for (let i = 0; i < initData.length; i++) {
        updatePlayer(initData[i]);
    }

    runGame();
}

function runGame() {
    requestAnimationFrame(runGame);
    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        
        //move bullets here and nothing else



        onLoop += 1;
        if (onLoop == 4) {
            //move player
            //request/send server data

            checkKeys();

            socket.emit('recieve data', player);

            onLoop = 0;
        }
    }
}