const game = {
    ctx: null,
    platform: null,
    ball: null,
    blocks: [],
    rows: 4,
    cols: 8,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null
    },
    init: function() {
        this.ctx = document.getElementById('my-canvas').getContext('2d');
        this.setEvents();
    },
    setEvents: function () {
        window.addEventListener('keydown', event => {
            const keyCode = event.code;

            if (keyCode === 'ArrowRight' || keyCode === 'ArrowLeft') {
                this.platform.start(keyCode);
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

        const onLoadImage = () => {
            ++loadedCount;
            if (loadedCount >= requireCount) {
                callback();
            }
        };

        for (const key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = './img/' + key + '.png';
            this.sprites[key].addEventListener('load', onLoadImage)
        }
    },
    update: function () {
        this.platform.move();
    },
    run: function() {
        window.requestAnimationFrame(() => {
            this.update();
            this.render();
            this.run();
        })
    },
    render: function () {
        const { ball, platform, ctx, sprites } = this;

        ctx.drawImage(sprites.background, 0, 0);
        ctx.drawImage(sprites.ball, 0, 0, ball.width, ball.height, ball.x, ball.y, ball.width, ball.height);
        ctx.drawImage(sprites.platform, platform.x, platform.y);
        this.renderBlocks();
    },
    renderBlocks: function () {
        const { ctx, sprites, blocks } = this;
        for ( const block of blocks) {
            ctx.drawImage(sprites.block, block.x, block.y);
        }
    },
    create: function () {
        const { cols, rows, blocks } = this;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                blocks.push({
                    x: 64 * col + 65,
                    y: 24 * row + 35
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
    }
};

game.ball = {
    x: 320,
    y: 280,
    width: 20,
    height: 20
}

game.platform = {
    width: 100,
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
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
        const { platform, ball } = this;
        if (this.dx) {
            this.x += this.dx;
            game.ball.x += this.dx;
        }
        if (this.x < 0) {
            this.x = 0;
            game.ball.x = 40;
        }
        if (this.x + this.width > 640) {
            this.x = 640 - this.width;
            game.ball.x = 640 - 60;
        }
    }
}

window.addEventListener('load', () => {
    game.start();
})
