const KeyW = 87;
const KeyA = 65;
const KeyS = 83;
const KeyD = 68;

const PAGE_SIZE = 1_200;
const PLAYER_HEIGHT = PAGE_SIZE/20;
const STEP_SIZE = PLAYER_HEIGHT/10;

const PLAYER1_COLOR = "blue";
const PLAYER2_COLOR = "red";
const BORDER_COLOR = "black";
const BORDER_WIDTH = 7;
const BORDER_FREQ = 0.6;
const GROUP_DENSITY = 5;

const GRID_ORDER = PAGE_SIZE/100;

let player1;
let player2;
let players;

let bg;
let grid;
let borders = [];

class Player{
  constructor(x, y, height, stepSize, id) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = this.height/2;
    this.stepSize = stepSize;
    this.id = id;
    this.step = STEP_SIZE;
  }

  show() {
    switch (this.id) {
      case 1:
        fill(PLAYER1_COLOR);
        stroke("black")
        break
      case 2:
        fill(PLAYER2_COLOR);
        stroke("black");
        break;
    }

    rect(this.x, this.y, this.width, this.height);


    circle(this.x + this.width/2, this.y+(2*this.height/20), this.height/5); // smallest
    circle(this.x + this.width/2, this.y+(7*this.height/20), this.height*3/10);
    circle(this.x + this.width/2, this.y+(15*this.height/20), this.height/2); // largest

    // debugging
  }

  borderCollide(border) {
    switch (border.isHorizontal) {
      case true:
        // horizontal border, check that the y coordinates don't hit it
        if (this.y+this.height > border.y && this.y < border.y){
          if (this.x < border.x + border.size && this.x + this.width > border.x) {
            return true;
          }
        }
        break;
      default:
        // vertical border
        if (this.x < border.x && this.x + this.width > border.x){
          if (this.y+this.height > border.y && this.y < border.y + border.size) {
            return true;
          }
        }
    }
    return false;
  }

}

class Border {
  constructor(x, y, size, isHorizontal, group) {
    this.x = x;
    this.y = y;
    this.size = size
    this.isHorizontal = isHorizontal;
    this.group = group; // if 0, no group, else associated with player n
  }

  show() {

    switch (this.group) {
      case 1:
        stroke(PLAYER1_COLOR);
        break;
      case 2:
        stroke(PLAYER2_COLOR);
        break;
      default:
        stroke(BORDER_COLOR);
    }
    
    strokeWeight(BORDER_WIDTH);

    switch (this.isHorizontal) {
      case true:
        line(this.x, this.y, this.x+this.size, this.y);
        break;
      default:
        line(this.x, this.y, this.x, this.y+this.size);
    }
  }

}

function drawBorders() {
  for (let b of borders) {
    borderGraphic = b.show()
  }
}

function updateBorders(group) {
  for (let b of borders) {
    if (b.group == group) {
      b.isHorizontal = !b.isHorizontal;
    }
  }
}

