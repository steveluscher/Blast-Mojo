/*
	Class: Request
	
	Class representation of a Controller Request instance. Encapsulates request-specific parameters, and 
	context-specific information, into an object; used in Mojo Command, Behavior, and Rule objects.
	
*/
dojo.provide("mojo.controller.Request");
dojo.declare("mojo.controller.Request", null, 
{
	/*
		Function: constructor
		
		Creates an instance of the mojo.controller.Request class.
		
		Parameters:
			paramsObj - {object}
			callerObj - {object}
			eventObj -  {event}
			commandName - {string}
			controllerObj - {mojo.controller.Controller}
			invocation - {object}
	*/
	constructor: function(paramsObj, callerObj, eventObj, commandName, controllerObj, invocation) {
		this._paramsFunc = null;
		this.paramsObj = null;
		this.callerObj = null;
		this.eventObj = null;
		this.commandName = null;
		this.controllerObj = null;
		this.invocation = null;
		if (typeof(paramsObj) == "function") {
			this.paramsObj = {};
			this._paramsFunc = paramsObj;
		} else if (typeof(paramsObj) == "object") {
			this.paramsObj = paramsObj;
		}

		if (callerObj == null || typeof callerObj == 'undefined') {
			throw new Error('ERROR mojo.controller.Request.constructor - callerObj is not set');
		} else {
			this.callerObj = callerObj;
		}
		this.eventObj = eventObj;
		if (commandName == null || typeof commandName == 'undefined') {
			throw new Error('ERROR mojo.controller.Request.constructor - commandName is not set');
		} else {
			if (typeof commandName != 'string') {
				throw new Error('ERROR mojo.controller.Request.constructor - commandName is not type String');
			} else {
				this.commandName = commandName;
			}
		}
		if (controllerObj == null || typeof controllerObj == 'undefined') {
			throw new Error('ERROR mojo.controller.Request.constructor - controllerObj is not set');
		} else {
			if (!(controllerObj instanceof mojo.controller.Controller)) {
				throw new Error('ERROR mojo.controller.Request.constructor - controllerObj is not type mojo.controller.Controller');
			} else {
				this.controllerObj = controllerObj;
			}
		}

		this.invocation = invocation;
	  },
	_paramsFunc: null,
	paramsObj: null,
	callerObj: null,
	eventObj: null,
	commandName: null,
	controllerObj: null,
	invocation: null,
	update: function() {
		if (this._paramsFunc && typeof(this._paramsFunc) == "function") {
			var latest = this._paramsFunc(this.getContextElement(), this.getCaller(), this.getController());
			for (var key in latest) {
				this.paramsObj[key] = latest[key];
			}
		}
	},
	/*
		Function: getParams
		
		Returns the object containing the set of parameter properties and values to be used by a Command.
		
		Returns:
			{object} paramsObj
			
		Example:
			(start code)
			// use requestObj passed into a Command
			var targetParam = requestObj.getParams().target;
			(end)
	*/
	getParams: function() {
		if (!this.paramsObj) {
			this.update();
		}
		return this.paramsObj;
	},
	/*
		Function: getCaller
		
		Returns the caller object that triggered the request.
		
		Returns:
			{object} callerObj
			
		Example:
			(start code)
			// use requestObj passed into a Command
			// check if object triggering request is a mojo.MessagingTopic
			if (requestObj.getCaller() instanceof mojo.MessagingTopic) {
				var msg = requestObj.getCaller().getMessage(); // get message
			}
			
			(end)
	*/
	getCaller: function() {
		return this.callerObj;
	},
	/*
		Function: getContextElement
		
		Returns the DOM context of the Controller which fired the request.
		
		Returns:
			{DOMElement} contextObj
		
		Example:
			(start code)
			// use requestObj passed into a Command
			// only do css queries within the context of the Controller
			var selectedList = mojo.query(".selected", requestObj.getContextElement());
			(end)
	*/
	getContextElement: function() {
		return this.getController().getContextElement();
	},
	/*
		Function: getEvent
		
		Returns the DOM event object triggered, if applicable.
		
		Returns:
			{event} eventObj
		
		Example:
			(start code)
			// use requestObj passed into a Command
			var x = requestObj.getEvent().offsetX;
			var y = requestObj.getEvent().offsetY;
			
			(end)
	*/
	getEvent: function() {
		return this.eventObj;
	},
	/*
		Function: getCommandName
		
		Returns the name of the Command that the request is being passed in to.
		
		Returns:
			{string} Command Name
	*/
	getCommandName: function() {
		return this.commandName;
	},
	/*
		Function: getController
		
		Returns the Controller which fired the request.
		
		Returns:
			{mojo.controller.Controller} Controller
	*/
	getController: function() {
		return this.controllerObj;
	},
	/*
		Function: getControllerName
		
		Returns the name of the Controller which fired the request.
		
		Returns:
			{string} Controller Name
		
	*/
	getControllerName: function() {
		return this.getController().declaredClass;
	},
	/*
		Function: getInvocation
		
		Returns the invocation object, which wraps an intercepted Command object. Used with Controller Intercepts only.
		
		Returns:
			{object} Invocation
			
		Example:
			(start code)
			// use requestObj passed into a Command
			if (requestObj.getInvocation()) {
				// execute the intercepted Command
				requestObj.getInvocation().proceed();
			}
			(end)
	*/
	getInvocation: function() {
		return this.invocation;
	}
});