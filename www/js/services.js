angular.module('pudhir.services', [])

/* Operations for collecting data  */
.service("Pudhir", function($http, $q, $log, Cache, Storage) {
	return {
		getPudhir:function(sequence) {
			var self = this;
			var nextPudhir;
			var deferred = $q.defer();

			//First check pudhir in cache 
			var nextPudhir = self.collectPudhirFromCache(sequence, false);
			//$log.debug("Next Pudhir : " + JSON.stringify(nextPudhir));			
			if(nextPudhir) {
				self.updateFavouriteFlag(nextPudhir); 
				deferred.resolve({
	          		pudhir: nextPudhir
	            });
			} else {
				var uri = encodeURI(C_URL);
				if(sequence >= C_SYNC_COUNT) {
					var page = Math.ceil((parseInt(sequence) + 1)/C_SYNC_COUNT);
					uri = encodeURI(C_URL + "&page=" + page);
				}
				//$log.debug("Collect Pudhir from Server : " + uri);	
	 			$http.get(uri)
	       			.success(function(data) { 
	       				//console.log("Remote Data - " + JSON.stringify(data));
	          			if(data && data.vidugadhaigal.length) {
	          				self.storeInCache(data);	
		          			var nextPudhir = self.collectPudhirFromCache(sequence, false);
		          			if(nextPudhir) {
			          			self.updateFavouriteFlag(nextPudhir); 
			          			deferred.resolve({
			          				pudhir: nextPudhir
			             		});
			             	} else {
			             		window.Firebase.exception("Empty Pudhir returned from cache");
			          			deferred.reject(
			          				{error: "error.unknown"}
			          			);
			             	}	
	          			}  else {	
	          				window.Firebase.event("empty_response", '');
	          				$log.debug('Vidugadaigal is empty show error here');
		          			deferred.resolve({
		          				last: true
		             		});
	          			} 
	       			}).error(function(msg, code) {
	       				window.Firebase.exception("Rest Call failed : " + code + " - " + msg + ", " + uri);
	          			$log.error(msg, code);
	          			deferred.reject(
	          				{error: "error.network"}
	          			);
	       			});
	       	}	
     		return deferred.promise;			
		},
		getFavouritePudhir:function(sequence, prevflag) {
			var self = this;
			var nextPudhir;
			var deferred = $q.defer();

			//First check pudhir in cache 
			var cacheFavPudhir = self.collectFavPudhirCache();

			//$log.debug("Favourite Pudhir Cache : " + JSON.stringify(cacheFavPudhir));			
			if(cacheFavPudhir) {
				self.getNextFavouritePudhir(deferred, cacheFavPudhir, sequence, prevflag);
			} else {
				var uri = encodeURI(C_URL_FAVOURITE);
				var fav = Storage.getFavourites();
				if(fav) {
					uri = uri + fav;
				}
				$log.debug("Collect Pudhir from Server : " + uri);	
	 			$http.get(uri)
	       			.success(function(data) { 
	       				//$log.debug("Remote Data - " + JSON.stringify(data));
	          			if(data && data.vidugadhaigal.length) {
	          				self.storeFavInCache(data.vidugadhaigal);	
	          				self.getNextFavouritePudhir(deferred, data.vidugadhaigal, sequence, prevflag);
	          			}  else {	
	          				window.Firebase.event("empty_fav_response", '');
	          				$log.debug('Vidugadaigal is empty show error here');
	          				//FIXME - Throw Exception Here
	          				/*
		          			deferred.resolve({
		          				last: true
		             		});
							*/
	          			} 
	       			}).error(function(msg, code) {
	       				window.Firebase.exception("Rest Call failed : " + code + " - " + msg + ", " + uri);
	          			$log.error(msg, code);
	          			deferred.reject(
	          				{error: "error.network"}
	          			);
	       			});
	       	}
     		return deferred.promise;			
		},
		getNextFavouritePudhir: function(deferred, fvidugadhaigal, sequence, prevflag) {
			var self = this;
			//$log.debug("Fav Vidugahaigal -  " + JSON.stringify(fvidugadhaigal));
			if(prevflag) {
				$log.debug("Collect Prev Pudhir for Sequence -  " + sequence);
				var size = _.size(fvidugadhaigal);
				var currIndex = 0;
				var sortedList = _.sortBy(fvidugadhaigal, function (obj) {
				   return parseInt(obj.seq);
				}).reverse();

				var prevPudhir = _.find(sortedList, function(pudhir) { 
					//$log.debug("Sequence : " + pudhir.seq + " - " + sequence);	
					currIndex = currIndex + 1;
					return parseInt(pudhir.seq) < sequence;
				});

				if(prevPudhir) {
          			self.updateFavouriteFlag(prevPudhir); 
          			$log.debug("Curr Index - " + currIndex + " vs Size - " + size);
          			//Checking if previous Pudhir is available 
          			if(currIndex > 1) {
          				prevPudhir.next = true; 
          			} else {
          				prevPudhir.next = false;
          			}
          			//Checking if next Pudhir is available 
          			if(currIndex < size) {
          				prevPudhir.prev = true; 
          			} else {
          				prevPudhir.prev = false;
          			}
          			deferred.resolve({
          				pudhir: prevPudhir
             		});
				} else {
	         		window.Firebase.exception("Failed to collect previous favourite pudhir - " + sequence);
	      			deferred.reject(
	      				{error: "error.unknown"}
	      			);
				}	
			} else {
				$log.debug("Collect Next Pudhir for Sequence -  " + sequence);
				var size = _.size(fvidugadhaigal);
				var currIndex = 0;
				var sortedList = _.sortBy(fvidugadhaigal, function (obj) {
					return parseInt(obj.seq);
				});				
				var nextPudhir = _.find(sortedList, function(pudhir) { 
					//$log.debug("Sequence : " + pudhir.seq + " - " + sequence);	
					currIndex = currIndex + 1;
					return parseInt(pudhir.seq) > sequence;
				});
				if(nextPudhir) {
          			self.updateFavouriteFlag(nextPudhir); 
          			$log.debug("Curr Index - " + currIndex + " vs Size - " + size);
          			//Checking if previous Pudhir is available 
          			if(currIndex > 1) {
          				nextPudhir.prev = true; 
          			} else {
          				nextPudhir.prev = false;
          			}
          			//Checking if next Pudhir is available 
          			if(currIndex < size) {
          				nextPudhir.next = true; 
          			} else {
          				nextPudhir.next = false;
          			}
          			deferred.resolve({
          				pudhir : nextPudhir
             		});
				} else {
	         		window.Firebase.exception("Failed to collect next favourite pudhir - " + sequence);
	      			deferred.reject(
	      				{error: "error.unknown"}
	      			);
				}	
			}
		},
		getPrevPudhir:function(sequence) {
			$log.debug('Service Method to collect Prev Pudhir');
			var self = this;
			var deferred = $q.defer();
			var prevPudhir  = self.collectPudhirFromCache(sequence, true);
			//$log.debug("Prev pudhir in cache : " + JSON.stringify(prevPudhir));
			if(prevPudhir) {
				self.updateFavouriteFlag(prevPudhir); 
	  			deferred.resolve({
	  				pudhir: prevPudhir
	     		});
	     	} else {
				var uri = encodeURI(C_URL);
				if(sequence >= C_SYNC_COUNT) {
					var page = Math.ceil((parseInt(sequence) - 1)/C_SYNC_COUNT);
					uri = encodeURI(C_URL + "&page=" + page);
					//FIXME - Analytics Event 
				}
				$log.debug("Collect Pudhir from Server : " + uri);	
	 			$http.get(uri)
	       			.success(function(data) { 
	       				//FIXME - Track Event
	       				//console.log("Remote Data - " + JSON.stringify(data));
	          			if(data) {
	          				self.storeInCache(data);	
	          			} /* else {
	          				$log.debug('Vidugadaigal is empty show error here');
	          			} */
	          			//FIXME - Resolve with empty data
	          			var prevPudhir = self.collectPudhirFromCache(sequence, true);
	          			//FIXME - If Vidugadhaigal is empty through exception and record in analytics
	          			self.updateFavouriteFlag(prevPudhir); 
	          			deferred.resolve({
	          				pudhir: prevPudhir
	             		});
	       			}).error(function(msg, code) {
	       				window.Firebase.exception("Rest Call failed : " + code + " - " + msg + ", " + uri);
	          			$log.error(msg, code);
	          			deferred.reject(
	          				{error: "error.network"}
	          			);
	       			});
	     	}	
     		return deferred.promise;			
		},
		storeInCache: function(vgaigal) {
			//FIXME - Later amend this vidugadhailgal to existing cache
			window.Firebase.event("cache_update", '');
			Cache.put(C_CACHE_VGADAI, vgaigal);	
			//$log.debug("Stored Vidugadhaigal in Cache");			
		},
		storeFavInCache: function(vgaigal) {
			window.Firebase.event("cache_fav_update", '');
			Cache.put(C_CACHE_FAV_VGADAI, vgaigal);	
			//$log.debug("Stored Vidugadhaigal in Cache");			
		},
		collectFromCache: function() {
			var cacheVgaigal =  Cache.get(C_CACHE_VGADAI);	
			return cacheVgaigal;
			//$log.debug("Collect Vidugadhaigal from Cache : " + JSON.stringify(cacheVgaigal));			
		},
		collectFavPudhirCache: function() {
			var cacheFavVgaigal =  Cache.get(C_CACHE_FAV_VGADAI);	
			return cacheFavVgaigal;
		},		
		collectPudhirFromCache: function(sequence, prevInd) {
			var self = this;
			var retPuchir;
			//$log.debug("Service method to collect Pudhir from cache : " + sequence + " - Prev : " + prevInd);
			var vgadhaigal = self.collectFromCache();
			if(vgadhaigal) {
				if(prevInd) {
					var sortedList = _.sortBy(vgadhaigal.vidugadhaigal, function (obj) {
 					   return parseInt(obj.seq);
 					}).reverse();
					var retPuchir = _.find(sortedList, function(pudhir) { 
						//$log.debug("Sequence : " + pudhir.seq + " - " + sequence);	
						return parseInt(pudhir.seq) < sequence;
					});
				} else {
					var sortedList = _.sortBy(vgadhaigal.vidugadhaigal, function (obj) {
 					   return parseInt(obj.seq);
 					});
					var retPuchir = _.find(sortedList, function(pudhir) { 
						//$log.debug("Sequence : " + pudhir.seq + " - " + sequence);	
						return parseInt(pudhir.seq) > sequence;
					});
				}	
				//$log.debug("Collect Prev from : " + JSON.stringify(vgadhaigal));
			} else {
				//$log.debug("Error Scenario Capture in Analytics");
				//FIXME - Capture in Anlytics
			}
			return retPuchir;
		},
		collectNext: function(list, sequence) {
			//$log.debug("Collect next pudhir : " + JSON.stringify(list));
			var sortedList = _.sortBy(list, 'seq');
			var nextPudhir = _.find(sortedList, function(pudhir) { 
				$log.debug("Sequence : " + pudhir.seq + " - " + sequence);	
				return pudhir.seq > sequence;
			});
			//FIXME - Handle Error Here
			//$log.debug("Next Pudhir : " + JSON.stringify(nextPudhir));	
			return nextPudhir;
		},
		updateFavouriteFlag: function(pudhir) {
			if(Storage.isFavourite(pudhir.id)) {
				pudhir.favourite = true;	
			}
		},
		getPudhirStats: function () {
			//FIXME - Prepare the Original JSON her 
			var stats = {"casual" : {"total" : "120", "current" : "20"}
						,"challenge" : {"total" : "100", "current" : "32"}};
			//var stats = JSON.parse({"casual":{"total":"120","current":"20"},"challenge":{"total":"100","current":"32"}});
			//$log.debug("Stats JSON  : " + JSON.stringify(stats));
			return stats;			
		}
	};
})

