const KeyW = 87;
const KeyA = 65;
const KeyS = 83;
const KeyD = 68;

const PLAYER1_COLOR = "blue";
const PLAYER2_COLOR = "red";
const PLAYER3_COLOR = "green" // TODO create player 3 to player n support
const BORDER_COLOR = "black";

let SEED = 1;
let DIFFICULTY = 10;
let PAGE_SIZE = 1_000;
let GRID_CELLS_ACROSS = 15;
let GRID_CELL_WIDTH = (PAGE_SIZE/GRID_CELLS_ACROSS);

let PLAYER_HEIGHT = GRID_CELL_WIDTH/2;
let STEP_SIZE = GRID_CELL_WIDTH/14;

let BORDER_WIDTH = GRID_CELL_WIDTH/10;
let BORDER_FREQ = 0.8;
let GROUP_DENSITY = 4;
let BUTTON_COUNT = 2;
let ACTIVE_RATE = 3;

let player1;
let player2;
let bg;
let checkered_flag;
let new_game_button;
let easier_button;
let harder_button;

let game_over = [];
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

    //rect(this.x, this.y, this.width, this.height);
    circle(this.x + this.width/2, this.y+(2*this.height/20), this.height/5); // smallest
    circle(this.x + this.width/2, this.y+(7*this.height/20), this.height*3/10);
    circle(this.x + this.width/2, this.y+(15*this.height/20), this.height/2); // largest
  }

  borderCollide(border) {
    switch (border.isHorizontal) {
      case true:
        // horizontal border, check that the y coordinates don't hit it
        if (this.y+this.height > border.y && this.y < border.y){
          if (this.x < border.x + border.size && this.x + this.width > border.x) {
            return border.active == 0;
          }
        }
        break;
      default:
        // vertical border
        if (this.x < border.x && this.x + this.width > border.x){
          if (this.y+this.height > border.y && this.y < border.y + border.size) {
            return border.active == 0;
          }
        }
    }
    return false;
  }

  buttonCollide(button) {
    switch (button.type) {
      case "toggle":
        let testX = button.x;
        let testY = button.y;
        if (button.x < this.x)                  testX = this.x;                // left edge
        else if (button.x > this.x+this.width)  testX = this.x+this.width;     // right edge

        if (button.y < this.y)                  testY = this.y;                 // top edge
        else if (button.y > this.y+this.height) testY = this.y+this.height;     // bottom edge

        let distX = button.x-testX;
        let distY = button.y-testY;
        let distance = Math.sqrt( (distX*distX) + (distY*distY) );
        if (distance <= button.size/2) {
          return true;
        }

        break;
      case "finish":
        if (this.x < button.x+button.size && button.x < this.x+this.width &&
          this.y < button.y+button.size && button.y < this.y+this.height) {
            // if overlapping, return true
            return true;
        }
      default:
        break;
    }
    return false;
  }

}

class Border {
  constructor(x, y, size, isHorizontal, group, active) {
    this.x = x;
    this.y = y;
    this.size = size
    this.isHorizontal = isHorizontal;
    this.group = group; // if 0, no group, else associated with player n
    this.active = active; // 0 means on, anything else means off
  }

