/* App Module */
(function () {

    'use strict';

    var app ;

    app = angular.module ('petroleum_app', ['petroleum_app.services','petroleum_app.controllers']);

    app.config ( function ($routeProvider) {
        return $routeProvider.otherwise({redirectTo: '/'});
    });

    app.run (function ($rootScope){

        return true;
    });

}).call(this);

