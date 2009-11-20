/*
	Class: Locator
	
	An abstract class for organizing web services into a central registry. Implement as a Singleton.
	
	Example:
		(start code)
		dojo.provide("sample.service.Locator");
		dojo.require("mojo.service.Locator");
		dojo.require("mojo.service.Service");

		dojo.declare("sample.service.Locator", mojo.service.Locator,
		function() {}, {
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