  show() {
    let c;
    switch (this.group) {
      case 1:
        c = color(PLAYER1_COLOR);
        break;
      case 2:
        c = color(PLAYER2_COLOR);
        break;
      default:
        c = color(BORDER_COLOR);
    }

    if (this.active != 0) {
      c.setAlpha(20);
    }
    stroke(c);
    
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
  constructor(x, y, size, group, type) {
    this.group = group;
    this.type = type;
    this.x = x;
    this.y = y;
    this.size = size;
    this.isColliding = new Array(players.length).fill(false);
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

    if (this.isColliding.includes(true)) fill(BORDER_COLOR);

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
      b.active += 1;
      b.active = b.active % ACTIVE_RATE;
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
        // if player collides with border of their color,
        if (player.id == border.group) {
          updateBorders(player.id); // don't update borders now
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
            if (player.id == button.group && !button.isColliding[player.id-1]) {
              button.isColliding[player.id-1] = true;
              updateBorders(player.id);
            }
            break;
          // made it to finish line
          case "finish":
            if (player.id == button.group && !game_over[player.id-1]) {
              button.isColliding[player.id-1] = true;
            }
            break;
          default:
            break; // pass
        }
      } else {
        button.isColliding[player.id-1] = false;
      }
      if (button.type == "finish") {
        game_over[button.group-1] = button.isColliding[button.group-1];
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
  for (let i = 1; i < GRID_CELLS_ACROSS-1; i++) {
    for (let j = 1; j < GRID_CELLS_ACROSS; j++) {
      if (pseudo_random() < BORDER_FREQ) {
        borders.push(new Border(i*GRID_CELL_WIDTH, j*GRID_CELL_WIDTH, GRID_CELL_WIDTH, true, 0, 0));
      }
    }
  }

  // create vertical borders
  for (let i = 1; i < GRID_CELLS_ACROSS; i++) {
    for (let j = 1; j < GRID_CELLS_ACROSS-1; j++) {
      if (pseudo_random() < BORDER_FREQ*2/3) {
        borders.push(new Border(i*GRID_CELL_WIDTH, j*GRID_CELL_WIDTH, GRID_CELL_WIDTH, false, 0, 0));
      }
    }
  }

  let group_index = 0;
  let active_index = 0;

  // recolor the borders
  for (let border of borders) {
    // ensure im not coloring a border at the edge.
    if (border.x == PAGE_SIZE-GRID_CELL_WIDTH || border.y == PAGE_SIZE-GRID_CELL_WIDTH) {
      border.group = 0;
    } else {
      border.group = group_index % GROUP_DENSITY;

      // enable and disable some borders
      if (border.group <= players.length && border.group > 0) {
        border.active = Math.floor(active_index / ACTIVE_RATE) % ACTIVE_RATE;
        active_index++;
      }

      group_index++;
    }
  }

  //create boundary borders
  for (let i = 1; i < GRID_CELLS_ACROSS-1; i++) {
    borders.push(new Border(i*GRID_CELL_WIDTH, GRID_CELL_WIDTH, GRID_CELL_WIDTH, true, 0, 0));
    borders.push(new Border(i*GRID_CELL_WIDTH, PAGE_SIZE-GRID_CELL_WIDTH, GRID_CELL_WIDTH, true, 0, 0));
    borders.push(new Border(GRID_CELL_WIDTH, i*GRID_CELL_WIDTH, GRID_CELL_WIDTH, false, 0, 0));
    borders.push(new Border(PAGE_SIZE-GRID_CELL_WIDTH, i*GRID_CELL_WIDTH, GRID_CELL_WIDTH, false, 0, 0));

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
  let used = [];
  // make finish buttons
  // TODO
  for (let p of players) {
    let x = PAGE_SIZE - p.x;
    let y = PAGE_SIZE - p.y;
    used.push(str((x/GRID_CELL_WIDTH).toFixed(1))+ "-" + str((y/GRID_CELL_WIDTH).toFixed(1)));
    buttons.push(new Button(x, y, GRID_CELL_WIDTH/2, p.id, "finish"));
  }


  // make toggle buttons
  for (let i = 0; i < BUTTON_COUNT*2; i++) {
    let x; let y;
    do {
      x = Math.floor(pseudo_random()*(GRID_CELLS_ACROSS-2)) + 1.5; // ensure no button outside of grid
      y = Math.floor(pseudo_random()*(GRID_CELLS_ACROSS-2)) + 1.5;
    } while (used.includes(str(x)+ "-" + str(y)));
    used.push(str(x.toFixed(1))+ "-" + str(y.toFixed(1)));
    console.log(used);
    buttons.push(new Button(x * GRID_CELL_WIDTH, y * GRID_CELL_WIDTH, GRID_CELL_WIDTH/4, (i%players.length) + 1, "toggle"));
  }

}

function isGameOver() {
  console.log(game_over);
  return !(game_over.includes(false));
}

function newGamePressed() {
  SEED += 1;
  setup();
}

function changeDifficulty(direction) {
  return function() {
    DIFFICULTY += direction == "harder" ? 1 : -1;
    setup();
  }
}

/* Game setup, run at start of game */

function setup() {
  clear();

  buttons = []
  players = []
  borders = []

  PAGE_SIZE = Math.min(windowWidth, windowHeight);
  GRID_CELL_WIDTH = (PAGE_SIZE/GRID_CELLS_ACROSS);
  PLAYER_HEIGHT = GRID_CELL_WIDTH/2;
  STEP_SIZE = GRID_CELL_WIDTH/14;
  BORDER_WIDTH = GRID_CELL_WIDTH/10;
  seed(SEED);

  player1 = new Player(1.5*GRID_CELL_WIDTH, 1.5*GRID_CELL_WIDTH, PLAYER_HEIGHT, STEP_SIZE, 1);
  player2 = new Player((GRID_CELLS_ACROSS-1.5)*GRID_CELL_WIDTH, (GRID_CELLS_ACROSS-1.5)*GRID_CELL_WIDTH, PLAYER_HEIGHT, STEP_SIZE, 2);
  players = [player1, player2];

  game_over = new Array(players.length).fill(false);

  createCanvas(PAGE_SIZE, PAGE_SIZE);
  bg = createGraphics(PAGE_SIZE, PAGE_SIZE);
  bg.background(225);
  image(bg, 0, 0);

  generateBorders();
  checkered_flag = loadImage("libraries/checkered-flag.png");
  generateButtons();

  /* user interactive buttons */  

  if (new_game_button) new_game_button.hide();
  new_game_button = createButton("New Game");
  let buffer = (GRID_CELL_WIDTH - new_game_button.height)/2;
  new_game_button.position(PAGE_SIZE - new_game_button.width - buffer, buffer);
  new_game_button.mousePressed(newGamePressed);

  if (easier_button) easier_button.hide();
  easier_button = createButton("Easier");
  easier_button.position(buffer, buffer);
  easier_button.mousePressed(changeDifficulty("easier"));

  if (harder_button) harder_button.hide();
  harder_button = createButton("Harder");
  harder_button.position(buffer*2 + easier_button.width, buffer);
  harder_button.mousePressed(changeDifficulty("harder"));
}

/* Game loop */

function draw() {
  clear();
  image(bg, 0, 0);
  drawBorders();
  drawButtons();

  let buffer = (GRID_CELL_WIDTH - new_game_button.height)/2;
  strokeWeight(0); fill(0); textSize(GRID_CELL_WIDTH/2);
  text("Difficulty: " + str(DIFFICULTY), buffer*3 + easier_button.width + harder_button.width, + GRID_CELL_WIDTH*2/3);

  strokeWeight(2); drawPlayers();

  if (isGameOver()) {
    console.log("game over");
    game_over = new Array(players.length).fill(false);
    window.alert("You won! Game difficulty will go up.");
    let func = changeDifficulty("harder");
    func();
  }
}

// TODOS
// Border animations
// sound on collide
