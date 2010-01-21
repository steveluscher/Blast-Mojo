/*!
 * Blast Mojo Framework
 * Available under the MIT License
 *
 * Copyright (c) 2007-2009, Blast Radius Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var mojo = {
  Version: '1.1.4'
};

/*
	Class: mojo
	Note: These functions reside within the mojo.* namespace.
*/

dojo.provide("mojo.evaluateClassPath");
/*
	Function: evaluateClassPath
	
	Returns the variable denoted by a dot-separated classpath
	
	Parameters:
		classPath - {string}
	
	Returns:
		{Mixed} variable

	Example:
		(start code)
		// instantiate an object by classpath without using eval
		var myObjectClassPath = 'stdlib.controller.TemplateController';
    var myObjectInstance = new mojo.evaluateClassPath(myObjectClassPath)();
		(end)
*/
mojo.evaluateClassPath = function(classPath) {
	var classPathParts = classPath.split('.');
	
	var variable = window;
	for(var len=classPathParts.length, i=0; i < len; i++) {
	  if(variable) variable = variable[classPathParts[i]];
	}
	return variable;
};

/*
	Class: Behavior

	An abstract class used in implementing Mojo Behaviors. A Behavior is an object that encapsulates functionality for controlling and manipulating UI interaction/reaction.

	Example:
		(start code)
		dojo.provide("sample.behavior.ClearFormBehavior");

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

	if(!requestObj.getParams() && typeof(requestObj.getParams()) == "boolean") return;
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
					if(targetEl.style.display == 'none') {
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
/*
   Class: Command

	An abstract class used in implementing Mojo Commands. A Command is an object that encapsulates
	functionality for processing data and/or business logic.

	Example:
		(start code)
		dojo.provide("sample.command.LoadHtmlCommand");
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
/*
	Class: Rule

	An abstract class used in implementing Mojo Rule. A Rule is an object used for encapsulating a conditional statement.

	Example:
		(start code)
		dojo.provide("sample.rule.MinimumAgeRule");

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
/*
	Class: Controller

	An abstract class used in implementing Mojo Controllers. A Controller is an object that encapsulates
	all event handling, Command managing and dispatching and intercepting in a Mojo application.

	Example:
		(start code)
		dojo.provide("sample.controller.ProfileController");

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
		var self = mojo.evaluateClassPath(this.declaredClass);
		var superclass = self.superclass;
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

			var handle = dojo.connect(srcObj, srcFunc, eventFunc);
			// store connection handle needed disconnect event handler
			this._connectHandles.push(handle);
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

		Adds a command object to a Controller�s command registry. Commands are referenced via a reference name.
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
			var commandObject = mojo.evaluateClassPath(cmdObjPath);
			// instantiate command
			var cmdObj = new commandObject();
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
/*
	Class: Map

	Singleton class for mapping Controllers to pages and/or DOM elements.

	Example:
		(start code)
		// sample JSON sitemap
		sample.SiteMap = [
			{pattern: "#menu-navigation",
			controllers: [
				{controller: "sample.controller.MenuController", params: {selected: 0}}
			]},
			{pattern: "home.htm",
			controllers: [
				{controller: "sample.controller.HomeController"}
			]}
		]
		// map controllers to Mojo application
		var sampleApp = mojo.controller.Map.getInstance();
		sampleApp.setSiteMap(sample.SiteMap);
		sampleApp.mapControllers(window.location.href);
		(end)
*/
dojo.provide("mojo.controller.Map");
__mojoControllerMap = null;
dojo.declare("mojo.controller.Map", null,
{


	/*
		Event: onComplete

		This event fires when the mapping of controllers completes.

	*/
	onComplete: function() {},
	/*
		Constructor: constructor

		Creates an instance of the mojo.controller.Map class.
	*/
  	constructor: function() {
  		mojo.Messaging.subscribe("/mojo/controller/mapControllers", this, "mapControllers");
  		// clean up mojo references onunload
  		dojo.addOnUnload(dojo.hitch(this, this._mojoCleanup));
  	},
	_controllers: new Array(),
	_siteMap: null,
	/*
		Function: getSiteMap

		Retrieves the JSON sitemap associated with the application.

		Returns:
			{object} siteMapObj

		Example:
			(start code)
			// get instance of mojo.controller.Map
			var map = mojo.controller.Map.getInstance();
			var sitemap = map.getSiteMap();
			(end)
	*/
	getSiteMap: function() {
		if (!this._siteMap)
			throw new Error('ERROR mojo.controller.Map - siteMap not set');

		return this._siteMap;
	},
	/*
		Function: setSiteMap

		Sets the JSON sitemap for the application.

		Parameters:
			siteMapObj - {object}

		Example:
			(start code)
			//See above for sample implementation usage.
			(end)
	*/
	setSiteMap: function(siteMapObj) {
		if(siteMapObj == null || typeof siteMapObj == 'undefined')
		  throw new Error("ERROR mojo.controller.Map.setSiteMap - siteMapObj parameter is required");

	  	var failSiteMapObjValidation = function() {
			throw new Error('ERROR mojo.controller.Map.setSiteMap - siteMapObj parameter must consist of patterns in the format {pattern: "pattern", controllers: [{controller: "controller.path"}]}');
		};
		if (!dojo.isArray(siteMapObj)) failSiteMapObjValidation();
		for (var i = 0, len = siteMapObj.length; i < len; i++) {
			var patternObj = siteMapObj[i];
			if (typeof patternObj.pattern == "undefined" || patternObj.pattern == null) failSiteMapObjValidation();
			if(!dojo.isArray(patternObj.controllers)) failSiteMapObjValidation();
			for(var j = 0, len = patternObj.controllers.length; j < len; j++) {
				if(typeof patternObj.controllers[j].controller == 'undefined' || !dojo.isString(patternObj.controllers[j].controller) || patternObj.controllers[j].controller == '') failSiteMapObjValidation();
			}
		}

		for(pattern in siteMapObj) {

		}

  	this._siteMap = siteMapObj;
	},
	/*
		Function: mapControllers

		Traverses the associated SiteMap configuration, and maps Controllers to pages and/or DOM elements.

		Parameters:
			mapContextObj - {string | object} (optional)

		Example:
			(start code)
			//See above for sample implementation usage.
			(end)
	*/
	mapControllers: function(mapContextObj) {
		var siteMap = this.getSiteMap();
		var siteMapLength = siteMap.length;
		for (var i = 0; i < siteMapLength; i++) {
			var pattern = siteMap[i].pattern;
			if (typeof(pattern) == "string") {
				var contextElementList = [];
				if (mapContextObj && typeof(mapContextObj) == "object") {
					contextElementList = mojo.query(pattern, mapContextObj);
				} else {
					contextElementList = mojo.query(pattern);
				}
				var contextElementListLength = contextElementList.length;
				for (var j = 0; j < contextElementListLength; j++) {
					this._mapControllers(siteMap[i].controllers, contextElementList[j]);
				}
			} else if (typeof(pattern) == "function" || typeof(pattern) == "object") {
				if (mapContextObj && typeof(mapContextObj) == "string") {
					var regex = new RegExp(pattern);
					if (regex.test(mapContextObj)) {
						this._mapControllers(siteMap[i].controllers);
					}
				}
			} else {
				alert(pattern);
				throw new Error("ERROR mojo.controller.Map - siteMap contains invalid pattern");
			}
		}
		// call a function which can be hooked into once all the controllers have been mapped
  		this.onComplete();
	},
	_mojoRefs: [],
	_mojoCleanup: function() {
		// Fix memory leaks in IE, remove any circular references
		this._mojoRefs.push(document);
		this._mojoRefs.push(document.body);
		this._mojoRefs.push(document.documentElement);
		document.head = document.extend = document.getElementsBySelector = null;
		for (var i = 0; i < this._mojoRefs.length; i++) {
			var el = this._mojoRefs[i];
			if (!el) { continue; }
			if (el.mojoObservers) {
				for (var handlerName in el.mojoObservers) {
					el[handlerName] = null;
				}
			}
			el.mojoControllers = el.mojoObservers = el.mojoObserve = null;
		}
	},
	_mapControllers: function(controllers, contextElementObj) {
		var controllersLength = controllers.length;
		for (var i = 0; i < controllersLength; i++) {
			var controllerName = controllers[i].controller;
			var controllerParams = controllers[i].params;
			// if in debug mode, catch and log exceptions. if in production mode, remove to improve runtime performance
			if (dojo.config && dojo.config.isDebug) {
				try {
					this.mapController(controllerName, contextElementObj, controllerParams);
				} catch(ex) {
					console.debug("EXCEPTION: " + ex.message + " in mojo.controller.Map.mapController() for controller: " + controllerName);
				}
			} else {
				this.mapController(controllerName, contextElementObj, controllerParams);
			}
		}
	},
	/*
		Function: mapController

		Initializes a controller, and associates it with a specified context.

		Parameters:
			controllerName - {string}
			contextElementObj - {DOMElement} (optional)

	*/
	mapController: function(controllerName, contextElementObj, controllerParams) {
		if(controllerName == null || typeof controllerName == 'undefined')
  	  	throw new Error('ERROR mojo.controller.Map.mapController - controllerName parameter is required');
  		if(!dojo.isString(controllerName) || controllerName == '')
  	  	throw new Error('ERROR mojo.controller.Map.mapController - controllerName parameter must be a non-empty string');

		// import the controller
		dojo.require(controllerName);
		var controllerObject = mojo.evaluateClassPath(controllerName);
		if (contextElementObj) {		
			if (!contextElementObj.mojoControllers) {
				contextElementObj.mojoControllers = {};
			}
			if (!contextElementObj.mojoControllers[controllerName]) { // store controller in context object
				contextElementObj.mojoControllers[controllerName] = new controllerObject(contextElementObj, controllerParams);
				if (!(contextElementObj.mojoControllers[controllerName] instanceof mojo.controller.Controller))
				  throw new Error('ERROR mojo.controller.Map.mapController - "'+controllerName+'" must be an instance of mojo.controller.Controller');
			}
		} else if (!this._controllers[controllerName]) { // store page-level controller in controller.Map
			this._controllers[controllerName] = new controllerObject(null, controllerParams);
			if (!(this._controllers[controllerName] instanceof mojo.controller.Controller))
			  throw new Error('ERROR mojo.controller.Map.mapController - "'+controllerName+'" must be an instance of mojo.controller.Controller');
		}
	}
});

