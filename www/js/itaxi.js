/* Create the sweetAlert Service singleton */


angular.module('appAngular', ['ionic', 'ionic.cloud' ,'itaxi.services', 'itaxi.factory', 'itaxi.controllers', 'ui.router','LocalStorageModule', 'uiGmapgoogle-maps'])
	
	.config(function ($stateProvider, $urlRouterProvider, localStorageServiceProvider, $ionicCloudProvider) {
		
		$stateProvider
		    .state('map', {
		        url: '/map',
		        templateUrl: 'views/map.html',
		        controller: 'ctrlMap'
		    })
		    .state('login', {
		        url: '/login',
		        templateUrl: "views/login.html",
		        controller: 'ctrlLogin'
		    })		        

			.state('trips', {
		        url: '/trips',
		        templateUrl: "views/trips.html",
		        controller: 'ctrlTrips'
		    })
		    .state('newTrip', {
		        url: '/newTrip',
		        templateUrl: "views/newtrip.html",
		        controller: 'ctrlNewTrip'
		    })
		    .state('newDriver', {
		        url: '/trips/createDriver',
		        templateUrl: "views/createDriver.html",
		        controller: 'ctrlNewDriver'
		    })
		    .state('cashTrip', {
		        url: '/trips/cashTrip',
		        templateUrl: "views/cashTrip.html",
		        controller: 'ctrlCashTrip'
		    });

		    
		    $urlRouterProvider.otherwise('/login');

		    localStorageServiceProvider
		    .setPrefix('myApp')
		    .setStorageType('sessionStorage')
		    .setNotify(true, true);

		    $ionicCloudProvider.init({
			    "core": {
			      "app_id": "9c8249b8"
			    },
			    "push": {
			     "sender_id": "347412374609",
			     "pluginConfig": {
			        "ios": {
			          "badge": true,
			          "sound": true
			        },
			        "android": {
			          "iconColor": "#343434"
			        }
			      }
			    }
			 });
	})
	
	.run(function($ionicPlatform) {
		  $ionicPlatform.ready(function() {
		    if(window.cordova && window.cordova.plugins.Keyboard) {
		      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		      // for form inputs)
		      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

		      // Don't remove this line unless you know what you are doing. It stops the viewport
		      // from snapping when text inputs are focused. Ionic handles this internally for
		      // a much nicer keyboard experience.
		      cordova.plugins.Keyboard.disableScroll(true);
		    }
		    if(window.StatusBar) {
		      StatusBar.styleDefault();
		    }
		});
	})
	
	
	
	