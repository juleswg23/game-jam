const KeyW = 87;
const KeyA = 65;
const KeyS = 83;
const KeyD = 68;

const PLAYER1_COLOR = "blue";
const PLAYER2_COLOR = "red";
const BORDER_COLOR = "black";
const BORDER_WIDTH = 6;

const PAGE_SIZE = 1_000;
const PLAYER_HEIGHT = PAGE_SIZE/25;
const STEP_SIZE = PLAYER_HEIGHT/5;
const GRID_ORDER = Math.ceil(PAGE_SIZE/100);
const GRID_CELL_WIDTH = PAGE_SIZE/GRID_ORDER;

const BORDER_FREQ = 0.7;
const GROUP_DENSITY = 5;
const BUTTON_COUNT = 2;

let player1;
let player2;
let bg;
let checkered_flag;

let players = [];
let borders = [];
let buttons = [];

/* pseudo random to be able to test gameply consistently */

var m_w = 123456789;
var m_z = 987654321;
var mask = 0xffffffff;

// Takes any integer
function seed(i) {
    m_w = (123456789 + i) & mask;
    m_z = (987654321 - i) & mask;
}

// Returns number between 0 (inclusive) and 1.0 (exclusive)
function pseudo_random()
{
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
}

seed(6);

/* Game logic */ 

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

  buttonCollide(button) {
    switch (button.type) {

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

class Button {
  constructor( x, y, size, group, type) {
    this.group = group;
    this.type = type;
    this.x = x;
    this.y = y;
    this.size = size;
  }

  // draw it on the board
  show() {
    strokeWeight(PLAYER_HEIGHT/15)
    switch (this.group) {
      case 1:
        fill(PLAYER1_COLOR);
        break;
      case 2:
        fill(PLAYER2_COLOR);
        break;
      default:
        fill(BORDER_COLOR);
    }
    if (this.type == "toggle") {
      circle(this.x, this.y, this.size);
    }
     if (this.type == "finish") {
      image(checkered_flag, this.x-this.size/2, this.y-this.size/2, this.size, this.size);
    }
    
  }
}

function drawBorders() {

    // Show black borders first
  for (let b of borders.toReversed()) {
    borderGraphic = b.show();
  }

  // show player borders on top
  // for (let p of players) {
  //   for (let b of borders) {
  //     if (b.group == p.id) {
  //       borderGraphic = b.show();
  //     }
  //   }
  // }

}

function updateBorders(group) {
  for (let b of borders) {
    if (b.group == group) {
      b.isHorizontal = !b.isHorizontal;
    }
  }
}

function drawButtons() {
  for (let button of buttons) {
    button.show();
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
        console.log("collide with ", border.group);

        // if player collides with border of their color,
        if (player.id == border.group) {
          //console.log("collision with color");
          updateBorders(player.id);
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

    for (let button of buttons) {
      if (player.buttonCollide(button)) {
        switch (button.type) {
          // update borders since we collided with a toggle button
          case "toggle":
            if (player.id == button.group) {
              updateBorders(player.id);
            }
            break;
          // made it to finish line
          case "finish":
            // TODO some finish line action!
            break;
          default:
            break; // pass
        }
      }
    }

    // collide with wall
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
      if (pseudo_random() < BORDER_FREQ) {
        borders.push(new Border(i*GRID_CELL_WIDTH, j*GRID_CELL_WIDTH, GRID_CELL_WIDTH, true, 0));
      }
    }
  }

  // create vertical borders
  for (let i = 1; i < GRID_ORDER; i++) {
    for (let j = 1; j < GRID_ORDER-1; j++) {
      if (pseudo_random() < BORDER_FREQ*2/3) {
        borders.push(new Border(i*GRID_CELL_WIDTH, j*GRID_CELL_WIDTH, GRID_CELL_WIDTH, false, 0));
      }
    }
  }

  let index = 0;

  // recolor the borders
  for (let border of borders) {
    // ensure im not coloring a border at the edge.
    if (border.x == PAGE_SIZE-GRID_CELL_WIDTH || border.y == PAGE_SIZE-GRID_CELL_WIDTH) {
      border.group = 0;
    } else {
      border.group = index % GROUP_DENSITY;
      index++;
    }
  }

  //create boundary borders
  for (let i = 1; i < GRID_ORDER-1; i++) {
    borders.push(new Border(i*GRID_CELL_WIDTH, GRID_CELL_WIDTH, GRID_CELL_WIDTH, true, 0));
    borders.push(new Border(i*GRID_CELL_WIDTH, PAGE_SIZE-GRID_CELL_WIDTH, GRID_CELL_WIDTH, true, 0));
    borders.push(new Border(GRID_CELL_WIDTH, i*GRID_CELL_WIDTH, GRID_CELL_WIDTH, false, 0));
    borders.push(new Border(PAGE_SIZE-GRID_CELL_WIDTH, i*GRID_CELL_WIDTH, GRID_CELL_WIDTH, false, 0));

  }

  // sort them by color
  let end = borders.length - 1;
  let i = 0;
  while (i < end) {
    if (borders[i].group <= players.length && borders[i].group > 0) {
      // is a colored border
      let tmp = borders[end];
      borders[end] = borders[i];
      borders[i] = tmp;
      end--;
    } else {
      i++;
    }
  }
}

/* Helper for creating buttons, run once */
function generateButtons() {
  // make finish buttons
  for (let p of players) {
    let x = PAGE_SIZE - p.x;
    let y = PAGE_SIZE - p.y;
    buttons.push(new Button(x, y, GRID_CELL_WIDTH/2, p.id, "finish"));
  }


  // make toggle buttons
  for (let i = 0; i < BUTTON_COUNT*2; i++) {
    // TODO place buttons
    let x = Math.floor(pseudo_random()*(GRID_ORDER-2)) + 1.5; // ensure no button outside of grid
    let y = Math.floor(pseudo_random()*(GRID_ORDER-2)) + 1.5;
    buttons.push(new Button(x * GRID_CELL_WIDTH, y * GRID_CELL_WIDTH, GRID_CELL_WIDTH/4, (i%players.length) + 1, "toggle"));
  }

}


/* Game setup, run once */

function setup() {
  clear();
  player1 = new Player(1.5*GRID_CELL_WIDTH, 1.5*GRID_CELL_WIDTH, PLAYER_HEIGHT, STEP_SIZE, 1);
  player2 = new Player(PAGE_SIZE-1.5*GRID_CELL_WIDTH, PAGE_SIZE-1.5*GRID_CELL_WIDTH, PLAYER_HEIGHT, STEP_SIZE, 2);
  players = [player1, player2];

  createCanvas(PAGE_SIZE, PAGE_SIZE);
  bg = createGraphics(PAGE_SIZE, PAGE_SIZE);
  bg.background(225);
  image(bg, 0, 0);

  generateBorders();
  checkered_flag = loadImage("libraries/checkered-flag.png");
  generateButtons();
}

/* Game loop */

function draw() {
  clear();
  image(bg, 0, 0);
  drawBorders();
  drawButtons();

  strokeWeight(2); drawPlayers();
}

// TODOS
// hinging doors
// buttons to manipulate state
// end location
// simultaneous actions
// Border animations
// layer the borders - black on top?
// simultaneuous border hits cause glitch
// draw borders around everything
// sound on collide
