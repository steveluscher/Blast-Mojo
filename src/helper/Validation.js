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
dojo.require("dojox.validate");
dojo.require("dojox.validate.web");

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