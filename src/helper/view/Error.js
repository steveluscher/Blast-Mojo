
/*
	DEPRECATED.
*/

dojo.provide("mojo.helper.view.Error");

mojo.helper.view.Error.showElementErrors = function(errorList, targetElement) {
	var errorListLength = errorList.length;
	for (var i = 0; i < errorListLength; i++) {
		var error = errorList[i];
		var err = document.createElement("span");
		err.className = "mojoValidationError";
		err.innerHTML = error.message;
		if (targetElement != null) {
			//dojo.place(err, targetElement, 'after');
			//targetElement.innerHTML = "";
			targetElement.appendChild(err);
		} else {
			if(error.element.type == "checkbox") {
				if(error.element.parentNode.tagName == "LABEL") {
					dojo.place(err, error.element.parentNode, 'after');
				} else {
					dojo.place(err, error.element, 'after');
				}
			} else {
				dojo.place(err, error.element, 'after');
			}
			
		}
	}
};