/*-
 * #%L
 * Codenjoy - it's a dojo-like platform from developers to developers.
 * %%
 * Copyright (C) 2018 Codenjoy
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */
const bulletDirections = (bullets, bulletsOnMap, board) => {
    bulletsOnMap = bulletsOnMap.reduce((ar, x) => {
        if (x.direction) {
            let X = x.x, Y = x.y;
            switch (x.direction) {
                case 'UP':
                    Y += 2;
                    break;
                case 'DOWN':
                    Y -= 2;
                    break;
                case 'RIGHT':
                    X += 2;
                    break;
                case 'LEFT':
                    X -= 2;
            }
            if (board.getAt(X, Y) === Elements.BULLET)
                ar.push(x);
        } else if (has(bullets, new Point(x.x, x.y + 2))) {
            x.direction = "UP";
            ar.push(x);
        } else if (has(bullets, new Point(x.x, x.y - 2))) {
            x.direction = "DOWN";
            ar.push(x);
        } else if (has(bullets, new Point(x.x + 2, x.y))) {
            x.direction = "RIGHT";
            ar.push(x);
        } else if (has(bullets, new Point(x.x - 2, x.y))) {
            x.direction = "LEFT";
            ar.push(x);
        }
        return ar;
    }, []);
    bulletsOnMap.forEach(x => x.update());
    bullets.filter(x => !has(bulletsOnMap, x)).forEach(b => bulletsOnMap.push(BulletFactory.create(b.x, b.y)));
    return bulletsOnMap;
}
const dangerCells = (bulletsArray, board) => {
  const tank = board.getMe();
  const bulletsFly = bulletsArray.reduce((ar, x) => {
    let x1 = x.x, x2 = x.x, y1 = x.y, y2 = x.y;
    let bulletUndef = false;
    switch (x.direction) {
      case 'UP':
        y1++;
        y2 += 2;
        break;
      case 'DOWN':
        y1--;
        y2 -= 2;
        break;
      case 'RIGHT':
        x1++;
        x2 += 2;
        break;
      case 'LEFT':
        x1--;
        x2 -= 2;
        break;
      default:
        bulletUndef = true;
    }
    if (!bulletUndef) {
      ar.push({x:x.x, y:x.y});
      ar.push({ x: x1, y: y1 });
      ar.push({ x: x2, y: y2 });
    }
    return ar;
  }, []);
  let dangerMap = new Array(board.size())
    .fill([])
    .map(()=>new Array(board.size()))
    .map(c=>c.fill(0));
  bulletsFly && bulletsFly
    .filter(x=>x.x >= 0 && x.x < board.size() && x.y >= 0 && x.y < board.size())
    .forEach(x=>{
      dangerMap[x.x][x.y] = Elements.BULLET;
    });
    return dangerMap;
}


const util = require('util');
const WSocket = require('ws');

const log = function (string) {
    console.log(string);
    if (!!printBoardOnTextArea) {
        printLogOnTextArea(string);
    }
};

const printArray = function (array) {
    const result = [];
    for (let index in array) {
        const element = array[index];
        result.push(element.toString());
    }
    return "[" + result + "]";
};

const processBoard = function (boardString) {
    const board = new Board(boardString);
    if (!!printBoardOnTextArea) {
        printBoardOnTextArea(board.boardAsString());
    }

    let logMessage = board + "\n\n";
    const answer = new DirectionSolver(board).get().toString();
    logMessage += "Answer: " + answer + "\n";
    logMessage += "-----------------------------------\n";

    log(logMessage);

    return answer;
};

// you can get this code after registration on the server with your email
let url = "http://algoritmix.dan-it.kiev.ua/codenjoy-contest/board/player/i7zskjkz5a93j272s0au?code=4803967771983834522";

url = url.replace("http", "ws");
url = url.replace("board/player/", "ws?user=");
url = url.replace("?code=", "&code=");

let ws;

