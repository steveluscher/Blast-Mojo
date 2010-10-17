
dojo.provide("mojo.css");
(function( mojo ) {
  
  /* 
    Function: css
    
    Easy to use API for setting styles of specific elements.
    
    (start code)
      var login_panel = mojo.queryFirst("#login");
      mojo.css(login_panel, 'border', '1px solid pink');
    (end)
  */
  mojo.css = function() {
    return dojo.style.apply(this, arguments);
  };
})( mojo );