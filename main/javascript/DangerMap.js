const dangerCells = (bulletsArray, board) => {
  const tank = board.getMe();
  const bulletsFly = bulletsArray.reduce((ar, x) => {
    let x1 = x, x2 = x, y1 = y, y2 = y;
    let bulletUndef = false;
    switch (x.direction) {
      case 'UP':
        y1++;
        y2 += 2;
        break;
      case 'DOWN':
        y--;
        y -= 2;
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
      ar.push({ x: x1, y: y1 });
      ar.push({ x: x2, y: y2 });
    }
  }, []);
  let dangerMap = new Array(board.size.y)
    .fill([])
    .map(()=>new Array(board.size.x))
    .map(c=>c.fill(0))
  bulletsFly
    .filter(x=>x.x >= 0 && x.x < board.size.x && y >= 0 && y < board.size.y)
    .forEach(x=>{
      dangerMap[x.x][x.y] = 1;
  });
  board.getBarriers().forEach(x=>dangerMap[x.x][x.y] = 1);
  board.getEnemies().forEach(x=>dangerMap[x.x][x.y] = 1);
  return dangerMap;
}
module.exports = dangerCells;