$(document).ready(function() {
  var seconds = 0;
  var initialTimer = [1, 0];
  var timer = [1, 0];
  var timerContainer = $('#clockTime');

  // Handle the sound player
  var playsound = function(){
    var audio = new Audio('audio_file.mp3');
    audio.play();
  };

  // Handle the display on the screen
  var handleTimerDisplay = function(timer) {
    var msg;
    if (timer === 'stop') {
      msg = 'BREAK';
      console.log(msg);
      timerContainer.text(msg);
      //playsound();
    } else {
      var newTimer = [];
      var sanetizeNumber = function(num){
        if (num < 10) {
          return '0' + num;
        } else {
          return num;
        }
      }
      newTimer[0] = sanetizeNumber(timer[0]);
      newTimer[1] = sanetizeNumber(timer[1]);
      msg = newTimer.join(':');
      timerContainer.text(msg);
    }
  };

  var handleTimer = 0;
  var counter = function() {
    if (timer[0] === 0 && timer[1] === 0) {
      console.log('stop');
      handleTimerDisplay('stop');
      clearInterval(handleTimer);
    } else if (timer[1] === 0) {
      timer[1] = 60
      timer[0] -= 1
      timer[1] -=1
    } else {
      timer[1] -=1
    }
    seconds += 1
    handleTimerDisplay(timer);
  };;


  // Handle the clicks on start / pause buttons
  var handlePlayButton = function() {
    $('.start-button').on('click', function() {
      $('.fa-play').toggleClass('hidden');
      $('.fa-pause').toggleClass('hidden');
      if ($('.fa-play').hasClass('hidden')) {
        handleTimer = setInterval(counter, 1000)
      } else {
        clearInterval(handleTimer);
      }
    })
  }();

  // Handle the clicks on stop button
  var handleStopButton = function() {
    $('.stop-button').on('click', function() {
      $('.fa-play').removeClass('hidden');
      $('.fa-pause').addClass('hidden');
      seconds = 0;
      handleTimerDisplay(initialTimer);
      clearInterval(handleTimer);
    })
  }();


  handleTimerDisplay(timer);

})
