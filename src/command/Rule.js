/*
	Class: Rule
   
	An abstract class used in implementing Mojo Rule. A Rule is an object used for encapsulating a conditional statement.
	
	Example:
		(start code)
		dojo.provide("sample.rule.MinimumAgeRule");
		dojo.require("mojo.command.Rule");

		dojo.declare("sample.rule.MinimumAgeRule", mojo.command.Rule, 
		{
			condition: function(requestObj) {
				var minimumAge = 18;
				if (this.getRequest().getParams().age >= minimumAge) {
					return true;
				}
				return false;
			}
		});
		
		(end)
*/
dojo.provide("mojo.command.Rule");
dojo.declare("mojo.command.Rule", null, 
{
	_requestObj: null,
	/*
		Function: getRequest
		
		Returns the mojo.controller.Request object passed into the Rule.
	
		Returns:
			{object} Mojo Request Object
	*/
	getRequest: function() {
		if (!this._requestObj) {
			throw new Error("ERROR mojo.command.Rule.getRequest -requestObj is not set");
		}
		return this._requestObj;
	},
	_execute: function(requestObj) {
		this._requestObj = requestObj;
		if (typeof(requestObj.update) == "function") {
			requestObj.update();
		}
		if (this._requestObj == null || (!this._requestObj)) {
			throw new Error("ERROR mojo.command.Rule._execute - requestObj is not set");
		} else if (!(this._requestObj instanceof mojo.controller.Request)) {
			throw new Error("ERROR mojo.command.Rule._execute - requestObj is not type of mojo.controller.Request");
		} else if (!this._requestObj.callerObj) {
			throw new Error("ERROR mojo.command.Rule._execute - callerObj is not set");
		} else if (!this._requestObj.invocation) {
			throw new Error("ERROR mojo.command.Rule._execute - invocation is not set");
		}

		if (dojo.config && dojo.config.isDebug) {
			try {
				if(this.execute(requestObj)) return true;
				return false;
			} catch(ex) {
				console.debug("EXCEPTION: " + ex.message + " in mojo.command.Rule.execute() for rule: " + requestObj.getCommandName() + ", controller: " + requestObj.getControllerName());
			}
		} else {
			if(this.execute(requestObj)) return true;
			return false;
		}

    	try {

    	} catch (ex) {
			//throw new Error("ERRPR mojo.command.Rule._execute invoke the exe")
    	//	throw new Error("EXCEPTION: " + ex.message + " in mojo.command.Rule.execute() for command: " + requestObj.commandName + ", controller: " + requestObj.controllerName);
    	}
	},
	
	/*
		Function: execute
		
		Abstract function that must be implemented in a concrete Rule class.
		
		Parameters: 
			requestObj - {object}
		
		Example:
			(start code)
			//See above for sample implementation usage.
			(end)
					 
	*/
	execute: function(requestObj) {
		if (this.condition(requestObj)) {
			return requestObj.invocation.proceed();
		}
	},
	/*
		Function: condition
		
		Abstract function that must be implemented in a concrete Rule class. The Controller will automatically 
		fire the condition() method when triggering a Rule. If a rule passes as true, the intercepted Command 
		will automatically be fired.
		
		Parameters: 
			requestObj - {object}
			
		Example:
			(start code)
			//See above for sample implementation usage.
			(end)
	*/
	condition: function(requestObj) {
		throw new Error("ERROR mojo.command.Rule.condition - condition() method is not implemented");
	}
});