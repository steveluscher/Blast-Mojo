dojo.registerModulePath("mojo", "../../src");
dojo.registerModulePath("helloworld", "../helloworld/js/helloworld");
//dojo.require("mojo.controller.Controller");
//dojo.require("mojo.controller.Map");

//dojo.require("mojo.css");
//dojo.require("mojo.animate");

dojo.require("helloworld.SiteMap");
//dojo.extend(mojo, dojo);
dojo.addOnLoad(function() {
  var ctrlIniter = mojo.controller.Map.getInstance();
  ctrlIniter.setSiteMap(helloworld.SiteMap);
  ctrlIniter.mapControllers(window.location.href);
});

