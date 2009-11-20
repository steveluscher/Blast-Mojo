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