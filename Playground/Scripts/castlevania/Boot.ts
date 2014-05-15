module Castlevania {
    export class Boot extends Phaser.State {
        preload() {
            this.load.image('preloadBar', 'Content/castlevania/loader.png');
        }

        create() {
            //  Unless you specifically need to support multitouch I would recommend setting this to 1
            this.input.maxPointers = 1;

            this.game.state.start('Preloader', true, false);
        }
    }
}