function drawPlayers() { 

  if (keyIsDown(UP_ARROW)) {
    player2.y -= player2.step;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player2.x += player2.step;
  }
  if (keyIsDown(LEFT_ARROW)) {
    player2.x -= player2.step;
  }
  if (keyIsDown(DOWN_ARROW)) {
    player2.y += player2.step;
  }
  
  if (keyIsDown(KeyW)) {
    player1.y-=STEP_SIZE;
  }
  if (keyIsDown(KeyA)) {
    player1.x-=STEP_SIZE;
  }
  if (keyIsDown(KeyS)) {
    player1.y+=STEP_SIZE;
  }
  if (keyIsDown(KeyD)) {
    player1.x+=STEP_SIZE;
  }

  // Collide with wall
  for (let player of players) {
    player.step = STEP_SIZE;
    for (let border of borders) {
      if (player.borderCollide(border)) {
        // if player and collide are same color, ignore it
        if (player.id == border.group) {
          //console.log("collision with color");
          continue;
        }
       
        // handle collision with out of color conflict
        // Get sides of border
        let border_top = border.y;
        let border_left = border.x;
        let border_bottom = border.y;
        let border_right = border.x;
        if (border.isHorizontal) {
          border_right = border.x + border.size;
        } else {
          border_bottom = border.y + border.size;
        }

        // Find nearest point of contact
        let nearest = [100000, ""];

        if (border_bottom - player.y < nearest[0] && border_bottom > player.y) {
          nearest[0] = border_bottom - player.y;
          nearest[1] = "below";
        }
        if ((player.y + player.height) - border_top < nearest[0] && (player.y + player.height) > border_top) {
          nearest[0] = (player.y + player.height) - border_top;
          nearest[1] = "above";
        }
        if (border_right - player.x < nearest[0] && border_right > player.x ) {
          nearest[0] = border_right - player.x;
          nearest[1] = "right";
        }
        if ((player.x + player.width) - border_left < nearest[0] && (player.x + player.width) > border_left) {
          nearest[0] = (player.x + player.width) - border_left;
          nearest[1] = "left";
        }

        switch (nearest[1]) {
          case "below":
            player.y = border_bottom;
            break;
          case "above":
            player.y = border_top - player.height;
            break;
          case "right":
            player.x = border_right;
            break;
          case "left":
            player.x = border_left - player.width;
            break;
          default:
            //
        }

      }      
    }
  }


  // Collision logic with wall
  for (let player of players) {
    if (player.x+player.width > PAGE_SIZE) {
      player.x = PAGE_SIZE-player.width;
    } else if (player.x < 0) {
      player.x = 0;
    }
    if (player.y > PAGE_SIZE - player.height) {
      player.y = PAGE_SIZE - player.height;
    } else if (player.y < 0) {
      player.y = 0;
    }
  }

  player1.show();
  player2.show();
}

/* Helper for creating borders, run once */

function generateBorders() {
  // create horizontal borders
  for (let i = 1; i < GRID_ORDER-1; i++) {
    for (let j = 1; j < GRID_ORDER; j++) {
      if (Math.random() < BORDER_FREQ) {
        borders.push(new Border(i*PAGE_SIZE/GRID_ORDER, j*PAGE_SIZE/GRID_ORDER, PAGE_SIZE/GRID_ORDER, true, 0));
      }
    }
  }

  // create vertical borders
  for (let i = 1; i < GRID_ORDER; i++) {
    for (let j = 1; j < GRID_ORDER-1; j++) {
      if (Math.random() < BORDER_FREQ) {
        borders.push(new Border(i*PAGE_SIZE/GRID_ORDER, j*PAGE_SIZE/GRID_ORDER, PAGE_SIZE/GRID_ORDER, false, 0));
      }
    }
  }

  let index = 0;

  // add the borders to background
  for (let border of borders) {
    border.group = index % GROUP_DENSITY;
    index++;
  }
}


/* Game setup, run once */

function setup() {
  player1 = new Player(PLAYER_HEIGHT, PLAYER_HEIGHT, PLAYER_HEIGHT, STEP_SIZE, 1);
  player2 = new Player(PAGE_SIZE-PLAYER_HEIGHT, PAGE_SIZE-PLAYER_HEIGHT, PLAYER_HEIGHT, STEP_SIZE, 2);
  players = [player1, player2];

  createCanvas(PAGE_SIZE, PAGE_SIZE);
  // createBorderOutline()

  bg = createGraphics(PAGE_SIZE, PAGE_SIZE);
  bg.background(225);
  image(bg, 0, 0);

  generateBorders();

}

/* Game loop */


function draw() {
  clear();
  image(bg, 0, 0);
  drawBorders();

  strokeWeight(2); drawPlayers();
}

// Starting movement, full step
// function keyPressed() {
//   if (key === 'w') {
//     player1.y -= STEP_SIZE;
//   } else if (key === 'a') {
//     player1.x -= STEP_SIZE;
//   } else if (key === 's') {
//     player1.y += STEP_SIZE;
//   } else if (key === 'd') {
//     player1.x += STEP_SIZE;
//   }

//   if (keyCode === UP_ARROW) {
//     player2.y -= STEP_SIZE;
//   } else if (keyCode === LEFT_ARROW) {
//     player2.x -= STEP_SIZE;
//   } else if (keyCode === DOWN_ARROW) {
//     player2.y += STEP_SIZE;
//   } else if (keyCode === RIGHT_ARROW) {
//     player2.x += STEP_SIZE;
//   }
// }


// hinging doors
// buttons to manipulate state