function connect() {
    ws = new WSocket(url);
    log('Opening...');

    ws.on('open', function () {
        log('Web socket client opened ' + url);
    });

    ws.on('close', function () {
        log('Web socket client closed');

        setTimeout(function () {
            connect();
        }, 5000);
    });

    ws.on('message', function (message) {
        const pattern = new RegExp(/^board=(.*)$/);
        const parameters = message.match(pattern);
        const boardString = parameters[1];
        const answer = processBoard(boardString);
        ws.send(answer);
    });
}

connect();

const Elements = {

    NONE: ' ',
    BATTLE_WALL: '☼',
    BANG: 'Ѡ',

    CONSTRUCTION: '╬',

    CONSTRUCTION_DESTROYED_DOWN: '╩',
    CONSTRUCTION_DESTROYED_UP: '╦',
    CONSTRUCTION_DESTROYED_LEFT: '╠',
    CONSTRUCTION_DESTROYED_RIGHT: '╣',

    CONSTRUCTION_DESTROYED_DOWN_TWICE: '╨',
    CONSTRUCTION_DESTROYED_UP_TWICE: '╥',
    CONSTRUCTION_DESTROYED_LEFT_TWICE: '╞',
    CONSTRUCTION_DESTROYED_RIGHT_TWICE: '╡',

    CONSTRUCTION_DESTROYED_LEFT_RIGHT: '│',
    CONSTRUCTION_DESTROYED_UP_DOWN: '─',

    CONSTRUCTION_DESTROYED_UP_LEFT: '┌',
    CONSTRUCTION_DESTROYED_RIGHT_UP: '┐',
    CONSTRUCTION_DESTROYED_DOWN_LEFT: '└',
    CONSTRUCTION_DESTROYED_DOWN_RIGHT: '┘',

    CONSTRUCTION_DESTROYED: ' ',

    BULLET: '•',

    TANK_UP: '▲',
    TANK_RIGHT: '►',
    TANK_DOWN: '▼',
    TANK_LEFT: '◄',

    OTHER_TANK_UP: '˄',
    OTHER_TANK_RIGHT: '˃',
    OTHER_TANK_DOWN: '˅',
    OTHER_TANK_LEFT: '˂',

    AI_TANK_UP: '?',
    AI_TANK_RIGHT: '»',
    AI_TANK_DOWN: '¿',
    AI_TANK_LEFT: '«'

};

const D = function (index, dx, dy, name) {

    const changeX = function (x) {
        return x + dx;
    };

    const changeY = function (y) {
        return y + dy;
    };

    const change = function (point) {
        return point.moveTo(this);
    };

    const inverted = function () {
        switch (this) {
            case Direction.UP :
                return Direction.DOWN;
            case Direction.DOWN :
                return Direction.UP;
            case Direction.LEFT :
                return Direction.RIGHT;
            case Direction.RIGHT :
                return Direction.LEFT;
            default :
                return Direction.STOP;
        }
    };

    const toString = function () {
        return name;
    };

    return {
        changeX: changeX,

        changeY: changeY,

        change: change,

        inverted: inverted,

        toString: toString,

        getIndex: function () {
            return index;
        }
    };
};

var Direction = {
    UP: D(2, 0, 1, 'up'),                 // you can move
    DOWN: D(3, 0, -1, 'down'),
    LEFT: D(0, -1, 0, 'left'),
    RIGHT: D(1, 1, 0, 'right'),
    ACT: D(4, 0, 0, 'act'),               // fire
    STOP: D(5, 0, 0, '')                   // stay
};

Direction.values = function () {
    return [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.DRILL_LEFT, Direction.DRILL_RIGHT, Direction.STOP];
};

Direction.valueOf = function (index) {
    const directions = Direction.values();
    for (let i in directions) {
        const direction = directions[i];
        if (direction.getIndex() == index) {
            return direction;
        }
    }
    return Direction.STOP;
};

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equal(o) {
        return o.getX() == this.x && o.getY() == this.y;
    }

    toString() {
        return '[' + this.x + ',' + this.y + ']';
    }

    isOutOf(boardSize) {
        return this.x >= boardSize || this.y >= boardSize || this.x < 0 || this.y < 0;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    shift(dx,dy){
        return new Point(this.x+dx, this.y+dy);
    }

    insideSquare(size){
        return this.x >= 0 && this.y >= 0 && this.x < size && this.y < size;
    }
    moveTo(direction) {
        return pt(direction.changeX(this.x), direction.changeY(this.y));
    }

    distanceSq(p) {
        //distance from a to b
        return Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2);
    }

    fastestPath(p, map) {
        return waveAlgorithm(map, this, p);
    }
};

