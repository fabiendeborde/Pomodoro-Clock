$(document).ready(function() {
  // Add Twitter widget library
  var addTwitterJS = function() {
    window.twttr = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };
      return t;
    }(document, "script", "twitter-wjs"));
  }();

  var timer = new Object();
  timer.handleTimer = 0;
  // Timer global state (stopped, counting, paused)
  timer.state = 'stopped';
  // Timer current phase (work or break)
  timer.phase = true;

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
  timer.pomodoroTime = 25;
  // Time left array (min, s)
  timer.timeLeft = [timer.pomodoroTime, 0];
  // Keep track of the seconds elapsed
  timer.seconds = 0;
  timer.totalSeconds = timer.pomodoroTime * 60;
  
  // Stop the timer and reset it
  timer.resetTimer = function() {
    timer.state = 'stopped';
    clearInterval(timer.handleTimer);
    timer.timeLeft = [timer.pomodoroTime, 0];
    timer.seconds = 0;
    timer.handleTimerDisplay(timer.timeLeft, timer.state);
    timer.green = timer.originalColor;
    timer.changeTimerBorderColor(timer.green);
    $('.pomodoro-counter .icon').removeClass('active');
    $('.pomodoro-counter .icon').removeClass('active')
  };

  // Start the timer
  timer.start = function() {
    timer.state = 'counting';
    timer.handleTimer = setInterval(timer.count, 1000);
  };

  // Pause the timer
  timer.pause = function() {
    timer.state = 'paused';
    clearInterval(timer.handleTimer);
  };

  // Handles the timer counting function
  timer.count = function() {
    if (timer.phase) {
      $('.pomodoro-counter .icon').addClass('active');
      $('.break-counter .icon').removeClass('active');
    } else {
      $('.pomodoro-counter .icon').removeClass('active');
      $('.break-counter .icon').addClass('active');
    }
    if (timer.timeLeft[0] === 0 && timer.timeLeft[1] === 0) {
      if (timer.phase) {
        timer.totalSeconds = timer.breakTime * 60;
        timer.timeLeft = [timer.breakTime, 0];
        timer.seconds = 0;
        timer.playsound('stop');
      } else {
        timer.totalSeconds = timer.pomodoroTime * 60;
        timer.timeLeft = [timer.pomodoroTime, 0];
        timer.seconds = 0;
        timer.playsound('gong');
      }
      timer.phase = !timer.phase;
    } else if (timer.timeLeft[1] === 0) {
      timer.timeLeft[1] = 60
      timer.timeLeft[0] -= 1
      timer.timeLeft[1] -=1
    } else {
      timer.timeLeft[1] -=1
    }
    timer.seconds += 1
    timer.handleTimerDisplay(timer.timeLeft);
    var percentLeft = 100 - ((timer.seconds * 100) / timer.totalSeconds);
    timer.changeTimerBorderColor(percentLeft);
  }

  // Handles the sound playing when the timer reach 0
  timer.playsound = function(name){
    var audio = new Audio(name + '.wav');
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
      timer.totalSeconds = timer[counter] * 60;
      timer.displayCounter(timer[counter + 'Container'], timer[counter]);
    }
  };

  // Handles the display of the small counters
  timer.displayCounter = function(el, value) {
    el.text(value);
  }

  // Handles the display of the main timer
  timer.handleTimerDisplay = function(timeLeft, timerState) {
    var newTimer = [];
    newTimer[0] = timer.sanetizeNumber(timeLeft[0]);
    newTimer[1] = timer.sanetizeNumber(timeLeft[1]);
    timer.mainContainer.text(newTimer.join(':'));
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
  $('.main-button .control-button').on('click', function() {
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
