/*
  Class: History
  
  Singleton class for managing browser history/state changes.
*/
dojo.provide("mojo.History");
var __mojoHistory = null;

dojo.declare("mojo.History", null, {
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
    if (newHash == null || typeof newHash == 'undefined')
      throw new Error('ERROR mojo.History.setHash - newHash parameter is required');
    if (!dojo.isString(newHash) || newHash == '')
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