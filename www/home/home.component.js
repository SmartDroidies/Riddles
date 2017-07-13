'use strict';

// Register `home` component, along with its associated controller and template
angular.
  module('home').
  component('home', {
    templateUrl: 'home/home.template.html',
    controller: ['$log', '$firebaseObject', '$firebaseArray', '$mdDialog', '$location', '$rootScope',
      function HomeController($log, $firebaseObject, $firebaseArray, $mdDialog, $location, $rootScope) {
        var self = this;

		self.feedback = function() {
			$rootScope.feedback();
		} 

		self.share = function() {
			$rootScope.share();
		} 

		self.rateus = function() {
			$rootScope.rateus();
		} 
		
		self.restart = function() {
			//$log.debug('Restart Pudhir from Start');	
			var confirm = $mdDialog.confirm()
			  .title('Are you sure you want to Restart?')
			  .textContent('You will loose your current position.')
			  .targetEvent(event)
			  .ok('Yes')
			  .cancel('No'); 
			$mdDialog.show(confirm).then(function() {
				self.postion.seq = null;
				self.postion.$save().then(function(data) {
					//$log.debug('Position : ' + self.postion.seq);
					$location.path("/pudhir"); 
				}, function(error) {
					$log.error("restart Error in reset user position : " + error);
					window.Firebase.exception("restart Error in reset user position : " + error);
				})
				window.Firebase.event("position_flushed", '');
			}, function() {
				//$log.debug('Position clear cancelled');
			});    
		}
		
		self.initialize = function() {
			self.collectUserPosition();	
			self.collectFavouriteCount();	
			self.testDevice = true;
		}
		
		//Collect users  position  
        self.collectUserPosition = function() {
            var refPosition = firebase.database().ref('position/' + deviceuuid);
			var objPosition = $firebaseObject(refPosition);
			objPosition.$loaded().then(function(data) {
				if(objPosition.seq && objPosition.seq > 0) {
					//$log.debug("collectUserPosition sequence : " + objPosition.seq);
					self.postion = objPosition;
					self.notstarted = false;
				} else {
					self.notstarted = true;
				}
			}).catch(function(error) {
				$log.error("collectUserPosition Error in collecting user position : " + error);
                window.Firebase.exception("collectUserPosition Error in collecting user position : " + error);
            });
        }

		//Collect favourite count  
        self.collectFavouriteCount = function() {
            var refFavourite = firebase.database().ref('favourites/' + deviceuuid);
			var objFavourites = $firebaseArray(refFavourite);
            objFavourites.$loaded().then(function(data) {
				if(objFavourites && objFavourites.length > 0) {
					//$log.debug("collectFavouriteCount : " + objFavourites.length);
					self.favempty = false;
				} else {
					self.favempty = true;
				}
            }).catch(function(error) {
				$log.error("collectFavouriteCount Error in collecting favourite count : " + error);
                window.Firebase.exception("collectFavouriteCount Error in collecting favourite count : " + error);
            });			
        }
		
		self.onExit = function() {
			if ( $('.ui-page-active').attr('id') == 'main') {
				alert('Alert for exit');
				self.exitAppPopup();	
			} else {
				$window.history.back();
			}
		};
		

		self.initialize();
		
  		if(!$rootScope.visited) {
  			$rootScope.visited = true;
  			document.addEventListener("backbutton", self.onExit, false);
  		} else {
  			//showInterstitial();
  		}

      }
    ]
  });