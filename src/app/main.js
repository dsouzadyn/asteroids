import { init, initKeys, keyPressed, Sprite, GameLoop } from 'kontra'

let { canvas } = init()

initKeys();

let sprites = [];

let degreesToRadians = function(deg) {
  return deg * Math.PI / 180;
}

let ship = Sprite({
  type: 'ship',
  x: 300,
  y: 300,
  width: 6,
  rotation: 0,
  dt: 0,
  ttl: Infinity,
  render: function() {
    this.context.save() // Required else entire canvas rotates lul

    this.context.translate(this.x, this.y);
    this.context.rotate(degreesToRadians(this.rotation));

    this.context.beginPath();

    // Draw a right facing triangle
    this.context.moveTo(-3, -5);
    this.context.lineTo(12, 0);
    this.context.lineTo(-3, 5);

    this.context.closePath();
    this.context.stroke();
    this.context.restore();
  },
  update: function() {
    // Rotate the ship left or right
    if (keyPressed('left')) {
      this.rotation += -4;
    } else if (keyPressed('right')) {
      this.rotation += 4;
    }

    // Move the ship forward in the direction it's facing
    const cos = Math.cos(degreesToRadians(this.rotation));
    const sin = Math.sin(degreesToRadians(this.rotation));

    if (keyPressed('up')) {
      this.ddx = cos * 0.1;
      this.ddy = sin * 0.1;
    } else {
      this.ddx = 0;
      this.ddy = 0;
    }

    this.advance();
    // Set a max speed
    const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    if (magnitude > 10) {
      this.dx *= 0.95;
      this.dy *= 0.95;
    }

    // allow the player to fire no more than 1 bullet every 1/4th second
    this.dt += 1/60;
    if (keyPressed('space') && this.dt > 0.25) {
      this.dt = 0;

      let bullet = Sprite({
        type: 'bullet',
        // Start the bullet at the end of the triangle
        x: this.x + cos * 12,
        y: this.y + sin * 12,

        dx: this.dx + cos * 5,
        dy: this.dy + sin * 5,

        ttl: 50,

        width: 2,
        height: 2,
        color: 'white'

      });
      sprites.push(bullet);
    }
  }
})

let createAsteroid = function(x, y, radius) {
  let asteroid = Sprite({
    type: 'asteroid',
    ttl: Infinity,
    x: x,
    y: y,
    radius: radius,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 - 2,
    render: function() {
      this.context.strokeStyle = 'white';
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      this.context.stroke();
    }
  });
  sprites.push(asteroid);
}

for (var i = 0; i < 4; i++) {
  createAsteroid(100, 100, 30);
}

sprites.push(ship);

let loop = GameLoop({
	update: function() {
    sprites.map(sprite => {
      sprite.update();

      if (sprite.x < 0) {
        sprite.x = canvas.width;
      } else if (sprite.x > canvas.width) {
        sprite.x = 0;
      }
      if (sprite.y < 0) {
        sprite.y = canvas.height;
      } else if (sprite.y > canvas.height) {
        sprite.y = 0;
      }
    });

    for(let i = 0; i < sprites.length; i++) {
      if (sprites[i].type === 'asteroid') {
        for(let j = 0; j < sprites.length; j++) {
          if (sprites[j].type !== 'asteroid') {
            let asteroid = sprites[i];
            let sprite = sprites[j];
            let dx = asteroid.x - sprite.x;
            let dy = asteroid.y - sprite.y;
            if (Math.sqrt(dx * dx + dy * dy) < asteroid.radius + sprite.width) {
              asteroid.ttl = 0;
              sprite.ttl = 0;
              if (asteroid.radius > 10) {
                createAsteroid(asteroid.x, asteroid.y, asteroid.radius / 2.5);
              }

              break;
            }
          }
        }
      }
    }
    sprites = sprites.filter(sprite => sprite.isAlive());
	},
	render: function() {
		sprites.map(sprite => sprite.render());
	}
})

loop.start();
