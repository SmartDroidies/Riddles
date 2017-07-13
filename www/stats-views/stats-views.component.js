  'use strict';

// Register `statsView` component, along with its associated controller and template
angular.
  module('statsViews').
  component('statsViews', {
    templateUrl: 'stats-views/stats-views.template.html',
    controller: ['$log', '$scope', '$firebaseObject', '$firebaseArray', '$routeParams',
      function StatsViewController($log, $scope, $firebaseObject, $firebaseArray, $routeParams) {
        var self = this;

		//Perform actions on initialize	
		self.initialize = function() {
			self.isLoading = true;
			if(self.section == 'favs') {
				$log.debug("Display Favourite Stats");
			} else if(self.section == 'likes') {
				//$log.debug("Display Likes Stats");
				self.statsByLikes();
			} else {
				//$log.debug("Display Views Stats");	
				self.statsByView();
			}
        }

		self.pudhir = function(ev, id) {
			$log.debug('Display Pudhir details in model dialog for : ' + id);
            var refPudhir = firebase.database().ref("pudhir").orderByChild("seq").equalTo(id).limitToFirst(1);
			// this uses AngularFire to create the synchronized array
			var pudhir =  $firebaseObject(refPudhir);
            pudhir.$loaded(function() {
				alert(pudhir.quest);
            }).catch(function(error) {
				/*
                $log.error("Error in collecting pudhir from firebase : " + seq, error);
                window.Firebase.exception("Error in collecting pudhir from firebase - " + seq + " : " + error);
				self.isLoading = false;
				self.isContent = false;
				self.isError = true;
				self.message = 'error.network';
				*/
            });
		}
		
        //Display Stats By Views
        self.statsByView = function() {
          var refStats = firebase.database().ref("stats").orderByChild("views").limitToLast(100);
          var arrStats = $firebaseArray(refStats);
          arrStats.$loaded().then(function(data) {
            $log.debug("Size of stats : " + _.size(arrStats));             
			var stats = arrStats;
			stats = _.sortBy(stats, function(stat) { return -stat.views; });
			self.stats = stats;
			self.isLoading = false;
			self.isContent = true;
			self.message = null;
			self.isError = false;	
          }).catch(function(error) {
              $log.error("statsByView Error in collecting stats from firebase - " + error);
              window.Firebase.exception("statsByView Error in collecting stats from firebase - " + error);
          });
        }
		
		//Load Firebase Pudhir Likes
        self.statsByLikes = function(pudhir) {
          var likesRef = firebase.database().ref("likes");
          var arrLikes = $firebaseArray(likesRef);
          arrLikes.$loaded().then(function(data) {
             $log.debug("Size of likes : " + _.size(arrLikes));             
			 var stats = arrLikes;
			_.each(stats, function(stat) {
				//$log.debug("Like Size of : " + stat.$id + " - " + _.size(stat));
				stat.size = _.size(stat);
			});			 
			stats = _.sortBy(stats, function(stat) { return -stat.size; });
			 
			 self.stats = stats;
			 self.isLoading = false;
			 self.isContent = true;
			 self.message = null;
			 self.isError = false;	
          }).catch(function(error) {
              $log.error("statsByLikes Error in collecting stats from firebase - " + error);
              window.Firebase.exception("statsByLikes Error in collecting stats from firebase - " + error);
          });
        };

		if($routeParams.section) {	
			//$log.debug("Display Stats for - " + $routeParams.section);
			self.section = $routeParams.section;
		}
		
		self.initialize();
		
      }
    ]
  });