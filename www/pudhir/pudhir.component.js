'use strict';

// Register `pudhir` component, along with its associated controller and template
angular.
  module('pudhir').
  component('pudhir', {
    templateUrl: 'pudhir/pudhir.template.html',
    controller: ['$log', '$scope', '$firebaseObject', '$firebaseArray', '$routeParams',
      function PudhirController($log, $scope, $firebaseObject, $firebaseArray, $routeParams) {
        var self = this;

		//Perform actions on initialize	
		self.initialize = function() {
			self.loadUserPosition();
			self.loadFavourites();
			self.isLoading = true;
        }

		//Collect users current position  
        self.loadUserPosition = function() {
			//$log.debug("Collect user position");
            var refPosition = firebase.database().ref('position/' + deviceuuid);
            $scope.position = $firebaseObject(refPosition);
            $scope.position.$bindTo($scope, "position");
            $scope.position.$loaded().then(function(data) {
				if(!$scope.favmode) {
					if($scope.position && $scope.position.seq) {
						self.seq = $scope.position.seq;    
					} else {
						self.seq = 1;    
						//$log.debug("Initilizing sequence : " + self.seq);
					}
					//$log.debug("Position Sequence : " + self.seq);
					self.loadPudhir(self.seq, true);
				}
            }).catch(function(error) {
				//FIXME - Show error on UI
				$log.error("Error in loadUserPosition : " + error);
                window.Firebase.exception("Error in loadUserPosition : " + error);
            });
        }

		//Loading User Favourites to Scope
		self.loadFavourites = function() {
            var refFavourite = firebase.database().ref('favourites/' + deviceuuid);
			$scope.favourites = $firebaseArray(refFavourite);
            $scope.favourites.$loaded().then(function(data) {
				if($scope.favmode) {
					$scope.favcount = _.size(data);
					if($scope.favcount > 0) {
						self.favindex = 0;
						self.loadFavPudhir(self.favindex);
					} else {
						self.pudhir = null;
						self.isContent = false;
						self.isLoading = false;
						self.isError = true;	
						self.message = "error.favempty";  
					}
				} 
            }).catch(function(error) {
                $log.error("Error in collecting favourites pudhir from firebase - " , error);
                window.Firebase.exception("Error in collecting favourites pudhir from firebase - " + error);
				//self.isLoading = false;
				//self.isContent = false;
				//self.isError = true;
				//self.message = 'error.network';
            });
			
		}
		
		self.collectLocalPudhir = function(seq) {
			var bPudhirFound = false;
			if($scope.pudhirs) {
				bPudhirFound = _.find($scope.pudhirs, function(pudhir) { 
					//$log.debug("Sequence : " + pudhir.seq + " - " + seq);	
					return pudhir.seq == seq;
				});
				//$log.debug('Finding Pudhir in Local for Sequence : ' + seq + ' - ' + bPudhirFound);
			}
			return bPudhirFound;
		}
		
		self.populateLocalPudhir = function(seq) {
			//$log.debug("Populate pudhir into scope for Sequence : " + seq);	
			var startSeq = self.startSequence(seq);
			self.isLoading = true;
			self.isError = false;
            var refPudhir = firebase.database().ref("pudhir").orderByChild("seq").startAt(startSeq).limitToFirst(recordsToDownload);
			// this uses AngularFire to create the synchronized array
			var pudhirs =  $firebaseArray(refPudhir);
            pudhirs.$loaded(function() {
				//$log.debug("Records Loaded : " + _.size(pudhirs));
				var count = pudhirs.length;
				if(count > 0) {
					$scope.pudhirs = pudhirs;
					self.loadPudhir(seq, false);
				} else {
					//FIXME - Throw Exception based on the sequence 
					//FIXME - Display Message based on the sequence 
				}
				self.isLoading = false;
            }).catch(function(error) {
                $log.error("Error in collecting pudhir from firebase : " + seq, error);
                window.Firebase.exception("Error in collecting pudhir from firebase - " + seq + " : " + error);
				self.isLoading = false;
				self.isContent = false;
				self.isError = true;
				self.message = 'error.network';
            });
		}
		
		self.startSequence = function(seq) {
			var startSeq = 0;
			if(seq > 9) {
			 startSeq = Math.floor(seq/10) * 10;
			}
			//$log.debug("Start sequence for : " + seq + " - " + startSeq);	
			return startSeq;
		}
		
		//Updating Position 
		self.updatePosition = function(pudhir) {
			if(pudhir.seq == 1) {
				pudhir.first = true;
			} else {
				pudhir.first = false;
			}
		}

		//Updating Favourite Position 
		self.updateFavPosition = function(pudhir, favindex) {
			if(favindex == 0) {
				pudhir.first = true;
			} else {
				pudhir.first = false;
			}

			if(favindex + 1 >= _.size($scope.favourites)) {
				pudhir.last = true;
			} else {
				pudhir.last = false;
			}
		}
		
		//Load Pudhir
		self.loadPudhir = function(seq, sync) {
			//Check for the available of the pudhir in scope
			var localPudhir = self.collectLocalPudhir(seq);
			if(localPudhir) {
				self.pudhir = localPudhir;
				self.isLoading = false;
				self.isContent = true;
				self.message = null;
				self.isError = false;	
				//$log.debug("Current Pudhir : " + self.pudhir);
				self.updatePosition(self.pudhir);
				self.checkFavourite(self.pudhir);
				self.loadPudhirStats(self.pudhir);
				self.loadPudhirLikes(self.pudhir);
				self.loadPudhirDislikes(self.pudhir);
			} else {
				if(sync) {
					self.populateLocalPudhir(seq);
				} else {
					//$log.debug("Sync is false and so this should be the end of the pudhirs");
					self.pudhir = null;
					self.isContent = false;
					self.isError = true;	
					self.message = "error.end";  
					//window.Firebase.event("pudhir_end", seq);
				}
			}
        }

		//Load Favourite Pudhir
		self.loadFavPudhir = function(favindex) {
			//FIXME - Handle Exception when scope of favourite is null 
			var fav = $scope.favourites[favindex];
			//$log.debug('Load favourite pudhir for - ' + fav.id);
			var refFavPudhir = firebase.database().ref("pudhir").child(fav.id);
            var objFavPudhir = $firebaseObject(refFavPudhir);
			objFavPudhir.$loaded().then(function(data) {
				//$log.debug('Display Favourite Pudhir : ' + objFavPudhir.$id);
				self.pudhir = objFavPudhir;
				self.isLoading = false;
				self.isContent = true;
				self.message = null;
				self.isError = false;
				self.updateFavPosition(self.pudhir, favindex);				
				self.checkFavourite(self.pudhir);
				self.loadPudhirStats(self.pudhir);
				self.loadPudhirLikes(self.pudhir);
				self.loadPudhirDislikes(self.pudhir);
			}).catch(function(error) {
				$log.error("Error in collecting favourite pudhir for index " + favindex + "-" + error);
				window.Firebase.exception("Error in collecting favourite pudhir for index " + favindex + "-" + error);
			});			
        }
		
		//Navigate to next pudhir
		self.next = function(sequence) {	
			//$log.debug("Display next pudhir : " + sequence + " : Favourites - " + $scope.favmode);
			if($scope.favmode) {
				if(self.favindex + 1 < _.size($scope.favourites)) {
					self.favindex = self.favindex + 1;
					self.loadFavPudhir(self.favindex);
				} else {
					alert("No More Favourites");
				}
			} else {
				self.storeUserPostion(sequence);
				self.seq = self.seq + 1;
				self.loadPudhir(self.seq, true);
			}
		}
		
		//Update user position in Firebase 
		self.storeUserPostion = function(sequence) {
			if($scope.position.seq == undefined || $scope.position.seq < sequence) {
				//$log.debug("Position is new storing it in firebase");
				$scope.position.seq = sequence;
			} else {
				//$log.debug("Position is not latest : " + sequence + " = " + $scope.position.seq);
			}
		}

		//Navigate to previous pudhir
		self.previous = function(sequence) {	
			//$log.debug("Display previous pudhir : " + sequence + " : Favourites - " + $scope.favmode);
			if($scope.favmode) {
				if(self.favindex > 0) {
					self.favindex = self.favindex - 1;
					self.loadFavPudhir(self.favindex);
				} else {
					alert("No More Favourites");
				}
			} else {
				if(self.seq > 1) {
					self.seq = self.seq - 1;
					self.loadPudhir(self.seq, true);
				}
			}
		}
		
		//Check if the current pudhir is favourite
		self.checkFavourite = function(pudhir) {
			if($scope.favourites) {
				//pudhir.favourite = $scope.favourites[0]; 
				pudhir.favourite = _.find($scope.favourites, function(favourite){ return favourite.seq == pudhir.seq; });
			}
		}

        //Load Firebase Pudhir Stats
        self.loadPudhirStats = function(pudhir) {
          //$log.debug("Load Stats for : " + pudhir.$id);
          var ref = firebase.database().ref("stats");
          var pudhirStatsRef = ref.child(pudhir.$id);
          var objPudhirStat = $firebaseObject(pudhirStatsRef);
          objPudhirStat.$loaded().then(function(data) {
              if (typeof objPudhirStat.views === 'undefined') {
                //$log.debug("Views for pudhir is not defined. Initialie it here");
                objPudhirStat.views = 1;
              } else {
				if(!isTestDevice()) {
					objPudhirStat.views = objPudhirStat.views + 1;
					$log.debug("Views for Pudhir incremented : " + isTestDevice());
				}
              }
			  objPudhirStat.$save();
			  pudhir.stats = objPudhirStat;
          }).catch(function(error) {
              $log.error("Error in pudhir stats for " + pudhir.$id  + "-" + error);
              window.Firebase.exception("Error in pudhir stats for " + pudhir.$id  + "-" + error);
          });
        }
		
		//Load Firebase Pudhir Likes
        self.loadPudhirLikes = function(pudhir) {
          //$log.debug("Load Likes for : " + pudhir.$id);
          var ref = firebase.database().ref("likes");
          var likesRef = ref.child(pudhir.$id);
          var arrLikes = $firebaseArray(likesRef);
          arrLikes.$loaded().then(function(data) {
             //$log.debug("Size of likes : " + _.size(arrLikes));             
             pudhir.likes = _.size(arrLikes);
			 $scope.likes = arrLikes;
             self.checkIfLiked(pudhir);
          }).catch(function(error) {
              $log.error("Error in getting likes for " + pudhir.$id  + "-" + error);
              window.Firebase.exception("Error in getting likes for " + pudhir.$id  + "-" + error);
          });
        };

        //Load Firebase Pudhir Dislikes
        self.loadPudhirDislikes = function(pudhir) {
          //$log.debug("Load Dislikes for : " + pudhir.$id);
          var ref = firebase.database().ref("dislikes");
          var dislikeRef = ref.child(pudhir.$id);
          var arrDislikes = $firebaseArray(dislikeRef);
          arrDislikes.$loaded().then(function(data) {
             //$log.debug("Size of dislikes : " + _.size(arrDislikes));             
             pudhir.dislikes = _.size(arrDislikes);
			 $scope.dislikes = arrDislikes;
			 self.checkIfDisliked(pudhir);
          }).catch(function(error) {
              $log.error("Error in getting dislikes for " + pudhir.$id  + "-" + error);
              window.Firebase.exception("Error in getting dislikes for " + pudhir.$id  + "-" + error);
          });
        };

        //Check if the current pudhir was liked
        self.checkIfLiked = function(pudhir) {
          //$log.debug("Check if pudhir liked by user : " + pudhir.$id);
          var liked = _.find($scope.likes, function(item) {  
            //$log.debug("Entry Liked Item : " + item.device);
            return item.device == deviceuuid;
          });
          if(liked) {
            pudhir.liked = liked.$id;
          }
        }

        //Check if the current pudhir was disliked
        self.checkIfDisliked = function(pudhir) {
          //$log.debug("Check if pudhir disliked by user : " + pudhir.$id);
		  var disliked = _.find($scope.dislikes, function(item) {  
            //$log.debug("Entry Disliked Item : " + item.device);
            return item.device == deviceuuid;
          });
          if(disliked) {
            pudhir.disliked = disliked.$id;
          }
        }
		
        //Like the pudhir in Firebase
        self.like = function(pudhir) {
          if(pudhir.liked) {
            self.removeFromLiked(pudhir);
          } else {
            self.addToLiked(pudhir);
          }
        };

        //Remove from Liked
        self.removeFromLiked = function(pudhir) {
			//$log.debug("Remove firebase record at : " + pudhir.liked);
			var recPosition = $scope.likes.$indexFor(pudhir.liked); 
			//$log.debug("Remove record at : " + recPosition);
			$scope.likes.$remove(recPosition).then(function(ref) {
				self.pudhir.liked = null;
				self.pudhir.likes = _.size($scope.likes);
				window.Firebase.event("pudhir_like_unset", "");
			}, function(error) {
				$log.error("Error in unsetting like for " + pudhir.$id  + "-" + error);
				window.Firebase.exception("Error in unsetting like for " + pudhir.$id  + "-" + error);
			});
        }

        //Add To Likes
        self.addToLiked = function(pudhir) {
			$scope.likes.$add({
				device: deviceuuid
			}).then(function(refLiked) {
				self.pudhir.liked = refLiked.key;
				self.pudhir.likes = _.size($scope.likes);
				window.Firebase.event("pudhir_like", "");
				if(pudhir.disliked) {
					self.removeFromDisliked(pudhir);  
				}
			}, function(error) {
				window.Firebase.exception("Error in setting like for " + pudhir.$id  + "-" + error);
				$log.error("Error in setting like for " + pudhir.$id  + "-" + error);
			});
		}

        //Dislike set & unset
        self.dislike = function(pudhir) {
          if(pudhir.disliked) {
            self.removeFromDisliked(pudhir);
          } else {
            self.addToDisliked(pudhir);
          }
        };

        //Remove from Disliked
        self.removeFromDisliked = function(quote) {
          var recPosition = $scope.dislikes.$indexFor(quote.disliked); 
          //$log.debug("Remove record at : " + recPosition);
          $scope.dislikes.$remove(recPosition).then(function(ref) {
            self.pudhir.disliked = null;
            self.pudhir.dislikes = _.size($scope.dislikes);
            window.Firebase.event("pudhir_dislike_unset", "");
          }, function(error) {
            $log.error("Error in unsetting dislike for " + pudhir.$id  + "-" + error);
            window.Firebase.exception("Error in unsetting dislike for " + pudhir.$id  + "-" + error);
          });
        }

        //Add To Disliked
        self.addToDisliked = function(pudhir) {
		  $scope.dislikes.$add({
            device: deviceuuid
          }).then(function(refDisliked) {
            self.pudhir.disliked = refDisliked.key;
            self.pudhir.dislikes = _.size($scope.dislikes);
            window.Firebase.event("pudhir_dislike", "");
            if(pudhir.liked) {
              self.removeFromLiked(pudhir);  
            }
          }, function(error) {
			$log.error("Error in setting dislike for " + pudhir.id  + "-" + error);
            window.Firebase.exception("Error in setting dislike for " + pudhir.id  + "-" + error);
          });
        }		
		
		self.viewAnswer = function() {
			self.pudhir.isAnswer = true;
		};

		//Add Pudhir to favourite
		self.favourite = function ($event, pudhir) {         
			//$log.debug('Mark Favourite : ' + pudhir.seq);   
			$scope.favourites.$add({
				id: pudhir.$id,
				seq: pudhir.seq,
				timestamp: firebase.database.ServerValue.TIMESTAMP
			}).then(function(ref) {
				self.pudhir.favourite = ref.key;
				$mdToast.show($mdToast.simple().textContent('Added to Favourite'));
				window.Firebase.event("favourite_added", pudhir.seq);
			});
		};

		//Remove Pudhir from favourite
		self.unfavourite = function ($event, pudhir) {         
			//$log.debug('UnMark Favourite : ' + pudhir.seq);   
			$scope.favourites.$remove(pudhir.favourite).then(function(ref) {
				self.pudhir.favourite = null;
				$mdToast.show($mdToast.simple().textContent('Removed from Favourite'));
				window.Firebase.event("favourite_removed", pudhir.seq);
			}, function(error) {
				$log.error("Error in removing from favourite for " + pudhir.seq  + "-" + error);
				window.Firebase.exception("Error in removing from favourite for " + pudhir.seq  + "-" + error);
			});			
		};

		//$log.debug("Display Pudhhir here");
		if($routeParams.viewfav) {
			$scope.favmode = true;
		}
		
		self.initialize();
		
      }
    ]
  });