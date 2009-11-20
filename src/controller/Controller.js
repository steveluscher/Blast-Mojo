/*
	Class: Controller
 	
	An abstract class used in implementing Mojo Controllers. A Controller is an object that encapsulates 
	all event handling, Command managing and dispatching and intercepting in a Mojo application.
	
	Example:
		(start code)
		dojo.provide("sample.controller.ProfileController");
		dojo.require("mojo.controller.Controller");

		dojo.declare("sample.controller.ProfileController", mojo.controller.Controller, 
		{
			addObservers: function() {
				this.addObserver(this, "onInit", "GetProfile");
				// add more observers ...
			},
			addCommands: function() {
				this.addCommand("GetProfile", "sampleApplication.command.profile.GetProfileCommand");
				// add more commands ...
			},
			addIntercepts: function() {
				// add more intercepts ...
			}
		});
		(end)

*/
dojo.provide("mojo.controller.Controller");
dojo.require("mojo.command.Command");
dojo.require("mojo.command.Behavior");
dojo.require("mojo.command.Rule");
dojo.require("mojo.controller.Request");

dojo.declare("mojo.controller.Controller", null, 
{
	constructor: function(contextElementObj, params) {
		this._init(contextElementObj, params);
		// clean up references to controller onunload
		dojo.addOnUnload(dojo.hitch(this, this._mojoCleanup));
	}, 
  	_mojoCleanup: function() {
		this.removeObservers();
		this.contextElementObj = null;
  	},
	_contextElementObj: null,
	_commands: new Array(),
	_connectHandles: new Array(),
	_queryCache: new Object(),
	_observers: new Object(),
	_tags: new Array(),
	_init: function(contextElementObj, params) {
		if (this.params) {
			// clone params object
			var cloneParams = {};
			cloneParams.onChange = function() {};
			// get base params first if inheriting a controller
			var baseParams = this._getBaseProperty("params");
			for (var paramName in baseParams) {
				if (typeof baseParams[paramName] == "object") {
					var param = baseParams[paramName];
					// create new mojo.controller.Param instance
					cloneParams[paramName] = new mojo.controller.Param(paramName, dojo.clone(param.defaultValue), param.required, param.type, cloneParams);
					// set value of parameter being passed in
					if (params) {
						cloneParams[paramName].setValue(params[paramName]);
					}
				}
			}
			for (var paramName in this.params) {
				if (typeof this.params[paramName] == "object") {
					var param = this.params[paramName];
					// create new mojo.controller.Param instance
					cloneParams[paramName] = new mojo.controller.Param(paramName, dojo.clone(param.defaultValue), param.required, param.type, cloneParams);
					// set value of parameter being passed in
					if (params) {
						cloneParams[paramName].setValue(params[paramName]);
					}
				}
			}
			this.params = cloneParams;
			cloneParams = null;
			params = null;
		}
		this._contextElementObj = null;
		if (contextElementObj) {
			this._contextElementObj = contextElementObj;
		}
		this._commands = new Array();
		this._tags = new Array();
		this._connectHandles = new Array();
		this._callBaseMethod("addCommands")
		this.addCommands();
		this._addObservers();
		this._callBaseMethod("addIntercepts")
		this.addIntercepts();
		this.onInit();
		if (this.params) {
			for (var paramName in this.params) {
				if (typeof this.params[paramName] == "object") {
					var param = this.params[paramName];
					if (param.getValue() != null) {
						param.onChange();
					}
				}
			}
		}
		mojo.Messaging.subscribe("/mojo/controller/" + this.declaredClass + "/addObservers", this, "_addObservers");
		mojo.Messaging.subscribe("/mojo/controller/addObservers", this, "_addObservers");
	},
	/*
		Function: getConfig
		
		Returns the specified configuration object.
		
		Parameters:
			configName - {string}
			
		Returns:
			{object} configObj
	*/
	getConfig: function(configName) {
		configName = configName.toLowerCase();
		switch(configName) {
			case "params":
				return this[configName];
				break;
		}
		return null;
	},
	/*
		Function: getValue
		
		Returns the value of the specified parameter.
		
		Parameters:
			paramName - {string}
			
		Returns:
			{object} value
	*/
	getValue: function(paramName) {
		return this.params[paramName].getValue();
	},
	/*
		Function: setValue
		
		Sets the value of the specified parameter.
		
		Parameters:
			paramName - {string}
			value - {object}
	*/
	setValue: function(paramName, value) {
		this.params[paramName].setValue(value);
	},
	/*
		Function: getContextController
		
		Returns a Controller instance that is in the same context as the current Controller.
		
		Parameters:
			controllerName - {string}

		Returns:
			{mojo.controller.Controller} contextControllerObj
	*/
	getContextController: function(controllerName) {
		if (this.getContextElement() && this.getContextElement().mojoControllers[controllerName]) {
			return this.getContextElement().mojoControllers[controllerName];
		}
		return null;
	},
	_getBaseProperty: function(propertyName) {
		var superclass = eval(this.declaredClass + ".superclass");
		if (superclass.declaredClass != "mojo.controller.Controller" && superclass[propertyName]) {
			return superclass[propertyName];
		}
		return null;
	},
	_callBaseMethod: function(methodName) {
		var method = this._getBaseProperty(methodName);
		if (method) method.call(this);
	},
	/*
		Function: getContextElement
		
		Returns the DOM context of the Controller.
		
		Returns:
			{DOMElement} contextElementObj
	*/
	getContextElement: function() {
		if(!this._contextElementObj) {
			return null;
		}
		return this._contextElementObj;
	},
	/*
		Event: onInit
		
		This event fires when the Controller is first initialized.
	*/
	onInit: function() {},
	_addObservers: function() {
		this._queryCache = new Object();
		this._observers = new Object();
		this._callBaseMethod("addObservers")
		this.addObservers();
		// add batch of observers
		for (var key in this._queryCache) {
			if (this._queryCache[key]["length"]) {
				for (var func in this._observers[key]) {
					if (this._observers[key][func]["length"]) {
						var queryCacheLength = this._queryCache[key].length;
						for (var i = 0; i < queryCacheLength; i++) {
							this._addObserver(this._queryCache[key][i], func, this._observers[key][func]);
						}
					}
				}
			}
		}
		// purge cached queries
		this._queryCache = new Object();
		this._observers = new Object();
	},
	/*
		Function: addObservers
		
		Abstract function fired on instantiation of concrete implementation of Controller class. Used as container function for adding observers.
		
		Example:
			(start code)
			// see above for sample implementation usage
			(end)
	*/
	addObservers: function() {
		throw new Error("ERROR mojo.controller.Controller.addObservers - addObservers() method is not implemented");
		
	},
	/*
		Function: removeObserver
		
		Removes all observers associated with the Controller.
	*/
	removeObservers: function() { 
		var connectHandlesLength = this._connectHandles.length;
		for (var i = 0; i < connectHandlesLength; i++) {
			dojo.disconnect(this._connectHandles[i]);
		}
	},
	/*
		Function: addObserver
		
		Defines and adds an observer to the Controller.
		
		Parameters:
			srcObj - {object} 
			srcFunc - {string} 
			cmdName - {string} 
			paramsObj - {object|function}
			
		Example:
			(start code)
			// observing an button, and firing a message onclick
			this.addObserver("#button", "onclick", "Messaging", function(context, caller) { return { 
				topic: "hello", message: {from: caller}
			}});
			
			(end)
	*/
	addObserver: function(srcObj, srcFunc, cmdName, paramsObj) {
		var isArrayOfStrings = function(srcObj) {
			if(!dojo.isArray(srcObj)) return false;

			for(var i = 0, len = srcObj.length; i < len; i++) {
				if(typeof(srcObj[i]) != 'string') return false;
			}
			return true;
		};
		
		if (!srcObj) {
			return;
		}
		if(!srcFunc) {
			throw new Error("ERROR mojo.controller.Controller.addObserver - srcFunc is not set");
		}
		
		if(typeof(srcFunc) != "string") {
			throw new Error("ERROR mojo.controller.Controller.addObserver - srcFunc is not type String");	
		}
		
		if(!cmdName) {
			throw new Error("ERROR mojo.controller.Controller.addObserver - cmdName is not set");
		}
		
		if(typeof(cmdName) != "string" && cmdName != null) {
			throw new Error("ERROR mojo.controller.Controller.addObserver - cmdName is not type String");
		}
		
		if (typeof(srcObj) == "string" || isArrayOfStrings(srcObj)) {
			if (!dojo.isArray(srcObj)) {
				srcObj = [srcObj];
			}
			for(var i = 0, len = srcObj.length; i < len; i++) {
				var tmpQuery = srcObj[i];
				// event delegation only works for events that bubble: onclick, onmouse*, onkey*, onmove*, etc.
				if (this.getContextElement() && srcFunc.match(/^onclick|onmouse|onkey|onmove/) != null) {
					// store css query for comparison later in event delegation
					this._addObserver(this.getContextElement(), srcFunc, [{cmdName: cmdName, paramsObj: paramsObj, eventDelegate: tmpQuery}]);
				} else {
					if (!this._queryCache[tmpQuery]) {
						// if string, treat as dom query
						this._queryCache[tmpQuery] = mojo.query(tmpQuery, this.getContextElement());
					}
					if (!this._observers[tmpQuery]) {
						this._observers[tmpQuery] = new Object();
					}
					if (!this._observers[tmpQuery][srcFunc]) {
						this._observers[tmpQuery][srcFunc] = new Array();
					}
					var obsLength = this._observers[tmpQuery][srcFunc].length;
					this._observers[tmpQuery][srcFunc][obsLength] = {cmdName: cmdName, paramsObj: paramsObj};
				}
			}
		} else {
			if (!dojo.isArray(srcObj)) {
				srcObj = [srcObj];
			}
			for (var i = 0, len = srcObj.length; i < len; i++) {
				this._addObserver(srcObj[i], srcFunc, [{cmdName: cmdName, paramsObj: paramsObj}]);
			}
			
		}
	
		if(!(this._commands[cmdName]) || this._commands[cmdName] == null) {
			throw new Error("ERROR mojo.controller.Controller.addObserver - cmdName does not reference a Command in the Controller");
		}
		
	},
	_addObserver: function(srcObj, srcFunc, cmds) {
		// add observer references to be cleaned-up onunload of page
		mojo.controller.Map.getInstance()._mojoRefs.push(srcObj);
		// create batch of un-added observers
		var observerBatch = new Array(); 
		var cmdsLength = cmds.length;
		for (var i = 0; i < cmdsLength; i++) {
			// normalize event delegate property, and use to properly differentiate tagged observers
			if (typeof(cmds[i].eventDelegate) == "undefined") {
				cmds[i].eventDelegate = "";
			}
			if (!this._observerIsTagged(srcObj, srcFunc + cmds[i].eventDelegate, cmds[i])) {
				observerBatch.push(cmds[i]);
				this._tagObserver(srcObj, srcFunc + cmds[i].eventDelegate, cmds[i]);
			}
		}
		
		if(!srcObj.mojoObservers) srcObj.mojoObservers = new Object();
		if(!srcObj.mojoObservers[srcFunc]) srcObj.mojoObservers[srcFunc.toLowerCase()] = new Array();
		
		if (observerBatch.length > 0) {		
			// add batch of observers
			var __this = this;
			var eventFunc = function(e) {
				var getEventTarget = function(e) {
					var e = e || window.event;
					var target = e.target || e.srcElement;
					if (target.nodeType == 3) { // defeat Safari bug
						target = target.parentNode;
					}
					return target;
				}
				if (__this.getContextElement() && __this.getContextElement().parentNode == null) {
					// if controller has been removed from view, remove all observers
					__this.removeObservers();
				} else {
					var observerBatchLength = observerBatch.length;
					for (var i = 0; i < observerBatchLength; i++) {
						if(typeof(mojo) != "undefined") {
							var callerObj = srcObj;
							if (observerBatch[i].eventDelegate.length > 0) {
								// compare stored css query against event target. Fire commands only if target matches
								var target = getEventTarget(e);
								callerObj = mojo.queryMatch(target, observerBatch[i].eventDelegate, __this.getContextElement(), true);
							}
							if (callerObj != null) {
								var requestObj = __this._setRequest(observerBatch[i].paramsObj, callerObj, e, observerBatch[i].cmdName);
								__this.fireCommandChain(observerBatch[i].cmdName, requestObj);
							}
						}
					}
				}
			};
			
			var lowercasedSrcFunc = srcFunc.toLowerCase();
			if((lowercasedSrcFunc == 'onmouseleave' || lowercasedSrcFunc == 'onmouseenter') && MooTools && Element.Events.mouseleave && Element.Events.mouseenter) {
			  $(srcObj).addEvent(srcFunc.replace('on',''), eventFunc);
			} else {
			  var handle = dojo.connect(srcObj, srcFunc, eventFunc);
			  // store connection handle needed disconnect event handler
			  this._connectHandles.push(handle);
			}
			srcObj.mojoObservers[srcFunc.toLowerCase()].push(eventFunc);
		}
	},
	_tagObserver: function(srcObj, srcFunc, cmd) {
		if (!srcObj.mojoObserve) {
			srcObj.mojoObserve = new Object();
		}
		if (typeof srcObj.mojoObserve[this.declaredClass] == "undefined") {
			var tagsLength = this._tags.length;
			srcObj.mojoObserve[this.declaredClass] = tagsLength;
			this._tags[tagsLength] = new Object();
		}
		var tagIndex = srcObj.mojoObserve[this.declaredClass];
		var tagKey = this._generateTagKey(srcFunc, cmd);
		if (this._tags[tagIndex] && !this._tags[tagIndex][tagKey]) {
			this._tags[tagIndex][tagKey] = true;
		}
	},
	_generateTagKey: function(srcFunc, cmd) {
		var tagKey = srcFunc + "_" + cmd.cmdName;
		if (cmd.paramsObj) {
			var serializeRequest;
			if (typeof(cmd.paramsObj) == "function") {
				serializeRequest = cmd.paramsObj.toString();
			} else if (typeof(cmd.paramsObj) == "object") {
				for (var key in cmd.paramsObj) {
				    if (cmd.paramsObj[key]) {
					    serializeRequest += key + ":" + cmd.paramsObj[key].toString() + ",";
					}
				}
			}
			tagKey += "_" + serializeRequest;
		 }
		return tagKey;
	},
  	_observerIsTagged: function(srcObj, srcFunc, cmd) {
		if (!srcObj.mojoObserve) {
			srcObj.mojoObserve = new Object();
		}
		var isTagged = false;
		var tagKey = this._generateTagKey(srcFunc, cmd);
		if (typeof srcObj.mojoObserve[this.declaredClass] != "undefined" && this._tags[srcObj.mojoObserve[this.declaredClass]] && this._tags[srcObj.mojoObserve[this.declaredClass]][tagKey]) {
			isTagged = true;
		}
		return isTagged;
	},
	/*
		Function: addCommands
		
		Abstract function fired on instantiation of concrete implementation of Controller class. Used as container function for adding commands.

		Parameters:
			cmdName - {string}
			cmdObjPath - {string}
			
		Example:
			(start code)
			//See above for sample implementation usage.
			(end)
	*/
	addCommands: function() {
		throw new Error("ERROR mojo.controller.Controller.addCommands - addCommands() method is not implemented");
	},
	/*
		Function: addCommand
		
		Adds a command object to a Controller’s command registry. Commands are referenced via a reference name.
 		A single name can be associated with multiple Commands.
		
		Parameters:
			cmdName - {string}
			cmdObjPath - {string}
	*/
	addCommand: function(cmdName, cmdObjPath) {
		if(!cmdName) {
			throw new Error('ERROR mojo.controller.Controller.addCommand - cmdName is not set');
		}
		
		if(typeof(cmdName) != "string") {
			throw new Error('ERROR mojo.controller.Controller.addCommand - cmdName is not type String');
		}
		
		if(!cmdObjPath) {
			throw new Error('ERROR mojo.controller.Controller.addCommand - cmdObjPath is not set');
		}
		
		if(typeof(cmdObjPath) != "string") {
			throw new Error('ERROR mojo.controller.Controller.addCommand - cmdObjPath is not type String');
		}
	
		if (!this._commands[cmdName]) {
			this._commands[cmdName] = new Array();
		}
		var addFunc = function(cmdName, cmdObjPath, thisObj) {
			// import the command
			dojo.require(cmdObjPath);
			// instantiate command
			var cmdObj = eval("new " + cmdObjPath + "()");
			if( (cmdObj instanceof mojo.command.Command) || (cmdObj instanceof mojo.command.Rule) || (cmdObj instanceof mojo.command.Behavior) ) {
				thisObj._commands[cmdName].push(cmdObj);
			} else {
				throw new Error('ERROR mojo.controller.Controller.addCommand - Command object is not type mojo.command.Command or mojo.command.Behavior or mojo.command.Rule');
			}
		};
		addFunc(cmdName, cmdObjPath, this);
		
	},
	/*
		Function: getCommand
		
		Retrieves the first command associated with the reference name.
		
		Parameters:
			cmdName - {string}
			
		Returns:
			{string} Command Name
			
		Example:
			(start code)
			// observing a function in a Command
			this.addObserver(this.getCommand("GetProfile"), "onResponse", "ProfileCompleted");
			(end)
	*/
	getCommand: function(cmdName) {
		if(!cmdName) {
			throw new Error("ERROR mojo.controller.Controller.getCommand - cmdName is not set");
		}
		
		if(typeof(cmdName) != "string") {
			throw new Error('ERROR mojo.controller.Controller.getCommand - cmdName is not type String');
		}
		
		if (this._commands[cmdName]) {
			return this._commands[cmdName][0];
		} 
		
		throw new Error("ERROR mojo.controller.Controller.getCommand - cmdName does not reference a Command in the Controller");
	
	},
	/*
		Function: getCommandChain
		
		Retrieves a set of Mojo Command Objects based on a specified command name.
		
		Parameters:
			cmdName - {string}
		
		Returns:
			{object array} Array of Mojo Command Objects
	*/
	getCommandChain: function(cmdName) {
		
		if(!cmdName) {
			throw new Error("ERROR mojo.controller.Controller.getCommandChain - cmdName is not set");
		}
		
		if(typeof(cmdName) != "string") {
			throw new Error("ERROR mojo.controller.Controller.getCommandChain - cmdName is not type String");
		}
		
		if(!this._commands[cmdName]) {
			throw new Error("ERROR mojo.controller.Controller.getCommandChain - cmdName does not reference a Command in the Controller");
		}
		
		if (this._commands[cmdName]) {
			return this._commands[cmdName];
		} 
		return null;
	},
	/*
		Function: fireCommandChain
		
		Executes all Command instances associated with the command name.
	
		Parameters:
			cmdName - {string}
			requestObj - {mojo.controller.Request}						
	*/
	fireCommandChain: function(cmdName, requestObj) {
		var commandChainLength = this._commands[cmdName].length;
		for (var i = 0; i < commandChainLength; i++) {
			this._commands[cmdName][i]._execute(requestObj);
		}
	},
	/*
		Function: addIntercepts
		
		Abstract function fired on instantiation of concrete implementation of Controller class. Used as a container for adding intercepts.
	
		Parameters:
			interceptType - {string} Supports Intercepting "before|after|around".
			interceptCmdName - {string} The reference name of the Command to intercept.
			cmdName - {string} The reference name of the Command to inject when intercepting.
			paramsObj - {object|function} Optional parameters to send via the Command request.
			
		Example:
			(start code)
			// inside a controller implementation
			//...
			addIntercepts: function() {
				// intercept the UpdateProfile Command, and Validate it before it fires
				this.addIntercept("around", "UpdateProfile", "ValidateProfile", function() { return {
				formSet: mojo.queryFirst("#profile-form")
			}});
			//...

			(end)
			
	*/
	addIntercepts: function() {
		throw new Error("ERROR mojo.controller.Controller.addIntercepts - addIntercepts() method is not implemented");
	},
	/*
		Function: addIntercept
		
		Adds an intercept to inject a Command before, after or around another Command when it has been triggered.
		
		Parameters:
			interceptType - {string} Supports Intercepting "before|after|around".
			interceptCmdName - {string} The reference name of the Command to intercept.
			cmdName - {string} The reference name of the Command to inject when intercepting.
			paramsObj - {object|function} Optional parameters to send via the Command request.
		
		Example:
			(start code)
			// inside a controller implementation
			//...
			addIntercepts: function() {
				// intercept the UpdateProfile Command, and Validate it before it fires
				this.addIntercept("around", "UpdateProfile", "ValidateProfile", function() { return {
				formSet: mojo.queryFirst("#profile-form")
			}});
			//..
			(end)
		
	*/
	addIntercept: function(interceptType, interceptCmdName, cmdName, paramsObj) {

		if(!interceptType) {
			throw new Error('ERROR mojo.controller.Controller.addIntercept - interceptType is not set');
		}
		
		if(typeof(interceptType) != "string") {
			throw new Error('ERROR mojo.controller.Controller.addIntercept - interceptType is not type String');
		}
		
		if(interceptType == "before" || interceptType == "after" || interceptType == "around") {
			//Pass
		} else {
			//If we don't have valid intercept types, throw the error.
			throw new Error('ERROR mojo.controller.Controller.addIntercept - interceptType is not "before", "after", or "around"');
		}
		
		if(!interceptCmdName) {
			throw new Error('ERROR mojo.controller.Controller.addIntercept - interceptCmdName is not set');
		}
		
		if(typeof(interceptCmdName) != "string") {
			throw new Error('ERROR mojo.controller.Controller.addIntercept - interceptCmdName is not type String');
		}
		
		
		if(!cmdName) {
			throw new Error('ERROR mojo.controller.Controller.addIntercept - cmdName is not set');
		}
		
		if(typeof(cmdName) != "string") {
			throw new Error('ERROR mojo.controller.Controller.addIntercept - cmdName is not type String');
		}

		if(interceptCmdName.toString() == cmdName.toString()) {
			throw new Error('ERROR mojo.controller.Controller.addIntercept - a command cannot add advice to itself');
		}
		
		if(!this._commands[interceptCmdName]) {
			throw new Error('ERROR mojo.controller.Controller.addIntercept - interceptCmdName does not reference a Command in the Controller');
		}
		
		if(!this._commands[cmdName]) {
			throw new Error('ERROR mojo.controller.Controller.addIntercept - cmdName does not reference a Command in the Controller');
		}
		



		var __this = this;
		var originalFunc = this.getCommand(interceptCmdName)["_execute"];
		var interceptFunc = function(invocation) {
			if(typeof(mojo) != "undefined") {
				requestObj = __this._setRequest(paramsObj, invocation.args[0].callerObj, invocation.args[0].eventObj, cmdName, invocation);
				__this.fireCommandChain(cmdName, requestObj);
			}
		};
		switch(interceptType) {
			case "before":
				this._commands[interceptCmdName][0]["_execute"] = function() {
					var invocation = {args: arguments, calleeObj: this};
					interceptFunc.apply(this, [invocation]);
					return originalFunc.apply(this, arguments);
				};
				break;
			case "after":
				this._commands[interceptCmdName][0]["_execute"] = function() {
					var invocation = {args: arguments, calleeObj: this};
					originalFunc.apply(this, arguments);
					return interceptFunc.apply(this, [invocation]);
				};
				break;
			case "around":
				this._commands[interceptCmdName][0]["_execute"] = function() {
					var invocation = {args: arguments, calleeObj: this};
					invocation.proceed = function() {
						return originalFunc.apply(this.calleeObj, this.args);
					};
					return interceptFunc.apply(this, [invocation]);
				};
				break;
		}		
	
	},
	_setRequest: function(paramsObj, callerObj, eventObj, cmdName, invocation) {
    		var requestObj = new mojo.controller.Request(paramsObj, callerObj, eventObj, cmdName, this, invocation);
		return requestObj;
	}
});
/*
	Function: updateObservers
	
	Static function. Re-adds all observers for a particular Controller. If no Controller is specified, all Controllers in application are updated.
	
	Parameters:
		controllerName - {string} (optional)
		
	Example:
		(start code)
		// update all observers for all controllers
		mojo.controller.Controller.updateObservers();
		
		(end)
*/
mojo.controller.Controller.updateObservers = function(controllerName) {
	if (controllerName) {
		mojo.Messaging.publish("/mojo/controller/" + controllerName + "/addObservers");
	} else {
		mojo.Messaging.publish("/mojo/controller/addObservers");
	}
};
