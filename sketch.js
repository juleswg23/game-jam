const KeyW = 87;
const KeyA = 65;
const KeyS = 83;
const KeyD = 68;

const PAGE_SIZE = 1_200;
const PLAYER_HEIGHT = PAGE_SIZE/20;
const STEP_SIZE = PLAYER_HEIGHT/5;

const PLAYER1_COLOR = "blue";
const PLAYER2_COLOR = "red";
const BORDER_COLOR = "black";
const BORDER_WIDTH = PLAYER_HEIGHT/8;
const BORDER_FREQ = 0.6;
const FRIENDLY_BORDERS = 10;

const GRID_ORDER = PAGE_SIZE/100;

let player1;
let player2;
let players;

let bg;
let grid;
let borders = [];

class Player{
  constructor(x, y, height, stepSize, playerBool) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = this.height/2;
    this.stepSize = stepSize;
    this.isPlayer1 = playerBool;
  }

  show() {
    switch (this.isPlayer1) {
      case true:
        fill(PLAYER1_COLOR);
        break
      default:
        fill(PLAYER2_COLOR);
    }
  
    circle(this.x, this.y-(this.height/4), this.height/2);
    circle(this.x, this.y-(13*this.height/20), this.height*3/10);
    circle(this.x, this.y-(18*this.height/20), this.height/5);

    // debugging
    rect(this.x-this.width/2, this.y-this.height, this.width, this.height);
  }

  borderCollide(border) {
    switch (border.isHorizontal) {
      case true:
        // horizontal border, check that the y coordinates don't hit it
        if (this.y > border.y && this.y-this.height < border.y){
          //console.log("inside horizontal collision case");

          return (this.x - this.width/2 > border.x && this.x + this.width/2 < border.x + border.size);
        }
        break;
      default:
        // vertical border
        if (this.x - this.width/2 < border.x && this.x + this.width/2 > border.x){
          //console.log("inside vertical collision case");
          //console.log(border)
          return (this.y > border.y && this.y - this.height < border.y + border.size);
        }
    }
    return false;
  }

}

class Border {
  constructor(x, y, size, isHorizontal, group) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.isHorizontal = isHorizontal;
    this.group = group; // if 0, no group, else associated with player n
  }

  show(pg) {

    switch (this.group) {
      case 1:
        pg.stroke(PLAYER1_COLOR);
        break;
      case 2:
        pg.stroke(PLAYER2_COLOR);
        break;
      default:
        pg.stroke(BORDER_COLOR);
    }
    
    pg.strokeWeight(BORDER_WIDTH);

    switch (this.isHorizontal) {
      case true:
        pg.line(this.x, this.y, this.x+this.size, this.y);
        break;
      default:
        pg.line(this.x, this.y, this.x, this.y+this.size);
    }
    return pg;
  }

}

function drawPlayers() { 

  // Steady movement, 1/3rd step
  if (keyIsDown(UP_ARROW)) {
    player2.y-=STEP_SIZE*2/3;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player2.x+=STEP_SIZE*2/3;
  }
  if (keyIsDown(LEFT_ARROW)) {
    player2.x-=STEP_SIZE*2/3;
  }
  if (keyIsDown(DOWN_ARROW)) {
    player2.y+=STEP_SIZE*2/3;
  }
  
  if (keyIsDown(KeyW)) {
    player1.y-=STEP_SIZE*2/3;
  }
  if (keyIsDown(KeyA)) {
    player1.x-=STEP_SIZE*2/3;
  }
  if (keyIsDown(KeyS)) {
    player1.y+=STEP_SIZE*2/3;
  }
  if (keyIsDown(KeyD)) {
    player1.x+=STEP_SIZE*2/3;
  }

  // Collision logic with wall
  for (let player of players) {
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

  // Collision logic with border
  for (let player of players) {
    for (let border of borders) {
      if (player.borderCollide(border)) {
        //console.log("{} collide with: {}", player, border);
      }
    }
  }

  player1.show();
  player2.show();
}

function generateBorders(background) {
  // create horizontal borders
  for (let i = 1; i < GRID_ORDER-1; i++) {
    for (let j = 1; j < GRID_ORDER; j++) {
      if (Math.random() < BORDER_FREQ) {
        borders.push(new Border(i*PAGE_SIZE/GRID_ORDER, j*PAGE_SIZE/GRID_ORDER, PAGE_SIZE/GRID_ORDER, true));
      }
    }
  }

  // create vertical borders
  for (let i = 1; i < GRID_ORDER; i++) {
    for (let j = 1; j < GRID_ORDER-1; j++) {
      if (Math.random() < BORDER_FREQ) {
        borders.push(new Border(i*PAGE_SIZE/GRID_ORDER, j*PAGE_SIZE/GRID_ORDER, PAGE_SIZE/GRID_ORDER, false));
      }
    }
  }

  let index = 0;

  // add the borders to background
  for (let border of borders) {

    border.group = index % 5;
    
    background = border.show(background);
    index++;
  }

  return background;
}

function setup() {
  player1 = new Player(100, 100, PLAYER_HEIGHT, STEP_SIZE, true);
  player2 = new Player(PAGE_SIZE-100, PAGE_SIZE-100, PLAYER_HEIGHT, STEP_SIZE, false);
  players = [player1, player2];

  createCanvas(PAGE_SIZE, PAGE_SIZE);
  // createBorderOutline()

  bg = createGraphics(PAGE_SIZE, PAGE_SIZE);
  bg.background(225);
  bg = generateBorders(bg);

}

function draw() {
  clear();
  image(bg, 0, 0);

  strokeWeight(2); drawPlayers();
}

// Starting movement, full step
function keyPressed() {
  if (key === 'w') {
    player1.y -= STEP_SIZE;
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
}


// hinging doors
// buttons to manipulate state