/*
	Class: mojo
	Note: These functions reside within the mojo.* namespace.
*/
var mojo = {
	version: "1.1.4",
	/*
	Function: evaluateClassPath

	Returns the variable denoted by a dot-separated classpath

	Parameters:
		classPath - {string}

	Returns:
		{Mixed} variable

	Example:
		(start code)
		// instantiate an object by classpath without using eval
		var myObjectClassPath = 'stdlib.controller.TemplateController';
		var myObjectInstance = new mojo.evaluateClassPath(myObjectClassPath)();
		(end)
	*/
	evaluateClassPath: function(classPath) {
		var classPathParts = classPath.split('.');

		var variable = window;
		for(var len=classPathParts.length, i=0; i < len; i++) {
		  if(variable) variable = variable[classPathParts[i]];
		}
		return variable;
	}
};