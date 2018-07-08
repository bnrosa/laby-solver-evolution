const RANDOM_STR_MAX_LEN = 50;
const MUTATION_RATE = 20;
const MUTATION_STEPS = 2
const PENALTY_FACTOR = 100
const INITIAL_GENERATION_SIZE = 100;
const GENERATIONS = 1000;
const ALLOWED_TO_BREED = 40;
const ALLOWED_SURVIVORS = 40;

const MAP2 = [ // (y,x)
  ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'], // y = 0
  ['#', '-', '-', '-', '-', '-', '#', '-', '-', '#'], // |
  ['#', '#', '#', '#', '#', '-', '-', '-', '#', '#'], // |
  ['#', '#', '-', '-', '#', '-', '#', '#', '-', '#'], // |
  ['#', '-', '-', '-', '-', '-', '-', '-', '-', '#'], // |
  ['#', '#', '#', '#', '-', '-', '#', '#', '#', '#'], // |
  ['#', '#', '-', '-', '-', '-', '-', '-', '-', '#'], // |
  ['#', '#', '#', '#', '#', '#', '#', '#', '-', '#'], // |
  ['#', '-', '-', '-', '-', '-', '-', '-', 'S', '#'], // V
  ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']  // y = 9
  // x = 0---------------->x = 9
];

const MAP3 = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'], // y = 0
    ['#', '-', '-', '-', '-', '-', '-', '-', '#', '#'],
    ['#', '-', '-', '-', '-', '-', '-', '-', '-', '#'],
    ['#', '-', '-', '-', '-', '-', '-', '#', '-', '#'],
    ['#', '#', '#', '#', '#', '-', '-', '#', '-', '#'],
    ['#', '-', '-', '-', '-', '-', '-', '#', '#', '#'],
    ['#', '-', '-', '-', '-', '-', '-', '#', '#', '#'],
    ['#', '-', '-', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '-', '-', '-', '-', '-', '-', '-', 'S', '#'],
    ['#', '-', '-', '-', '-', '-', '-', '-', '-', '#'], 
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']   // y =10
    //x=0 ---------------------------------------> x=9
];

const MAP = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'], // y = 0
    ['#', 'S', '#', '-', '-', '-', '-', '-', '#', '#'],
    ['#', '-', '#', '-', '#', '#', '-', '-', '-', '#'],
    ['#', '-', '#', '-', '-', '-', '-', '#', '-', '#'],
    ['#', '-', '#', '#', '#', '-', '-', '#', '-', '#'],
    ['#', '-', '#', '-', '-', '#', '#', '#', '-', '#'],
    ['#', '-', '-', '-', '-', '-', '-', '#', '-', '#'],
    ['#', '#', '-', '#', '#', '#', '#', '#', '-', '#'],
    ['#', '#', '-', '-', '#', '#', '#', '#', '-', '#'],
    ['#', '-', '-', '-', '-', '-', '-', '-', '-', '#'], 
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']   // y =10
    //x=0 ---------------------------------------> x=9
];

const MAP_END = {x: 1, y: 1};
const ROBOT_STARTING_X = 3;
const ROBOT_STARTING_Y = 1;
//Starting direction for both robot and laby
const STARTING_DIRECTION = "RIGHT";
const ROBOT_SIGHT = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
const GENETIC_PATTERN = [
'---',
'#--',
'-#-',
'##-',
'--#',
'###',
'-##',
'#-#',
'S--',
'-S-',
'--S',
'S##',
'##S',
'#S#',
'-#S',
'#-S',
'#S-',
'-S#',
'S-#',
'S#-'];

let counter = 0;
let best_candidates = []
let best_candidates_children = []
let candidates = []

let new_g = [];

let running = 1;

class Robot {
  constructor(genes, x, y, sight, fitness, found){
    this.genes = genes;
    this.x = x;
    this.y = y;
    this.sight = sight;
    this.fitness = fitness;
    this.found = found
  }

