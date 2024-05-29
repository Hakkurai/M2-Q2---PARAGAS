import CreditsScene from './scenes/CreditsScene.js';
import GameScene from './scenes/GameScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GameOverScene from './scenes/GameOverScene.js'; 

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,    
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MainMenuScene, GameScene, CreditsScene, GameOverScene] 
};

var game = new Phaser.Game(config);
