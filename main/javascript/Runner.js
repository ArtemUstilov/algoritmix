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
let url = "http://algoritmix.dan-it.kiev.ua/codenjoy-contest/board/player/71hk8ayegb2ayigd3oix?code=9199167215377388441";

url = url.replace("http", "ws");
url = url.replace("board/player/", "ws?user=");
url = url.replace("?code=", "&code=");

let ws;

function connect() {
    ws = new WSocket(url);
    log('Opening...');

    ws.on('open', function() {
        log('Web socket client opened ' + url);
    });

    ws.on('close', function() {
        log('Web socket client closed');

        setTimeout(function() {
            connect();
        }, 5000);
    });

    ws.on('message', function(message) {
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
    UP:   D(2, 0, 1, 'up'),                 // you can move
    DOWN: D(3, 0, -1, 'down'),
    LEFT: D(0, -1, 0, 'left'),
    RIGHT:D(1, 1, 0, 'right'),
    ACT:  D(4, 0, 0, 'act'),               // fire
    STOP: D(5, 0, 0, '')                   // stay
};

Direction.values = function() {
   return [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.DRILL_LEFT, Direction.DRILL_RIGHT, Direction.STOP];
};

Direction.valueOf = function(index) {
  const directions = Direction.values();
  for (let i in directions) {
      const direction = directions[i];
      if (direction.getIndex() == index) {
             return direction;
        }
    }
    return Direction.STOP;
};

const Point = function (x, y) {
  return {
    equals: function (o) {
      return o.getX() == x && o.getY() == y;
    },

    toString: function () {
      return '[' + x + ',' + y + ']';
    },

    isOutOf: function (boardSize) {
      return x >= boardSize || y >= boardSize || x < 0 || y < 0;
    },

    getX: function () {
      return x;
    },

    getY: function () {
      return y;
    },

    moveTo: function (direction) {
      return pt(direction.changeX(x), direction.changeY(y));
    }
  }
};

var pt = function(x, y) {
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

var Board = function(board){
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

  var getAt = function(x, y) {
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

  var findAll = function(element) {
      const result = [];
      for (let i = 0; i < size*size; i++) {
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
        size : boardSize,
        getMe : getMe,
        getEnemies : getEnemies,
        getBullets : getBullets,
        isGameOver : isGameOver,
        isAt : isAt,
        boardAsString : boardAsString,
        toString : toString,
        findAll : findAll,
        isAnyOfAt : isAnyOfAt,
        getNear : getNear,
        isNear : isNear,
        countNear : countNear,
        isBarrierAt : isBarrierAt,
        getBarriers : getBarriers,
        getAt : getAt
    };
};

const random = function (n) {
  return Math.floor(Math.random() * n);
};

let direction;

const DirectionSolver = function(board){

    return {
        /**
         * @return next hero action
         */
        get : function() {
          const tank = board.getMe();


          return "LEFT,ACT";
        }
    };
};

