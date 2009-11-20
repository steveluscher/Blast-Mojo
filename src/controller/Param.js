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
