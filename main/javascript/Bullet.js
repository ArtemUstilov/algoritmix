const bulletDirections = (bullets, bulletsOnMap, board)=>{
  bulletsOnMap = bulletsOnMap.reduce((ar,x) => {
    if(x.direction){
      let X = x.x, Y = x.y;
      switch(x.direction){
        case 'UP':
          Y += 2;
          break;
        case 'DOWN':
          Y -= 2;
          break;
        case 'RIGHT':
          X+=2;
          break;
        case 'LEFT':
          X-=2;
      }
      if(board.getAt(X,Y) === Elements.BULLET)
        ar.push(x);
    }
    else
    if (has(bullets,new Point(x.x, x.y + 2))) {
      x.direction = "UP";
      ar.push(x);
    } else
    if (has(bullets,new Point(x.x, x.y - 2))) {
      x.direction = "DOWN";
      ar.push(x);
    } else
    if (has(bullets,new Point(x.x + 2, x.y))) {
      x.direction = "RIGHT";
      ar.push(x);
    } else
    if (has(bullets,new Point(x.x - 2, x.y))) {
      x.direction = "LEFT";
      ar.push(x);
    }
    return ar;
  }, []);
  bulletsOnMap.forEach(x=>x.update());
  bullets.filter(x=>!has(bulletsOnMap,x)).forEach(b=>bulletsOnMap.push(BulletFactory.create(b.x,b.y)));
}
module.exports.bullet = bulletDirections;