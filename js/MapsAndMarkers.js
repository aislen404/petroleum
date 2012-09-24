//The Marks
markerObject = (function (){
    function markerObject (options) {

        var thePosition = (!options.position)? new google.maps.LatLng(options.lat, options.lng):options.position;

        this.markerInstance = new MarkerWithLabel({
            position: thePosition,
            icon: icoResolutor(options.icon),
            map: options.objMap.mapInstance,
            labelContent: options.title,
            labelAnchor: new google.maps.Point(22, 0),
            labelClass: "labels", // the CSS class for the label
            labelStyle: {opacity: 0.75}
        });
    }

    //For register the events
    markerObject.prototype.registerMapEvent = function (ev,callBack){
        return google.maps.event.addListener(this.markerInstance, ev ,callBack);
    };

    return markerObject;

}).call(this);

//The geoposition and marker
geoMarker = ( function (){
    function geoMarker (){

        this.geoMarker = new GeolocationMarker();
        this.geoMarker.setCircleOptions({fillColor: '#808080'});
        this.myPosition = null;
    }

    geoMarker.prototype.activate = function (objMap){
        google.maps.event.addListener(this.geoMarker, 'position_changed', function() {
            objMap.setCenter(this.getPosition());
            objMap.fitBounds(this.getBounds());
            this.myPosition = this.getPosition();
        });

        google.maps.event.addListener(this.geoMarker, 'geolocation_error', function(e) {
            alert('There was an error obtaining your position. Message: ' + e.message);
        });

        this.geoMarker.setMap(objMap);
    };

    geoMarker.prototype.getPosition = function (){
        return this.myPosition;
    };

    return geoMarker;

}).call(this);

//The geocoder
geoCoder = ( function (){
    function geoCoder (){
        this.geoCoder = new google.maps.Geocoder();
    }

    geoCoder.prototype.getAddress = function (LatLng){
        this.geoCoder.geocode({'latLng': LatLng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    return (results[1].formatted_address);
                }
            } else {
                alert("Geocoder failed due to: " + status);
            }
        });
    };
/*          results[0].formatted_address: "275-291 Bedford Ave, Brooklyn, NY 11211, USA",
            results[1].formatted_address: "Williamsburg, NY, USA",
            results[2].formatted_address: "New York 11211, USA",
            results[3].formatted_address: "Kings, New York, USA",
            results[4].formatted_address: "Brooklyn, New York, USA",
            results[5].formatted_address: "New York, New York, USA",
            results[6].formatted_address: "New York, USA",
            results[7].formatted_address: "United States" */

    return geoCoder;

}).call(this);

directionsObject = ( function () {
    function directionsObject (){
        //For directions service

        theDirectionsPanel = document.getElementById('directionsPanel');   //directions div id
        directionsServiceInstance = new google.maps.DirectionsService();

        routeBoxer = new RouteBoxer();
        boxpolys = new Array();
        boxPolysBounds = new Array();

    }

    //Directions layer
    directionsObject.prototype.addDirectionsLayer = function (objMap){
        directionsLayerInstance = new google.maps.DirectionsRenderer({
            strokeColor: '#FF0000',
            preserveViewport: true,
            draggable: false
        });
        directionsLayerInstance.setMap(objMap);
        directionsLayerInstance.setPanel(theDirectionsPanel);
    };

    directionsObject.prototype.clearDirectionsLayer = function(objMap){
        directionsLayerInstance.setMap(null);
        directionsLayerInstance.setPanel(null);

        if (boxpolys != null) {
            for (var i = 0; i < boxpolys.length; i++) {
                boxpolys[i].setMap(null);
            }
        }
        boxpolys = null;

        directionsLayerInstance = new google.maps.DirectionsRenderer();

        directionsLayerInstance.setMap(objMap);
        directionsLayerInstance.setPanel(theDirectionsPanel);
    };

    directionsObject.prototype.calculateDirectionsLayer = function(request,objMap,range){
        directionsServiceInstance.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {

                directionsLayerInstance.setDirections(response);
                boxPolysBounds = [];
                boxpolys = [];
                var distance = range / 1000 ;
                alert (distance);
                var path = response.routes[0].overview_path;
                var boxes = this.routeBoxer.box(path, distance);

                for (var i = 0; i < boxes.length; i++) {
                    boxPolysBounds.push(boxes[i]);
                    boxpolys.push(new google.maps.Rectangle({
                        bounds: boxes[i],
                        fillOpacity: 0.2,
                        fillColor: '#66CCFF',
                        strokeOpacity: 1.0,
                        strokeColor: '#3399CC',
                        strokeWeight: 0.5,
                        map: objMap
                    }));
                }
            }
        });
    };

    directionsObject.prototype.getBoxPolysBounds = function(){
        var response = new Array();
        for (var i=0; i< boxPolysBounds.length; i++) {
            response.push({
                latSW:boxPolysBounds[i].ca.b,
                lngSW:boxPolysBounds[i].ea.b,
                latNS:boxPolysBounds[i].ca.f,
                lngNS:boxPolysBounds[i].ea.f
            });
        }
        return response ;
    };

    return directionsObject;

}).call(this);