    /***
     * Flips robot sight clockwise
     */
    flipClockwise(){
        switch(this.sight){
        case 'RIGHT':
            this.sight = 'DOWN';
            break;
        case 'DOWN':
            this.sight = 'LEFT';
            break; 
        case 'LEFT':
            this.sight = 'UP';
            break;
        case 'UP':
            this.sight = 'RIGHT';
            break;
        }
        if(this.x == 1 && this.y == 1){
            this.fitness -= 300;
        }
    }

    /***
    * Flip robot anticlockwise
    */
    flipAntiClockwise(){
        switch(this.sight){
        case 'RIGHT':
            this.sight = 'UP';
            break;
        case 'DOWN':
            this.sight = 'RIGHT'; 
            break;
        case 'LEFT':
            this.sight = 'DOWN';
            break;
        case 'UP':
            this.sight = 'LEFT';
            break;
        }
        if(this.x == 1 && this.y == 1){
            this.fitness -= 300;
        }
  }

  /**
   * Moves robot to the diagonal-right spot
   */
  moveDiagonalRight(){
    let wantedX = this.x;
    let wantedY = this.y;
    switch(this.sight) {
          case "RIGHT":
              wantedX++;
              wantedY--;
              break;
          case "UP":
              wantedX++;
              wantedY++;
              break;
          case "LEFT":
              wantedX--;
              wantedY++;
              break;
          case "DOWN":
              wantedX--;
              wantedY--;
              break;
    }
    if(MAP[wantedY][wantedX] != '#'){
      this.y = wantedY;
      this.x = wantedX;
      //this.fitness +=10;
    }
    else{
      this.fitness -= 200;
    }
  }

  /**
   * Moves robot to the diagonal-left spot
   */
  moveDiagonalLeft(){
    let wantedX = this.x;
    let wantedY = this.y;
    switch(this.sight) {
          case "RIGHT":
              wantedX++;
              wantedY++;
              break;
          case "UP":
              wantedX--;
              wantedY++;
              break;
          case "LEFT":
              wantedX--;
              wantedY--;
              break;
          case "DOWN":
              wantedX++;
              wantedY--;
              break;
    }
    if(MAP[wantedY][wantedX] != '#'){
      this.y = wantedY;
      this.x = wantedX;
      //this.fitness +=10;
    }
    else{
      this.fitness -= 200;
    }
  }

  moveFront(){
    
    let wantedX = this.x;
    let wantedY = this.y;
    switch(this.sight) {
          case "RIGHT":
              wantedX++;
              break;
          case "UP":
              wantedY++;
              break;
          case "LEFT":
              wantedX--;
              break;
          case "DOWN":
              wantedY--;
              break;
    }
    if(MAP[wantedY][wantedX] != '#'){
      this.y = wantedY;
      this.x = wantedX;
      //this.fitness += 10;
    }
    else{
      this.fitness -= 200;
    }
  }

  calcSignals(){
    let signalFront, signalLeft, signalRight;
    switch(this.sight) {
          case "RIGHT":
        signalFront = MAP[this.y][this.x +1];
        signalLeft = MAP[this.y +1 ][this.x + 1];
        signalRight = MAP[this.y - 1][this.x + 1];
              break;
          case "UP":
        signalFront = MAP[this.y +1][this.x];
        signalLeft = MAP[this.y +1][this.x -1 ];
        signalRight = MAP[this.y +1][this.x + 1];
              break;
          case "LEFT":
        signalFront = MAP[this.y][this.x -1];
        signalLeft = MAP[this.y -1][this.x - 1];
        signalRight = MAP[this.y +1][this.x - 1];
              break;
          case "DOWN":
        signalFront = MAP[this.y  -1][this.x];
        signalLeft = MAP[this.y - 1][this.x + 1];
        signalRight = MAP[this.y - 1][this.x - 1];
              break;
    }
      let signal = "" + signalLeft + signalFront + signalRight;
      return signal;
  }

  get signals(){
      return this.calcSignals();
  }

