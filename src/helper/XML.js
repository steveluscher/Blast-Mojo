/*
 	Class: XML

	Utility methods for manipulating XML data.
*/
dojo.provide("mojo.helper.XML");

dojo.require('mojo.helper.Inflector');

dojo.declare('mojo.helper.XML', null, {
	/*
		Constructor: constructor
		
		Creates an instance of the mojo.helper.XML class
		
		Parameters:
			xml - {string|XmlDocument} The XML to convert to a JavaScript object.
			params - {<mojo.helper.XML.params>} Optional parameters.
		
		Example:
			(start code)
			// instantiate new XML
			var xml = new mojo.helper.XML("<?xml version="1.0" encoding="UTF-8"?><nodes><upon/></nodes>");
			(end)
	*/
	constructor: function(xml, params) {
		if(typeof XMLDocument != 'undefined' && xml instanceof XMLDocument) {
			this.xmlDocument = xml;
		} else if(xml.readyState) { // Internet Explorer DOMDocument
			this.xmlDocument = xml;
		} else {
			if(window.ActiveXObject) {
			  this.xmlDocument = new ActiveXObject("Microsoft.XMLDOM");
			  this.xmlDocument.async = 'false';
			  this.xmlDocument.loadXML(xml);
			} else if(document.implementation && document.implementation.createDocument) {
				var xmlParser = new DOMParser();
			  this.xmlDocument = xmlParser.parseFromString(xml, 'text/xml');
			} else {
				throw new Error('ERROR mojo.helper.XML.constructor - This browser does not support XML parsing');
			}
		}
		
		this.params = new mojo.helper.XML.params();
		for(key in params) {
			this.params[key] = params[key];
		}
	},
	
	/*
		APIMethod: toObject
	
		Static function--Returns a JavaScript object representation of this instance of mojo.helper.XML 
		
		Example:
			(start code)
				
			(end)
  */
	toObject: function() {
		var object = {};
		var rootNode = this.xmlDocument.documentElement;
		
		var contents = this._parseNode(rootNode);

		object[rootNode.nodeName] = contents;
		
		return object;
	},
	
	/*
		Method: parseNode
		
		Private function--Parses an XML node as a JavaScript object
		
		Parameters:
			node - {Element|Text|CDATASection} The node to parse
			
		Returns:
			A JavaScript object representation of the XML node
	*/
	_parseNode: function(node) {
		var object = null;
		var textualNode = true;
		var hasAttributes = false;
		
		// Look for comment nodes
		if(node.nodeType == 7) return;
		
		// Look for text nodes or CDATA sections
		if(node.nodeType == 3 || node.nodeType == 4) {
			if (this._isWhiteSpace(node.nodeValue)) return;
			
			return node.nodeValue;
  	}

		// Look for attributes
		if (node.attributes) {
			var len = node.attributes.length;
			if(len) {
				hasAttributes = true;
				if(!object) object = {};
				
	   	 	for(var i = 0; i < len; i++) {
	        object['@' + node.attributes[i].nodeName] = this._toJavaScriptType(node.attributes[i].nodeValue);
		    }
			}
		}

		// Recurse if the current node contains children
		if(node.childNodes) {
			var len = node.childNodes.length;
			
			if(len) {
				if(!object) object = {};
			
				// Determine if the current node contains only text nodes, or if its last node is a text node
				for(var i = 0; i < len; i++) {
					var childNodeType = node.childNodes[i].nodeType;
					textualNode = (childNodeType == 3 && !this._isWhiteSpace(node.childNodes[i].nodeValue));
				}
			
				// If the current node contains only text nodes, or the last node is a text node, flatten them now
				if(textualNode && !hasAttributes) {
					for(var i = 0; i < len; i++) {
						if(i == 0) {
							object = this._nodeToString(node.childNodes[i]);
						} else {
							object += this._nodeToString(node.childNodes[i]);
						}
					}
				} else {
					for(var i = 0; i < len; i++) {
						var parsedNode = this._parseNode(node.childNodes[i]);
						if(typeof parsedNode == 'undefined') continue;
						
						var nodeName = node.childNodes[i].nodeName;
						
						if(nodeName == '#cdata-section') nodeName = '#cdata';
						
						if(object[nodeName]) {
							if(!(object[nodeName] instanceof Array) && nodeName != '#cdata') {
								object[nodeName] = [object[nodeName]];
							}
							if(nodeName == '#cdata') {
								object[nodeName] += parsedNode;
							} else {
								object[nodeName].push(parsedNode);
							}
						} else {
							if(this._shouldInferArrays(node, object)) {
								object[nodeName] = [parsedNode];
							} else {
								object[nodeName] = parsedNode;	
							}
						}
					}
				}
			}	else if(this._shouldInferArrays(node, object)) {
				if(!object) object = {};
				object[mojo.helper.Inflector.singularize(node.nodeName)] = [];
			}
		}
		
		return object;
	},
	
	_shouldInferArrays: function(node, object) {
		return (this.params.inferArrays
	         && (
						// parent node has a plural nodeName
						(mojo.helper.Inflector.pluralize(mojo.helper.Inflector.singularize(node.nodeName)) == node.nodeName)
			  
						|| // OR
			 
						// parent node has a numeric total attribute
						(object && Number(object['@total']).toString() != 'NaN')
					));
	},
	
	_isWhiteSpace: function(text) {
		return !text.match(/[^\x00-\x20]/);
	},
	
	/*
		Method: _nodeToString
		
		Private function--Returns a string representation of an XML node
		
		Parameters:
			node - {Element|Text|CDATASection} The node to parse
			
		Returns:
			A string representation of the XML node
	*/
	_nodeToString: function(node) {
		var nodeType = node.nodeType;
		var nodeName = node.nodeName;
		
		switch(nodeType) {
			// Element nodes
			case 1:
				// open the xml node
				str = '<' + nodeName;
				
				// write out attributes
				if(node.attributes) {
					var len = node.attributes.length;
					if(len) {
						for(var i = 0; i < len; i++) {
							var key = node.attributes[i].nodeName;
							var value = node.attributes[i].nodeValue || '';
							str += ' ' + key + '="' + value + '"';
						}
					}
				}
				
				// Check for content inside this node
				if(node.childNodes) {
					var len = node.childNodes.length;
					if(len) {
						var hasInnerXml = true;
						str += '>';
						for(var i = 0; i < len; i++) {
							str += this._nodeToString(node.childNodes[i]);
						}
					}
				}
				
				// Close the node
				if(hasInnerXml) {
					str += '</' + nodeName + '>';
				} else {
					str += '/>';
				}
				break;
			// Text nodes
			case 3:
				str = this._toJavaScriptType(node.nodeValue);
			  break;
			// CDATA nodes
			case 4:
			  str = '<![CDATA[' + node.nodeValue + ']]>';
				break;
		}
		
		return str;
	},
	
	/*
		Method _toJavaScriptType
	
		Private function--Detects common patterns and casts to proper JavaScript types where appropriate
		
		Parameters:
		  variable - {string} The string to search for a recognized JavaScript type
		
		Returns:
		  A JavaScript type, if detected. Otherwise, returns the original string.
	*/
	_toJavaScriptType: function(variable) {
		// Detect booleans
		if(variable.toLowerCase() == "false") return false;
		if(variable.toLowerCase() == "true") return true;
		
		// Detect octal numbers (0777, 0367)
		if(variable.match('0[0-7]{3}') && variable.indexOf("-")<=0) {
			var octal_number = parseInt(variable);
			return octal_number;
		}		
		
		// Detect numbers (123, 123.456, 1.7976931348623157e+308, Infinity)
		var number = parseFloat(variable);
		if(number == variable) return number;
				
		// Detect hex numbers (0xFF)
		var hex_number = parseInt(variable);
		if(hex_number == variable) return hex_number;
		
		// Detect dates
		if (variable.match(/^[0-9]+[\- ][0-9]+[\- ][0-9]+/)) { // handle 2008-06-06 and 2008 6 6 format
			var date = new Date(variable.replace(/[\- ]/g, "/"));
		} else {
			var date = new Date(variable);
		}
		if(date instanceof Date && date.toString() != 'Invalid Date' && date.toString() != 'NaN') return date;
		
		return variable;
	}
});

