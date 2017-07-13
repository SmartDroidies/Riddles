angular.module('pudhir.controllers', [])

//Home Controller
.controller('HomeCtrl', function(Pudhir, $mdDialog, $location, $log, $scope, Storage) {

  this.restart = function() {
    var confirm = $mdDialog.confirm()
      .title('Are you sure you want to Restart?')
      .textContent('You will loose your current position.')
      .targetEvent(event)
      .ok('Yes')
      .cancel('No'); 
    $mdDialog.show(confirm).then(function() {
        window.Firebase.event("restart_confirmed", '');
        $log.debug('Redirected - /pudhir/casual/restart');
        $location.path('/pudhir/casual/restart'); 
    }, function() {
        window.Firebase.event("restart_cancelled", '');
    });    
  }

  var pref = Storage.getUserPreference();
  if(pref && parseInt(pref.casual.position) > 0) {
    $scope.notstarted = false;
  }  else {
    $scope.notstarted = true;
  }
  if(pref && pref.favourite.length > 0) {
    $scope.fav_empty = false;
  } else {
    $scope.fav_empty = true;
  }
  //$log.debug('Not Started : ' + $scope.notstarted);
  //$log.debug('Favourite Empty : ' + $scope.fav_empty);

  this.stats = Pudhir.getPudhirStats();

})

