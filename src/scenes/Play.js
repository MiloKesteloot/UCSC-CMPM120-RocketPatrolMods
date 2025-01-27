class Play extends Phaser.Scene {

	static playInstance = null

    constructor() {
        super("playScene");
		Play.playInstance = this
    }

	create() {
		// game.physics.startSystem(Phaser.Physics.ARCADE)
		// place tile sprite
		this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0)
		// green UI background
		this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0)
		// white borders
		this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
		this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
		this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
		this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0)

		// add rocket (p1)
		this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0)

		// define keys
		keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
		keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
		keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
		keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)

		this.ships = [
			new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4                  , 'spaceship'      , 0, 30, 3).setOrigin(0, 0),
			new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship'      , 0, 20, 3).setOrigin(0,0),
			new Spaceship(this, game.config.width                 , borderUISize*6 + borderPadding*4, 'spaceship'      , 0, 10, 3).setOrigin(0,0),
			new Spaceship(this, game.config.width                 , borderUISize*3 + borderPadding*4, 'spaceship-small', 0, 60, 5).setOrigin(0,0)

		]

		this.p1Score = 0;

		let scoreConfig = {
			fontFamily: 'Courier',
			fontSize: '28px',
			backgroundColor: '#F3B141',
			color: '#843605',
			align: 'right',
			padding: {
				top: 5,
				bottom: 5,
			},
			fixedWidth: 100
		};
		this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig)
		this.timerText = this.add.text(game.config.width - borderUISize - borderPadding - 100, borderUISize + borderPadding*2, "1:30", scoreConfig)
		this.timer = Math.floor(game.settings.gameTimer / (1000/60)) // 1000 / x = 60

		// GAME OVER flag
		this.gameOver = false

		// 60-second play clock
		scoreConfig.fixedWidth = 0
	}

	timeFormat() {
		let seconds = Math.floor(this.timer / 60) + 1
		let visualMinutes = Math.floor(seconds/60)
		let visualSeconds = seconds%60
		return visualMinutes + ":" + (visualSeconds < 10 ? "0" : "") + visualSeconds;
	}

	update(time, dt) {

		this.timer -= 0.05 * dt

		if (this.timer <= 0) {
			this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER').setOrigin(0.5)
			this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart').setOrigin(0.5)
			this.gameOver = true
		} else {
			this.timerText.text = this.timeFormat()
		}

		if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)) {
			this.scene.restart()
		}

		this.starfield.tilePositionX -= 4
		
		if (!this.gameOver) {               
			this.p1Rocket.update(this.input.activePointer.isDown);
			for (let s of this.ships) {
				s.update();

				if (this.checkCollision(this.p1Rocket, s)) {
					this.p1Rocket.reset();
					this.shipExplode(s);
					s.reset();
				}
			}
		} 

		if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
			this.scene.start("menuScene");
		}
	}

	checkCollision(rocket, ship) {
		// simple AABB checking
		if (rocket.x < ship.x + ship.width && 
			rocket.x + rocket.width > ship.x && 
			rocket.y < ship.y + ship.height &&
			rocket.height + rocket.y > ship. y) {
			return true
		} else {
			return false
		}
	}

	shipExplode(ship) {
		// temporarily hide ship
		ship.alpha = 0;

		// create explosion particles at ship's position
		const emitter = this.add.particles(0, 0, 'explosion-particle', {
			// Emitter configuration
			lifespan: 2000,
			speed: { min: 0, max: 200 },
			scale: { start: 1, end: 0 },
			blendMode: 'ADD'
		  });
		emitter.explode(50, ship.x, ship.y);

		// create explosion animation
		let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
		boom.anims.play('explode');              // play explode animation
		boom.on('animationcomplete', () => {     // callback after anim completes
			ship.reset()                         // reset ship position
			ship.alpha = 1                       // make ship visible again
			boom.destroy()                       // remove explosion sprite
		});

		this.p1Score += ship.points;
  		this.scoreLeft.text = this.p1Score; 
		
		this.sound.play('sfx-explosion');

		Play.playInstance.timer += 60*5
	}
}
