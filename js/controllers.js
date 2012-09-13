/* Controllers */
'use strict';

var module;

module = angular.module ('petroleum_app.controllers',[]);

module.controller('petroleumCtrl', function ($scope, mapServiceProvider,directionsServiceProvider,dataServiceProvider,geoMarkerServiceProvider,poiServiceCreator) {

// --------- initialization of model-view bindings  --------- \\
    //the dataset
    $scope.gasolina_type=0;

    // map object
    $scope.mapObj = null;

    //geoposicion
    $scope.geopos = false;
    $scope.geoPosObj = null;

    //gasolina
    $scope.gasolinaCluster=[];

    //route planning filters
    $scope.route_mode='driving';
    $scope.route_highways=true;
    $scope.route_tolls=true;
    $scope.route_optimize=true;

    //route planning direction layer
    $scope.directionLayer = false;
    $scope.directionLayerResponse = null;
    $scope.waypoints=[];
    $scope.origin = null;
    $scope.destination = null;

    //route planning marker clusters
    $scope.wayPointsCluster=[];
    $scope.OLDwayPointsCluster = [];

    // Main function in ng-init
    $scope.BeganToBegin = function (){
        $scope.initJqueryScripts();
        $scope.showLocalizacionOptions();
        $scope.showCombustibleOptions();
        $scope.showRoutePlanningOptions();
        $scope.createMap();
        $scope.gasToggle();

    };
    // Control the creation of map
    $scope.createMap = function() {

        //calling the servce for create a map to display the datasets
        $scope.mapObj = mapServiceProvider;


        // Setting map event control for zoom changes
        $scope.mapObj.registerMapEvent('zoom_changed',function(){
            console.log ('[EVENT] ZOOM:',$scope.mapObj.getZoom());
        });

        //Setting map event control for bounds changes
        $scope.mapObj.registerMapEvent('bounds_changed',function(){
            console.log ('[EVENT] BOUNDS:',$scope.mapObj.getLatNS(),$scope.mapObj.getLongNS(),$scope.mapObj.getLatSW(),$scope.mapObj.getLongSW());
        });
    };

    // Gas control
    $scope.gasToggle = function (){

        try {
            $scope.gasolinaCluster.clearMarkers();
            $scope.gasolinaCluster=[];
            clearTable();
        }catch(e){} //clearMarkers is a method of MarkerCluster

        if($scope.gasolina_type !=0 ){

            $scope.showCombustibleOptions();

            $('#gas_ctrl').attr('class','gas-load');

            var latNS = $scope.mapObj.getLatNS();
            var lngNS = $scope.mapObj.getLongNS();
            var latSW = $scope.mapObj.getLatSW();
            var lngSW = $scope.mapObj.getLongSW();

            var URI = 'dataModels/mitycProxy.php?tipo='+$scope.gasolina_type+'&lngSW='+lngSW+'&latSW='+latSW+'&lngNS='+lngNS+'&latNS='+latNS;
            console.log(URI);
            var arryOfMarkers = [];

            $.ajax({
                type: 'GET',
                url: URI,
                dataType: 'xml',
                success: function (data){
                    var i=1;
                    var valor=0;
                    var expensive;
                    var expensiveOption;
                    var cheap;
                    var cheapOption;
                    var gasolinera;
                    var theData;
                    var tipo;
                    $scope.datos = [];

                    $(data).find('elemento').each(function()
                    {

                        if(i==1){
                            tipo = 'barata';
                        }else if(i==$(data).find('elemento').length){
                            tipo = 'cara';
                        }else{
                            tipo = 'Gasolinera';
                        }

                        theData = {
                            tipo : tipo,
                            precio: $(this).find('precio').text()+' €',
                            rotulo: $(this).find('rotulo').text(),
                            alias : $(this).find('precio').text()+' €',
                            lat : $(this).find('y').text(),
                            lng : $(this).find('x').text()
                        };

                        addRow(theData);
                        $scope.datos.push(theData);
                        arryOfMarkers.push(markerCreator(theData,$scope.mapObj.mapInstance));

                        var auxPrecio = parseInt(theData.alias.replace(/,/g, '.'));

                        if(auxPrecio>valor){
                            expensive = auxPrecio;
                            expensiveOption = theData;
                            valor = expensive;
                        }else{
                            cheap = auxPrecio;
                            cheapOption = theData;
                        }

                        $scope.gasolinaCluster.push(gasolinera);

                        i+=1;
                    });

                    $scope.gasolinaCluster =poiServiceCreator.createGazCluster(arryOfMarkers,$scope.mapObj);
                    $scope.datos= angular.toJson($scope.datos);

                    console.log('Gasolineras',i-1);
                    console.log('cheapOption',cheapOption);
                    console.log('expensiveOption',expensiveOption);
                    console.log($scope.datos);

                    $('#gas_ctrl').attr('class','gas');
                }
            });
        }
    };

    $scope.initJqueryScripts = function (){
        $('#list').hide();
    };


    $scope.showLocalizacionOptions = function (){
        $('#myModalLocalizacion').toggle();
    };

    $scope.showCombustibleOptions = function (){
        $('#myModalCombustible').toggle();
    };

    $scope.showRoutePlanningOptions = function (){
        $('#myModalRoutePlanning').toggle();
    };

    $scope.renderToggle = function (el){
        renderToggle_view ('btn_renderToggle');
    };

    $scope.positionControl = function (){
        if($scope.mapObj.mapInstance){
            if($scope.geopos){
                $scope.geoPosObj = geoMarkerServiceProvider.activate($scope.mapObj.mapInstance);
            }else{
                $scope.geoPosObj = null;
            }
        }
    };


// --------- Controls for route planning --------- \\
    // Init the direction routine and register click event to creater the route marks (waypoints)
    $scope.createRoute = function(){
        var originOptions,destinationOptions;

        if (!$scope.directionLayer){

            $scope.showRoutePlanningOptions();

            //calling the method to create the directions layer and directions service
            $scope.directionLayer = directionsServiceProvider.addDirectionsLayer($scope.mapObj.mapInstance);

            //register click event
            $scope.mapObj.registerMapEvent('click',function(event){
                // the first mark, the origin
                if ($scope.origin == null) {
                    $scope.origin = event.latLng; // position for marker
                    originOptions = {
                        position:$scope.origin,
                        draggable: false,
                        tipo:  'Origin',
                        title: 'origen'
                    };
                    $scope.wayPointsCluster.push(poiServiceCreator.createGenericPoi(originOptions,$scope.mapObj)); //calling the marker service to create a origin mark
                } else if ($scope.destination == null) {
                    // the second mark, destination
                    $scope.destination = event.latLng; // position for marker
                    destinationOptions = {
                        position:$scope.destination,
                        draggable: false,
                        tipo:  'Destination',
                        title: 'destino 1'
                    };
                    $scope.wayPointsCluster.push(poiServiceCreator.createGenericPoi(destinationOptions,$scope.mapObj)); //calling the marker service to create a destination mark
                } else {
                    //the limit of 9 is a google limit for the service
                    if ($scope.waypoints.length <= 9) {
                        $scope.waypoints.push({ location: $scope.destination, stopover: true });// the others marks to waypoints
                        $scope.destination = event.latLng; // position for marker
                        destinationOptions = {
                            position:$scope.destination,
                            draggable: false,
                            tipo:  'Destination',
                            title: 'destino'+ $scope.waypoints.length
                        };
                        $scope.wayPointsCluster.push(poiServiceCreator.createGenericPoi(destinationOptions,$scope.mapObj)); //calling the marker service to create a destination mark
                    } else {
                        alert("Maximum number of waypoints reached");
                    }
                }
            });

            //The direction layer is created , now we can create a waypoints, calculate, update , reset or undo
            //Hide the button !! prevent malicious or dumbs cliks
            $('#createRoute').hide();

        }else{
            alert ('push the Blue ')
        }
    };

    // Trigger the calculate process getting all the mandatory params needed for the request
    $scope.calcRoute = function() {
        if(!$scope.directionLayer){

            $scope.showRoutePlanningOptions();

            //Without origin or any destination is not possible calculate no route.
            if ($scope.origin == null) {
                alert("Click on the map to add a start point");
                return;
            }
            if ($scope.destination == null) {
                alert("Click on the map to add an end point");
                return;
            }

            var mode;
            switch ( $scope.route_mode ) {
                case "bicycling":
                    mode = google.maps.DirectionsTravelMode.BICYCLING;
                    break;
                case "driving":
                    mode = google.maps.DirectionsTravelMode.DRIVING;
                    break;
                case "walking":
                    mode = google.maps.DirectionsTravelMode.WALKING;
                    break;
            }

            //the request options, first 3 thru createRoute the rest with route planning form
            var request = {
                origin: $scope.origin,
                destination: $scope.destination,
                waypoints: $scope.waypoints,
                travelMode: mode,
                optimizeWaypoints: $scope.route_optimize,
                avoidHighways: $scope.route_highways,
                avoidTolls: $scope.route_tolls
            };

            //Calling directly to the method of the map object

            $scope.directionLayerResponse = directionsServiceProvider.calculateDirectionsLayer(request,$scope.mapObj.mapInstance);

            console.log('controler ',$scope.directionLayerResponse);

            //Unregistering the event for no more waypoints
            $scope.mapObj.unRegisterEvent('click');

            //Needed to remove the temporal markers created by the user in the route
            $scope.removeTemporalMarkers();

            //Hide the button !! prevent malicious or dumbs cliks
            $('#calcRoute').hide();
        }
    };

    $scope.removeTemporalMarkers = function(){
        for (var i = 0; i < $scope.wayPointsCluster.length; i++) {
            $scope.wayPointsCluster[i].setMap(null);
        }
    };

    //Recall the calcRoute routine
    $scope.updateRoute = function(){
        if($scope.directionLayer){
            $scope.calcRoute();
        }
    };

    //Call directly the method of the map object for remove all waypoints and indications
    $scope.resetRoute = function() {

        directionsServiceProvider.clearDirectionsLayer($scope.mapObj.mapInstance);

        $scope.directionLayer = false;
        $scope.waypoints=[];
        $scope.origin = null;
        $scope.destination = null;

        $('#createRoute').show();
        $('#calcRoute').show();


    };
});
