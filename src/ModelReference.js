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