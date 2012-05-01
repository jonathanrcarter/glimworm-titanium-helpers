//	http://code.google.com/p/oauth-adapter/wiki/UsageManualR4
Ti.include('/helpers/oauth_adapter.js');

function twitter() {
	this.oAuthAdapter = null;
};


twitter.prototype.runQuery = function(FN) {
	if (this.oAuthAdapter == null) {
		this.oAuthAdapter = new OAuthAdapter(
	        '<your-consumer-secret>',
	        '<your-consumer-key>',
	        'HMAC-SHA1');
	}

	if (FN == "") {
		// load the access token for the service (if previously saved)
		this.oAuthAdapter.loadAccessToken('twitter');
		
		this.oAuthAdapter.send('https://api.twitter.com/1/statuses/update.json', [['status', 'hey @ziodave, I successfully tested the #oauth adapter with #twitter and @appcelerator #titanium!']], 'Twitter', 'Published.', 'Not published.');
		
		// if the client is not authorized, ask for authorization. the previous tweet will be sent automatically after authorization
		if (this.oAuthAdapter.isAuthorized() == false) {
		    // this function will be called as soon as the application is authorized
		    var receivePin = function() {
		        // get the access token with the provided pin/oauth_verifier
		        this.oAuthAdapter.getAccessToken('http://twitter.com/oauth/access_token');
		        // save the access token
		        this.oAuthAdapter.saveAccessToken('twitter');
		    };
		    
		    // show the authorization UI and call back the receive PIN function
			this.oAuthAdapter.showAuthorizeUI('https://api.twitter.com/oauth/authorize?' + this.oAuthAdapter.getRequestToken('https://api.twitter.com/oauth/request_token'), receivePin);
		

		}
	}
}	

module.exports = twitter;

