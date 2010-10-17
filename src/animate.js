dojo.provide("mojo.animate");
(function( mojo ) {
  var speeds = {
    'fast': 200,
    'normal': 500,
    'slow': 1000
  };
  
  mojo.animate = function() {
    return function(animationConfig) {
      
    }(arguments);
  };
  
  /* 
    Function: fadeIn
    
    Convenience method for developers to fade-in elements
    
    (start code)
      var element = mojo.queryFirst("#main");
      mojo.fadeIn(element, 'fast', function() {
        console.log('animation end');
      });
    (end)
  */
  mojo.fadeIn = function(element, speed, callback) {
    return function() {
      dojo.fadeIn.call(this, { node: element, duration: speeds[speed], onEnd: function() {
          callback.apply(this, arguments);
        } 
      }).play();
    }();
  };
  
  /* 
    Function: fadeOut
    
    Convenience method for developers to fade-out elements
    
    (start code)
      var element = mojo.queryFirst("#main");
      mojo.fadeOut(element, 'fast', function() {
        console.log('animation end');
      });
    (end)
  */
  mojo.fadeOut = function(element, speed, callback) {
    return function() {
      dojo.fadeOut.call(this, { node: element, duration: speeds[speed], onEnd: function() {
          callback.apply(this, arguments);
        }
      }).play();
    }();
  };
})( mojo );