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
dojo.require("mojo.Messaging");
dojo.require("mojo.query");
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
  _controllers: [],
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
    if (siteMapObj == null || typeof siteMapObj == 'undefined')
      throw new Error("ERROR mojo.controller.Map.setSiteMap - siteMapObj parameter is required");
    
      var failSiteMapObjValidation = function() {
      throw new Error('ERROR mojo.controller.Map.setSiteMap - siteMapObj parameter must consist of patterns in the format {pattern: "pattern", controllers: [{controller: "controller.path"}]}');
    };
    if (!dojo.isArray(siteMapObj)) failSiteMapObjValidation();
    for (var i = 0, len = siteMapObj.length; i < len; i++) {
      var patternObj = siteMapObj[i];
      if (typeof patternObj.pattern == "undefined" || patternObj.pattern == null) failSiteMapObjValidation();
      if (!dojo.isArray(patternObj.controllers)) failSiteMapObjValidation();
      for(var j = 0, len = patternObj.controllers.length; j < len; j++) {
        if (typeof patternObj.controllers[j].controller == 'undefined' || !dojo.isString(patternObj.controllers[j].controller) || patternObj.controllers[j].controller == '') failSiteMapObjValidation();
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
    if (controllerName == null || typeof controllerName == 'undefined')
        throw new Error('ERROR mojo.controller.Map.mapController - controllerName parameter is required');
      if (!dojo.isString(controllerName) || controllerName == '')
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