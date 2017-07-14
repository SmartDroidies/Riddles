'use strict';

angular.
  module('pudhirApp').
  config(['$locationProvider' ,'$routeProvider', 
    function config($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/home', {
          template: '<home></home>'
        }).
        when('/pudhir', {
          template: '<pudhir></pudhir>'
        }).
        when('/favourites', {
          template: '<pudhir></pudhir>',
		  resolve: { viewfav: function ($route) { $route.current.params.viewfav = true; } }
        }).
        when('/stats/:section', {
          template: '<stats-views></stats-views>'
        }).
        when('/likestats', {
          template: '<stats-likes></stats-likes>'
        }).
        when('/favstats', {
          template: '<stats-fav></stats-fav>'
        }).
		
        otherwise('/home');
    }
  ])
  
  //Theme configure 
  .config(function($mdThemingProvider, $provide) {

  	$mdThemingProvider.theme('default')
		.primaryPalette('cyan')
		.accentPalette('orange')
		.warnPalette('red')
		.backgroundPalette('brown')
  })
  
.run(function($rootScope, $location, $log) {

	/*
	//Share App
  	$rootScope.share = function () {   
  	  window.plugins.socialsharing.share('\u0bae\u0bc0\u0ba3\u0bcd\u0b9f\u0bc1\u0bae\u0bcd \u0baa\u0baf\u0ba3\u0bbf\u0baa\u0bcd\u0baa\u0bcb\u0bae\u0bcd \u0b9a\u0bbf\u0bb1\u0bc1 \u0bb5\u0baf\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1 - ', '\u0bb5\u0bbf\u0b9f\u0bc1\u0b95\u0ba4\u0bc8\u0b95\u0bb3\u0bcd', null, C_APPMKT_URL);
      window.Firebase.event("app_share", 'share');
  	}

  	//Rate US
  	$rootScope.rateus = function () {        
	  var url = "market://details?id=com.smart.droid.tamil.pudhir";
      window.open(url,"_system");		
      window.Firebase.event("app_rate", 'rate');
  	};  

  	//Feedback
  	$rootScope.feedback = function () {     
      //FIXME - Not working Fix it   
      window.Firebase.event("app_feedback", 'feedback');	
      cordova.plugins.email.open({
          to:      'smartdroidies@gmail.com',
          subject: '\u0bb5\u0bbf\u0b9f\u0bc1\u0b95\u0ba4\u0bc8\u0b95\u0bb3\u0bcd \u0baa\u0bb1\u0bcd\u0bb1\u0bbf \u0b95\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1 - ' + AppVersion.version,
          body:    '',
          isHtml:  true
      });      
  	};

  	//Recipies
  	$rootScope.recipie = function (piruvu) {        
  	   var newpath = "/recipies/" + piruvu;
	     $location.path(newpath); 
  	};  

  	//Go Back
  	$rootScope.back = function () {        
  		window.history.back();
  	};  

    //Go Home
    $rootScope.home = function () {        
      $location.path("/home"); 
    };  
	*/
	
	$rootScope.authenticate = function() {
		firebase.auth().signInAnonymously().catch(function(error) {
			$log.error(error.message);
			window.Firebase.exception(error.message);
		});

		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
			  // User is signed in.
			  var isAnonymous = user.isAnonymous;
			  var uid = user.uid;
			  $log.debug("Anonymous User : " + uid);
			} else {
			  // User is signed out. Display Exception Message to user
			}
		});
	};     

	$rootScope.authenticate(); 	
	
});

//ng-i18next - use i18next with Angularjs
angular.module('jm.i18next').config(['$i18nextProvider', function ($i18nextProvider) {
    $i18nextProvider.options = {
        lng: 'en',
        useCookie: false,
        useLocalStorage: false,
        fallbackLng: 'en',
        resGetPath: 'locales/__lng__/__ns__.json',
        defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
    };
}]);
