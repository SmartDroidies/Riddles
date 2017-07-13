"use strict";

var ad = ad || {};

//Initialize Banner & Intersitital Ad
ad.init = function() {
  //console.log('Init Ad');
  ad.createBanner();
  ad.prepareInter();
};


//Load Banner Ad
ad.createBanner = function() {
  //Move this isTestDevice into an util
  var testFlag = isTestDevice();

  window.AdMob.createBanner( {
    publisherId: admobid.banner,
    autoShow: true,
    isTesting: testFlag
    /*
    position: AdMob.AD_POSITION.BOTTOM_CENTER, 
    */
  }, function(result) {
    //console.log('Create Banner Success : ' + result);
  }, function(error) {
    console.log('Create Banner Error : ' + error);
  });

} 

//Prepare Init Ad
ad.prepareInter = function() {
  var testFlag = isTestDevice();

  window.AdMob.prepareInterstitial( {
    interstitialAdId: admobid.interstitial,
    autoShow: false,
    isTesting: testFlag
  }, function(result) {
    //console.log('Prepare Intersitital Success : ' + result);
  }, function(error) {
    console.log('Prepare Intersitital Error : ' + error);
  });
} 


//Show Init Ad
ad.showInter = function() {
  window.AdMob.showInterstitial();
} 


document.addEventListener('admob.banner.events.LOAD_FAIL', function(event) {
  //console.log(event)
})

document.addEventListener('admob.interstitial.events.LOAD_FAIL', function(event) {
  //console.log(event)
})

document.addEventListener('admob.interstitial.events.LOAD', function(event) {
  //console.log(event)
})

document.addEventListener('admob.interstitial.events.CLOSE', function(event) {
  //console.log(event)
  ad.prepareInter();
})
