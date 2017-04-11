
angular.module('itaxi.controllers', [])

.controller('ctrlAddDriver', function (localStorageService,$rootScope, $scope, $state, global) {
	  

	    $scope.agregar = function(){
	        $rootScope.guardando = true;
	        global.addDriver($scope.driver);
	    }
	})
	.controller('ctrlNewTrip', function (localStorageService,$rootScope, $scope, $state, global) {
	    
	    if(!global.verificateSession()){return;}  
	    
	    
	    $scope.trip = {};
	    $scope.trip.startPoint = global.startPoint;
	    $scope.trip.endPoint = global.endPoint;

	    $scope.createTrip = function(){
	        $rootScope.guardando = true;
	        global.newTrip($scope.trip);
	    };

	    $scope.validateEmpty = function(obj){
	 	   return jQuery.isEmptyObject(obj);
		}

	})	
	.controller('ctrlTrips', function (localStorageService,$rootScope, $scope, $state, global) {
	    if(!global.verificateSession()){return;}  
	    global.getMyTrips();
	    $scope.myTrips = global.myTrips;
	    
	})
	.controller('ctrlCashTrip', function (localStorageService,$rootScope, $scope, $state, global) {
	    if(!global.verificateSession()){return;} 
	    global.getUncashedTrip();
	    $scope.trip = global.uncashedTrip;  

	    $scope.validateEmpty = function(obj){
	 	   return jQuery.isEmptyObject(obj);
		}

	    $scope.cashTrip = function(trip)  {
	    	$rootScope.guardando = true;
	    	if(global.cashTrip(trip))
	    	{
	    		alert('ok?')
	    		$scope.trip = {};
	    	}
	    };

	    $scope.$on('cloud:push:notification', function(event, data) {
		  var msg = data.message;
		  alert(msg.title + ': ' + msg.text);
		});

	})
	.controller('ctrlLogin', function (localStorageService, $rootScope, $scope, $state, global, swal) {
	    
	     /* 
	     	$scope.$on('$ionicView.enter', function(e) {
  			alert('etre a ctrlLogin')
  			});
		*/
	    $scope.login = function(){
	    	$rootScope.guardando = true;
	    	if ($scope.user.type == 'client') {
	    		global.loginClient($scope.user);
	    	}
	    	 else if ($scope.user.type == 'driver'){
	    	 	global.loginDriver($scope.user);		
	    	 }
	    	 else{
	    	 	swal.warning('Warning', 'Select an user type');
	    	 }
	    	
	    }
	})
	
	.controller('ctrlMap', function ($scope, $log, $timeout, $state,$rootScope, global, swal) {
	   if(!global.verificateSession()){return;} 

	   $rootScope.searchDirection = function(){
	   		var swal = window.swal;

	   		swal({   
            title: "What address are you looking for?",   
            text: "Write where you want to go",   
            type: "input",   
            showCancelButton: true,   
            closeOnConfirm: false,   
            animation: "slide-from-top",   
            inputPlaceholder: "523 South Irving StBuilding 3 Springfield, MA 01234",
            confirmButtonText: "Search",
            cancelButtonText: "Cancel" 
        }, function(inputValue){

	            if (inputValue === false) return false;      
	            if (inputValue === "") {
	            	swal.showInputError("You must write something"); 
	            	return false;
	            }
	             global.createByAddress(inputValue, function(marker) {
                	
        			refresh(marker);
        			$rootScope.marker.coords.latitude = marker.latitude;
        			$rootScope.marker.coords.longitude = marker.longitude;
                });
	            swal("Nice!", "You wrote: " + inputValue, "success"); 
	            return inputValue;	            
        	});
			
	   }

	   function refresh(marker) {
            $scope.map.control.refresh({latitude: marker.latitude,
                longitude: marker.longitude});
        };

        $rootScope.addAddress = function(address) {
        	
            var address = $rootScope.address || address;
            if (address !== '') {
                global.createByAddress(address, function(marker) {
                	
        			refresh(marker);
        			$rootScope.marker.coords.latitude = marker.latitude;
        			$rootScope.marker.coords.longitude = marker.longitude;
                });
            }
        };
		//generar unas posiciones por defecto en caso de q el gps se tarde o no funcione
		$rootScope.map = {center: {latitude: 0, longitude: 0}, control: {}, zoom: 15  };
		$rootScope.marker = {
		      id: 0,
		      coords: {
		        latitude: 0,
		        longitude: 0
		      },
		      options: { draggable: true, animation :1 },
		      events: {
		        dragend: function (marker, eventName, args) {
		          $log.log('marker dragend');
		          $scope.actualLatitude = marker.getPosition().lat();
		          $scope.actualLongitude = marker.getPosition().lng();
		          $log.log($scope.actualLatitude);
		          $log.log($scope.actualLongitude);

		          $scope.marker.options = {
		            draggable: true,
		            labelContent: "lat: " + $scope.actualLatitude + ' ' + 'lon: ' + $scope.actualLongitude,
		            labelAnchor: "100 0",
		            labelClass: "marker-labels"
		          };
		        }
		      }
	    	};     
		//fin posiciones por defecto

		geolocationSuccess = function(position){	   
			
			$scope.actualLatitude = position.coords.latitude;
			$scope.actualLongitude = position.coords.longitude;
			$rootScope.map.center.longitude = position.coords.longitude;
			$rootScope.map.center.latitude = position.coords.latitude;

			$scope.options = {scrollwheel: false};
		    $scope.coordsUpdates = 0;
		    $scope.dynamicMoveCtr = 0;
		    
		    $rootScope.marker.coords.latitude = $scope.actualLatitude;
		    $rootScope.marker.coords.longitude = $scope.actualLongitude;	   
		}

		geolocationError = function(){
			swal.warning("Warning" ,'geolocation undefined');
		};

		
		navigator.geolocation.getCurrentPosition(geolocationSuccess, 
   		geolocationError, { maximumAge: 3000, timeout: 7000, enableHighAccuracy: true });
	   
	   	$scope.buttonValue = global.buttonValue;

	   	$scope.goBack= function(to, value){

	   		if (value == "pick up location") {
	   			
	   			global.startPoint.latitudestart = $scope.actualLatitude;
	   			global.startPoint.longitudeestart = $scope.actualLongitude;
	   		}
			if (value == "destination") {
	   			global.endPoint.latitudeend =  $scope.actualLatitude;
	   			global.endPoint.longitudeend = $scope.actualLongitude;
	   		}
	   		$state.go(to);
	   	}	   

	    $scope.$watchCollection("marker.coords", function (newVal, oldVal) {
	      if (_.isEqual(newVal, oldVal))
	        return;
	      $scope.coordsUpdates++;
	    });

	    $timeout(function () {

	      $scope.marker.coords = {
	        latitude: $scope.actualLatitude,
	        longitude: $scope.actualLongitude
	      };

	      $scope.dynamicMoveCtr++;
	      
	      $timeout(function () {
	        $scope.marker.coords = {
	          latitude: $scope.actualLatitude,
	          longitude: $scope.actualLongitude
	        };
	        $scope.dynamicMoveCtr++;
	      }, 2000);

	    }, 1000);
  	});
