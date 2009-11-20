/*
	Class: Messaging
	
  	Contains static functions for publishing / subscribing to messages by topic.
*/
dojo.provide("mojo.Messaging");
dojo.require("mojo.MessagingTopic");
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