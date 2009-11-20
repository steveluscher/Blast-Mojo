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