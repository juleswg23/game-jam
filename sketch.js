const KeyW = 87;
const KeyA = 65;
const KeyS = 83;
const KeyD = 68;

const PAGE_SIZE = 1_000;
const PLAYER_HEIGHT = 50;
const STEP_SIZE = 10;
let sunHeight;

let player1;
let player2;
let players;

class Player{
  constructor(x, y, height, stepSize, playerBool) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.stepSize = stepSize;
    this.isPlayer1 = playerBool;
  }

  move(params) {
    
  }

  show() {
    switch (this.isPlayer1) {
      case true:
        fill("navy");
        break
      default:
        fill("red");
    }
  
    circle(this.x, this.y-(this.height/4), this.height/2);
    circle(this.x, this.y-(13*this.height/20), this.height*3/10);
    circle(this.x, this.y-(18*this.height/20), this.height/5);
  }

}

function drawPlayers() { 

  // Steady movement, 1/3rd step
  if (keyIsDown(UP_ARROW)) {
    player2.y-=STEP_SIZE/3;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player2.x+=STEP_SIZE/3;
  }
  if (keyIsDown(LEFT_ARROW)) {
    player2.x-=STEP_SIZE/3;
  }
  if (keyIsDown(DOWN_ARROW)) {
    player2.y+=STEP_SIZE/3;
  }
  
  if (keyIsDown(KeyW)) {
    player1.y-=STEP_SIZE/3;
  }
  if (keyIsDown(KeyA)) {
    player1.x-=STEP_SIZE/3;
  }
  if (keyIsDown(KeyS)) {
    player1.y+=STEP_SIZE/3;
  }
  if (keyIsDown(KeyD)) {
    player1.x+=STEP_SIZE/3;
  }

  // Collision logic with wall
  for (let player of players) {
    console.log(player);
    if (player.x+PLAYER_HEIGHT/5 > PAGE_SIZE) {
      player.x = PAGE_SIZE-PLAYER_HEIGHT/5;
    } else if (player.x-PLAYER_HEIGHT/5 < 0) {
      player.x = PLAYER_HEIGHT/5;
    }
    if (player.y > PAGE_SIZE) {
      player.y = PAGE_SIZE;
    } else if (player.y-PLAYER_HEIGHT < 0) {
      player.y = PLAYER_HEIGHT;
    }
  }

  player1.show();
  player2.show();
}

function setup() {
  player1 = new Player(100, 100, PLAYER_HEIGHT, STEP_SIZE, true);
  player2 = new Player(PAGE_SIZE-100, PAGE_SIZE-100, PLAYER_HEIGHT, STEP_SIZE, false);

  players = [player1, player2];

  createCanvas(PAGE_SIZE, PAGE_SIZE);
}

function draw() {
  background(200);

  drawPlayers();
}


// Starting movement, full step
function keyPressed() {
  if (key === 'w') {
    player1 -= STEP_SIZE;
  } else if (key === 'a') {
    player1.x -= STEP_SIZE;
  } else if (key === 's') {
    player1.y += STEP_SIZE;
  } else if (key === 'd') {
    player1.x += STEP_SIZE;
  }

  if (keyCode === UP_ARROW) {
    player2.y -= STEP_SIZE;
  } else if (keyCode === LEFT_ARROW) {
    player2.x -= STEP_SIZE;
  } else if (keyCode === DOWN_ARROW) {
    player2.y += STEP_SIZE;
  } else if (keyCode === RIGHT_ARROW) {
    player2.x += STEP_SIZE;
  }
  
  return false;
}
