const game = {
    running: true,
    ctx: null,
    platform: null,
    ball: null,
    blocks: [],
    rows: 4,
    cols: 8,
    width: 640,
    height: 360,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null
    },
    sounds: {
        bump: null
    },
    score: 0,
    addScore: function () {
        ++this.score;

        if (this.score >= this.blocks.length) {
            window.requestAnimationFrame(() => this.end('You have won!'));
        }
    },
    init: function() {
        this.ctx = document.getElementById('my-canvas').getContext('2d');
        this.setEvents();
        this.setFontStyle();
    },
    setFontStyle: function () {
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#FFFFFF';
    },
    setEvents: function () {
        window.addEventListener('keydown', event => {
            const keyCode = event.code;

            if (keyCode === 'ArrowRight' || keyCode === 'ArrowLeft') {
                this.platform.start(keyCode);
            }

            if (keyCode === 'Space') {
                this.platform.fire();
            }
        });
        window.addEventListener('keyup', event => {
            const keyCode = event.code;

            if (keyCode === 'ArrowRight' || keyCode === 'ArrowLeft') {
                this.platform.stop();
            }
        });
    },
    preload: function (callback) {
        let loadedCount = 0;
        const requireCount = Object.keys(this.sprites).length;

        const onLoadResource = () => {
            ++loadedCount;
            if (loadedCount >= requireCount) {
                callback();
            }
        };

        this.loadImages(onLoadResource);

        this.loadSounds(onLoadResource);
    },
    loadImages(onLoadResource) {
        for (const key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = './img/' + key + '.png';
            this.sprites[key].addEventListener('load', onLoadResource)
        }
    },
    loadSounds(onLoadResource) {
        for (const key in this.sounds) {
            this.sounds[key] = new Audio('./sounds/' + key + '.mp3');
            this.sounds[key].addEventListener('canplaythrough', onLoadResource, { once: true });
        }
    },
    update: function () {
        this.platform.collideWorldBound();
        this.platform.move();

        this.collideBlocks();

        this.collidePlatform();

        this.ball.collideWorldBound();

        this.ball.move();

    },
    collidePlatform() {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform);
        }
    },
    collideBlocks() {
        for (const block of this.blocks) {
            if (block.active && this.ball.collide(block)) {
                this.ball.bumpBlock(block);
                this.addScore();
            }
        }    },
    run: function() {
        if (this.running) {
            window.requestAnimationFrame(() => {
                this.update();
                this.render();
                this.run();
            })
        }
    },
    render: function () {
        const { ball, platform, ctx, sprites, width, height } = this;

        ctx.clearRect(0, 0, width, height);

        ctx.drawImage(sprites.background, 0, 0);
        ctx.drawImage(sprites.ball, ball.frameStep * ball.width, 0, ball.width, ball.height, ball.x, ball.y, ball.width, ball.height);
        ctx.drawImage(sprites.platform, platform.x, platform.y);
        this.renderBlocks();

        this.ctx.fillText('Score: ' + this.score, 15, 25);
    },
    renderBlocks: function () {
        const { ctx, sprites, blocks } = this;
        for (const block of blocks) {
            if (!block.active) continue;
            ctx.drawImage(sprites.block, block.x, block.y);
        }
    },
    create: function () {
        const { cols, rows, blocks } = this;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                blocks.push({
                    x: 64 * col + 65,
                    y: 24 * row + 35,
                    width: 60,
                    height: 20,
                    active: true
                })
            }
        }
    },
    start: function () {
        this.init();
        this.preload(() => {
            this.create();
            this.run();
        });
    },
    random(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    },
    getRect(object) {
        const left = object.x + (object.dx || 0);
        const right = left + object.width;
        const top = object.y + (object.dy || 0);
        const bottom = top + object.height;

        return ({ left, right, top, bottom})
    },
    end(message) {
        game.running = false;
        alert(message);
        window.location.reload();
    }
};

game.ball = {
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    velocity: 3,
    dy: 0,
    dx: 0,
    frameStep: 0,
    start() {
        this.dy = -this.velocity
        this.dx = game.random(-this.velocity, this.velocity);
        this.animate();
    },
    animate() {
        setInterval(() => {
            ++this.frameStep;
            if (this.frameStep >= 4) {
                this.frameStep = 0;
            }
        }, 200);
    },
    move() {
        this.y += this.dy;
        this.x += this.dx;
    },
    collide(element) {
        const ball = game.getRect(this);
        const elem = game.getRect(element);

        if (ball.right > elem.left && ball.left < elem.right && ball.top < elem.bottom && ball.bottom > elem.top) {
            return true;
        }

        return false;
    },
    bumpBlock(block) {
        this.dy *= -1;
        block.active = false;
        game.sounds.bump.play();
    },
    bumpPlatform(platform) {
        if (platform.dx) {
            this.x += platform.dx;
        }

        if (this.velocity) {
            this.dy = -this.velocity;
            const touchX = this.x + this.width / 2;
            this.dx = this.velocity * platform.getTouchOffset(touchX);
        }
        game.sounds.bump.play();
    },
    collideWorldBound() {
        const ballRec = game.getRect(this);

        const { velocity } = this;

        if (ballRec.top < 0) {
            this.y = 0;
            this.dy = velocity;
            game.sounds.bump.play();
        } else if (ballRec.left < 0) {
            this.x = 0;
            this.dx = velocity;
            game.sounds.bump.play();
        } else if (ballRec.right > game.width) {
            this.x = game.width - this.width;
            this.dx = -velocity;
            game.sounds.bump.play();
        } else if (ballRec.bottom > game.height) {
            game.end('Game over');
        }
    }
}

game.platform = {
    width: 100,
    height: 14,
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    ball: game.ball,
    fire() {
      if (this.ball) {
          this.ball.start();
          this.ball = null;
      }
    },
    start(keyCode) {
        const { velocity } = this;
        if (keyCode === 'ArrowRight') {
            this.dx = velocity;
        }
        if (keyCode === 'ArrowLeft') {
            this.dx = -velocity;
        }
    },
    stop() {
        this.dx = 0;
    },
    move() {
        if (this.dx) {
            this.x += this.dx;
            if (this.ball) {
                game.ball.x += this.dx;
            }
        }
    },
    /**
     *
     * @param touchX - ball x-axis coordinate
     * @return {number} - value from -1 to 1
     * @description -1 equals the most extreme point on the left and 1 equals the most extreme point
     * on the right, 0 equals center platform
     */
    getTouchOffset(touchX) {
        const offset = touchX - this.x;

        return (offset * 2 / 100) - 1;
    },
    collideWorldBound() {
        const platformRect = game.getRect(this);

        if (platformRect.right > game.width) {
            this.x = game.width - this.width;
            this.dx = 0;
        } else if (platformRect.left < 0) {
            this.x = 0;
            this.dx = 0;
        }
    }
}

window.addEventListener('load', () => {
    game.start();
})