//The Map
mapObject = (function() {
    var geoSuccessCallback, geolocationError;

    function mapObject(options) {

        var theLat = 40.418889;     // Madrid City Center Latitude
        var theLong = -3.691944;    // Madrid City Center Longitude
        this.theZoom = 12;            // First Zoom

        this.theMap = document.getElementById('map_canvas');                    //map div id

        //this.positionTracking = false;

        var myOptions = {
           zoom: this.theZoom,
           center: new google.maps.LatLng(theLat, theLong),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.BOTTOM_CENTER
            },
            panControl: true,
            panControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            scaleControl: true,
            scaleControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER
            },
            streetViewControl: false,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            }
        };

        //the instance of the map
        this.mapInstance = new google.maps.Map(this.theMap,myOptions);

    }

    //For register the events
    mapObject.prototype.registerMapEvent = function (ev,callBack){
        return google.maps.event.addListener(this.mapInstance, ev,callBack);
    };

    //For UNregister the events
    mapObject.prototype.unRegisterEvent = function (ev){
        return google.maps.event.clearListeners(this.mapInstance,ev)
    };

    // generic in geo - May be will be used in the DGT services to get the parameters needed in the query
    mapObject.prototype.getLatNS = function (){ return  this.mapInstance.getBounds().getNorthEast().lat(); };
    mapObject.prototype.getLongNS = function (){ return  this.mapInstance.getBounds().getNorthEast().lng(); };
    mapObject.prototype.getLatSW = function (){ return  this.mapInstance.getBounds().getSouthWest().lat(); };
    mapObject.prototype.getLongSW = function (){ return  this.mapInstance.getBounds().getSouthWest().lng(); };
    mapObject.prototype.getZoom = function (){ return  this.mapInstance.getZoom(); };

    return mapObject;

}).call(this);

//AUXILIAR FUNCTION TO RESOLVE THE ICO FOR MARKS
//return the icon type
icoResolutor = function (type) {
    var ico;

    switch (type){
        case ('Me'):
            ico = 'img/me.png';
            break;
        case ('Marker'):
            ico ='img/default.png';
            break;
        case ('Gasolinera'):
            ico = 'img/gasolinera.png';
            break;
        case ('barata'):
            ico = 'img/star.png';
            break;
        case ('cara'):
            ico = 'img/shit.png';
            break;

        default:
            ico ='img/default.png';
    }
    return ico;
};


// Clear boxes currently on the map
clearBoxes = function () {
    if (boxpolys != null) {
        for (var i = 0; i < boxpolys.length; i++) {
            boxpolys[i].setMap(null);
        }
    }
    boxpolys = null;
};