/*
	Function: mapControllers

	Static function. Re-maps controllers based on the associated SiteMap

	Parameters:
		mapContextObj - {object} (optional)

	Example:
		(start code)
		// re-map controllers
		mojo.controller.Map.mapControllers();
		(end)
*/
mojo.controller.Map.mapControllers = function(mapContextObj) {
	mojo.Messaging.publish("/mojo/controller/mapControllers", [mapContextObj]);
};
/*
	Function: getInstance

	Static function. Returns the instance of the mojo.controller.Map singleton object

	Returns:
		{object} mojo.controller.Map object

	Example:
		(start code)
		// get instance of mojo.controller.Map
		var map = mojo.controller.Map.getInstance();
		(end)
*/
mojo.controller.Map.getInstance = function() {
	if (__mojoControllerMap == null) {
		__mojoControllerMap = new mojo.controller.Map();
	}
	return __mojoControllerMap;
};
/*
	Class: Param

	Class representation of a Controller Param instance. Param object provides methods for getting, setting, and validating parameters,
	as well as can be observed in a Controller.

*/
dojo.provide("mojo.controller.Param");
dojo.declare("mojo.controller.Param", null,
{
	/*
		Function: constructor

		Creates an instance of the mojo.controller.Param class.

		Parameters:
			name - {string}
			defaultValue - {object}
			required -  {boolean}
			type - {type}
			paramsRootObj - {object}
	*/
	constructor: function(name, defaultValue, required, type, paramsRootObj) {
		this._value = null;
		this._defaultValue = null;
		this._params = null;
		this._type = null;

		this._name = name;
		this._defaultValue = defaultValue;
		if (type) this._type = type;
		if (paramsRootObj) this._params = paramsRootObj;
		this.setValue(this._defaultValue);
		if (typeof required == "boolean") this._required = required;
	},
	_name: null,
	_value: null,
	_defaultValue: null,
	_required: false,
	_type: null,
	_params: null,
	/*
		Function: getName

		Returns the name of the parameter.

		Returns:
			{string} name
	*/
	getName: function() {
		return this._name;
	},
	/*
		Function: getValue

		Returns the value of the parameter.

		Returns:
			{object} value
	*/
	getValue: function() {
		return this._value;
	},
	/*
		Function: setValue

		Sets the value of the parameter, and fires the onChange event if the value has changed.

		Parameters:
			value - {object}
	*/
	setValue: function(value) {
		var validate = mojo.helper.Validation.getInstance();
		var required = this.getRequired();
		var type = this.getType();
		// check required and type
		if (required && !validate.isRequired(value)) {
			throw new Error("ERROR mojo.controller.Param.setValue - value parameter is required")
		}
		// don't set to undefined
		if (typeof value == "undefined") {
			return;
		}
		if (type && !validate.isType(value, {type: type})) {
			throw new Error("RROR mojo.controller.Param.setValue - value parameter is invalid type");
		}
		if (this.getValue() != value) {
			this._value = value;
			this.onChange();
			if (this._params != null && this._params["onChange"]) {
				this._params.onChange();
			}
		}
	},
	/*
		Function: getDefaultValue

		Returns the default value of the parameter.

		Returns:
			{object} value
	*/
	getDefaultValue: function() {
		return this._defaultValue;
	},
	/*
		Function: getRequired

		Returns whether or not the parameter is required.

		Returns:
			{boolean} required
	*/
	getRequired: function() {
		return this._required;
	},
	/*
		Function: getType

		Returns the data type of the parameter

		Returns:
			{type} type
	*/
	getType: function() {
		return this._type;
	},
	/*
		Event: onChange

		This event fires when the parameter value has changed.
	*/
	onChange: function() {
	}
});
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
/*
 	Class: Inflector

	Utility methods for pluralizing strings and ordinalizing numbers.
*/
dojo.provide("mojo.helper.Inflector");

var __mojoInflector = null;