  doActions(){
    this.fitness -= 5;
    let actionCode = this.genes[this.signals];
    if(this.found != true){
        switch(actionCode){
            case 1:
                this.moveFront();
                break;
            case 2:
                this.flipAntiClockwise();
                break;
            case 3:
                this.flipClockwise();
                break;
            case 0:
                this.moveDiagonalLeft();
                break;
            case 4:
                this.moveDiagonalRight();
                break;
        }
        if(MAP[this.y][this.x] == 'S'){
            this.found = true;
            this.fitness += 1000;
        }
    }
    
  }

  distanceFitness(){
      let myPosition = {x: this.x, y: this.y};
      let distance = euclideanDistance(myPosition, MAP_END);
      this.fitness -= distance * 300; 
  }
  //End of robot class
}

/**
 * Returns new random robot
 */
function random_robot(x, y, start_sight, pattern){
  let genes = {};
  pattern.forEach(function (gene){
    genes[gene] = get_random_int(0, 5);
  });
  let robot = new Robot(genes,x, y, start_sight, 0, false);
  return robot;
}

function get_random_int(min, max) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
}

function euclideanDistance(actualPosition, desirablePosition) {
    return Math.floor(
        Math.sqrt(
            Math.pow((desirablePosition.x - actualPosition.x), 2) +
            Math.pow((desirablePosition.y - actualPosition.y), 2)
        )
    );
}

function crossOver(robot1, robot2){
    let childRobot = random_robot(ROBOT_STARTING_X, ROBOT_STARTING_Y, STARTING_DIRECTION, GENETIC_PATTERN);
    let count = 0;
    GENETIC_PATTERN.forEach(function (gene){
        count++;
        if(count > 10){
            childRobot.genes[gene] = robot1.genes[gene];
        }
        else{
            childRobot.genes[gene] = robot2.genes[gene];
        }
    });
    return childRobot;
}

function mutate(robot){
    mutante = random_robot(ROBOT_STARTING_X, ROBOT_STARTING_Y, STARTING_DIRECTION, GENETIC_PATTERN);
    GENETIC_PATTERN.forEach(function(gene){
      if(get_random_int(0, 10) > 4){
          mutante.genes[gene] = robot.genes[gene];
      }
      else{
          mutante.genes[gene] = get_random_int(0, 5);
      }
    })
    return mutante;
}

function main(){
    //console.log(robot1.signals);
    let survivers;
    let mutantes = [];
    let robotsGeneration = [];
    let breeded = [];
    let score;
    //Initial generation
    for(let i= 0;i<100; i++){
        robot1 = random_robot(ROBOT_STARTING_X, ROBOT_STARTING_Y, STARTING_DIRECTION, GENETIC_PATTERN);
        robotsGeneration.push(robot1);
    }
    //Evolutionary loop
    for(let t =0; t<=50; t++){
        score = 0;
        mutantes = [];
        survivers = [];
        breeded = [];
        for(let m= 0; m<100; m++){
            for(let j = 0; j <100; j++){
                robotsGeneration[j].doActions();
            }
        }
        for(let i =0; i<100; i++){
            robotsGeneration[i].distanceFitness();
        }
        robotsGeneration.sort((a,b) => b.fitness - a.fitness);
        survivers = robotsGeneration.slice(0 , 40);
        robotsGeneration = [];
        for(let i = 0; i< 40; i++){
            mutantes.push(mutate(survivers[i]));
        }
        for(let i = 0; i <40; i++){
            if(i %2 == 0){
            breeded.push(crossOver(survivers[i], survivers[i +1]));
            }
        }
        //console.log(breeded.length);

        robotsGeneration = breeded.concat(survivers, mutantes);
        //console.log(robotsGeneration.length);
        for(let z = 0; z < 100; z++){
            score += robotsGeneration[z].fitness;
        };
        console.log("Generation: "+ t + " Medium Fitness: "+ (score/100)+ "; Best fitness: " + survivers[0].fitness + "; Position: " + survivers[0].x + "," + survivers[0].y);
    }
    for(let z = 0; z < 100; z++){
        //console.log(robotsGeneration[z].x + "  " + robotsGeneration[z].y);
    };
}

main();