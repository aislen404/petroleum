/* Controllers */
'use strict';

var module;

module = angular.module ('petroleum_app.controllers',[]);

module.controller('petroleumCtrl', function ($scope, mapServiceProvider,dataServiceProvider,poiServiceCreator) {

// --------- initialization of model-view bindings  --------- \\
    //the dataset
    $scope.datos;
    $scope.gasolina_type=0;

    // map object
    $scope.mapObj = null;

    //Gasolina
    $scope.gasolinaCluster=[];

    // Main function in ng-init
    $scope.BeganToBegin = function (){
        $scope.createMap();
        $scope.gasToogle();

    };
    // Control the creation of map
    $scope.createMap = function() {

        //calling the servce for create a map to display the datasets
        $scope.mapObj = mapServiceProvider;

        // Setting map event control for zoom changes
        $scope.mapObj.registerMapEvent('zoom_changed',function(){
            //console.log ('[EVENT] ZOOM:',$scope.mapObj.getZoom());
        });

        //Setting map event control for bounds changes
        $scope.mapObj.registerMapEvent('bounds_changed',function(){
            //console.log ('[EVENT] BOUNDS:',$scope.mapObj.getLatNS(),$scope.mapObj.getLongNS(),$scope.mapObj.getLatSW(),$scope.mapObj.getLongSW());
        });
    };

    // Gas control
    $scope.gasToogle = function (){

        try {
            $scope.gasolinaCluster.clearMarkers();
            $scope.gasolinaCluster=[];
        }catch(e){} //clearMarkers is a method of MarkerCluster

        if($scope.gasolina_type !=0 ){
            var URI = 'dataModels/mitycProxy.php?tipo='+$scope.gasolina_type;
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

                    $(data).find('elemento').each(function()
                    {
                        var theData = {
                            tipo : 'Gasolinera',
                            alias : $(this).find('precio').text()+' € '+$(this).find('rotulo').text(),
                            lat : $(this).find('y').text(),
                            lng : $(this).find('x').text()
                        };

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
                    console.log('Gasolineras',i-1);

                    console.log('cheapOption',cheapOption);
                    //var ch = setMarkers(cheapOption,$scope.mapObj.mapInstance,1);
                    //ch.b.set('style','color: #FF0000;font-family: Trebuchet MS;font-size: 15px;font-weight: bold;left: -34%;letter-spacing: 2px;padding: 2px;position: relative;top: -33px;');

                    console.log('expensiveOption',expensiveOption);
                    //var ex = setMarkers(expensiveOption,$scope.mapObj.mapInstance,-1);
                    //ex.b.set('style','color: #00FF00;font-family: Trebuchet MS;font-size: 15px;font-weight: bold;left: -34%;letter-spacing: 2px;padding: 2px;position: relative;top: -33px;');

                }
            });
        }
    };
});