dojo.declare('mojo.helper.Inflector', null, {
	Inflections: {
		plural: [
		  [/(quiz)$/i,               "$1zes"  ],
		  [/^(ox)$/i,                "$1en"   ],
		  [/([m|l])ouse$/i,          "$1ice"  ],
		  [/(matr|vert|ind)ix$|ex$/i, "$1ices" ],
		  [/(x|ch|ss|sh)$/i,         "$1es"   ],
		  [/([^aeiouy]|qu)y$/i,      "$1ies"  ],
		  [/(hive)$/i,               "$1s"    ],
		  [/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
		  [/sis$/i,                  "ses"    ],
		  [/([ti])um$/i,             "$1a"    ],
		  [/(buffal|tomat)o$/i,      "$1oes"  ],
		  [/(bu)s$/i,                "$1ses"  ],
		  [/(alias|status)$/i,       "$1es"   ],
		  [/(octop|vir)us$/i,        "$1i"    ],
		  [/(ax|test)is$/i,          "$1es"   ],
		  [/s$/i,                    "s"      ],
		  [/$/,                      "s"      ]
		],
		singular: [
		  [/(quiz)zes$/i,                                                    "$1"     ],
		  [/(matr)ices$/i,                                                   "$1ix"   ],
		  [/(vert|ind)ices$/i,                                               "$1ex"   ],
		  [/^(ox)en/i,                                                       "$1"     ],
		  [/(alias|status)es$/i,                                             "$1"     ],
		  [/(octop|vir)i$/i,                                                 "$1us"   ],
		  [/(cris|ax|test)es$/i,                                             "$1is"   ],
		  [/(shoe)s$/i,                                                      "$1"     ],
		  [/(o)es$/i,                                                        "$1"     ],
		  [/(bus)es$/i,                                                      "$1"     ],
		  [/([m|l])ice$/i,                                                   "$1ouse" ],
		  [/(x|ch|ss|sh)es$/i,                                               "$1"     ],
		  [/(m)ovies$/i,                                                     "$1ovie" ],
		  [/(s)eries$/i,                                                     "$1eries"],
		  [/([^aeiouy]|qu)ies$/i,                                            "$1y"    ],
		  [/([lr])ves$/i,                                                    "$1f"    ],
		  [/(tive)s$/i,                                                      "$1"     ],
		  [/(hive)s$/i,                                                      "$1"     ],
		  [/([^f])ves$/i,                                                    "$1fe"   ],
		  [/(^analy)ses$/i,                                                  "$1sis"  ],
		  [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
		  [/([ti])a$/i,                                                      "$1um"   ],
		  [/(n)ews$/i,                                                       "$1ews"  ],
		  [/s$/i,                                                            ""       ]
		],
		irregular: [
		  ['move',   'moves'   ],
		  ['sex',    'sexes'   ],
		  ['child',  'children'],
		  ['man',    'men'     ],
		  ['person', 'people'  ],
		  ['cow',    'kine']
		],
		uncountable: [
		  "sheep",
		  "fish",
		  "series",
		  "species",
		  "money",
		  "rice",
		  "information",
		  "equipment"
		]
	},

	ordinalize: function(number) {
		if (11 <= parseInt(number) % 100 && parseInt(number) % 100 <= 13) {
		  return number + "th";
		} else {
		  switch (parseInt(number) % 10) {
		    case  1: return number + "st";
		    case  2: return number + "nd";
		    case  3: return number + "rd";
		    default: return number + "th";
		  }
		}
	},

	pluralize: function(word) {
		for (var i = 0; i < this.Inflections.uncountable.length; i++) {
		  var uncountable = this.Inflections.uncountable[i];
			if (word.toLowerCase() == uncountable) {
		    return uncountable;
		  }
		}
		for (var i = 0; i < this.Inflections.irregular.length; i++) {
			var singular = this.Inflections.irregular[i][0];
		  var plural   = this.Inflections.irregular[i][1];
		  var endMatch = new RegExp(singular+'$');
			if (endMatch.test(word.toLowerCase()) || word == plural) {
		    return word.replace(endMatch, plural);
		  }
		}
		for (var i = 0; i < this.Inflections.plural.length; i++) {
		  var regex          = this.Inflections.plural[i][0];
		  var replace_string = this.Inflections.plural[i][1];
		  if (regex.test(word)) {
	     return word.replace(regex, replace_string);
		  }
		}
	},

	singularize: function(word) {
    for (var i = 0; i < this.Inflections.uncountable.length; i++) {
      var uncountable = this.Inflections.uncountable[i];
      if (word.toLowerCase == uncountable) {
        return uncountable;
      }
    }
    for (var i = 0; i < this.Inflections.irregular.length; i++) {
      var singular = this.Inflections.irregular[i][0];
      var plural   = this.Inflections.irregular[i][1];
      var endMatch = new RegExp(plural+'$');
			if ((endMatch.test(word.toLowerCase())) || (word == plural)) {
        return word.replace(endMatch, singular);
      }
    }
    for (var i = 0; i < this.Inflections.singular.length; i++) {
      var regex          = this.Inflections.singular[i][0];
      var replace_string = this.Inflections.singular[i][1];
      if (regex.test(word)) {
        return word.replace(regex, replace_string);
      }
    }
		return word;
  }
});

mojo.helper.Inflector.pluralize = function(string) {
    var inflector = mojo.helper.Inflector.getInstance();
		return inflector.pluralize(string);
}

mojo.helper.Inflector.singularize = function(string) {
    var inflector = mojo.helper.Inflector.getInstance();
		return inflector.singularize(string);
}

mojo.helper.Inflector.ordinalize = function(number) {
    var inflector = mojo.helper.Inflector.getInstance();
		return inflector.ordinalize(number);
}

/*
	Function: getInstance

	Static function--Retrieves a Mojo Inflector instance.

	Example:
		(start code)
		var myInflector = mojo.helper.Inflector.getInstance();
		(end)

	Returns:
		{object} mojo.helper.Inflector
*/
mojo.helper.Inflector.getInstance = function() {
	if (__mojoInflector == null) {
		__mojoInflector = new mojo.helper.Inflector();
	}
	return __mojoInflector;
};
/*
	Class: Validation

	Singleton class containing validation methods for validating web forms.

	Example:
		(start code)
		// instantiate Validation singleton
		var validate = mojo.helper.Validation.getInstance();

		// create set of validation rules
		sample.rules.GalleryRules = {
			"title": [
				{rule: validate.isRequired, errorMsg: "field is required"},
				{rule: validate.isLength, errorMsg: "field must be less than 255 characters", params: {max: 255}}
			]
		}

		// execute validation, and get errors found
		var errors = validate.execute(sample.rules.GalleryRules, mojo.query("form"));

		(end)
*/
dojo.provide("mojo.helper.Validation");

var __mojoHelperValidation = null;
dojo.declare("mojo.helper.Validation", null,
{
	/*
		Function: isRequired

		Returns whether or not a value exists.

		Parameters:
			value - {string}

		Returns:
			{boolean}

	*/
	isRequired: function(value) {
		if (typeof value == "undefined" || value == null) return false;
		if (dojo.isString(value)) return dojo.string.trim(value).length > 0;
		return true;
	},
	/*
		Function: isType

		Returns whether or not a value is of a specified data type.

		Parameters:
			value - {string}
			paramsObj - {object}

		Returns:
			{boolean}

	*/
	isType: function(value, paramsObj) {
		switch(paramsObj.type) {
			case String:
				return (typeof value == "string" || value instanceof String);
				break;
			case Number:
				return (typeof value == "number" || value instanceof Number);
				break;
			case Boolean:
				return (typeof value == "boolean" || value instanceof Boolean);
				break;
			default:
				return (value instanceof paramsObj.type);
		}
	},
	/*
		Function: isEmailAddress

		Returns whether or not a value is valid email address syntax.

		Parameters:
			value - {string}

		Returns:
			{boolean}
	*/
	isEmailAddress: function(value) {
		if (value == null)
			throw new Error('ERROR mojo.helper.Validation.isEmailAddress - value parameter is required');
		if (!dojo.isString(value))
			throw new Error('ERROR mojo.helper.Validation.isEmailAddress - value parameter must be a non-empty string');
		value = value.replace(/^\s+|\s+$/g,""); //trim string value
		dojo.require("dojox.validate");
		dojo.require("dojox.validate.web");
		if (!dojox.validate.isEmailAddress(value, {}) || value.match(/[^\w-_@\.]/gi)) return false;
		return true;
	},
	/*
		Function: isEmailAddressList

		Returns whether or not a value is a valid email address list.

		Parameters:
			value - {string}

		Returns:
			{boolean}
	*/
	isEmailAddressList: function(value) {
		if (value == null)
			throw new Error('ERROR mojo.helper.Validation.isEmailAddressList - value parameter is required');
		if (!dojo.isString(value))
			throw new Error('ERROR mojo.helper.Validation.isEmailAddressList - value parameter must be a non-empty string');

		dojo.require("dojox.validate");
		dojo.require("dojox.validate.web");
		if (!dojox.validate.isEmailAddressList(value, {})) return false;
		return true;
	},
	/*
		Function: isUrl
		Check if a specified value is a URL.

		Parameters:
			value - {string}

		Returns:
			{boolean}

	*/
	isUrl: function(value) {
		if (value == null)
			throw new Error('ERROR mojo.helper.Validation.isUrl - value parameter is required');
		if (!dojo.isString(value))
			throw new Error('ERROR mojo.helper.Validation.isUrl - value parameter must be a non-empty string');

		dojo.require("dojox.validate");
		dojo.require("dojox.validate.web");
		return dojox.validate.isUrl(value, {allowLocal: true});
	},
	/*
		Function: isLength

		Returns wether or not a value length is within a specified range.

		Parameters:
			value - {string}
			paramsObj - {object}

		Returns:
			{boolean}
	*/
	isLength: function(value, paramsObj) {
		/*
			params:
			- min: minimum length. optional parameter. (default is 0)
			- max: maximum length. optional parameter. (default is unlimited)
		*/
		if ((value==null)||(value=="")) return true;
		if (!dojo.isString(value))
			throw new Error('ERROR mojo.helper.Validation.isLength - value parameter must be a string');

		if (paramsObj) {
			if (paramsObj.min && paramsObj.min > value.length) {
				return false;
			}
			if (paramsObj.max && paramsObj.max < value.length) {
				return false;
			}
		}
		return true;
	},
	/*
		Function: isRange

		Returns wether or not a numeric value is within a specified range.

		Parameters:
			value - {string}
			paramsObj - {object}

		Returns:
			{boolean}
	*/
	isRange: function(value, paramsObj) {
		/*
			params:
			- min: minimum length. optional parameter. (default is 0)
			- max: maximum length. optional parameter. (default is unlimited)
		*/
		if ((value==null)||(value=="")) return true;
		value = parseInt(value);
		if (isNaN(value)) {
			return false;
		}
		if (paramsObj) {
			if (typeof(paramsObj.min) == "undefined") {
				paramsObj.min = 0;
			}
			if (paramsObj.min > value) {
				return false;
			}
			if (typeof(paramsObj.max) != "undefined" && paramsObj.max < value) {
				return false;
			}
		}
		return true;
	},
	/*
		Function: isMatch

		Returns whether or not a value matches a specified regex expression.

		Parameters:
			value - {string}
			paramsObj - {object}

		Returns:
			{boolean}
	*/
	isMatch: function(value, paramsObj) {
		/*
			params:
			- regex: regular expression.
			- refValue: value to reference node.
		*/
		if ((value==null)||(value=="")) return true;

		if (paramsObj) {
			if (paramsObj.refValue) paramsObj.regex = "^" + paramsObj.refValue + "$";
			if (!(new RegExp(paramsObj.regex)).test(value)) return false;
		}

		return true;
	},
	/*
		Function: isZipCode

		Returns whether or not a value is a valid American zip code.

		Parameters:
			value - {string}
			notRequired - {boolean}

		Returns:
			{boolean}
	*/
	isZipCode: function(value) {
		var valid = "0123456789-";
		var hyphencount = 0;

		if ((value==null)||(value=="")) return true;

		if (value.length!=5 && value.length!=10) return false; // Value is not a 5 digit or 5 digit+4 zip code.

		for (var i=0; i < value.length; i++) {
			temp = "" + value.substring(i, i+1);
			if (temp == "-") hyphencount++;
			if (valid.indexOf(temp) == "-1") return false; // Invalid characters in the zip code
			if ((hyphencount > 1) || ((value.length==10) && ""+value.charAt(5)!="-")) return false; // The hyphen character should be used with a properly formatted 5 digit+four zip code. ie '12345-6789'
		}
		return true;
	},
	/*
		Function: isPostalCode

		Returns whether or not a value is a valid Canadian Postal code.

		Parameters:
			value - {string}

		Returns:
			{boolean}
	*/
	isPostalCode: function(value) {
		if (value == null)
			throw new Error('ERROR mojo.helper.Validation.isPostalCode - value parameter is required');
		if (!dojo.isString(value))
			throw new Error('ERROR mojo.helper.Validation.isPostalCode - value parameter must be a non-empty string');

		if (typeof value == "undefined" || value == null) return false;
		if (value.length == 6 && value.search(/^[a-zA-Z]\d[a-zA-Z]\d[a-zA-Z]\d$/) != -1) return true;
		else if (value.length == 7 && value.search(/^[a-zA-Z]\d[a-zA-Z](-|\s)\d[a-zA-Z]\d$/) != -1) return true;
		else return false;
		return true;
	},

	/*
		Function: execute

		Executes a set of validation rules against one or more web forms, and returns an array of errors found.

		Parameters:
			rulesObj - {object}
			domElmListObj - {Array of DOMElements}

		Returns:
			{Array of Error Objects}

		Example:
			(start code)
			//See above for sample implementation usage.
			(end)


	*/
	execute: function(rulesObj, domElmListObj) {
		if (typeof rulesObj == 'undefined' || rulesObj == null)
			throw new Error('ERROR mojo.helper.Validation.execute - rulesObj parameter is required');

		if (typeof domElmListObj == 'undefined' || domElmListObj == null)
			throw new Error('ERROR mojo.helper.Validation.execute - domElmListObj parameter is required');

		var failRulesObjValidation = function() {
			throw new Error('ERROR mojo.helper.Validation.execute - rulesObj parameter must consist of rules in the format {"inputName": [{rule: testFunction[, errorMsg: "msg"]}[, ...]]}');
		};

		if(!dojo.isArray(domElmListObj)) domElmListObj = [domElmListObj];

		for(rule in rulesObj) {
			if(!dojo.isArray(rulesObj[rule])) failRulesObjValidation();

			for(var i=0, len=rulesObj[rule].length; i<len; i++) {
				if(typeof rulesObj[rule][i].rule != 'function') failRulesObjValidation();
				if(typeof rulesObj[rule][i].error != 'undefined' && !dojo.isString(rulesObj[rule][i].error)) failRulesObjValidation();
			}
		}

    var nextElement = function (node, tagName) {
    	if (!node) {
    		return null;
    	}
    	do {
    		node = node.nextSibling;
    	} while (node && node.nodeType != 1);
    	if (node && tagName && tagName.toLowerCase() != node.tagName.toLowerCase()) {
    		return nextElement(node, tagName);
    	}
    	return node;
    };

		var elmList = new Array();
		var domElmListLength = domElmListObj.length;
		for (var i = 0; i < domElmListLength; i++) {
				var tmpList = mojo.query("*[name]", domElmListObj[i]);
				if (domElmListObj[i].name) {
					tmpList.push(domElmListObj[i]);
				}
				var tmpListLength = tmpList.length;
				for (var j = 0; j < tmpListLength; j++) {
					elmList.push(tmpList[j]);
				}
				elmList = mojo.distinct(elmList);
				var tmpErrList = mojo.query(".mojoValidationError", domElmListObj[i]);
				var tmpNext = nextElement(domElmListObj[i], "SPAN");
				if (tmpNext != null && dojo.hasClass(tmpNext, "mojoValidationError")) {
					tmpErrList.push(tmpNext);
				}
				var tmpErrListLength = tmpErrList.length;
				for (var j = 0; j < tmpErrListLength; j++) {
					dojo._destroyElement(tmpErrList[j]);
				}
		}
		var isValid = true;
		var errorList = new Array();

		// recursively traverses upward nodes to decipher if node is shown or not
		var isShowing = function(node) {
			var result = true;
			while (node != null) {
			  if(dojo.style(node, 'visibility') == 'hidden' || dojo.style(node, 'display') == 'none') {
				  result = false;
					break;
				}
				node = (node.tagName == 'BODY') ? null : node.parentNode;
			}
			return result;
		};

		var elmListLength = elmList.length;
		// handle form groups (radio buttons / check boxes) by normalizing into a single element
		// only add error messaging to the last instance of the element
		var groups = {};
		for (var i = (elmListLength-1); i >= 0; i--) {
			var elm = elmList[i];
			if (elm.type == "radio" || elm.type == "checkbox") {
				elm.mojoValidationGroup = true;
				if (!groups[elm.name]) {
					groups[elm.name] = new Array();
				} else {
					elmList[i] = null;
				}
				if (elm.checked) {
					groups[elm.name].push((elm.value) ? elm.value : "checked");
				}
			}
		}
		for (var i = 0;  i < elmListLength; i++) {
			var elm = elmList[i];
			if (elm) {
				if (rulesObj[elm.name]) {
					var ruleChain = rulesObj[elm.name];
					var ruleChainLength = ruleChain.length;
					for (var j = 0; j < ruleChainLength; j++) {
						var ruleObj = ruleChain[j];
						if (ruleObj["force"] || (isShowing(elm) && !elm.disabled) || (elm.type && elm.type == "hidden")) {
							if (ruleObj.params && ruleObj.params.ref) {
								var tmpRefValue = mojo.queryFirst("*[name=\"" + ruleObj.params.ref + "\"]").value;
								if (tmpRefValue && tmpRefValue.length > 0) {
									ruleObj.params.refValue = tmpRefValue;
								}
							}
							var tmpElmValue = elm.value;
							if (elm.mojoValidationGroup) {
								// for groups, get concatenated value
								tmpElmValue = groups[elm.name].toString();
							}
							if (!(ruleObj.rule(tmpElmValue, ruleObj.params))) {
								var error = {element: elm, message: ruleObj["errorMsg"]};
								errorList.push(error);
								isValid = false;
								break;
							}
						}
					}
				}
			}
		}		return errorList;
	}
});

/*
	Function: getInstance

	Static function--Returns the instance of the mojo.helper.Validation singleton object.

	Returns:
		{object} mojo.helper.Validation
*/
mojo.helper.Validation.getInstance = function() {
	if (__mojoHelperValidation == null) {
		__mojoHelperValidation = new mojo.helper.Validation();
	}
	return __mojoHelperValidation;
};

/*
	DEPRECATED.
*/

dojo.provide("mojo.helper.view.Error");

mojo.helper.view.Error.showElementErrors = function(errorList, targetElement) {
	var errorListLength = errorList.length;
	for (var i = 0; i < errorListLength; i++) {
		var error = errorList[i];
		var err = document.createElement("span");
		err.className = "mojoValidationError";
		err.innerHTML = error.message;
		if (targetElement != null) {
			//dojo.place(err, targetElement, 'after');
			//targetElement.innerHTML = "";
			targetElement.appendChild(err);
		} else {
			if(error.element.type == "checkbox") {
				if(error.element.parentNode.tagName == "LABEL") {
					dojo.place(err, error.element.parentNode, 'after');
				} else {
					dojo.place(err, error.element, 'after');
				}
			} else {
				dojo.place(err, error.element, 'after');
			}

		}
	}
};
/*
 	Class: XML

	Utility methods for manipulating XML data.
*/
dojo.provide("mojo.helper.XML");


dojo.declare('mojo.helper.XML', null, {
	/*
		Constructor: constructor

		Creates an instance of the mojo.helper.XML class

		Parameters:
			xml - {string|XmlDocument} The XML to convert to a JavaScript object.
			params - {<mojo.helper.XML.params>} Optional parameters.

		Example:
			(start code)
			// instantiate new XML
			var xml = new mojo.helper.XML("<?xml version="1.0" encoding="UTF-8"?><nodes><upon/></nodes>");
			(end)
	*/
	constructor: function(xml, params) {
		if(typeof XMLDocument != 'undefined' && xml instanceof XMLDocument) {
			this.xmlDocument = xml;
		} else if(xml.readyState) { // Internet Explorer DOMDocument
			this.xmlDocument = xml;
		} else {
			if(window.ActiveXObject) {
			  this.xmlDocument = new ActiveXObject("Microsoft.XMLDOM");
			  this.xmlDocument.async = 'false';
			  this.xmlDocument.loadXML(xml);
			} else if(document.implementation && document.implementation.createDocument) {
				var xmlParser = new DOMParser();
			  this.xmlDocument = xmlParser.parseFromString(xml, 'text/xml');
			} else {
				throw new Error('ERROR mojo.helper.XML.constructor - This browser does not support XML parsing');
			}
		}

		this.params = new mojo.helper.XML.params();
		for(key in params) {
			this.params[key] = params[key];
		}
	},

	/*
		APIMethod: toObject

		Static function--Returns a JavaScript object representation of this instance of mojo.helper.XML

		Example:
			(start code)

			(end)
  */
	toObject: function() {
		var object = {};
		var rootNode = this.xmlDocument.documentElement;

		var contents = this._parseNode(rootNode);

		object[rootNode.nodeName] = contents;

		return object;
	},

	/*
		Method: parseNode

		Private function--Parses an XML node as a JavaScript object

		Parameters:
			node - {Element|Text|CDATASection} The node to parse

		Returns:
			A JavaScript object representation of the XML node
	*/
	_parseNode: function(node) {
		var object = null;
		var textualNode = true;
		var hasAttributes = false;

		// Look for comment nodes
		if(node.nodeType == 7) return;

		// Look for text nodes or CDATA sections
		if(node.nodeType == 3 || node.nodeType == 4) {
			if (this._isWhiteSpace(node.nodeValue)) return;

			return node.nodeValue;
  	}

		// Look for attributes
		if (node.attributes) {
			var len = node.attributes.length;
			if(len) {
				hasAttributes = true;
				if(!object) object = {};

	   	 	for(var i = 0; i < len; i++) {
	        object['@' + node.attributes[i].nodeName] = this._toJavaScriptType(node.attributes[i].nodeValue);
		    }
			}
		}

		// Recurse if the current node contains children
		if(node.childNodes) {
			var len = node.childNodes.length;

			if(len) {
				if(!object) object = {};

				// Determine if the current node contains only text nodes, or if its last node is a text node
				for(var i = 0; i < len; i++) {
					var childNodeType = node.childNodes[i].nodeType;
					textualNode = (childNodeType == 3 && !this._isWhiteSpace(node.childNodes[i].nodeValue));
				}

				// If the current node contains only text nodes, or the last node is a text node, flatten them now
				if(textualNode && !hasAttributes) {
					for(var i = 0; i < len; i++) {
						if(i == 0) {
							object = this._nodeToString(node.childNodes[i]);
						} else {
							object += this._nodeToString(node.childNodes[i]);
						}
					}
				} else {
					for(var i = 0; i < len; i++) {
						var parsedNode = this._parseNode(node.childNodes[i]);
						if(typeof parsedNode == 'undefined') continue;

						var nodeName = node.childNodes[i].nodeName;

						if(nodeName == '#cdata-section') nodeName = '#cdata';

						if(object[nodeName]) {
							if(!(object[nodeName] instanceof Array) && nodeName != '#cdata') {
								object[nodeName] = [object[nodeName]];
							}
							if(nodeName == '#cdata') {
								object[nodeName] += parsedNode;
							} else {
								object[nodeName].push(parsedNode);
							}
						} else {
							if(this._shouldInferArrays(node, object)) {
								object[nodeName] = [parsedNode];
							} else {
								object[nodeName] = parsedNode;
							}
						}
					}
				}
			}	else if(this._shouldInferArrays(node, object)) {
				if(!object) object = {};
				object[mojo.helper.Inflector.singularize(node.nodeName)] = [];
			}
		}

		return object;
	},

	_shouldInferArrays: function(node, object) {
		return (this.params.inferArrays
	         && (
						// parent node has a plural nodeName
						(mojo.helper.Inflector.pluralize(mojo.helper.Inflector.singularize(node.nodeName)) == node.nodeName)

						|| // OR

						// parent node has a numeric total attribute
						(object && Number(object['@total']).toString() != 'NaN')
					));
	},

	_isWhiteSpace: function(text) {
		return !text.match(/[^\x00-\x20]/);
	},

	/*
		Method: _nodeToString

		Private function--Returns a string representation of an XML node

		Parameters:
			node - {Element|Text|CDATASection} The node to parse

		Returns:
			A string representation of the XML node
	*/
	_nodeToString: function(node) {
		var nodeType = node.nodeType;
		var nodeName = node.nodeName;

		switch(nodeType) {
			// Element nodes
			case 1:
				// open the xml node
				str = '<' + nodeName;

				// write out attributes
				if(node.attributes) {
					var len = node.attributes.length;
					if(len) {
						for(var i = 0; i < len; i++) {
							var key = node.attributes[i].nodeName;
							var value = node.attributes[i].nodeValue || '';
							str += ' ' + key + '="' + value + '"';
						}
					}
				}

				// Check for content inside this node
				if(node.childNodes) {
					var len = node.childNodes.length;
					if(len) {
						var hasInnerXml = true;
						str += '>';
						for(var i = 0; i < len; i++) {
							str += this._nodeToString(node.childNodes[i]);
						}
					}
				}

				// Close the node
				if(hasInnerXml) {
					str += '</' + nodeName + '>';
				} else {
					str += '/>';
				}
				break;
			// Text nodes
			case 3:
				str = this._toJavaScriptType(node.nodeValue);
			  break;
			// CDATA nodes
			case 4:
			  str = '<![CDATA[' + node.nodeValue + ']]>';
				break;
		}

		return str;
	},

	/*
		Method _toJavaScriptType

		Private function--Detects common patterns and casts to proper JavaScript types where appropriate

		Parameters:
		  variable - {string} The string to search for a recognized JavaScript type

		Returns:
		  A JavaScript type, if detected. Otherwise, returns the original string.
	*/
	_toJavaScriptType: function(variable) {
		// Detect booleans
		if(variable.toLowerCase() == "false") return false;
		if(variable.toLowerCase() == "true") return true;

		// Detect octal numbers (0777, 0367)
		if(variable.match('0[0-7]{3}') && variable.indexOf("-")<=0) {
			var octal_number = parseInt(variable);
			return octal_number;
		}

		// Detect numbers (123, 123.456, 1.7976931348623157e+308, Infinity)
		var number = parseFloat(variable);
		if(number == variable) return number;

		// Detect hex numbers (0xFF)
		var hex_number = parseInt(variable);
		if(hex_number == variable) return hex_number;

		// Detect dates
		if (variable.match(/^[0-9]+[\- ][0-9]+[\- ][0-9]+/)) { // handle 2008-06-06 and 2008 6 6 format
			var date = new Date(variable.replace(/[\- ]/g, "/"));
		} else {
			var date = new Date(variable);
		}
		if(date instanceof Date && date.toString() != 'Invalid Date' && date.toString() != 'NaN') return date;

		return variable;
	}
});

/*
	APIMethod

	Class function--Returns a JavaScript object representation of the XML string or XmlDocument passed in

	Parameters:
		xml - {string|XmlDocument} The XML to convert to a JavaScript object.
		params - {<mojo.helper.XML.params>} Optional parameters.
*/
mojo.helper.XML.toObject = function(xml, params) {
	var xml = new mojo.helper.XML(xml, params);
	return xml.toObject();
};

/*
  Class: XML.params

	Parameters for XML manipulations.
*/
dojo.declare('mojo.helper.XML.params', null, {
	/**
	 * Property: inferArrays
	 * {Boolean} Determines whether or not the XML parser will treat unique nodes who are children of a parent with a plural nodeName, or children of a node with a total attribute, as those which should form part of an array. Defaults to true.
	 *
	 * Example:
	 * (start code)
	 * // Nodes who are children of a parent with a plural nodeName
	 * var objectWithInference = mojo.helpers.XML.toObject('<nodes><a>All By Myself</a></nodes>', { inferArrays: true }); // => {nodes: { a: ['All By Myself'] } }
	 * var objectWithoutInference = mojo.helpers.XML.toObject('<nodes><a>All By Myself</a></nodes>', { inferArrays: false }); // => {nodes: { a: 'All By Myself' } }
	 *
	 * // Nodes whose parent has a total attribute
	 * var objectWithInference = mojo.helpers.XML.toObject('<review_array total="1"><review>All By Myself</review></review_array>', { inferArrays: true }); // => {review_array: { review: ['All By Myself'] } }
	 * var objectWithoutInference = mojo.helpers.XML.toObject('<review_array total="1"><review>All By Myself</review></review_array>', { inferArrays: false }); // => {review_array: { review: 'All By Myself' } }
	 */
	inferArrays: true
});
/*
	Class: History

	Singleton class for managing browser history/state changes.
*/
dojo.provide("mojo.History");
var __mojoHistory = null;

dojo.declare("mojo.History", null,
{


  constructor: function() {
    var thisObj = this;
  	if (typeof rsh != "undefined" && rsh["dhtmlHistory"] && rsh["dhtmlHistory"]["_isIE"]) {
  		// use Real Simple History (RSH) library for IE
  		rsh.dhtmlHistory.init();
  		dojo.connect(rsh.dhtmlHistory, "_fireHistoryEvent", function(newHash) {
  			thisObj.setHash(newHash);
  			thisObj._execute();
  		});
  	} else {
  		this._interval = window.setInterval(function() {
  			thisObj._execute();
  		}, 100);
		}
	},
	_interval: null,
	_defaultHash: "",
	_savedHash: "",
	_paramsObj: null,
	_topic: null,
	/*
	   Event: onChange

		This event fires when the history changes state.
	*/
	onChange: function() {
	},
	/*
	   	Function: getHash

		Retrieves the hash of the current page url.

		Returns:
			{string} Hash

		Example:
			(start code)
			// if current location is: http://localhost/main#topic=news
			var currentHash = mojo.History.getInstance().getHash(); //returns "topic=news"
			(end)
	*/
	getHash: function() {
		var hash = window.location.hash;
		if (hash.length > 0) {
			hash = hash.substring(1);
		}
		if (hash.toLowerCase() == "null" || hash.toLowerCase() == "undefined") {
			hash = "";
		}
		if (hash.length == 0 && this._defaultHash.length > 0) {
			hash = this._defaultHash;
		}
		return hash;
	},
	/*
	   	Function: setHash

		Sets the hash of the current page url.

		Parameters:
			newHash - {string} Hash.

		Example:
			(start code)
			// if current location is: http://localhost/main
			mojo.History.getInstance().setHash("topic=news"); //sets location to: http://localhost/main#topic=news

			(end)

	*/
	setHash: function(newHash) {
		if(newHash == null || typeof newHash == 'undefined')
  	  throw new Error('ERROR mojo.History.setHash - newHash parameter is required');
  	if(!dojo.isString(newHash) || newHash == '')
  	  throw new Error('ERROR mojo.History.setHash - newHash parameter must be a non-empty string');

		window.location.hash = newHash;
	},
	/*
	   	Function: setDefault

		Sets the default application state of the History object.

		Parameters:
			defaultHashObj - {string|object}

		Example:
			(start code)
			// set default state as a string
			mojo.History.getInstance().setDefault("topic=news&id=1234");

			// OR set default state as a JS object
			mojo.History.getInstance().setDefault({topic: "news", id: 1234});

			(end)
	*/
	setDefault: function(defaultHashObj) {
		if(defaultHashObj == null || typeof defaultHashObj == 'undefined')
  	  throw new Error('ERROR mojo.History.setDefault - defaultHashObj parameter is required');

		if (typeof(defaultHashObj) == "string") {
			this._defaultHash = defaultHashObj;
		} else if (typeof(defaultHashObj) == "object") {
			this._defaultHash = this._parseObj(defaultHashObj);
		}
		this._execute();
	},
	_execute: function() {
		var currentHash = this.getHash();

		if (currentHash.length == 0 && this._defaultHash.length > 0) {
			currentHash = this._defaultHash;
		}
		if (this._savedHash != currentHash) {
			document.title = document.title.replace(window.location.hash, "");
			this._savedHash = currentHash;
			this._paramsObj = this._parseHash(this._savedHash);
			this._topic = this._paramsObj["topic"] || null;
			this.onChange();
			if (this._topic) {
				mojo.Messaging.publish(this._topic, this._paramsObj);
			}
		}
	},
	_parseHash: function(hash) {
		var obj = new Object();
		var vars = hash.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair.length == 2) {
				obj[pair[0]] = unescape(pair[1]);
			}
		}
		return obj;
	},
	_parseObj: function(obj) {
		var hashParts = new Array();
		for (var key in obj) {
			hashParts.push(key + "=" + escape(obj[key].toString()));
		}
		var hash = hashParts.join("&");
		return hash;
	},

	/*
	   	Function: getParams

		Retrieves an object representation of the current state of the History object,
		containing any hash name/value pairs as properties of the object.

		Returns:
			{object} Parameter Object

		Example:
			(start code)
			// if current location is: http://localhost/main#topic=news&id=1234
			var params = mojo.History.getInstance().getParams(); // returns {topic: "news", id:1234}
			var topic = mojo.History.getInstance().getParams().topic; // returns "news"
			var id = mojo.History.getInstance().getParams().id; // returns 1234
			(end)
	*/
	getParams: function() {
		return this._paramsObj;
	},
	/*
	   	Function: getTopic

		Retrieves the current topic of the History object. The "topic" keyword is used in conjunction
		with mojo.Messaging, and will broadcast a message based on the topic whenever it is set in
		the History object.

		Returns:
			{object} Topic

		Example:
			(start code)
			// if current location is: http://localhost/main#topic=news&id=1234
			var topic = mojo.History.getInstance().getTopic(); // returns "news"
			// message topic will be triggered. Ie. mojo.Messaging.publish("news", historyParams)
			(end)

	*/
	getTopic: function() {
		return this._topic;
	}
});
/*
	Function: getInstance

	Static function--Retrieves a Mojo History instance.

	Example:
		(start code)
		var myHistoryObj = mojo.History.getInstance();
		(end)

	Returns:
		{object} mojo.History
*/
mojo.History.getInstance = function() {
	if (__mojoHistory == null) {
		__mojoHistory = new mojo.History();
	}
	return __mojoHistory;
};
dojo.provide("mojo.*");
/*
	Class: Messaging

  	Contains static functions for publishing / subscribing to messages by topic.
*/
dojo.provide("mojo.Messaging");
__mojoMessagingTopics = new Array();

