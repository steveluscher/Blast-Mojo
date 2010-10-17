/*
  Class: Behavior

  An abstract class used in implementing Mojo Behaviors. A Behavior is an object that encapsulates functionality for controlling and manipulating UI interaction/reaction.

  Example:
    (start code)
    dojo.provide("sample.behavior.ClearFormBehavior");
    dojo.require("mojo.command.Behavior");

    dojo.declare("sample.behavior.ClearFormBehavior", mojo.command.Behavior, 
    {
      execute: function(requestObj) {
        var inputs = mojo.query("input", this.getRequest().getContextElement());
        for (var i = 0, len = inputs.length; i < len; i++) {
          inputs[i].value = "";
        }
      }
    });
    (end)
*/
dojo.provide("mojo.command.Behavior");
dojo.declare("mojo.command.Behavior", null, 
{
  _requestObj: null,
  /*
    Function: getRequest
    
    Returns the mojo.controller.Request object passed into the Behavior.
      
    Returns:
      
      {object} Mojo Request Object
  */
    getRequest: function() {
        if (!this._requestObj) {
      throw new Error("ERROR mojo.command.Behavior.getRequest - requestObj is not set");
    }
        return this._requestObj;
    },
    _execute: function(requestObj) {
        this._requestObj = requestObj;
        if (typeof(requestObj.update) == "function") {
            requestObj.update();

        }
  if (this._requestObj == null || (!this._requestObj)) {
    throw new Error("ERROR mojo.command.Behavior._execute - requestObj is not set");
  } else if (!(this._requestObj instanceof mojo.controller.Request)) {
    throw new Error("ERROR mojo.command.Behavior._execute - requestObj is not type of mojo.controller.Request");
  } else if (!this._requestObj.callerObj) {
    throw new Error("ERROR mojo.command.Behavior._execute - callerObj is not set");
  }

  if (!requestObj.getParams() && typeof(requestObj.getParams()) == "boolean") return;
  if (dojo.config && dojo.config.isDebug) {
    try {
      return this.execute(requestObj);
    } catch(ex) {
      console.debug("EXCEPTION: " + ex.message + " in mojo.command.Behavior.execute() for behavior: " + requestObj.getCommandName() + ", controller: " + requestObj.getControllerName());
    }
  } else {
    return this.execute(requestObj);
  }
    },
  /*
    Function: execute
    
    Abstract function that must be implemented in a concrete Behavior class. The Controller will automatically
    fire the execute() method when triggering a Behavior.

    Parameters:
      requestObj - {object}
      
    Example:
    
      (start code)
      dojo.declare("myapplication.command.toggleComponent", mojo.command.Behavior, 
      {
        execute: function(requestObj) {
          
          //In the UI, we have an anchor with the following markup--please note the *rel* attribute.
          //<a id='component1' rel='component1Content' href='view/component1'>
          //<div id='component1Content'>Lots of content goes here.</div>
    
          var targetEl = mojo.queryFirst("#" + requestObj.callerObj.getAttribute('rel')); //CSS selector for the ID

          //Now we have the reference to the content panel, so we can determine its state and toggle it accordingly.
          if (targetEl.style.display == 'none') {
            //Show it.
          } else {
            //Hide it.
          }
        }
      });
      (end)

  */
    execute: function(requestObj) {
    throw new Error("ERROR mojo.command.Behavior.execute - execute() method is not implemented");
    }

});