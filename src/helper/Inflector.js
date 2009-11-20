/*
 	Class: Inflector

	Utility methods for pluralizing strings and ordinalizing numbers.
*/
dojo.provide("mojo.helper.Inflector");

var __mojoInflector = null;

dojo.declare('mojo.helper.Inflector', null, {
	Inflections: {
		plural: [
		  [/(quiz)$/i,               "$1zes"  ],
		  [/^(ox)$/i,                "$1en"   ],
		  [/([m|l])ouse$/i,          "$1ice"  ],
		  [/(matr|vert|ind)ix$|ex$/i, "$1ices" ],
		  [/(x|ch|ss|sh)$/i,         "$1es"   ],
		  [/([^aeiouy]|qu)y$/i,      "$1ies"  ],
		  [/(hive)$/i,               "$1s"    ],
		  [/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
		  [/sis$/i,                  "ses"    ],
		  [/([ti])um$/i,             "$1a"    ],
		  [/(buffal|tomat)o$/i,      "$1oes"  ],
		  [/(bu)s$/i,                "$1ses"  ],
		  [/(alias|status)$/i,       "$1es"   ],
		  [/(octop|vir)us$/i,        "$1i"    ],
		  [/(ax|test)is$/i,          "$1es"   ],
		  [/s$/i,                    "s"      ],
		  [/$/,                      "s"      ]
		],
		singular: [
		  [/(quiz)zes$/i,                                                    "$1"     ],
		  [/(matr)ices$/i,                                                   "$1ix"   ],
		  [/(vert|ind)ices$/i,                                               "$1ex"   ],
		  [/^(ox)en/i,                                                       "$1"     ],
		  [/(alias|status)es$/i,                                             "$1"     ],
		  [/(octop|vir)i$/i,                                                 "$1us"   ],
		  [/(cris|ax|test)es$/i,                                             "$1is"   ],
		  [/(shoe)s$/i,                                                      "$1"     ],
		  [/(o)es$/i,                                                        "$1"     ],
		  [/(bus)es$/i,                                                      "$1"     ],
		  [/([m|l])ice$/i,                                                   "$1ouse" ],
		  [/(x|ch|ss|sh)es$/i,                                               "$1"     ],
		  [/(m)ovies$/i,                                                     "$1ovie" ],
		  [/(s)eries$/i,                                                     "$1eries"],
		  [/([^aeiouy]|qu)ies$/i,                                            "$1y"    ],
		  [/([lr])ves$/i,                                                    "$1f"    ],
		  [/(tive)s$/i,                                                      "$1"     ],
		  [/(hive)s$/i,                                                      "$1"     ],
		  [/([^f])ves$/i,                                                    "$1fe"   ],
		  [/(^analy)ses$/i,                                                  "$1sis"  ],
		  [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
		  [/([ti])a$/i,                                                      "$1um"   ],
		  [/(n)ews$/i,                                                       "$1ews"  ],
		  [/s$/i,                                                            ""       ]
		],
		irregular: [
		  ['move',   'moves'   ],
		  ['sex',    'sexes'   ],
		  ['child',  'children'],
		  ['man',    'men'     ],
		  ['person', 'people'  ],
		  ['cow',    'kine']
		],
		uncountable: [
		  "sheep",
		  "fish",
		  "series",
		  "species",
		  "money",
		  "rice",
		  "information",
		  "equipment"
		]
	},
	
	ordinalize: function(number) {
		if (11 <= parseInt(number) % 100 && parseInt(number) % 100 <= 13) {
		  return number + "th";
		} else {
		  switch (parseInt(number) % 10) {
		    case  1: return number + "st";
		    case  2: return number + "nd";
		    case  3: return number + "rd";
		    default: return number + "th";
		  }
		}
	},

	pluralize: function(word) {
		for (var i = 0; i < this.Inflections.uncountable.length; i++) {
		  var uncountable = this.Inflections.uncountable[i];
			if (word.toLowerCase() == uncountable) {
		    return uncountable;
		  }
		}
		for (var i = 0; i < this.Inflections.irregular.length; i++) {
			var singular = this.Inflections.irregular[i][0];
		  var plural   = this.Inflections.irregular[i][1];
		  var endMatch = new RegExp(singular+'$');
			if (endMatch.test(word.toLowerCase()) || word == plural) {
		    return word.replace(endMatch, plural);
		  }
		}
		for (var i = 0; i < this.Inflections.plural.length; i++) {
		  var regex          = this.Inflections.plural[i][0];
		  var replace_string = this.Inflections.plural[i][1];
		  if (regex.test(word)) {
	     return word.replace(regex, replace_string);
		  }
		}
	},
	
	singularize: function(word) {
    for (var i = 0; i < this.Inflections.uncountable.length; i++) {
      var uncountable = this.Inflections.uncountable[i];
      if (word.toLowerCase == uncountable) {
        return uncountable;
      }
    }
    for (var i = 0; i < this.Inflections.irregular.length; i++) {
      var singular = this.Inflections.irregular[i][0];
      var plural   = this.Inflections.irregular[i][1];
      var endMatch = new RegExp(plural+'$');
			if ((endMatch.test(word.toLowerCase())) || (word == plural)) {
        return word.replace(endMatch, singular);
      }
    }
    for (var i = 0; i < this.Inflections.singular.length; i++) {
      var regex          = this.Inflections.singular[i][0];
      var replace_string = this.Inflections.singular[i][1];
      if (regex.test(word)) {
        return word.replace(regex, replace_string);
      }
    }
		return word;
  }
});

mojo.helper.Inflector.pluralize = function(string) {
    var inflector = mojo.helper.Inflector.getInstance();
		return inflector.pluralize(string);
}

mojo.helper.Inflector.singularize = function(string) {
    var inflector = mojo.helper.Inflector.getInstance();
		return inflector.singularize(string);
}

mojo.helper.Inflector.ordinalize = function(number) {
    var inflector = mojo.helper.Inflector.getInstance();
		return inflector.ordinalize(number);
}

/*
	Function: getInstance
	
	Static function--Retrieves a Mojo Inflector instance. 
	
	Example:
		(start code)
		var myInflector = mojo.helper.Inflector.getInstance();
		(end)
	
	Returns:
		{object} mojo.helper.Inflector
*/
mojo.helper.Inflector.getInstance = function() {
	if (__mojoInflector == null) {
		__mojoInflector = new mojo.helper.Inflector();
	}
	return __mojoInflector;
};