/*
	Function: publish

	Invokes all listeners subscribed to topic.

	Parameters:
		topic - {string} Topic
		messageObj - {object} Message Object (optional)

	Example:
		(start code)
		// subscribe an object's function to a message topic
		var test = {dialog: function(msg) {
		    if (!msg) msg = "test";
		    alert(msg);
		}}

		var handle = mojo.Messaging.subscribe("someTopic", test, "dialog");

		// invoke dialog function by publishing message topic
		mojo.Messaging.publish("someTopic");

		// invoke dialog function, and pass in a parameter
		mojo.Messaging.publish("someTopic", ["hello world"]);
		(end)
*/
mojo.Messaging.publish = function(topic, messageObj) {
	if(topic == null || typeof topic == 'undefined')
	  throw new Error('ERROR mojo.Messaging.publish - topic parameter is required');
	if(!dojo.isString(topic) || topic == '')
	  throw new Error('ERROR mojo.Messaging.publish - topic parameter must be a non-empty string');

	var topicObj = mojo.Messaging.getTopic(topic);
	topicObj.setMessage(messageObj);
	topicObj.onPublish(messageObj);
	if(!dojo.isArray(messageObj)) {
	  messageObj = [messageObj];
  }
	dojo.publish(topic, messageObj);
	topicObj.setMessage(null);//wipe clean (but not delete obj to save memory)
};

