/*
	Class: Model

	Contains static functions for managing model data / application state. 
	
	NOTE: This should be changed to a Singleton in the future
	
*/
dojo.provide("mojo.Model");
dojo.require("mojo.ModelReference");
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
