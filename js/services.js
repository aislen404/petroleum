/*Services for map */
'use strict';

var module;
var markerCreator;
var clusterCreator;

module = angular.module('petroleum_app.services',['ngResource']);

// --------- THE MAPS  --------- \\
//These service create the map and trigger the geolocalization on.
module.factory('mapServiceProvider', function (){
    var myOptions = {};
    var mapa = new mapObject (myOptions);   //mapObject is an interface for google map API
    mapa.positionTrack();                   //swicht on the geolocalization (if is available)
    return mapa;                            //returning the google map object
});

// --------- THE DATASETS  --------- \\
//These service only get data for the data sets, is AngularJS 100%
module.factory('dataServiceProvider', function ($resource){
    return $resource('dataModels/:file', {}, {
        query: {method:'GET', params:{file:''}, isArray:true}
    });
});


// --------- THE POIS  --------- \\
//These service generate all the POIS and clusters in especifics method for especifics elements
module.factory('poiServiceCreator',function (){
    var dato;

    return {
        //Gaz Stations cluster
        createGazCluster: function (arrayOfMarkers,objMap){
            var myOptions = {
                gridSize: 100,
                maxZoom: 14,
                styles: [{
                    url: 'img/m1.png',
                    height: 53,
                    width: 52,
                    anchor: [0,0],
                    textColor: '#000',
                    textSize: 11
                }, {
                    url: 'img/m2.png',
                    height: 56,
                    width: 55,
                    anchor: [0,0],
                    textColor: '#000',
                    textSize: 12
                }, {
                    url: 'img/m3.png',
                    height: 66,
                    width: 65,
                    anchor: [0,0],
                    textColor: '#000',
                    textSize: 13
                }]
            }; //especific options for the cluster

            return clusterCreator (objMap.mapInstance,arrayOfMarkers,myOptions); //create a cluster with all the markeres returned and stored
        },
        //Only ONE personalized POI per call
        createGenericPoi: function (data,objMap){
            return markerCreator (data,objMap);
        }
    };
});

// --------- THE AUX METHODS  --------- \\
//Marker creator
markerCreator = function (dato,objMap){
    var myOptions = {
        lat:dato.lat,
        lng:dato.lng,
        position:dato.position,
        draggable: false,
        objMap: objMap,
        icon: dato.tipo,
        title: dato.tipo+" : "+ dato.alias
    };// retriving and matching the especific options for this marker

    console.log (myOptions);
    var markObject = new markerObject (myOptions);  //markerObject is an interface for google map API

    //TODO: this will be in the controller NOT in the SERVICE
    markObject.registerMapEvent ('click',function(){
            alert(dato.alias);
    });

    //TODO: Why .markerInstance?
    return markObject.markerInstance;
};

//TODO: this will we abstracted to scriptAux, who really implement the google API.
//Cluster creator
clusterCreator = function (objMap,markers,myOptions){
    return new MarkerClusterer(objMap, markers, myOptions);
};