/*
	Function: subscribe

	Attaches a listener to a message topic--Use returned handle to unsubscribe.

	Parameters:
		topic - {string}
		targetObj - {object}
		targetFunc - {string}

	Returns:
		{object} handle


	Example:
		(start code)
		// subscribe an object's function to a message topic
		var test = {dialog: function(msg) {
		    if (!msg) msg = "test";
		    alert(msg);
		}}

		var handle = mojo.Messaging.subscribe("someTopic", test, "dialog");

		// invoke dialog function by publishing message topic
		mojo.Messaging.publish("someTopic");

		// invoke dialog function, and pass in a parameter
		mojo.Messaging.publish("someTopic", ["hello world"]);
		(end)
*/
mojo.Messaging.subscribe = function(topic, targetObj, targetFunc) {
	// ensure that a topic has been provided
	// and that it is a non-empty string
	if(topic == null || typeof topic == 'undefined')
	  throw new Error('ERROR mojo.Messaging.subscribe - topic parameter is required');
	if(!dojo.isString(topic) || topic == '')
	  throw new Error('ERROR mojo.Messaging.subscribe - topic parameter must be a non-empty string');

	// ensure that the targetObj is indeed an object or a string
	if(!dojo.isObject(targetObj) && !dojo.isString(targetObj))
	  throw new Error('ERROR mojo.Messaging.subscribe - targetObj parameter must be an object or a string');

	mojo.Messaging.getTopic(topic);

	return dojo.subscribe(topic, targetObj, targetFunc);
};

/*
	Function: unsubscribe

	Removes a specific subscribed listener from a message topic.

	Parameters:
		handle - {object}

	Example:
		(start code)
		// subscribe to a message topic
		var handle = mojo.Messaging.subscribe("someTopic", test, "dialog");
		// unsubscribe from message topic
		mojo.Messaging.unsubscribe(handle);

		(end)
*/
mojo.Messaging.unsubscribe	= function(handle) {
	dojo.unsubscribe(handle);
};

/*
	Function: getTopic

	Retrieves the MessagingTopic object associated with the message topic--If topic
	doesn't exist, this function will generate one.

	Paramters:
		topic - {string}

	Returns:
		{object} Topic

	Example:
		(start code)
		// stand-alone usage
		var topicObj = mojo.Messaging.getTopic(“someTopic”);

		// usage in a Mojo Controller
		this.addObserver(mojo.Messaging.getTopic(“someTopic”), “onPublish”, “SomeCommand”);

		(end)
*/
mojo.Messaging.getTopic = function(topic) {
	if(topic == null || typeof topic == 'undefined')
	  throw new Error('ERROR mojo.Messaging.getTopic - topic parameter is required');
	if(!dojo.isString(topic) || topic == '')
	  throw new Error('ERROR mojo.Messaging.getTopic - topic parameter must be a non-empty string');

  if (!__mojoMessagingTopics[topic]) {
		__mojoMessagingTopics[topic] = new mojo.MessagingTopic(topic);
	}
	return __mojoMessagingTopics[topic];
};
/*
	Class: MessagingTopic

	Class representation of a message topic.
*/
dojo.provide("mojo.MessagingTopic");
dojo.declare("mojo.MessagingTopic", null,
{
	/*
		Function: onPublish

		This event fires when this message topic gets published.
	*/
	onPublish: function() {
	},
	/*
		Constructor: constructor

		Creates an instance of the mojo.MessagingTopic class.

		Parameters:
			topic - {string}

		Example:
			(start code)
			// instantiate a new MessagingTopic object
			var msgObj = new mojo.MessagingTopic("someTopic");

			(end)
	*/
	constructor: function(topic) {
		if (topic == null || typeof topic == 'undefined') throw new Error('ERROR mojo.MessagingTopic - topic parameter is required');
		if (typeof topic == 'string') {
			if (topic == '') throw new Error('ERROR mojo.MessagingTopic - topic parameter must be a non-empty string');
		} else {
			throw new Error('ERROR mojo.MessagingTopic - topic parameter is not type String');
		}

		this._topic = topic;
		__mojoMessagingTopics[topic] = this;
	},
	_topic: null,
	_messageObj: null,
	/*
		Function: getTopic

		Retrieves the message topic.

		Returns:
			{object} Topic
	*/
	getTopic: function() {
		return this._topic;
	},
	/*
		Function: getMessage

		Retrieves the message object broadcasted with the message topic.

		Returns:
			{object} messageObj
	*/
	getMessage: function() {
		return this._messageObj;
	},
	/*
		Function: setMessage

		Sets the message object associated with the message topic.

		Parameters:
			messageObj - {object}


	*/
	setMessage: function(messageObj) {
		this._messageObj = messageObj;
	}

});
/*
	Class: Model

	Contains static functions for managing model data / application state.

	NOTE: This should be changed to a Singleton in the future

*/
dojo.provide("mojo.Model");
__mojoModel = new Array();
__mojoModelReferences = new Array();

/*
   Function: set

   Sets the model data for a particular model key. If a model registered under the key does not exist, it is created.

   Parameters:
      key - {string}
      valueObj - {object}

	Example:
		(start code)
		var data = [1 2,3];
		mojo.Model.set("testModel", data); // store data into the "testModel" model
		(end)
*/
mojo.Model.set = function(key, valueObj) {
	if (key == null || typeof key == 'undefined')
		throw new Error('ERROR mojo.Model.set - key parameter is required');
	if (!dojo.isString(key) || key == '')
		throw new Error('ERROR mojo.Model.set - key parameter must be a non-empty string');

	__mojoModel[key] = dojo.clone(valueObj);
	mojo.Model.notify(key);
};