/*
	APIMethod
	
	Class function--Returns a JavaScript object representation of the XML string or XmlDocument passed in 

	Parameters:
		xml - {string|XmlDocument} The XML to convert to a JavaScript object.
		params - {<mojo.helper.XML.params>} Optional parameters.
*/
mojo.helper.XML.toObject = function(xml, params) {
	var xml = new mojo.helper.XML(xml, params);
	return xml.toObject();
};

/*
  Class: XML.params

	Parameters for XML manipulations.
*/
dojo.declare('mojo.helper.XML.params', null, {
	/**
	 * Property: inferArrays
	 * {Boolean} Determines whether or not the XML parser will treat unique nodes who are children of a parent with a plural nodeName, or children of a node with a total attribute, as those which should form part of an array. Defaults to true.
	 *
	 * Example:
	 * (start code)
	 * // Nodes who are children of a parent with a plural nodeName
	 * var objectWithInference = mojo.helpers.XML.toObject('<nodes><a>All By Myself</a></nodes>', { inferArrays: true }); // => {nodes: { a: ['All By Myself'] } }
	 * var objectWithoutInference = mojo.helpers.XML.toObject('<nodes><a>All By Myself</a></nodes>', { inferArrays: false }); // => {nodes: { a: 'All By Myself' } }
	 *
	 * // Nodes whose parent has a total attribute
	 * var objectWithInference = mojo.helpers.XML.toObject('<review_array total="1"><review>All By Myself</review></review_array>', { inferArrays: true }); // => {review_array: { review: ['All By Myself'] } }
	 * var objectWithoutInference = mojo.helpers.XML.toObject('<review_array total="1"><review>All By Myself</review></review_array>', { inferArrays: false }); // => {review_array: { review: 'All By Myself' } }
	 */
	inferArrays: true
});