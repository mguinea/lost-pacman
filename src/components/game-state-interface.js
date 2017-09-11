AFRAME.registerComponent('game-state-interface', {
	init: function () {
	},
	tick : function(t, dt){
		var entity = this.el;
		var text = "";

		if(retry === true){
			retry = false;
			countDownTimer = 7;
		}

		if(countDown === true){
			if(countDownTimer > 5){
				text = "Ready?\r\n" + ~~(countDownTimer);
			}else if(countDownTimer > 3){
				text = "Steady?\r\n" + ~~(countDownTimer);
			}
			else if(countDownTimer > 0.1){
				text = "Go!\r\n" + ~~(countDownTimer);
			}
			entity.setAttribute("text", {value: text});
		}else if(gameOver === true){
			var bestScore = (scores[0] < score) ? score : scores[0];
			text = "Game Over";

			entity.setAttribute("text", {value: text});
		}else if(gameFinish === true){
			scores.sort();
			scores.reverse();
			var bestScore = (scores[0] < score) ? score : scores[0];
			
			text = "Congratulations!\r\n Your score: " + score + "\r\nBest score: " + bestScore;
			// Show new record message
			if(scores[0] < score){
				text += "\r\nNEW RECORD!!!";
			}
			entity.setAttribute("text", {value: text});
		}
	}
});