/*
	Function: add

	Appends a data item to a model that is an array list.

	Parameters:
		key - {string}
		valueObj - {object}

	Example:
		(start code)
		var data = [1,2,3];
		mojo.Model.set("testModel", data);
		mojo.Model.add("testModel", 4); // model is now [1, 2, 3, 4]

		(end)
*/
mojo.Model.add = function(key, valueObj) {

	if(key == null || typeof key == 'undefined')
	  throw new Error('ERROR mojo.Model.add - key parameter is required');
	if(!dojo.isString(key) || key == '')
	  throw new Error('ERROR mojo.Model.add - key parameter must be a non-empty string');

	if(valueObj == null || typeof valueObj == 'undefined')
	  throw new Error('ERROR mojo.Model.add - valueObj parameter is required');
	if(valueObj == '')
	  throw new Error('ERROR mojo.Model.add - valueObj parameter must be a non-empty string');

	if (mojo.Model.contains(key)) {
		if (!dojo.isArray(__mojoModel[key])) {
			var tmpModel = __mojoModel[key];
			__mojoModel[key] = new Array();
			__mojoModel[key].push(tmpModel);
		}
		if (dojo.isArray(valueObj)) {
			for (var i = 0; i < valueObj.length; i++) {
				__mojoModel[key].push(valueObj[i]);
			}
		} else {
			__mojoModel[key].push(valueObj);
		}
		mojo.Model.notify(key);
	} else {
		mojo.Model.set(key, valueObj);
	}
};

/*
	Function: get

	Retrieves the data for a specified model based on the model key.

	Parameters:
		key - {string}

	Returns:
		{object} Mojo Model.

	Examples:
		(start code)
		var temp = mojo.Model.get("testModel");
		(end)
*/
mojo.Model.get = function(key) {

	if(key == null || typeof key == 'undefined')
	  throw new Error('ERROR mojo.Model.get - key parameter is required');
	if(!dojo.isString(key) || key == '')
	  throw new Error('ERROR mojo.Model.get - key parameter must be a non-empty string');
	
	var tmp = __mojoModel[key];
		
	if (typeof tmp == "undefined") {
	  if (dojo.config && dojo.config.isDebug) {
  		console.debug("WARNING mojo.Model - No entry found for \"" + key + "\" key");
  	}

	  tmp = null;
  }
  
	return tmp;
};

/*
	Function: getReference

	Retrieves the mojo.ModelReference object associated with a model.
	If model doesn't exist, this function will generate one. Object can be observed in
	a Mojo Controller.

	Parameters:
		key - {string}

	Returns:
		{object} Model Reference Object

	Example:
		(start code)
		// stand-alone usage
		var modelObj = mojo.Model.getReference("testModel");

		// usage in a Mojo Controller
		this.addObserver(mojo.Model.getReference("testModel"), "onNotify", "SomeCommand");
		(end)
*/
mojo.Model.getReference = function(key) {

	if(key == null || typeof key == 'undefined')
	  throw new Error('ERROR mojo.Model.getReference - key parameter is required');
	if(!dojo.isString(key) || key == '')
	  throw new Error('ERROR mojo.Model.getReference - key parameter must be a non-empty string');

	if (!__mojoModelReferences[key]) {
		__mojoModelReferences[key] = new mojo.ModelReference(key);
	}
	return __mojoModelReferences[key];
};

/*
	Function: remove

	Clears the model data for a particular model key.

	Parameters:
		key - {object}

	Example:
		(start code)
		mojo.Model.remove("testModel");
		(end)
*/
mojo.Model.remove = function(key) {


	if(key == null || typeof key == 'undefined')
	  throw new Error('ERROR mojo.Model.remove - key parameter is required');
	if(!dojo.isString(key) || key == '')
	  throw new Error('ERROR mojo.Model.remove - key parameter must be a non-empty string');

	var ref = mojo.Model.getReference(key);

	__mojoModel[key] = null;
	mojo.Model.notify(key);


};

/*
	Function: contains

	Returns whether or not a specified model exists.

	Parameters:
		key - {string}

	Returns:
		{boolean} Exists

	Example:
		(start code)
		if (mojo.Model.contains("testModel")) {
			// the model exists!
		}

		(end)
*/
mojo.Model.contains = function(key) {

	if(key == null || typeof key == 'undefined')
	  throw new Error('ERROR mojo.Model.contains - key parameter is required');
	if(!dojo.isString(key) || key == '')
	  throw new Error('ERROR mojo.Model.contains - key parameter must be a non-empty string');

	var tmp = __mojoModel[key];
	if (tmp) {
		return true;
	}
	return false;
};

/*
	Function: notify

	Notifies any registered observers of the specified model of a model change. This method is
	automatically triggered on set, add, and remove Model methods. This method is used with
	mojo.component.Template to re-databind the template.

	Parameters:
		key - {string}

	Example:
		(start code)
		// observe "testModel" model
		mojo.Model.addObserver("testModel", {doSomething: function() {
			var data = mojo.Model.get("testModel");
			//do something
		}}, "doSomething");
		mojo.Model.notify("testModel"); // notify observer to do something with model

		(end)
*/
mojo.Model.notify = function(key) {
	if(key == null || typeof key == 'undefined')
	  throw new Error('ERROR mojo.Model.notify - key parameter is required');
	if(!dojo.isString(key) || key == '')
	  throw new Error('ERROR mojo.Model.notify - key parameter must be a non-empty string');

	__mojoModel["__mojoTemplateControllers"] = [];
	var ref = mojo.Model.getReference(key);
	// Notify registered observers of change
	ref.onNotify();
	mojo.Messaging.publish("/mojo/model/" + key);

	// re-map any controllers to components dynamically created from template data-binding
	// ********* RECURSION BUG HERE... RACE CONDITION? mojo.controller.Map.mapControllers();

	// handle mojo template observer updates
	var templateControllersLength = __mojoModel["__mojoTemplateControllers"].length;
	for (var i = 0; i < templateControllersLength; i++ ) {
		var controllerInstance = __mojoModel["__mojoTemplateControllers"][i];
		if (controllerInstance && controllerInstance.updateController) {
			controllerInstance._addObservers();
			controllerInstance.updateController = null;
		}
	}
	__mojoModel["__mojoTemplateControllers"] = null;
};

/*
	Function: addObserver

	Registers an observer to a specified model. Returns a handle to allow unregistering.

	Parameters:

		key - {string} Which model to observe.
		targetObj - {object} When to execute (onclick, etc)
		targetFunc - {string} What to execute on the target object.

	Returns:
		{object} handle

	Example:
		(start code)
		// observe "testModel" model
			mojo.Model.addObserver("testModel", {doSomething: function() {
				var data = mojo.Model.get("testModel");
		 		//do something
		}}, "doSomething");
			mojo.Model.notify("testModel"); // notify observer to do something with model
		(end)
*/
mojo.Model.addObserver = function(key, targetObj, targetFunc) {

	if(key == null || typeof key == 'undefined')
	  throw new Error('ERROR mojo.Model.addObserver - key parameter is required');
	if(!dojo.isString(key) || key == '')
	  throw new Error('ERROR mojo.Model.addObserver - key parameter must be a non-empty string');
	if(targetObj == null || typeof targetObj == 'undefined')
	  throw new Error('ERROR mojo.Model.addObserver - targetObj parameter is required');
	if(!dojo.isObject(targetObj))
	  throw new Error('ERROR mojo.Model.addObserver - targetObj parameter must be an object');
	if(targetFunc == null || typeof targetFunc == 'undefined')
	  throw new Error('ERROR mojo.Model.addObserver - targetFunc parameter is required');
	if(!dojo.isString(targetFunc) || targetFunc == '')
	  throw new Error('ERROR mojo.Model.addObserver - targetFunc parameter must be a function and is not of type string');

	// register observer
	return mojo.Messaging.subscribe("/mojo/model/" + key, targetObj, targetFunc);
};

/*
	Function: removeObserver

	Unregisters an observer from a model.

	Parameters:
		handle - {object}

	Example:
		(start code)
		// observe "testModel" model
		var handle = mojo.Model.addObserver("testModel", {doSomething: function() {
			var data = mojo.Model.get("testModel");
			//do something
		}}, "doSomething");
		// remove observer
		mojo.Model.removeObserver(handle);
		(end)

*/
mojo.Model.removeObserver = function(handle) {

	if(handle == null || typeof handle != 'object')
	  throw new Error('ERROR mojo.Model.removeObserver - handle parameter is required');

	// unregister observer
	mojo.Messaging.unsubscribe(handle);
};
/*
	Class: ModelReference

	Class representation of a model instance.
*/
dojo.provide("mojo.ModelReference");
dojo.declare("mojo.ModelReference", null, {

	/*
		Event: onNotify

		This event fires when a change has been made in the model.
	*/
	onNotify: function() {

	},
	/*
		Constructor: constructor

		Creates an instance of the mojo.ModelReference class

		Parameters:
			key - {string}

		Example:
			(start code)
			// instantiate a new ModelReference
			var model = new mojo.ModelReference("testModel");
			(end)
	*/
	constructor: function(key) {
		if (key == null || typeof key == 'undefined')
			throw new Error('ERROR mojo.ModelReference - key parameter is required');
		if (!dojo.isString(key) || key == '')
			throw new Error('ERROR mojo.ModelReference - key parameter must be a non-empty string');

		this._key = key;
		__mojoModelReferences[key] = this;
	},
	_key: null,
	/*
		Function: getKey

		Retrieves the model key.

		Returns:
			{string} Mojo Model Key

	*/
	getKey: function() {
			return this._key;
	},
	/*
		Function: getValue

		Retrieves the data stored in the model.

		Returns:
			{object} Mojo Model
	*/
	getValue: function() {
		return mojo.Model.get(this._key);
	},

	/*
		Function: setValue

		Sets new data to be stored in the model.

		Parameters:
			valueObj - {object}
	*/
	setValue: function(valueObj) {
		mojo.Model.set(this._key, valueObj);
	}
});
/*
	Class: mojo
	Note: These functions reside within the mojo.* namespace.
*/