function waveAlgorithm(map, pos, dest){
    //init map where in every cell its path from pos
    //if its unpassable cell value is -1
    pos = new Point(pos.x,pos.y);
    if(pos.distanceSq(dest) < 2)
        return [dest];
    let mapSheme = new Array(map.length)
        .fill([])
        .map(()=>new Array(map.length))
        .map(c=>c.fill(0))
        .map((row,x)=>row
            .map((c,y)=>map[x][y] ? 0 : -1))
    mapSheme[pos.y][pos.x] = 0;
    mapSheme[dest.y][dest.x] = 0;
    //wave its all cells whose neighbors need to be incremented
    let wave = [pos];
    //loop that increments all cells until we come to pos from dest
    let counter = 0;
    while(!mapSheme[dest.y][dest.x] && counter < 150){
        wave = incrementNeighbors(mapSheme, map, wave, pos);
        counter++;
    }
    if(counter == 500)
        return;
        //return waveAlgorithm(map, pos, dest);
    let lastStep = dest;
    let path = [];
    console.log(mapSheme)
    while(!lastStep.equal(pos)){
        path.unshift(lastStep);
        lastStep = decrementedCell(mapSheme, lastStep);
        if(!lastStep)return path;
    }
    //path it is array of points
    return path;
}

function incrementNeighbors(mapSheme, map, wave, pos){
    //icnrement all nearby to wave cells
    let nextWave = [];
    if(!wave || !wave.length)return;
    let value = mapSheme[wave[0].y][wave[0].x] + 1;
    wave.forEach(waveI=>{
        getNearbyCells(
            waveI, (x)=>
                x.insideSquare(map.length)&& map[x.y][x.x]&& !mapSheme[x.y][x.x]&& !x.equal(pos)
        ).forEach(n=>{
            mapSheme[n.y][n.x] = value;
            nextWave.push(n);
        })
    })
    return nextWave;
}
function getNearbyCells(p,validCB){
    //gets nearby cells
    return [p.shift(-1,0), p.shift(1,0), p.shift(0, -1), p.shift(0,1)]
        .filter(x=>validCB(x));
}
function decrementedCell(mapSheme, lastStep) {
    //finds cell that has n-1 value to find all path to pos
    return getNearbyCells(lastStep, (x)=>x.insideSquare(mapSheme.length))
        .find((cell)=>mapSheme[cell.y][cell.x] == mapSheme[lastStep.y][lastStep.x] - 1)
}


function bulletCreator() {
    class Bullet extends Point {
        constructor(x, y, id) {
            super(x, y);
            this.direction = undefined;
            this.id = id;
            this.initX = x;
            this.initY = y;
        }

        toString() {
            return this.x + " " + this.y + " " + this.direction;
        }

        update() {
            switch (this.direction) {
                case 'UP':
                    this.y += 2;
                    break;
                case 'DOWN':
                    this.y -= 2;
                    break;
                case 'RIGHT':
                    this.x += 2;
                    break;
                case 'LEFT':
                    this.x -= 2;
                    break;
                default:
            }
        }
    }

    this.counter = 0;
    this.createBullet = (x, y) => {
        this.id++;
        return new Bullet(x, y, this.id);
    }
    return {create: this.createBullet};
}

const getSaveCells = function (x, y, dangerMap) {
  const result = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if(x.x >= 0 && x.x < board.size.x && y >= 0 && y < board.size.y) continue;
      if(!dangerMap[x+dx][y+dy]){
        const str = dx + " " + dy
        switch(str){
          case '-1 0':
            result.push('LEFT');
            break;
          case '1 0':
            result.push('RIGHT');
            break;
          case '0 1':
            result.push('UP');
            break;
          case '0 -1':
            result.push('DOWN');
            break;
          case '0 0':
            result.push('STOP');
            break;
        }
      }
    }
  }
  function compareRandom(a, b) {
    return Math.random() - 0.5;
  }

  result.sort(compareRandom);
  return result;
};
var pt = function (x, y) {
    return new Point(x, y);
};

