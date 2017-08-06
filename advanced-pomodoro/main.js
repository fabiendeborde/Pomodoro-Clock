$(document).ready(function() {

  var timer = new Object();
  // Keep the first green value safely
  timer.originalColor = 98;
  // Green value that will change during the timer counting
  timer.green = 98;
  timer.handleTimer = 0;
  // Timer global state (stopped, counting, paused)
  timer.state = 'stopped';
  // Time left array (min, s)
  timer.timeLeft = [0, 0];
  // Keep track of the seconds elapsed
  timer.seconds = 0;
  // Handles the numbers < 10 to display with a 0 before
  timer.sanetizeNumber = function(num){
    if (num < 10) {
      return '0' + num;
    } else {
      return num;
    }
  }

  // Main containers elements and default value
  timer.mainContainer = $('#timer');
  timer.breakTimeContainer = $('#break-timer');
  timer.breakTime = 5;
  timer.pomodoroTimeContainer = $('#pomodoro-timer');
  timer.pomodoroTime = timer.timeLeft[0];

  // Stop the timer and reset it
  timer.resetTimer = function() {
    console.log('stop');
    timer.state = 'stopped';
    clearInterval(timer.handleTimer);
    timer.timeLeft = [timer.pomodoroTime, 0];
    timer.seconds = 0;
    timer.handleTimerDisplay(timer.timeLeft, timer.state);
    timer.green = timer.originalColor;
    timer.changeTimerBorderColor(timer.green);
  };

  // Start the timer
  timer.start = function() {
    console.log('counting');
    timer.state = 'counting';
    timer.handleTimer = setInterval(timer.count, 1000);
  };

  // Pause the timer
  timer.pause = function() {
    console.log('pausing');
    timer.state = 'paused';
    clearInterval(timer.handleTimer);
  };

  // Handles the timer counting function
  timer.count = function() {
    console.log(timer.seconds);
    //timer.changeTimerBorderColor(timer.green);
    //timer.green -= 1;
    if (timer.timeLeft[0] === 0 && timer.timeLeft[1] === 0) {
      clearInterval(timer.handleTimer);
      timer.state = 'done';
    } else if (timer.timeLeft[1] === 0) {
      timer.timeLeft[1] = 60
      timer.timeLeft[0] -= 1
      timer.timeLeft[1] -=1
    } else {
      timer.timeLeft[1] -=1
    }
    timer.seconds += 1
    timer.handleTimerDisplay(timer.timeLeft);
    // if (timer.green === 0) {
    //   timer.pause();
    //   timer.reset();
    // }
  }

  // Handles the sound playing when the timer reach 0
  timer.playsound = function(){
    var audio = new Audio('stop.wav');
    audio.play();
  }

  // Handles the color of the main timer border
  timer.changeTimerBorderColor = function(color) {
    var hsl = 'hsl(' + color + ',91.9%,29%)';
    $('.main-timer').css({'border-color': hsl})
  };

  // Handle the small counters counting function
  // Update only if the timer is stopped
  // Update the main timer when updating the pomodoro-timer
  timer.changeTime = function(counter, operation) {
    if (timer.state !== 'stopped') {
      return null
    } else {
      if (operation === 'add') {
        timer[counter] += 1;
      } else if (operation === 'sub' && timer[counter] !== 0) {
        timer[counter] -= 1;
      }
      if (counter === 'pomodoroTime') {
        if (operation === 'add') {
          timer.timeLeft[0] += 1;
        } else if (operation === 'sub' && timer[counter] > 0) {
          timer.timeLeft[0] -= 1;
        } else if (operation === 'sub' && timer[counter] === 0) {
          timer.timeLeft[0] = 0;
        }
        timer.handleTimerDisplay(timer.timeLeft)
      }
      timer.displayCounter(timer[counter + 'Container'], timer[counter]);
    }
  };

  // Handles the display of the small counters
  timer.displayCounter = function(el, value) {
    el.text(value);
  }

  // Handles the display of the main timer
  timer.handleTimerDisplay = function(timeLeft, timerState) {
    if (timer.state === 'done') {
      timer.playsound();
      console.log('done');
    } else {
      var newTimer = [];
      newTimer[0] = timer.sanetizeNumber(timeLeft[0]);
      newTimer[1] = timer.sanetizeNumber(timeLeft[1]);
      timer.mainContainer.text(newTimer.join(':'));
    }
  };

  // Handles the 3 states of the timer (playing, paused, stopped)
  timer.handleState = {
    stop: function() {
      $('.main-button .start-button').removeClass("hidden");
      $('.main-button .stop-button').addClass("hidden");
      $('.control-wrapper .fa-play').removeClass("hidden");
      $('.control-wrapper .fa-pause').addClass("hidden");
      $('.control-wrapper').addClass('stopped');
      timer.state = 'stopped';
      timer.resetTimer();
    },
    count: function() {
      $('.main-button .start-button').addClass("hidden");
      $('.main-button .stop-button').removeClass("hidden");
      $('.control-wrapper').removeClass('stopped');
      $('.control-wrapper .fa-play').addClass("hidden");
      $('.control-wrapper .fa-pause').removeClass("hidden");
      timer.state = 'counting';
      timer.start();
    },
    pause: function() {
      $('.main-button .start-button').addClass("hidden");
      $('.main-button .stop-button').removeClass("hidden");
      $('.control-wrapper .fa-play').removeClass("hidden");
      $('.control-wrapper .fa-pause').addClass("hidden");
      timer.pause();
    }
  }

  // Click event handler on the Play/Pause/Stop controllers
  // Changes the states of the timer
  $('.main-button').on('click', function() {
    if (timer.state === 'stopped') {
      timer.handleState.count();
    } else if (timer.state === 'counting') {
      timer.handleState.stop();
    } else if (timer.state === 'paused') {
      timer.handleState.stop();
      timer.state = 'stopped';
    }
  })
  $('.control-wrapper').on('click', function() {
    if (timer.state === 'stopped') {
      timer.handleState.count();
      timer.state = 'counting';
    } else if (timer.state === 'counting') {
      timer.handleState.pause();
      timer.state = 'paused';
    } else if (timer.state === 'paused') {
      timer.handleState.count();
      timer.state = 'counting';
    }
  })

  // Click event handler on the + / - controllers
  // Changes the values of the timer
  $('.break-counter .add').on('click', function(e){
    e.preventDefault();
    timer.changeTime('breakTime', 'add');
  })
  $('.break-counter .substract').on('click', function(e){
    e.preventDefault();
    timer.changeTime('breakTime', 'sub');
  })
  $('.pomodoro-counter .add').on('click', function(e){
    e.preventDefault();
    timer.changeTime('pomodoroTime', 'add');
  })
  $('.pomodoro-counter .substract').on('click', function(e){
    e.preventDefault();
    timer.changeTime('pomodoroTime', 'sub');
  })

  // Make sure to display the default counter values (5, 25)
  timer.displayCounter(timer.breakTimeContainer, timer.breakTime);
  timer.displayCounter(timer.pomodoroTimeContainer, timer.pomodoroTime);
  timer.handleTimerDisplay(timer.timeLeft, timer.state);

})
