/* Constants */
/*
var C_CACHE_VGADAI = "cache-vgadhai";
var C_CACHE_FAV_VGADAI = "cache-fav-vgadhai";
var C_SYNC_COUNT = 10;
var C_URL = 'http://vidugadhai.tamiltaagam.com/?json=y&count=' + C_SYNC_COUNT;
var C_URL_FAVOURITE = 'http://vidugadhai.tamiltaagam.com/?json=y&t=fav&ids=';
var C_APPMKT_URL = 'https://play.google.com/store/apps/details?id=com.smart.droid.tamil.pudhir'; 
//var C_APPMKT_URL = 'https://play.google.com/store/apps/details?id=com.smart.droid.tamil.jumble'; 
var C_MODE_CHALLENGE = 'challenge';
var C_MODE_CASUAL = 'casual';
var C_ACTION_RESART = 'restart';
var C_ACTION_CONTINUE = 'continue';
var C_ACTION_FAVOURITE = 'favourite';
var C_KEY_USERPREF = 'preference';
var C_KEY_FAVOURITE =  "favourite";

var C_ADPERVIEW = 2;
var interDisplayed = 5;

//ID's 
var testDevice = '9ff99ad5ec042ed6';


// select the right Ad Id according to platform 
var admobid = {};
if( /(android)/i.test(navigator.userAgent) ) { // for android & amazon-fireos 
  platform = 'Android';
  admobid = {
    banner: 'ca-app-pub-4636161670373902/4454919471', 
    interstitial: 'ca-app-pub-4636161670373902/5931652674'
  };
}


//Device Ready Event
document.addEventListener("deviceready", onDeviceReadyAction, false);
function onDeviceReadyAction() {

  if(device.uuid) {
    deviceuuid = device.uuid;
    console.log("Device ID Detected : " + deviceuuid);
  }

	// Manage Ad
	//initializeAd();

}

function isTestDevice() {
    var flgTestDevice = false;
    var deviceUUID = device.uuid;
	//console.log("Device Id : " + deviceUUID);
    if(deviceUUID == null || deviceUUID == testDevice) {
      //console.log("Test Device : " + device.uuid);
      flgTestDevice = true;
    }
    return flgTestDevice;
}

//Load AdMob Interstitial Ad
function showInterstitial() {
  if(interDisplayed > C_ADPERVIEW) {
    if(AdMob) {
      AdMob.showInterstitial();
      interDisplayed = 0;
    } 
  } else {
    interDisplayed = interDisplayed + 1;
    console.log("Interstitial Displayed : " + interDisplayed);
  }    
}

document.addEventListener("onAdDismiss", function(data) {
  //alert("Interstitial Ad Dismissed ");
  //console.log("Interstitial Ad Dismissed : " + data.adType);
  if (data.adType == 'interstitial') {
    //alert("Ad interstitial Dismiss");
    if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:false} );
  }
});
*/