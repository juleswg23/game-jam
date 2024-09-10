const KeyW = 87;
const KeyA = 65;
const KeyS = 83;
const KeyD = 68;

const PAGE_SIZE = 1_200;
const PLAYER_HEIGHT = PAGE_SIZE/20;
const STEP_SIZE = PLAYER_HEIGHT/1000;

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
  }

  show() {
    switch (this.id) {
      case 1:
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
          if (this.x - this.width/2 < border.x + border.size && this.x + this.width/2 > border.x) {
            //updateBorders(this.group);
            return true;
          }
        }
        break;
      default:
        // vertical border
        if (this.x - this.width/2 < border.x && this.x + this.width/2 > border.x){
          if (this.y > border.y && this.y - this.height < border.y + border.size) {
            // do some action
            //updateBorders(this.group);

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
    this.size = size;
    this.isHorizontal = isHorizontal;
    this.group = group; // if 0, no group, else associated with player n
  }

  addTo(pg) {

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

function drawBorders() {
  let borderGraphic = createGraphics(PAGE_SIZE, PAGE_SIZE);
  for (let b of borders) {
    borderGraphic = b.addTo(borderGraphic);
  }
  return borderGraphic;
}

function updateBorders(group) {
  for (let b of borders) {
    if (b.group == group) {
      b.isHorizontal = !b.isHorizontal;
    }
  }
}

function drawPlayers() { 
  // Steady movement, 2/3rds step
  //console.log(key);
  for (let player of players) {
    for (let border of borders) {
      let collision = player.borderCollide(border);
      let step = collision ? -(STEP_SIZE*2) : STEP_SIZE*2/3;

      console.log("collision: ", collision, " step: ", step);

      if (keyIsDown(UP_ARROW)) {
        player2.y -= step;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        player2.x += step;
      }
      if (keyIsDown(LEFT_ARROW)) {
        player2.x -= step;
      }
      if (keyIsDown(DOWN_ARROW)) {
        player2.y += step;
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
    }
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
  // for (let player of players) {
  //   for (let border of borders) {
  //     if (player.borderCollide(border)) {
  //       switch (key) {
  //         case 'w':
  //           player.y += STEP_SIZE*2;
  //           break;
  //         case 'a':
  //           player.x += STEP_SIZE*2;
  //           break;
  //         case 's':
  //           player.y -= STEP_SIZE*2;
  //           break;
  //         case 'd':
  //           player.x -= STEP_SIZE*2;
  //           break;
  //         case UP_ARROW:
  //           player.y += STEP_SIZE*2;
  //           break;
  //         case LEFT_ARROW:
  //           player.x += STEP_SIZE*2;
  //           break;
  //         case DOWN_ARROW:
  //           player.y -= STEP_SIZE*2;
  //           break;
  //         case RIGHT_ARROW:
  //           player.x -= STEP_SIZE*2;
  //           break;
  //         default: 
  //           console.log(key);
  //       }
  //     }
  //   }
  // }

  player1.show();
  player2.show();
}

/* Helper for creating borders, run once */

function generateBorders() {
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
  image(drawBorders(), 0, 0);

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