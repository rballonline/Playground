 module Golf {
 
    export class MainMenu extends Phaser.State {
 
        //background: Phaser.Sprite;
        //logo: Phaser.Sprite;
 
        create() {
            this.stage.backgroundColor = 0xffffff;
            /*
                       this.background = this.add.sprite(0, 0, 'titlepage');
                       this.background.alpha = 0;
 
                       this.logo = this.add.sprite(this.world.centerX, -300, 'logo');
                       this.logo.anchor.setTo(0.5, 0.5);

                       this.add.tween(this.background).to({ alpha: 1}, 2000, Phaser.Easing.Bounce.InOut, true);
                       this.add.tween(this.logo).to({ y: 220 }, 2000, Phaser.Easing.Elastic.Out, true, 2000);
             */
            this.game.add.text(this.game.world.centerX, 10, 'Golf', { font: '45px Arial' });
            this.game.add.text(this.game.world.centerX, 50, 'Start', { font: '25p Arial' }); 

            this.input.onDown.addOnce(this.startGame, this);
 
        }
 
        fadeOut() {
 /*
            this.add.tween(this.background).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
            var tween = this.add.tween(this.logo).to({ y: 800 }, 2000, Phaser.Easing.Linear.None, true);

            tween.onComplete.add(this.startGame, this);
  */
        }
 
        startGame() {
 
            this.game.state.start('Level1', true, false);
 
        }
 
    }
 
}