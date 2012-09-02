//The Marks
markerObject = (function (){
    function markerObject (options) {

        var thePosition = (!options.position)? new google.maps.LatLng(options.lat, options.lng):options.position;

        var myOptions = {
            //position: options.position,
            position: thePosition,
            draggable: options.draggable,
            map: options.objMap.mapInstance,
            icon: icoResolutor(options.icon), //we use a method to resolve and abstract the icons by type
            title: options.title
        };

        this.markerInstance = new google.maps.Marker(myOptions);
    }

    //For register the events
    markerObject.prototype.registerMapEvent = function (ev,callBack){
        return google.maps.event.addListener(this.markerInstance, ev ,callBack);
    }

    return markerObject;

}).call(this);

//The Map
mapObject = (function() {
    var geoSuccessCallback, geolocationError;

    function mapObject(options) {

        var theLat = 40.418889;     // Madrid City Center Latitude
        var theLong = -3.691944;    // Madrid City Center Longitude
        this.theZoom = 14;            // First Zoom

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
                position: google.maps.ControlPosition.RIGHT_CENTER
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

        var map = this.mapInstance;

        GeoMarker = new GeolocationMarker();
        GeoMarker.setCircleOptions({fillColor: '#808080'});

        google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
            map.setCenter(this.getPosition());
            map.fitBounds(this.getBounds());
        });

        google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {
            alert('There was an error obtaining your position. Message: ' + e.message);
        });

        GeoMarker.setMap(map);

    }

    //For register the events
    mapObject.prototype.registerMapEvent = function (ev,callBack){
        return google.maps.event.addListener(this.mapInstance, ev,callBack);
    };

    //For UNregister the events
    mapObject.prototype.unRegisterEvent = function (ev){
        return google.maps.event.clearListeners(this.mapInstance,ev)
    };

    // Geolocation and Tracking position
    mapObject.prototype.positionTrack = function() {
        if (!this.positionTracking.state) {
            this.positionTrackingOn();
            return this.positionTrackRefresh();
        } else if (this.positionTracking.state) {
            return this.positionTrackingOff();
        }
    };
    mapObject.prototype.positionTrackingOn = function() {
        console.log('tracking on');
        var geoLoc, options, watchID;
        if (!this.nav) {
            this.nav = window.navigator;
        }
        if (this.nav) {
            geoLoc = this.nav.geolocation;
            window.map = this.mapInstance;
            if (geoLoc) {
                watchID = geoLoc.watchPosition(geoSuccessCallback, geolocationError, options = {
                    enableHighAccuracy: true
                });
            }
            try {
                geoLoc.getCurrentPosition(geoSuccessCallback, geolocationError, options = {
                    enableHighAccuracy: true
                });
            } catch (_error) {}
            return this.positionTracking.state = true;
        }
    };
    mapObject.prototype.positionTrackRefresh = function() {
        var pos;
        pos = window.pos;
        if (pos) {
            return this.mapInstance.panTo(new google.maps.LatLng(pos.lat(), pos.lng()));
        }
    };
    mapObject.prototype.positionTrackingOff = function(watchID) {
        window.navigator.geolocation.clearWatch(watchID);
        try {
            window.userPositionMarker.setMap(null);
        } catch (_error) {}
        return this.positionTracking.state = false;
    };

    // generic in geo - May be will be used in the DGT services to get the parameters needed in the query
    mapObject.prototype.getLatNS = function (){ return  this.mapInstance.getBounds().getNorthEast().lat(); };
    mapObject.prototype.getLongNS = function (){ return  this.mapInstance.getBounds().getNorthEast().lng(); };
    mapObject.prototype.getLatSW = function (){ return  this.mapInstance.getBounds().getSouthWest().lat(); };
    mapObject.prototype.getLongSW = function (){ return  this.mapInstance.getBounds().getSouthWest().lng(); };
    mapObject.prototype.getZoom = function (){ return  this.mapInstance.getZoom(); };

    //Callback controls for Geolocation
    geoSuccessCallback = function(position) {
        var icon;
        if (position.coords.latitude) {
            window.pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            try {
                window.userPositionMarker.setMap(null);
            } catch (_error) {}
            icon = icoResolutor('Me');
            return window.userPositionMarker = new google.maps.Marker({
                icon: icon,
                position: window.pos,
                map: window.map,
                title: 'You are here.'
            });
            window.map.panTo(window.pos);
        }
    };
    geolocationError = function(error) {
        var alert, msg;
        console.log('geoLoc error');
        msg = 'Unable to locate position. ';
        switch (error.code) {
            case error.TIMEOUT:
                msg += 'Timeout.';
                break;
            case error.POSITION_UNAVAILABLE:
                msg += 'Position unavailable.';
                break;
            case error.PERMISSION_DENIED:
                msg += 'Please turn on location services.';
                break;
            case error.UNKNOWN_ERROR:
                msg += error.code;
        }
        return msg;
    };

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