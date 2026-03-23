export class Rocket {
  constructor(canvas, text, isName=false) {
    this.canvas = canvas;
    this.x = canvas.width/2;
    this.y = canvas.height + 30;
    this.text = text;
    this.isName = isName;
    this.targetY = canvas.height * .35;
    this.speed = 11;
    this.done = false;
  }

  update(explodeFn) {
    this.y -= this.speed;
    if (this.y <= this.targetY) {
      this.done = true;
      explodeFn(this.x, this.y, this.text, this.isName);
    }
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x-1, this.y, 2, 16);
  }
}

export class Particle {
  constructor(x,y,tx,ty,color) {
    this.x=x; this.y=y;
    this.tx=tx; this.ty=ty;
    this.vx=(Math.random()-.5)*10;
    this.vy=(Math.random()-.5)*10;
    this.a=1;
    this.c=color;
  }

  update() {
    this.vx*=.88;
    this.vy*=.88;
    this.x+=this.vx+(this.tx-this.x)*.08;
    this.y+=this.vy+(this.ty-this.y)*.08;
    this.a-=.012;
  }

  draw(ctx) {
    ctx.fillStyle=`rgba(${this.c},${this.a})`;
    ctx.beginPath();
    ctx.arc(this.x,this.y,2,0,Math.PI*2);
    ctx.fill();
  }
}