angular.module('pudhirApp', ['ngRoute', 'ngSanitize', 'ngMaterial', 'ngAnimate', 'jm.i18next', 'underscore', 'pudhir.controllers', 'pudhir.services', 'pudhir.cache'])

.config(['$routeProvider', 
		function ($routeProvider) {
			$routeProvider.when('/home', {
				templateUrl : 'views/base.html',
				controller : 'HomeCtrl',
        controllerAs: 'homeCtrl'
			}).when('/pudhir/:mode/:action', {
				templateUrl : 'views/pudhir.html',
				controller : 'PudhirCtrl',
        controllerAs: 'pudhirCtrl'
			}).otherwise({
				redirectTo : '/home'
			});
		}
])
.config(function($mdThemingProvider, $mdIconProvider) {
	$mdThemingProvider.theme('default')
		.primaryPalette('red')
		.accentPalette('grey')
    .warnPalette('deep-orange')
		.backgroundPalette('grey')
    .dark();

  $mdIconProvider.icon("share", "./assets/svg/share.svg", 24);    
})
.run(function($rootScope, $location, $log) {

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

  	//Go Back
  	$rootScope.back = function () {        
  		window.history.back();
  	};  

    //Go Home
    $rootScope.home = function () {        
      $location.path("/home"); 
    };  
});

//ng-i18next - use i18next with Angularjs
angular.module('jm.i18next').config(['$i18nextProvider', function ($i18nextProvider) {
    $i18nextProvider.options = {
        lng: 'ta',
        useCookie: false,
        useLocalStorage: false,
        fallbackLng: 'en',
        resGetPath: 'locales/__lng__/__ns__.json',
        defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
    };
}]);
