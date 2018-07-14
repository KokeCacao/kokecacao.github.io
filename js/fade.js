// $(window).scroll(function () {
//     console.log($(window).scrollTop());
//     var topDivHeight = $(".preset").height();
//     // var topDivHeight = 0;
//     var viewPortSize = $(window).height();

//     var triggerAt = 150;
//     var triggerHeight = (topDivHeight - viewPortSize) + triggerAt;

//     if ($(window).scrollTop() >= triggerHeight) {
//         $('.hide').css('visibility', 'visible').hide().fadeIn();
//         $(this).off('scroll');
//     }
// });

// $("div#foo").fadeIn("fast",function(){
//       $("div#bar").fadeIn("fast", function(){
//            // etc.
//       });
//    });

$(window).on("load",function() {
  $(window).scroll(function() {
    var windowBottom = $(this).scrollTop() + $(this).innerHeight();
    $(".fade").each(function() {
      /* Check the location of each desired element */
      var objectBottom = $(this).offset().top + $(this).outerHeight();
      var objectTop = $(this).offset().top;

      /* If the element is completely within bounds of the window, fade it in */
      if (objectTop +15 < windowBottom) { //object comes into view (scrolling down)
        if ($(this).css("opacity")==0) {$(this).fadeTo(800,1);}
      } else { //object goes out of view (scrolling up)
        // if ($(this).css("opacity")==1) {$(this).fadeTo(800,0);}
      }
    });
  }).scroll(); //invoke scroll-handler on page-load
});