dojo.provide("mojo.query");
/*
	Function: query

	Retrieves a set of nodes based on a given CSS selector. Includes support for CSS3 selectors.

	Parameters:
		cssSelectors - {string}
		rootObj - {DOMElement}

	Returns:
		{Array of DOMElements} elementListObj

	Example:
		(start code)
		// get anchors on the page with a class name of "link"
		var links = mojo.query("a.link");

		// get all divs on the page
		var divs = mojo.query("div");

		// get all the nodes with a class name of "selected" inside a particular node
		// container
		var container = mojo.queryFirst("#container");
		var nodes = mojo.query(".selected", container);

		(end)
*/
mojo.query = function(cssSelectors, rootObj) {
	if(rootObj && (typeof rootObj == "string" || typeof rootObj == "object")) {
	  var results = dojo.query(cssSelectors, rootObj);
	} else {
		if ((new RegExp(/^\#[a-zA-Z0-9\-\_]*$/)).test(cssSelectors)) {
			var tmpElm = document.getElementById(cssSelectors.substring(1));
			if (tmpElm) {
				var results = [tmpElm];
			} else {
				var results = [];
			}
		} else {
			var results = dojo.query(cssSelectors);
		}
	}
	return results;
};
/*
	Function: queryFirst

	Retrieves the first node of a set of nodes based on a given CSS selector. Includes support for CSS3 selectors.

	Parameters:
		cssSelectors - {string}
		rootObj - {DOMElement}

	Returns:
		{DOMElement} elementListObj

	Example:
		(start code)
		// get a node with an id of "container"
		var container = mojo.queryFirst("#container");
		(end)
*/
mojo.queryFirst = function(cssSelectors, rootObj) {
	var results = mojo.query(cssSelectors, rootObj);
	if (results.length > 0) {
		return results[0];
	}
	return null;
};
/*
	Function: distinct

	Retrieves a set of distinct nodes from an array of nodes.

	Parameters:
		elementListObj - {DOMElement Array}

	Returns:
		{Array of DOMElements} elementListObj
*/
mojo.distinct = function(elementListObj) {
  if (elementListObj.length == 0) return elementListObj;
  var results = [], n;
  for (var i = 0, l = elementListObj.length; i < l; i++)
    if (!(n = elementListObj[i])._counted) {
      n._counted = true;
      results.push(n);
    }
  for (var i = 0, node; node = results[i]; i++)
    node._counted = undefined;
  return results;
};
/*
	Function: queryMatch

	Checks whether or not a given element matches a given CSS selector, and returns either the matching element, null if no matches, or a matching parent of the given element (if checkParents is true).

	Parameters:
		elementObj - {DOMElement}
		cssSelectors - {string}
		rootObj - {DOMElement}
		checkParents - {Boolean}

	Returns:
		{DOMElement} matchedElementObj

*/
mojo.queryMatch = function(elementObj, cssSelectors, rootObj, checkParents) {
	if (!elementObj || elementObj == rootObj) return null;
	var basicSelector = false;
	var results = [];
	if ((new RegExp(/^[\#|\.]?[a-zA-Z0-9\-\_]+$/)).test(cssSelectors)) {
		basicSelector = true;
	} else {
		results = mojo.query(cssSelectors, rootObj);
	}
	while (elementObj && elementObj != rootObj) {
		if (basicSelector) {
			if ((cssSelectors.indexOf("#") == 0 && elementObj.id == cssSelectors.substring(1)) ||
			    (cssSelectors.indexOf(".") == 0 && dojo.hasClass(elementObj, cssSelectors.substring(1))) ||
			    (elementObj["tagName"] && elementObj.tagName.toLowerCase() == cssSelectors.toLowerCase())) {
				return elementObj;
			}
		} else {
			for (var i = 0, len = results.length; i < len; i++) {
				if (results[i] == elementObj) return elementObj;
			}
		}
		if (checkParents) {
			elementObj = elementObj.parentNode;
		} else {
			break;
		}
	}
	return null;
};
/*
	Class: Locator

	An abstract class for organizing web services into a central registry. Implement as a Singleton.

	Example:
		(start code)
		dojo.provide("sample.service.Locator");

		dojo.declare("sample.service.Locator", mojo.service.Locator,
		{
			addServices: function() {
		        this.addService(new mojo.service.Service("getRSS", "/json/rssFeed", {format: 'json', cache: true}));
		        this.addService(new mojo.service.Service("getProfile", "/ json/members/${memberId}/profile", {format: 'json', cache:false }));
		        this.addService(new mojo.service.Service("updateProfile", "/ json/members/${memberId}/profile", {format: 'json', cache:false }));
			}
		});

		var __sampleServiceLocator = null;
		sample.service.Locator.getInstance = function() {
			if (__sampleServiceLocator == null) {
				__sampleServiceLocator = new sample.service.Locator();
			}
			return __sampleServiceLocator;
		}

		(end)
*/
dojo.provide("mojo.service.Locator");

__mojoServiceRegistry = new Array();

dojo.declare("mojo.service.Locator", null,
{
  constructor: function() {
  	if (__mojoServiceRegistry.length == 0) {
  		this.addServices();
  	}
  },

	/*
		Function: addServices

		Abstract function fired on instantiation of concrete implementation of Locator class.
		Used as container function for adding services.

	*/
	addServices: function() {
		if (dojo.config && dojo.config.isDebug) {
		  console.debug("ERROR mojo.service.Locator - addServices() not implemented");
	  }
	},
	/*
		Function: addService

		Adds a service object to the Locator's service registry.

		Parameters:
			serviceObj - {object} mojo.service.Service

		Example:
			(start code)
			// get locator instance
			var locator = sample.service.Locator.getInstance();
			// instantiate a new service
			var service = new mojo.service.Service("getRSS", "/json/rssFeed", {format: 'json', cache: true});
			// add service to locator
			locator.addService(service);
			(end)
	*/
	addService: function(serviceObj) {
		if(serviceObj == null || typeof serviceObj == 'undefined')
		  throw(new Error("ERROR mojo.service.Locator.addService - serviceObj parameter is required"));
		if(!(serviceObj instanceof mojo.service.Service))
		  throw(new Error("ERROR mojo.service.Locator.addService - serviceObj parameter must be an instance of the mojo.service.Service class"));

    var serviceName = serviceObj.getName();

		if(!__mojoServiceRegistry[serviceName]) {
		  __mojoServiceRegistry[serviceName] = serviceObj;
	  } else {
	    throw(new Error('ERROR mojo.service.Locator.addService - service with the name "' + serviceName + '" already exists in the registry; service not added'));
	  }
	},
	/*
		Function: getService

		Retrieves the service object associated with the service name.

		Parameters:
			name - {string} The name of the Service.

		Returns:
			{object} mojo.service.Service

		Example:
			(start code)
			// get locator instance
			var locator = sample.service.Locator.getInstance();
			// get a service
			var service = locator.getService("getRSS");
			(end)
	*/
	getService: function(name) {
		// ensure that a topic has been provided
  	// and that it is a non-empty string
  	if(name == null || typeof name == 'undefined')
  	  throw new Error('ERROR mojo.service.Locator.getService - name parameter is required');
  	if(!dojo.isString(name) || name == '')
  	  throw new Error('ERROR mojo.service.Locator.getService - name parameter must be a non-empty string');

  	return __mojoServiceRegistry[name] || null;
	}
});
/*
	Class: Service

	Class representation of a web service call.
*/
dojo.provide("mojo.service.Service");

dojo.declare("mojo.service.Service", null,
{
	/*
	  Constants: mojo.service.Service constants

	  VALID_METHODS  - A list of HTTP methods acceptable as configuration when instantiating a new mojo.service.Service object.
	  DEFAULT_PARAMS - The default configuration for a mojo.service.Service object.
	*/

  VALID_METHODS: ['GET', 'POST', 'PUT', 'DELETE'],
	DEFAULT_PARAMS: {
    format: 'json',
    method: 'GET',
    cacheExpiry: 0,
    cache: true,
    retry: 1,
    hijax: false,
		inferArrays: true
  },

	/*
		Function: constructor

		Creates an instance of the mojo.service.Service class.

		Parameters:
			name - {string}
			uri - {string}
			paramsObj - {object}

		Example:
			(start code)
			// instantiate a new JSON service that caches for 60 seconds
			var jsonService = new mojo.service.Service("getRSS", "/json/rssFeed", {format: 'json', cache: true, cacheExpiry: 60});

			// instantiate a new text transport service that does not cache
			var textService = new mojo.service.Service("getHTMlFragment", "/html/fragment.html", {format: 'text', cache: false});

			// instantiate a new XML service that does not make inferences about what nodes should form part of an array of nodes
			var xmlService = new mojo.service.Service("getAtom", "/xml/atomFeed", {format: 'xml', inferArrays: false});
			(end)
	*/
  constructor: function(name, uri, paramsObj) {
    if(name == null || typeof name == 'undefined')
  	  throw new Error('ERROR mojo.service.Service.constructor - name parameter is required');
  	if(!dojo.isString(name) || name == '')
  	  throw new Error('ERROR mojo.service.Service.constructor - name parameter must be a non-empty string');

	  if(uri == null || typeof uri == 'undefined')
  	  throw new Error('ERROR mojo.service.Service.constructor - uri parameter is required');
  	if(!dojo.isString(uri) || uri == '')
  	  throw new Error('ERROR mojo.service.Service.constructor - uri parameter must be a non-empty string');

	  // Validate URIs against RFC2396
	  /*
	  if(!(new RegExp(TODO)).test(uri))
	    throw new Error('ERROR mojo.service.Service.constructor - uri parameter conform to RFC2396');
	  */

	  // Duplicate the default parameters
	  var configuration = {};
	  for(property in this.DEFAULT_PARAMS) configuration[property] = this.DEFAULT_PARAMS[property];

	  // Set the default method according to service name
		if(name.toLowerCase().indexOf("add") == 0) {
		  configuration.method = "POST";
		} else if (name.toLowerCase().indexOf("update") == 0) {
		  configuration.method = "PUT";
		} else if (name.toLowerCase().indexOf("delete") == 0) {
		  configuration.method = "DELETE";
		}

		if(paramsObj) {
	    // should, by default, set the cache configuration property to false if the method configuration property is not "GET"
      if(paramsObj.method) {
	      if(paramsObj.method != 'GET') configuration.cache = false;
	    } else {
	      if(configuration.method != 'GET') configuration.cache = false;
	    }

	  	// should, by default, set the retry configuration property to 0 if the method configuration property is not "GET"
	    if(paramsObj.method) {
	      if(paramsObj.method != 'GET') configuration.retry = 0;
	    } else {
	      if(configuration.method != 'GET') configuration.retry = 0;
		  }
		}

	  // Merge any explicit configuration with the default configuration
    if(paramsObj) {
	    for(property in paramsObj) configuration[property] = paramsObj[property];
	  }

	  this.setName(name);
  	this.setUri(uri);
  	this.setParams(configuration);

		// Expire any pre-existing cache immediately
		this._expireCache(this.getName());
  },
	_name: "",
	_uri: "",
	_params: new Object(),
	/*
		Function: getName

		Retreives the name of the web service.

		Returns:
			{string} Name of the service.

		Example:
			(start code)
			var service = new mojo.service.Service("getRSS", "/json/rssFeed", {format: 'json', cache: true});
			var name = service.getName(); // returns "getRSS"
			(end)
	*/
	getName: function() {
		return this._name;
	},
	/*
		Function: setName

		Sets the name for the web service.

		Parameters:
			name - {string} The name of the service.

		Example:
			(start code)
			// instantiate a new service
			var service = new mojo.service.Service("getRSS", "/json/rssFeed", {format: 'json', cache: true});
			service.setName("getNews"); // changes name from "getRSS" to "getNews"
			(end)
	*/
	setName: function(name) {
		if(name == null || typeof name == 'undefined')
  	  throw new Error('ERROR mojo.service.Service.setName - name parameter is required');
  	if(!dojo.isString(name) || name == '')
  	  throw new Error('ERROR mojo.service.Service.setName - name parameter must be a non-empty string');

  	this._name = name;
	},
	/*
		Function: getUri

		Retrieves the Uri for the web service. Uri returned will include TrimPath variable syntax if inserted.

		Returns:
			{string} uri

		Example:
			(start code)
			// instantiate a new service
			var service = new mojo.service.Service("getRSS", "/json/rssFeed", {format: 'json', cache: true});
			var uri = service.getUri(); // returns "/json/rssFeed"
			(end)
	*/
	getUri: function() {
		return this._uri;
	},
	/*
		Function: setUri

		Sets the Uri for the web service. TrimPath variable syntax can be inserted to allow
		for dynamic Uri generation when invoking service call.

		Parameters:
			uri - {string}

		Example:
			(start code)
			// instantiate a new service
			var service = new mojo.service.Service("getRSS", "/json/rssFeed", {format: 'json', cache: true});
			service.setUri("/json/rssFeed/${id}"); // add dynamic variable to Uri
			(end)

	*/
	setUri: function(uri) {
		if(uri == null || typeof uri == 'undefined')
  	  throw new Error('ERROR mojo.service.Service.setUri - uri parameter is required');
  	if(!dojo.isString(uri) || uri == '')
  	  throw new Error('ERROR mojo.service.Service.setUri - uri parameter must be a non-empty string');

		this._uri = uri;
	},
	/*
		Function: getParams

		Retrieves the options for the web service call. If options are not explicitly set,
		default option values will be returned.

		Returns:
			{object} Parameter Object.

		Example:
			(start code)
			// instantiate a new service
			var service = new mojo.service.Service("getRSS", "/json/rssFeed", {format: 'json', cache: true});
			var options = service.getParams(); // returns {json:true, cache:true, method:"GET", cacheExpiry:0, retry: 1}
			(end)
	*/
	getParams: function() {
		return this._paramsObj;
	},
	/*
		Function: setParams

		Sets the options for the web service call.

		Parameters:
			paramsObj - {object} Parameters to be sent to the service.

		Example:
			(start code)
			// instantiate a new service
			var service = new mojo.service.Service("getRSS", "/json/rssFeed", {format: 'json', cache: true});
			service.setParams({cache: false}); // changes cache to false. All other defined options remain unchanged.
			(end)
	*/
	setParams: function(paramsObj) {
		if(!paramsObj)
      throw new Error('ERROR mojo.service.Service.setParams - paramsObj parameter is required');

    if(paramsObj) {
	    for(property in paramsObj) {
	      switch(property) {
	        case 'hijax':
	        case 'cache':
					case 'inferArrays':
	          if(typeof paramsObj[property] != 'boolean')
              throw new Error('ERROR mojo.service.Service.setParams - ' + property + ' property of paramsObj must be a boolean');
	          break;
	        case 'cacheExpiry':
	        case 'retry':
	          if(typeof paramsObj[property] != 'number')
	            throw new Error('ERROR mojo.service.Service.setParams - ' + property + ' property of paramsObj must be a number');
						break;
	        case 'format':
						if(typeof paramsObj[property] != 'string')
	            throw new Error('ERROR mojo.service.Service.setParams - ' + property + ' property of paramsObj must be a string');
						break;
					case 'method':
	          var validMethodFound = false;
	          for(var i = 0, len = this.VALID_METHODS.length; i < len; i++) {
	            if(this.VALID_METHODS[i] == paramsObj[property].toUpperCase()) validMethodFound = true;
	          }
	          if(!validMethodFound)
	            throw new Error('ERROR mojo.service.Service.setParams - method property of paramsObj must be one of "GET", "POST", "PUT", or "DELETE"');
	          break;
	      }
	    }
	  }

		if(!this._paramsObj) this._paramsObj = {};

		// DEPRECATED: should set format to 'json' when paramsObj contains a key named 'json' with the value true
		if(paramsObj.json == true) {
			this._paramsObj.format = 'json';
			if (dojo.config && dojo.config.isDebug) {
				console.debug("WARNING mojo.service.Service.setParams - json parameter is DEPRECATED; use {format: 'json'} instead");
			}
		}
		// DEPRECATED: should set format to 'text' when paramsObj contains a key named 'json' with the value false
		if(paramsObj.json == false) {
			this._paramsObj.format = 'text';
			if (dojo.config && dojo.config.isDebug) {
				console.debug("WARNING mojo.service.Service.setParams - json parameter is DEPRECATED; use {format: 'json'} instead");
			}
		}

		for(property in paramsObj) this._paramsObj[property] = paramsObj[property];

	},
	/*
		Function: invoke

		Fires the web service request, and triggers onResponse or onError callback methods on the caller
		depending on success or failure respectively. Optional service parameters are sent with the web
		service request, and are used to generate a dynamic Uri for the call when TrimPath syntax is used
		(if TrimPath.parseTemplate is available).

		Parameters:
			paramsObj - {object} Parameters to send to the service.
			callerObj - {object} Command object to pass to the service.

		Example:
			(start code)
			// instantiate a new service
			var service = new mojo.service.Service("getRSS", "/json/rssFeed/${id}", {format: 'json', cache: true});
			var caller = {
			onResponse: function(data) { alert("success!"); },
			onError: function(error) { alert("error"); }
			}
			service.invoke({id: "cnn"}, caller); // generates Uri "/json/rssFeed/cnn" based on the service parameters passed in.
			//Triggers callback methods onResponse or onError
			(end)
	*/
	invoke: function(paramsObj, callerObj) {
		if(!callerObj)
			throw new Error("ERROR mojo.service.Service.invoke - callerObj parameter is required");
		if(!dojo.isObject(callerObj))
			throw new Error("ERROR mojo.service.Service.invoke - callerObj parameter must be an object");
		if(typeof callerObj.onResponse != 'function')
			throw new Error("ERROR mojo.service.Service.invoke - callerObj parameter must contain an object with an onResponse method");
		if(typeof callerObj.onError != 'function')
			throw new Error("ERROR mojo.service.Service.invoke - callerObj parameter must contain an object with an onError method");

		var serviceParams = this.getParams();

		// get address via templated uri
		if(typeof TrimPath != 'undefined' && TrimPath.parseTemplate) {
			var uriFinal = TrimPath.parseTemplate(this.getUri()).process(paramsObj);
			if (paramsObj && paramsObj["_MODIFIERS"] && paramsObj["defined"]) {
  			delete paramsObj["_MODIFIERS"];
  			delete paramsObj["defined"];
  		}
		} else {
		  var uriFinal = this.getUri();
		}

		if (serviceParams.hijax && callerObj.getRequest() && callerObj.getRequest().callerObj && callerObj.getRequest().callerObj.tagName == "A") {
			uriFinal = callerObj.getRequest().callerObj.href;
		}

		var tried = 0;
		var serializeName = this.getName();
		var pairs = new Array();
		for (var key in paramsObj) {
			if (typeof(paramsObj[key]) != "function") {
				pairs.push(key + "_" + paramsObj[key]);
			} else {
				pairs.push(key + "__function");
			}
		}
		if(pairs.length > 0) serializeName += "_" + pairs.join("_");

		var errorCallback = function(errorObj, httpObj) {
			var errors = new Array();
			// handle http error
			if (httpObj) {
				errorObj.code = httpObj.status;
				errors.push(errorObj);
			}
			//handle error as string
			if (typeof(errorObj) == "string") {
				var msg = errorObj;
				errorObj = new Object();
				errorObj.message = msg;
			}
			// handle exception error
			if (errorObj.name) {
				errorObj.code = errorObj.name;
				errors.push(errorObj);
			}
			// handle json error
			if (errorObj.errors) {
				errors = errorObj.errors;
			}
			if (errorObj.error) {
				errors.push(errorObj.error);
			}
			// handle server error redirect
			if (errors[0]["redirectUrl"]) {
				window.location.replace(errors[0]["redirectUrl"]);
			}
			if (httpObj && serviceParams.retry >= tried) { // retry http errors only
				serviceInvoke();
			} else {
				callerObj.onError(errors);
			}
		};
		var thisObj = this;
		var serviceInvoke = function() {
			var toSentenceCase = function(string) { return string.charAt(0).toUpperCase() + string.replace(/ \w/g, function(m){return m.toUpperCase();}).substring(1); };
			return dojo['xhr' + toSentenceCase(serviceParams.method.toLowerCase())]({
				url: uriFinal,
				preventCache: (!serviceParams.cache && serviceParams.method == "GET"),
				handleAs: serviceParams.format,
				content: paramsObj,
				load: function(response, ioArgs) {
					tried++;
					if (ioArgs.handleAs == 'json') {
						if (!dojo.isObject(response)) {
							// we expected an object as the response…
							// let's try to eval the JSON one more time
							try {
								response = eval(response);
							} catch(ex) {
								errorCallback(ex);
								return;
							}
						}

						if(response.error || response.errors) {
							errorCallback(response);
						} else {
							if (serviceParams.cache) {
						    thisObj._setCache(serializeName, response, serviceParams.cacheExpiry);
							}
							callerObj.onResponse(response, ioArgs.args.content);
						}
					} else if (ioArgs.handleAs == 'xml') {
						try {
							var params = {};
							if(typeof serviceParams.inferArrays != 'undefined') params.inferArrays = serviceParams.inferArrays;

							response = mojo.helper.XML.toObject(response, params);
						} catch(ex) {
							errorCallback(ex);
						}

						if(response.error || response.errors) {
						  //normalize errors
							if(response.errors && response.errors['error'] && response.errors['error'] instanceof Array) {
								response.errors = response.errors['error'];
							}
							errorCallback(response);
						}	else {
							if (serviceParams.cache) {
						    thisObj._setCache(serializeName, response, serviceParams.cacheExpiry);
							}
							callerObj.onResponse(response, ioArgs.args.content);
						}
					} else {
						if (serviceParams.cache) {
							thisObj._setCache(serializeName, response, serviceParams.cacheExpiry);
						}
						callerObj.onResponse(response, ioArgs.args.content);
					}
				},
				error: function(response, ioArgs) {
					tried++;
					errorCallback(response, ioArgs.xhr);
				}
			});
		};
		var cacheObj;
    if (serviceParams.cache) {
			cacheObj = this._getCache(serializeName);
    }
    if (cacheObj) {
    	callerObj.onResponse(cacheObj.data, paramsObj);
		} else {
			var currentXhr = serviceInvoke();
		}
	return currentXhr;
	},
  _setCache: function(key, data, cacheExpiry) {
  	var expiryTime = 0;
  	if (cacheExpiry > 0) {
  		expiryTime = (new Date()).getTime() + (cacheExpiry * 1000);
  	}
  	mojo.Model.set(key, {data: data, expiryTime: expiryTime});
  },
  _getCache: function(key) {
  	var cacheObj = null;
  	if (mojo.Model.contains(key)) {
  		cacheObj = mojo.Model.get(key);
			// check cache expiry
			var now = (new Date()).getTime();
			if (cacheObj.expiryTime > 0 && now > cacheObj.expiryTime) {
				this._expireCache(key);
				cacheObj = null;
			}
		}
  	return cacheObj;
	},
	_expireCache: function(key) {
		mojo.Model.remove(key);
	}
});