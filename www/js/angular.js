/* Create the sweetAlert Service singleton */
function sweetAlertService() {

    this.success = function(title, message) {
        swal(title, message,'success');
    };

    this.error = function(title, message) {
        swal(title, message,'error');
    };

    this.warning = function(title, message) {
        swal(title, message,'warning');
    };

    this.info = function(title, message) {
        swal(title, message,'info');
    };

    this.custom = function (configObject) {
        swal(configObject);
    };
};

angular.module('appAngular', ['ionic','ionic.cloud', 'ui.router','LocalStorageModule', 'uiGmapgoogle-maps', 'ionic.cloud'])
	
	.config(function ($stateProvider, $urlRouterProvider, localStorageServiceProvider, $ionicCloudProvider) {
		
		$stateProvider
		    .state('map', {
		        url: '/map',
		        templateUrl: '../views/map.html',
		        controller: 'ctrlMap'
		    })
		    .state('login', {
		        url: '/login',
		        templateUrl: "../views/login.html",
		        controller: 'ctrlLogin'
		    })
			.state('trips', {
		        url: '/trips',
		        templateUrl: "../views/trips.html",
		        controller: 'ctrlTrips'
		    })
		    .state('newTrip', {
		        url: '/newTrip',
		        templateUrl: "../views/newtrip.html",
		        controller: 'ctrlNewTrip'
		    })
		    .state('newDriver', {
		        url: '/trips/createDriver',
		        templateUrl: "../views/createDriver.html",
		        controller: 'ctrlNewDriver'
		    })
		    .state('cashTrip', {
		        url: '/trips/cashTrip',
		        templateUrl: "../views/cashTrip.html",
		        controller: 'ctrlCashTrip'
		    });

		    $urlRouterProvider.otherwise('login');

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
	.service('swal', sweetAlertService)
	.factory('global', function ( $state, $http, $rootScope, localStorageService, swal, $ionicPush) {
	    var global = {};
	    $rootScope.guardando = false;
	    global.startPoint = {};
	    global.endPoint = {};
	    global.uncashedTrip = {};
	    global.myTrips = new Array();
	    $rootScope.address = '';
	    var markerId = 0;
		$rootScope.drivers = false;
		$rootScope.clients = false;


	    global.buttonValue = "indeterminate";

	   

	    function errorCallback (){
    		$.toast({
					    heading: 'Error',
					    text: "whit out server response",
					    icon: 'error',
						position: 'bottom-center',
						showHideTransition: 'slide',
						bgColor : '#ff0000',
					    loader: true,        // Change it to false to disable loader
					    textColor : 'white',
					    loaderBg: '#c60000'  // To change the background
						});
    	}

	    $rootScope.goto = function(to, desc){
	    	
	    	global.buttonValue = desc;	    	
	    	$state.go(to);
	    }
	    //Iniciar sesion conductores
	    global.loginDriver = function(user){
		        $http({
		            method: 'post',
		            cache: false,
		            headers: {'Content-Type': 'application/json'},
		            url: 'http://localhost:1337/drivers/session',
		            data :{
		            	user : user.user,
		            	password: user.password
		            }
		        })
		        .then(function successCallback(response) {
		            console.log(response);
		            $rootScope.cargando = false;
          			if (response.data.user == null) {
          				swal.warning("Message", "user not found")
          			} else {
          				$rootScope.user = response.data.user;
          				$rootScope.drivers = true;
          				localStorageService.set('sesion', response.data.user);
          				swal.success("Welcome", "Press 'OK' to close");
          				$state.go('cashTrip');
          			}
		      }
		      ,function errorCallback(response) {
		      	errorCallback();
		    });
    	};

    	//Iniciar sesion clientes
	    global.loginClient = function(user){
		        $http({
		            method: 'post',
		            cache: false,
		            headers: {'Content-Type': 'application/json'},
		            url: 'http://localhost:1337/clients/session',
		            data :{
		            	user : user.user,
		            	password: user.password
		            }
		        })
		        .then(function successCallback(response) {
		            console.log(response);
		            $rootScope.cargando = false;
          			if (response.data.user == null) {
          				swal.warning("Message", "user not found")

          			} else {
          				$rootScope.user = response.data.user;
          				$rootScope.clients = true;
          				localStorageService.set('sesion', response.data.user);

          				//Registrar token
          				$ionicPush.register().then(function(t) {
						  return $ionicPush.saveToken(t);
						}).then(function(t) {
							alert(t.token)
						  console.log('Token saved:', t.token);
						  
						});
          				
          				swal.success("Welcome", "press ok to close")
          				$state.go('newTrip');
          			}
		      }
		      ,function errorCallback(response) {
		      	errorCallback();
		    });
    	};

    	//obtener mis viajes (Cliente)
    	global.getMyTrips = function() {
		        $http({
		            method: 'GET',
		            cache: false,
		            headers: {'Content-Type': 'application/json'},
		            url: 'http://localhost:1337/trips/' + localStorageService.get('sesion')._id,
		        })
		        .then(function successCallback(response) {
		            console.log(response);
		            angular.copy(response.data.trips, global.myTrips);
		            $.toast({
					    heading: (response.data.error)? 'Error':'Success',
					    text: response.data.message,
					    icon: (response.data.error)?'error':'success',
						position: 'bottom-center',
						showHideTransition: 'slide',
						bgColor : (response.data.error)?'#ff0000': '#1663c9',
					    loader: true,        // Change it to false to disable loader
					    textColor : 'white',
					    loaderBg: (response.data.error)?'#c60000':'#9EC600'  // To change the background
						});		            
		      	}
		      	,function errorCallback(response) {
		      		errorCallback();
		    });
    	};

    	//Crear nuevo viaje
    	global.newTrip = function(trip){
		    $http({
		        method: 'post',
		        cache: false,
		        headers: {'Content-Type': 'application/json'},
		        url: 'http://localhost:1337/trips/' + localStorageService.get('sesion')._id,
		        data : {
		        	longitudestart :trip.startPoint.longitudestart,
		            latitudestart : trip.startPoint.latitudestart,
		            longitudeend : trip.endPoint.longitudeend,
		            latitudeend : trip.endPoint.latitudeend
		            }
		        })
		        .then(function successCallback(response) {		
		            $.toast({
					    heading: (response.data.error)? 'Error':'Success',
					    text: response.data.message,
					    icon: (response.data.error)?'error':'success',
						position: 'bottom-center',
						showHideTransition: 'slide',
						bgColor : (response.data.error)?'#ff0000': '#1663c9',
					    loader: true,        // Change it to false to disable loader
					    textColor : 'white',
					    loaderBg: (response.data.error)?'#c60000':'#9EC600'  // To change the background
						});
		      	}
		      	,function errorCallback(response) {
		        	errorCallback();
		    });
    	};
    	
    	//Cobrar un  viaje (Conductor)
    	global.cashTrip = function(trip){
		    $http({
		        method: 'post',
		        cache: false,
		        headers: {'Content-Type': 'application/json'},
		        url: 'http://localhost:1337/trips/cash/' + global.uncashedTrip._id,
		        data : {
		        	duration : 2
		            }
		        })
		        .then(function successCallback(response) {		
		            $.toast({
					    heading: (response.data.error)? 'Error':'Success',
					    text: response.data.message,
					    icon: (response.data.error)?'error':'success',
						position: 'bottom-center',
						showHideTransition: 'slide',
						bgColor : (response.data.error)?'#ff0000': '#1663c9',
					    loader: true,        // Change it to false to disable loader
					    textColor : 'white',
					    loaderBg: (response.data.error)?'#c60000':'#9EC600'  // To change the background
						});
		            //Actualiza la GUI para quitar o dejar el viaje
		           if (response.data.error) {
		           		return false;
		           } else {
		           		global.uncashedTrip = {};
		           		$state.go('cashTrip')
		           		return true;		           
		           	}
		      	}
		      	,function errorCallback(response) {
		       		errorCallback();
		    });
    	};

    	//obtener viaje por cobrar (Conductor)
    	global.getUncashedTrip = function() {
		    $http({
		        method: 'GET',
		        cache: false,
		        headers: {'Content-Type': 'application/json'},
		        url: 'http://localhost:1337/trips/uncashed/' +localStorageService.get('sesion')._id,
			})
		        .then(function successCallback(response) {
		        		angular.copy(response.data.trip, global.uncashedTrip);
		       			//Notificación visual
		        		$.toast({
					    heading: (response.data.error)? 'Error':'Success',
					    text: response.data.message,
					    icon: (response.data.error)?'error':'success',
						position: 'bottom-center',
						showHideTransition: 'slide',
						bgColor : (response.data.error)?'#ff0000': '#1663c9',
					    loader: true,        // Change it to false to disable loader
					    textColor : 'white',
					    loaderBg: (response.data.error)?'#c60000':'#9EC600'  // To change the background
						});
		        		
		      	}
		      	,function errorCallback(response) {
		        	errorCallback();
		    });
    	};

		//Agregar conductor (es nesesario??)
		global.addDriver = function(driver){
    		http({
		            method: 'post',
		            cache: false,
		            headers: {'Content-Type': 'application/json'},
		            url: 'http://localhost:1337/drivers',
		            data : {
		            	name : driver.name + " " +driver.lastName,
		            	user : driver.user,
		            	password : driver.password,
		            	email : driver.email,
		            	phone : driver.phone
		            }
		        })
		        .then(function successCallback(response) {
		            
		            $rootScope.cargando = false;
          			              		
              		localStorageService.set('sesion', response.data);
              		if(response.data.usuario.tipo == 'Administrador'){
                		$rootScope.administrador = true;
            		}
            		$state.go('map');
              		global.visible = true; //se puede ver

		            if (!response.data.err) {
		               // Materialize.toast(response.data.msg, 3000, 'rounded blue');
		                
		            }
		            else{
		              //Materialize.toast(response.data.msg, 3000, 'rounded red');
		          	}
		      }
		      ,function errorCallback(response) {
		        // Materialize.toast("Error Callback", 3000, 'rounded red');
		    });
    	};

    	//Validar que haya unsa sesión activa
    	global.verificateSession = function () {
	
	        if (localStorageService.get('sesion') == null)
	        {
	            $rootScope.visible = false;
	            $state.go('login');
	            swal.warning("Warning", "you should start an session");
	            return false;
	        }
	        if(localStorageService.get('sesion').balance == null){
	            $rootScope.drivers = true;
	            $rootScope.clients = false;
	        }else{
	            $rootScope.clients = true;
	            $rootScope.drivers = false;
	        }
	        $rootScope.visible = true; //se puede ver?
	        $rootScope.user = localStorageService.get('sesion');
	        return true;	        
    	};

    	$rootScope.closeSession = function(){
    		$rootScope.drivers = false;
			 $rootScope.clients = false;
		     $rootScope.visible = false;
		     localStorageService.remove('sesion');
		     $state.go('login');		     
		};

		function create(latitude, longitude) {
	        var marker = {
	            latitude: latitude,
	            longitude: longitude,
	            id: ++ markerId          
	        };
	        return marker;        
    	}

    	function invokeSuccessCallback(successCallback, marker) {
	        if (typeof successCallback === 'function') {
	            successCallback(marker);	        
	        }
    	}

    	global.createByCurrentLocation = function (successCallback) {
	        if (navigator.geolocation) {
	            navigator.geolocation.getCurrentPosition(function (position) {
	                var marker = create(position.coords.latitude, position.coords.longitude);
	                invokeSuccessCallback(successCallback, marker);
	            });
	        } else {
	            errorCallback();
	        }
    	}

    	global.createByAddress = function (address, successCallback) {
	        var geocoder = new google.maps.Geocoder();
	        geocoder.geocode({'address' : address}, function (results, status) {
	            if (status === google.maps.GeocoderStatus.OK) {
	                var firstAddress = results[0];
	                var latitude = firstAddress.geometry.location.lat();
	                var longitude = firstAddress.geometry.location.lng();
	                var marker = create(latitude, longitude);
	                invokeSuccessCallback(successCallback, marker);
	            } else {
	                swal.warning("Unknown address", address);
	            }
	        });
    	}

		return global;
	})
	
	.controller('ctrlAddDriver', function (localStorageService,$rootScope, $scope, $state, global) {
	  

	    $scope.agregar = function(){
	        $rootScope.guardando = true;
	        global.addDriver($scope.driver);
	    }
	})
	.controller('ctrlNewTrip', function (localStorageService,$rootScope, $scope, $state, global) {
	    
	    if(!global.verificateSession()){return;}  
	    
	    $scope.$on('cloud:push:notification', function(event, data) {
		var msg = data.message;
		  alert(msg.title + ': ' + msg.text);
		});

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
	    	global.cashTrip(trip);
	    };

	    $scope.$on('cloud:push:notification', function(event, data) {
		  var msg = data.message;
		  alert(msg.title + ': ' + msg.text);
		});

	})
	.controller('ctrlLogin', function (localStorageService, $rootScope, $scope, $state, global, swal) {
	    
	    alert('login ctl')

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
	.controller('ctrlMenu', function (localStorageService,$rootScope, $scope, $state, global) {
	    //if(!global.verificateSession()){return;} 
	    alert('menu ctl')
	    
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

	