/* Operations for storing in local storage  */
.service('Storage', function($log) {
	return {
		getUserPreference: function() {
			var prefString =  window.localStorage.getItem(C_KEY_USERPREF);
			var pref;
			if(!prefString) {
				var favourite = new Array();
				pref = {'casual' : {'position' : ''}, 'favourite' : favourite};
				window.localStorage.setItem(C_KEY_USERPREF, JSON.stringify(pref));
				window.Firebase.event("preference_init", '');
				//$log.debug("User Preference : " + JSON.stringify(pref));
			} else {
				pref = JSON.parse(prefString);
			}
			return pref;
		},
		storeSequence: function(sequence) {
			var pref =  this.getUserPreference();
			//$log.debug("User Preference : " + JSON.stringify(pref));
			if(pref) {
				var tempPos = 0;
				if(pref.casual.position) {
					tempPos = parseInt(pref.casual.position);
				}
				//$log.debug("Update User Preference : " + tempPos);
				if(sequence > tempPos) {
					pref.casual.position =  sequence;
					window.localStorage.setItem(C_KEY_USERPREF, JSON.stringify(pref));
					window.Firebase.event("preference_update", sequence);
				} else {
					$log.debug("Ne need to update position : " + tempPos);
				}	
			} else if (!pref) {
				$log.debug("Exception Scenario - User Preference Empty");
				window.Firebase.exception("Empty User Preference : Sequence - " + sequence);
			} 
		},
		addFavourite:function(pudhirID) {	
			var pref =  this.getUserPreference();
			var arrFavourite;
			if(pref) {
				if(pref.favourite) {
					arrFavourite = pref.favourite;
					arrFavourite.push(pudhirID);
				} else {
					arrFavourite = new Array();
					arrFavourite.push(pudhirID);
				}
				pref.favourite = arrFavourite;
				window.localStorage.setItem(C_KEY_USERPREF, JSON.stringify(pref));
				//FIXME - Store in firebase database
			} else {
				//FIXME - Test this if favourite is set first
				$log.debug("Exception Scenario - User Preference Empty");
			} 
		}, 
		removeFavourite:function(pudhirID) {
			var pref =  this.getUserPreference();
			var arrFavourite;
			if(pref && pref.favourite) {
				arrFavourite = pref.favourite;
				$log.debug("Favourites Before Filter : " + arrFavourite);
				var arrFavourite = _.filter(arrFavourite, function(num) { 
					$log.debug("Num - " + num + " : Pudhir - " + pudhirID); 
					return (num != pudhirID); 
				});
				$log.debug("Favourites After Filter : " + arrFavourite);
				pref.favourite = arrFavourite;
				window.localStorage.setItem(C_KEY_USERPREF, JSON.stringify(pref));
			} else {
				//FIXME - Throw Exception
				$log.debug("Exception Scenario - User Preference Empty");
			} 
			//FIXME - Store in firebase database
		},	
		getFavourites: function() {
			var favourite = null;
			var pref =  this.getUserPreference();
			if(pref && pref.favourite) {
				//$log.debug("User Favourite : " + pref.favourite);
				favourite =  pref.favourite;
			}	
			/*
			if(favouriteStored != null) {
				favourite = favouriteStored.split(",");
			}
			*/
			return favourite;
		},
		isFavourite: function(pudhirId) {
			//$log.debug('Check Favourite for : ' + pudhirId);
			var bFavourite = false;
			
			var pref =  this.getUserPreference();
			//var arrFavourite;
			if(pref && pref.favourite) {
				//$log.debug("User Favourite : " + pref.favourite);
				var index =  _.indexOf(pref.favourite, pudhirId);
				if(index >= 0) {
					bFavourite = true;
				}
			}	
			//$log.debug("Favourite : " + bFavourite);
			return bFavourite;
		},
		clearPosition: function() {
			var pref =  this.getUserPreference();
			if(pref && pref.casual.position) {
				//FIXME - Capture Event
				pref.casual.position =  0;
				$log.debug("Favourites After Reset Position : " + JSON.stringify(pref));
				window.localStorage.setItem(C_KEY_USERPREF, JSON.stringify(pref));
			} else {
				//FIXME - Throw Exception
				$log.debug("Exception Scenario - User Preference Empty");
			} 
			//FIXME - Store in firebase database
		} 
	};
})

/* Cache Services */
var cacheServices = angular.module('pudhir.cache', []);
cacheServices.factory('Cache', function ($cacheFactory) {
	return $cacheFactory('cache-pudhir');
});