$(document).ready(function() {

  var green = 98;
  var changeTimerBorderColor = function(color) {
    var hsl = 'hsl(' + color + ',91.9%,29%)';
    $('.main-timer').css({'border-color': hsl})
  }

  var handleTimer = 0;
  var colorTransition = function() {
    changeTimerBorderColor(green);
    green -= 1;
    console.log(green);

    if (green === 0) {
      console.log('stop');
      clearInterval(handleTimer);
      green = 98;
      changeTimerBorderColor(green);
    }
  }

  $('h1').on('click', function() {
    handleTimer = setInterval(colorTransition, 2000);
  })

})
