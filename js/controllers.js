/* Controllers */
'use strict';

var module;

module = angular.module ('petroleum_app.controllers',[]);

module.controller('petroleumCtrl', function ($scope, mapServiceProvider,dataServiceProvider,poiServiceCreator) {

// --------- initialization of model-view bindings  --------- \\
    //the dataset
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
            console.log ('[EVENT] ZOOM:',$scope.mapObj.getZoom());
        });

        //Setting map event control for bounds changes
        $scope.mapObj.registerMapEvent('bounds_changed',function(){
            console.log ('[EVENT] BOUNDS:',$scope.mapObj.getLatNS(),$scope.mapObj.getLongNS(),$scope.mapObj.getLatSW(),$scope.mapObj.getLongSW());
        });
    };

    // Gas control
    $scope.gasToogle = function (){

        try {
            $scope.gasolinaCluster.clearMarkers();
            $scope.gasolinaCluster=[];
            clearTable();
        }catch(e){} //clearMarkers is a method of MarkerCluster

        if($scope.gasolina_type !=0 ){

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
                    $scope.datos = [];

                    $(data).find('elemento').each(function()
                    {

                        if(i==1){
                            theData = {
                                tipo : 'barata',
                                precio: $(this).find('precio').text()+' €',
                                rotulo: $(this).find('rotulo').text(),
                                alias : $(this).find('precio').text()+' € '+$(this).find('rotulo').text(),
                                lat : $(this).find('y').text(),
                                lng : $(this).find('x').text()
                            };
                        }else if(i==$(data).find('elemento').length){
                            theData = {
                                tipo : 'cara',
                                precio: $(this).find('precio').text()+' €',
                                rotulo: $(this).find('rotulo').text(),
                                alias : $(this).find('precio').text()+' € '+$(this).find('rotulo').text(),
                                lat : $(this).find('y').text(),
                                lng : $(this).find('x').text()
                            };
                        }else{
                            theData = {
                                tipo : 'Gasolinera',
                                precio: $(this).find('precio').text()+' €',
                                rotulo: $(this).find('rotulo').text(),
                                alias : $(this).find('precio').text()+' € '+$(this).find('rotulo').text(),
                                lat : $(this).find('y').text(),
                                lng : $(this).find('x').text()
                            };
                        }

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

                    $('#datos').html($scope.datos);

                    console.log('Gasolineras',i-1);
                    console.log('cheapOption',cheapOption);
                    console.log('expensiveOption',expensiveOption);
                    console.log($scope.datos);

                }
            });
        }
    };
});

function addRow (data) {

    var tds ='<tr>';
    tds += '<td>'+data.rotulo+'</td>';
    tds += '<td>'+data.precio+'</td>';
    tds += '<td>'+data.lat+'</td>';
    tds += '<td>'+data.lng+'</td>';
    tds+='</tr>';

    $('#tabla tbody').append(tds);
}
function clearTable (){
    $('#tabla tbody').html('');
}