const LengthToXY = function (boardSize) {
    function inversionY(y) {
        return boardSize - 1 - y;
    }

    function inversionX(x) {
        return x;
    }

    return {
        getXY: function (length) {
            if (length == -1) {
                return null;
            }
            const x = inversionX(length % boardSize);
            const y = inversionY(Math.ceil(length / boardSize));
            return new Point(x, y);
        },

        getLength: function (x, y) {
            const xx = inversionX(x);
            const yy = inversionY(y);
            return yy * boardSize + xx;
        }
    };
};

function convertDengerBoardToMap(dangerBoard) {
    console.log(dangerBoard);
    return dangerBoard.map(row => {
        return row.map(cell => cell === 0 ? 1 : 0);
    });
}


var Board = function (board) {
    const contains = function (a, obj) {
        let i = a.length;
        while (i--) {
            if (a[i].equals(obj)) {
                return true;
            }
        }
        return false;
    };

    const sort = function (all) {
        return all.sort(function (pt1, pt2) {
            return (pt1.getY() * 1000 + pt1.getX()) -
                (pt2.getY() * 1000 + pt2.getX());
        });
    };

    const removeDuplicates = function (all) {
        const result = [];
        for (let index in all) {
            const point = all[index];
            if (!contains(result, point)) {
                result.push(point);
            }
        }
        return sort(result);
    };

    const boardSize = function () {
        return Math.sqrt(board.length);
    };

    const size = boardSize();
    const xyl = new LengthToXY(size);

    const getMe = function () {
        let result = [];
        result = result.concat(findAll(Elements.TANK_UP));
        result = result.concat(findAll(Elements.TANK_DOWN));
        result = result.concat(findAll(Elements.TANK_LEFT));
        result = result.concat(findAll(Elements.TANK_RIGHT));
        if (result.lenght == 0) {
            return null;
        }
        return result[0];
    };

    const getEnemies = function () {
        let result = [];
        result = result.concat(findAll(Elements.AI_TANK_UP));
        result = result.concat(findAll(Elements.AI_TANK_DOWN));
        result = result.concat(findAll(Elements.AI_TANK_LEFT));
        result = result.concat(findAll(Elements.AI_TANK_RIGHT));
        result = result.concat(findAll(Elements.OTHER_TANK_UP));
        result = result.concat(findAll(Elements.OTHER_TANK_DOWN));
        result = result.concat(findAll(Elements.OTHER_TANK_LEFT));
        result = result.concat(findAll(Elements.OTHER_TANK_RIGHT));
        return result;
    };

    const getBullets = function () {
        let result = [];
        result = result.concat(findAll(Elements.BULLET));
        return result;
    };

    const isGameOver = function () {
        return getMe() == null;
    };

    const isBulletAt = function (x, y) {
        if (pt(x, y).isOutOf(size)) {
            return false;
        }

        return getAt(x, y) == Elements.BULLET;
    };

    const isAt = function (x, y, element) {
        if (pt(x, y).isOutOf(size)) {
            return false;
        }
        return getAt(x, y) == element;
    };

    var getAt = function (x, y) {
        if (pt(x, y).isOutOf(size)) {
            return Elements.BATTLE_WALL;
        }
        return board.charAt(xyl.getLength(x, y));
    };

    const boardAsString = function () {
        let result = "";
        for (let i = 0; i < size; i++) {
            result += board.substring(i * size, (i + 1) * size);
            result += "\n";
        }
        return result;
    };

    const getBarriers = function () {
        let result = [];
        result = result.concat(findAll(Elements.BATTLE_WALL));
        result = result.concat(findAll(Elements.CONSTRUCTION));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_DOWN));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_UP));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_LEFT));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_RIGHT));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_DOWN_TWICE));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_UP_TWICE));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_LEFT_TWICE));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_RIGHT_TWICE));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_LEFT_RIGHT));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_UP_DOWN));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_UP_LEFT));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_RIGHT_UP));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_DOWN_LEFT));
        result = result.concat(findAll(Elements.CONSTRUCTION_DESTROYED_DOWN_RIGHT));
        return sort(result);
    };

    const toString = function () {
        return util.format("Board:\n%s\n" +
            "My tank at: %s\n" +
            "Enemies at: %s\n" +
            "Bulets at: %s\n",
            boardAsString(),
            getMe(),
            getEnemies(),
            getBullets()
        );
    };

    var findAll = function (element) {
        const result = [];
        for (let i = 0; i < size * size; i++) {
            const point = xyl.getXY(i);
            if (isAt(point.getX(), point.getY(), element)) {
                result.push(point);
            }
        }
        return sort(result);
    };

    const isAnyOfAt = function (x, y, elements) {
        if (pt(x, y).isOutOf(size)) {
            return false;
        }
        for (let index in elements) {
            const element = elements[index];
            if (isAt(x, y, element)) {
                return true;
            }
        }
        return false;
    };

    // TODO применить этот подход в других js клиентах
    const getNear = function (x, y) {
        const result = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) continue;
                result.push(getAt(x + dx, y + dy));
            }
        }
        return result;
    };

    const isNear = function (x, y, element) {
        return getNear(x, y).includes(element);
    };

    const getNearest = function (x, y, elements) {
        return elements.map(element => {
            return {
                element: element,
                distance: Math.sqrt((x - element.x) * (x - element.x) + (y - element.y) * (y - element.y))
            }
        }).sort((first, second) => first.distance - second.distance)[0].element;
    };

    const isBarrierAt = function (x, y) {
        if (pt(x, y).isOutOf(size)) {
            return true;
        }

        return contains(getBarriers(), pt(x, y));
    };

    const countNear = function (x, y, element) {
        return getNear(x, y)
            .filter(function (value) {
                return value === element
            })
            .length;
    };

    return {
        size: boardSize,
        getMe: getMe,
        getEnemies: getEnemies,
        getBullets: getBullets,
        isGameOver: isGameOver,
        isAt: isAt,
        boardAsString: boardAsString,
        toString: toString,
        findAll: findAll,
        isAnyOfAt: isAnyOfAt,
        getNear: getNear,
        isNear: isNear,
        countNear: countNear,
        isBarrierAt: isBarrierAt,
        getBarriers: getBarriers,
        getAt: getAt,
    };
};

