export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.bullets = null;
        this.knights = null;
        this.shootDelay = 500;
        this.timer = null;
        this.timeAlive = 0;
        this.score = 0;
    }

    init(data) {
        this.timeAlive = data.timeAlive || 0;
        this.score = data.score || 0;
    }

    preload() {
        // Load assets
        this.load.image('background', 'assets/images/background.png');
        this.load.image('knight', 'assets/images/Knight.png');
        this.load.image('dragon', 'assets/images/Dragon.png');
        this.load.image('bullet', 'assets/images/Fireball.png');

        // Audio
        this.load.audio('gameMusic', 'assets/bgm/gameBGM.mp3');
        this.load.audio('knightSlain', 'assets/sfx/knightslainBGM.wav');
        this.load.audio('shootSound', 'assets/sfx/shootBGM.mp3');
        this.load.audio('gameOverSound', 'assets/bgm/gameoverBGM.mp3');
    }

    create() {
        const backgroundImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        backgroundImage.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.gameMusic = this.sound.add('gameMusic', { loop: true, volume: 0.02 });
        this.gameMusic.play();

        this.player = this.physics.add.sprite(100, this.game.config.height - 50, 'dragon');
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        this.knights = this.physics.add.group();

        this.physics.add.collider(this.player, this.knights, this.hitKnightWithPlayer, null, this);
        this.physics.add.overlap(this.bullets, this.knights, this.hitKnightWithBullet, null, this);

        this.time.addEvent({
            delay: Phaser.Math.Between(1500, 1500),
            callback: this.spawnKnight,
            callbackScope: this,
            loop: true
        });

        this.startTimer();

        this.scoreText = this.add.text(10, 10, 'Score: ' + this.score, {
            fontSize: 20,
            fill: '#ffffff',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 1,
                stroke: false,
                fill: true
            }
        });
    }

    startTimer() {
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.timerText = this.add.text(
            this.cameras.main.width - 10,
            10,
            'Time: ' + this.timeAlive + 's',
            {
                fontFamily: 'Mono',
                fontSize: 20,
                fill: '#ffffff',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000',
                    blur: 1,
                    stroke: false,
                    fill: true
                }
            }
        ).setOrigin(1, 0);
    }

    updateTimer() {
        this.timeAlive++;
        this.timerText.setText('Time: ' + this.timeAlive + 's');
    }

    restartGame() {
        this.timer.remove(false);
        this.timeAlive = 0;
        this.timer = null;
        this.timerText.destroy();
        this.startTimer();
        this.score = 0;
        this.scoreText.setText('Score: ' + this.score);
    }

    update() {
        const speed = 160;
        const delta = this.game.loop.delta / 300; // Convert delta to seconds

        if (this.cursors.left.isDown) {
            this.player.x -= speed * delta;
        } else if (this.cursors.right.isDown) {
            this.player.x += speed * delta;
        }

        if (this.cursors.up.isDown) {
            this.player.y -= speed * delta;
        } else if (this.cursors.down.isDown) {
            this.player.y += speed * delta;
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.shootBullet();
        }

        this.bullets.children.iterate((bullet) => {
            if (bullet && bullet.y < 0) {
                bullet.destroy();
            }
        });

        this.knights.children.iterate((knight) => {
            if (knight && knight.y > this.game.config.height) {
                knight.destroy();
            }
        });
    }

    shootBullet() {
        this.sound.play('shootSound', { volume: 0.3 });

        if (!this.nextShootTime || this.time.now > this.nextShootTime) {
            let bullet = this.bullets.get(this.player.x, this.player.y - this.player.height);
            if (bullet) {
                bullet.setActive(true);
                bullet.setVisible(true);
                bullet.setVelocityY(-400);
                this.nextShootTime = this.time.now + this.shootDelay;
            }
        }
    }

    spawnKnight() {
        const x = Phaser.Math.Between(0, this.game.config.width - 32);
        const knight = this.knights.create(x, 0, 'knight');
        knight.setVelocityY(100);
    }

    hitKnightWithBullet(bullet, knight) {
        this.sound.play('knightSlain', { volume: 0.05 });
        bullet.destroy();
        knight.destroy();
        this.updateScore();
    }

    updateScore() {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    hitKnightWithPlayer(player, knight) {
        if (this.gameMusic) {
            this.gameMusic.stop();
        }
        this.sound.play('gameOverSound', { volume: 0.05 });
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        player.setVisible(false);
        this.gameOver = true;

        this.scene.start('GameOverScene', { timeAlive: this.timeAlive, score: this.score });
    }
}