//Pudhir Controller
.controller('PudhirCtrl', function($scope, $location, $rootScope, $log, $mdBottomSheet, $mdToast, $routeParams, Pudhir, Storage) {

  this.casualMode = function(action) {
    //$log.debug("Display Casual Pudhir for : " + action);
    var position;
    if(action == C_ACTION_RESART) {
      Storage.clearPosition();
      position = 0;
      this.displayPudhir(position); 
    } else if (action == C_ACTION_CONTINUE) {
       var pref = Storage.getUserPreference();
       if(pref && pref.casual.position) {
          position = pref.casual.position;
       }
       //$log.debug('Users current position : ' + position);
       this.displayPudhir(position); 
    } else if (action == C_ACTION_FAVOURITE) {
      position = 0;
      this.displayFavourite(position, false); 
    } else {
      alert('Unknwon Action report error in Analytics');
    }
  }  

  //Show Home Page
  this.displayPudhir = function (sequence) {    
    var self = this;
    self.isLoading = true;
    self.isContent = false;
    self.isAction = false;
    if(!sequence) {
      sequence = 0;
    }
    showInterstitial();
    var promise = Pudhir.getPudhir(sequence);
    promise.then(
      function(payload) { 
        var pudhir = payload.pudhir;
        if(pudhir) {
          self.pudhir = payload.pudhir;
          // Set Flag for Prev button
          if(self.pudhir && parseInt(self.pudhir.seq) > 1) {
            self.hidePrev = false;
          } else {
            self.hidePrev = true;
          }

          //$log.debug("Prev Flag : " + self.hidePrev);
          self.isContent = true;
          self.isLoading = false;
          self.isAction = true;
        } else if(payload.last) {
          self.isLoading = false;
          self.isError = true;  
          self.message = "error.end";  
          window.Firebase.event("pudhir_end", sequence);
        } else {
          window.Firebase.event("pudhir_empty", sequence);
          window.Firebase.exception("Unexpected Flow : " + sequence);
          $log.error("Unexpected Flow : " + sequence);
        }  
      },
      function(errorPayload) {
        window.Firebase.exception("Error Loadig Pudhir : " + errorPayload);
        $log.error('Failure Loadig Pudhir', JSON.stringify(errorPayload));
        if(errorPayload.error) {
          self.message = errorPayload.error;
        } else {
          self.message = "error.unknown";  
        }
        $log.debug("Error Message - " + this.message);
        self.isError = true;
        self.isLoading = false;
        self.isAction = false;
      });    
  }; 

  //Display Prev & Next Pudhir for Favourite
  this.displayFavourite = function (sequence, prevflag)  {
    var self = this;
    self.isLoading = true;
    self.isContent = false;
    self.isAction = false;
    self.fav_mode = true;
    showInterstitial();
    //$log.debug("Display Favourite Pudhir for : " + sequence + " & Prev - " + prevflag);
    var promise = Pudhir.getFavouritePudhir(sequence, prevflag);
    promise.then(
      function(payload) { 
        var pudhir = payload.pudhir;
        if(pudhir) {
          self.pudhir = pudhir;
          self.hidePrev = !pudhir.prev;
          self.hideNext = !pudhir.next;
        } else {
          window.Firebase.event("pudhir_favourite_empty", sequence);
          window.Firebase.exception("Unexpected Flow : " + sequence);
          $log.error("Unexpected Flow : " + sequence);
        }  
        //$log.debug("Prev Flag : " + self.hidePrev);
        self.isContent = true;
        self.isLoading = false;
        self.isAction = true;
      },
      function(errorPayload) {
        window.Firebase.exception("Error Loadig Pudhir : " + errorPayload);
        $log.error('Failure Loadig Pudhir', JSON.stringify(errorPayload));
        if(errorPayload.error) {
          self.message = errorPayload.error;
        } else {
          self.message = "error.unknown";  
        }
        $log.debug("Error Message - " + this.message);
        self.isError = true;
        self.isLoading = false;
        self.isAction = false;
      });    
  }

  this.previous = function(sequence, bFavMode) {
    var self = this;
    //$log.debug("Display next pudhir : " + sequence + " : Favourites - " + bFavMode);

    if(bFavMode) {
      this.displayFavourite(sequence, true);
    } else {
      self.isLoading = true;
      self.isContent = false;
      self.isAction = false;
      this.isAnswer = false;
      //FIXME - Collect based on user mode
      var promise = Pudhir.getPrevPudhir(sequence);
      promise.then(
        function(payload) { 
          var prevPudhir = payload.pudhir; 
          if(prevPudhir) {
            self.pudhir = prevPudhir;
            self.hideNext = false;
          } else {
            window.Firebase.event("pudhir_empty", sequence);
            window.Firebase.exception("Unexpected Flow : " + sequence);
            $log.error("Unexpected Flow : " + sequence);
          } 

          // Set Flag for Prev button
          if(self.pudhir && parseInt(self.pudhir.seq) > 1) {
            self.hidePrev = false;
          } else {
            self.hidePrev = true;
          }

          self.isContent = true;
          self.isLoading = false;
          self.isAction = true;
          //$log.debug('Pudhir - ' + JSON.stringify(payload));
        },
        function(errorPayload) {
          window.Firebase.exception("Error Loadig Previous Pudhir : " + errorPayload);
          $log.error('Failure Loadig Previous Pudhir', JSON.stringify(errorPayload));
          if(errorPayload.error) {
            self.message = errorPayload.error;
          } else {
            self.message = "error.unknown";  
          }
          $log.debug("Error Message - " + this.message);
          self.isError = true;
          self.isLoading = false;
          self.isAction = false;
        });    
    }

  }

  this.next = function(sequence, bFavMode) {
    //$log.debug("Display next pudhir : " + sequence + " : Favourites - " + bFavMode);
    if(bFavMode) {
      this.displayFavourite(sequence, false);
    } else {
      this.displayPudhir(sequence);
      Storage.storeSequence(sequence);
    }
    this.isAnswer = false;
  }

  this.viewAnswer = function() {
    this.isAnswer = true;
  };

  this.sharePudhir = function(pudhir) {
    //$log.debug('Share Pudhir : ' + JSON.stringify(pudhir));   
    // this is the complete list of currently supported params you can pass to the plugin (all optional) 
    var options = {
      message: "\u0bb5\u0bbf\u0b9f\u0bc1\u0b95\u0ba4\u0bc8 \u0b8e\u0ba3\u0bcd - " + pudhir.seq + " : " + pudhir.content, // not supported on some apps (Facebook, Instagram) */
      subject: "\u0bb5\u0bbf\u0b9f\u0bc1\u0b95\u0ba4\u0bc8\u0b95\u0bb3\u0bcd", // fi. for email 
      /*
      files: ['', ''], // an array of filenames either locally or remotely 
      */
      url: C_APPMKT_URL,
      chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title 
    }
 
    var onSuccess = function(result) {
      //console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true 
      //console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false) 
      window.Firebase.event("pudhir_share", result.app);
    }
 
    var onError = function(msg) {
      //console.log("Sharing failed with message: " + msg);
      window.Firebase.exception("Exception on Pudhir Share : " + msg);
    }
    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
  } 

  //Add Pudhir to favourite
  this.favourite = function ($event, pudhir) {         
    //$log.debug('Mark Favourite : ' + JSON.stringify(pudhir));   
    Storage.addFavourite(pudhir.id);
    this.pudhir.favourite = true;
    $mdToast.show($mdToast.simple().textContent('Added to Favourite'));
    window.Firebase.event("favourite_added", pudhir.id);
  };

  //Remove Pudhir from favourite
  this.unfavourite = function ($event, pudhir) {         
    //$log.debug('UnMark Favourite : ' + JSON.stringify(pudhir));   
    Storage.removeFavourite(pudhir.id);
    this.pudhir.favourite = false;
    $mdToast.show($mdToast.simple().textContent('Removed from Favourite'));
    window.Firebase.event("favourite_removed", pudhir.id);
  };

  this.mode = $routeParams.mode;
  this.action = $routeParams.action;
  //$log.debug("Mode :  " + this.mode + ", Action : " + this.action);
  if(this.mode == C_MODE_CHALLENGE) {
     //$log.debug("Display pudhir for challenge mode"); 
  } else {
    //$log.debug("Display pudhir for casual mode"); 
    //FIXME - Capture in Analytics
    this.casualMode(this.action); 
  }

});