function getTanksTrajectories(danger, board) {
  let tempDanger = new Array(danger.length).fill([]).map(x=>new Array(danger.length).fill(0));
  board.getEnemies().forEach(tank => {
    for (let x = tank.x+1; x < 43; x++) {
      if (danger[x][tank.y] !== Elements.BATTLE_WALL) {
        tempDanger[x][tank.y]++;
      } else break;
    }
    for (let x = tank.x-1; x >= 0 ; x--) {
      if (danger[x][tank.y] !== Elements.BATTLE_WALL) {
        tempDanger[x][tank.y]++;
      } else break;
    }
    for (let y = tank.y+1; y < 43 ; y++) {
      if (danger[tank.x][y] !== Elements.BATTLE_WALL) {
        tempDanger[tank.x][y]++;
      } else break;
    }
    for (let y = tank.y-1; y >= 0 ; y--) {
      if (danger[tank.x][y] !== Elements.BATTLE_WALL) {
        tempDanger[tank.x][y]++;
      } else break;
    }
  })
  console.log(tempDanger);
  return tempDanger;
}

const random = function (n) {
    return Math.floor(Math.random() * n);
};
const has = (array, point) => {
    return array.some(x => x.x == point.x && x.y == point.y);
}
let direction;
let bulletsOnMap = [];
let dangerMap = [];

const BulletFactory = bulletCreator();
const DirectionSolver = function (board) {
  return {
    get: function () {

      const tank = board.getMe();
      if (!tank)
        return "STOP"
      bulletsOnMap = bulletDirections(board.getBullets(), bulletsOnMap, board);
      dangerMap = dangerCells(bulletsOnMap, board);
      getTanksTrajectories(dangerMap, board);
      return getSaveCells(tank.x, tank.y, dangerMap) + ",ACT";
    }
  };
};



