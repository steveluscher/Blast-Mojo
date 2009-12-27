/*
   Class: Command

	An abstract class used in implementing Mojo Commands. A Command is an object that encapsulates 
	functionality for processing data and/or business logic.
	
	Example:
		(start code)
		dojo.provide("sample.command.LoadHtmlCommand");
		dojo.require("mojo.command.Command");
		dojo.require("sample.service.Locator");

		dojo.declare("sample.command.LoadHtmlCommand", mojo.command.Command, 
		{
			execute: function(requestObj) {
				// invoke a service call to get some Html
				var locator = sample.service.Locator.getInstance();
				var service = locator.getService("getHtml")
				service.invoke(this.getRequest().getParams(), this);
			},
			onResponse: function(data) {
				// handle success response...
			},
			onError: function(error) {
				// handle error response...
			}
		});
		(end)
	
*/
dojo.provide("mojo.command.Command");
dojo.declare("mojo.command.Command", null, 
{
	_requestObj: null,
	/*
		Function: getRequest
		
		Returns the mojo.controller.Request object passed into the Command.
	
		Returns:
			{object} Mojo Request Object
			
		Example:
			(start code)
			//See above example implementation.
			(end)	
			
		
	*/
	getRequest: function() {
		if (!this._requestObj) {
			throw new Error("ERROR mojo.command.Command.getRequest - requestObj is not set");
		}
		return this._requestObj;
	},
	_execute: function(requestObj) {
		this._requestObj = requestObj;
		if (typeof(requestObj.update) == "function") {
			requestObj.update();
		}
		if (this._requestObj == null || (!this._requestObj)) {
			throw new Error("ERROR mojo.command.Command._execute - requestObj is not set");
		} else if (!(this._requestObj instanceof mojo.controller.Request)) {
			throw new Error("ERROR mojo.command.Command._execute - requestObj is not type of mojo.controller.Request");
		}
		
		if(!requestObj.getParams() && typeof(requestObj.getParams()) == "boolean") return;
		if (dojo.config && dojo.config.isDebug) {
			try {
				return this.execute(requestObj);
			} catch(ex) {
				console.debug("EXCEPTION: " + ex.message + " in mojo.command.Command.execute() for command: " + requestObj.getCommandName() + ", controller: " + requestObj.getControllerName());
			}
		} else {
			return this.execute(requestObj);
		}
	},
	/*
		Function: execute
		
		Abstract function that must be implemented in a concrete Command class. The Controller will automatically 
		fire the execute() method when triggering a Command.
		
		Parameters:
			requestObj - {object}
			
		Example:
			(start code)
			//See above example implementation.
			(end)
	*/	
	execute: function(requestObj) {
		throw new Error("ERROR mojo.command.Command.execute - execute() method is not implemented");
	},
	/*
		Function: onResponse
		
		Abstract function that must be implemented in a concrete Command class. Used to handle the data from a successful response.
		
		Parameters:
			data - {object} 
		
		Exmaple:
			(start code)
			// see above for sample implementation usage.
			(end)
			
	*/	
	onResponse: function(data) {
		throw new Error("ERROR mojo.command.Command.onResponse - onResponse() method is not implemented");
	},
	/*
		Function: onError
		
		Abstract function that must be implemented in a concrete Command class. Used to handle errors from an error response.
		
		Parameters:
			error - {object}
			
		Example:
			(start code)
			//See above example implementation.
			(end)
	*/	
	onError: function(error) {
		throw new Error("ERROR mojo.command.Command.onError - onError() method is not implemented");
	}
});