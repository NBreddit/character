(function() {

/***********
 * Angular *
 ***********/

var app = angular.module('unb');
var directives = { }, filters = { };

/************************
 * Attribute directives *
 ************************/

directives.toInt = function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) { return '' + value; });
            ngModel.$formatters.push(function(value) { return parseInt(value, 10); });
        }
    };
};

/***********
 * Filters *
 ***********/

filters.decorate = function() {
    return function(input) {
        if (!input) return 'None';
        if (input.constructor == Array) input = input[0];
        if (input.constructor != String) return 'N/A';
        return input
            .replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>')
            .replace(/\[RCV\]/g,'<span class="badge RCV">RCV</span>')
            .replace(/\[TND\]/g,'<span class="badge TND"><i class="tnd-icon"></i> TND</span>')
            .replace(/\[EMPTY\]/g,'<span class="badge EMPTY"><i class="fa fa-circle-o"></i> EMPTY</span>')
            .replace(/\[BLOCK\]/g,'<span class="badge BLOCK"><i class="block-icon"></i> BLOCK</span>')
            .replace(/\[BOMB\]/g,'<span class="badge BOMB"><i class="fa fa-bomb"></i> BOMB</span>')
            .replace(/\[RAINBOW\]/g,'<span class="badge RAINBOW"></i> RAINBOW</span>')
            .replace(/\[G\]/g,'<span class="badge G">G</span>');
    };
};

filters.range = function() {
    return function(input, total) {
        total = parseInt(total,10);
        for (var i=0;i<total;++i) input.push(i);
        return input;
    };
};

/******************
 * Initialization *
 ******************/

for (var directive in directives)
    app.directive(directive, directives[directive]);

for (var filter in filters)
    app.filter(filter, filters[filter]);

})();
