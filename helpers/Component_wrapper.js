/*
 * Wrapper for Titanium UI components.  This wrapper provides a few pieces of critical
 * functionality, currently missing from Titanium UI objects:
 * - The ability to safely extend components with new members
 * - Resource management and object lifecycle handling
 * - Some syntactical sugar
 * 
 * Caveat Number One:
 * Not all Titanium UI objects are perfectly wrappable.  Some still need to be used directly,
 * notably TableViews and TableViewRows, since they contain LOTS of magic - like purple, sparkly 
 * unicorn magic.  If you need a TableView, it's best to have it as a child of a Component-ized 
 * view, and work with the TableView directly.
 * 
 * Caveat Number Two:
 * This is not an Appcelerator-supported API - this is one approach to accomplishing the goals of
 * best-practice UI development.  This Component wrapper can be considered an advanced use of the
 * Titanium API, and should only be used by developers who are already knowledgeable about the core
 * Titanium JavaScript APIs.
 * 
 */
function Component(/*Titanium Proxy Object*/ tiView) {
	this.viewProxy = tiView;
	this.globalHandlers = {};
}

//Wrappers for common Titanium view construction functions
Component.prototype.add = function(tiChildView) {
	var v = tiChildView.viewProxy||tiChildView;
	this.viewProxy.add(v);
};
Component.prototype.remove = function(tiChildView) {
	var v = tiChildView.viewProxy||tiChildView;
	this.viewProxy.remove(v);
};
Component.prototype.open = function(args) {
	if (this.viewProxy.open) {
		this.viewProxy.open(args||{animated:false});
	}
};
Component.prototype.close = function(args) {
	if (this.viewProxy.close) {
		this.viewProxy.close(args||{animated:false});
	}
};
Component.prototype.animate = function(args,callback) {
	this.viewProxy.animate(args,callback||function(){});
};

//Getter/Setter for the wrapped Titanium view proxy object
Component.prototype.get = function(key) {
	return this.viewProxy[key];
};
Component.prototype.set = function(key,value) {
	this.viewProxy[key] = value;
};

//Event Handling
Component.prototype.on = function(event,callback) {
	switch (event) {
		case 'location':
			this.globalHandlers.location = callback;
			Ti.Geolocation.addEventListener('location', this.globalHandlers.location);
			break;
		case 'orientationchange':
			this.globalHandlers.orientationchange = callback;
			Ti.Gesture.addEventListener('orientationchange', this.globalHandlers.orientationchange);
			break;
		default:
			this.viewProxy.addEventListener(event,callback);
			break;
	}
};
Component.prototype.fire = function(event,data) {
	this.viewProxy.fireEvent(event,data||{});
};

//Sugar for handling orientation change
Component.prototype.orientation = function(branches) {
	this.on('orientationchange', function(e) {
		switch (e.orientation) {
			case Ti.UI.PORTRAIT:
			case Ti.UI.UPSIDE_PORTRAIT:
				if (branches.portrait) {
					branches.portrait.call(this);
				}
				break;
			case Ti.UI.LANDSCAPE_LEFT:
			case Ti.UI.LANDSCAPE_RIGHT:
				if (branches.landscape) {
					branches.landscape.call(this);
				}
				break;
		}
	});
};

//This should be overridden by any Components which wish to execute custom 
//clean up logic, to release their child components, etc.
Component.prototype.onDestroy = function() {};

//Clean up resources used by this Component
Component.prototype.release = function() {
	//remove global event handlers
	if (this.globalHandlers.location) {
		Ti.Geolocation.removeEventListener('location', this.globalHandlers.location);
	}
	if (this.globalHandlers.orientationchange) {
		Ti.Gesture.removeEventListener('orientationchange', this.globalHandlers.orientationchange);
	}

	//force cleanup on proxy
	this.viewProxy = null;

	//run custom cleanup logic
	this.onDestroy();
};

//adding to public interface
exports.Component = Component;

//Component-wrapped and sugared Titanium UI object constructors - most common ones included, add/remove as needed
exports.Window = function(args) {
	return new Component(Ti.UI.createWindow(args));
};
exports.View = function(args) {
	return new Component(Ti.UI.createView(args));
};
exports.Button = function(args) {
	return new Component(Ti.UI.createButton(args));
};
exports.ScrollView = function(args) {
    return new Component(Ti.UI.createScrollView(args));
};
exports.ScrollableView = function(args) {
	var views = [],
		newargs = args;

	//unwrap child views of ScrollableView
	for(var i = 0, l = _args.views.length; i<l; i++) {
		var v = _args.views[i].viewProxy||_args.views[i];
		views.push(v);
	}
	newargs.views = views;

	return new Component(Ti.UI.createScrollableView(newargs));
};
exports.ImageView = function(image,args) {
	var newargs = args||{};
	newargs.image = image;
	return new Component(Ti.UI.createImageView(newargs));
};
exports.Label = function(textOrKey, args) {
	var newargs = args||{};
	newargs.text = L(textOrKey,textOrKey);
	return new Component(Ti.UI.createLabel(newargs));
};