(function() {

var directives = { };
var filters = { };

var app = angular.module('unb');

/**************
 * Directives *
 **************/

directives.characterTable = function($rootScope, $timeout, $compile, $storage) {
    return {
		restrict: 'E',
		replace: true,
		template: '<table id="mainTable" class="table table-striped-column panel panel-default"></table>',
		link: function(scope, element, attrs) {
			var table = element.dataTable({
				iDisplayLength: $storage.get('unitsPerPage', 10),
				stateSave: true,
				data: scope.table.data,
				columns: scope.table.columns,
				rowCallback: function(row, data, index) {
					if (!row || row.hasAttribute('loaded')) return;
					var $row = $(row);
					if (!$row) return;
					// lazy thumbnails
					$row.find('[data-original]').each(function(n,x) {
						x.setAttribute('src',x.getAttribute('data-original'));
						x.removeAttribute('data-original');
					});
					var id = data[data.length - 1] + 1;
					// cosmetic fixes
                    //types
                    var typeBox = row.cells[3];
                    var type = typeBox.textContent;
                    $(typeBox).html('<img src="../img/type/' + type + '.png">');

                    //stars
                    var starBox = row.cells[2];
                    var rarity = starBox.textContent;
                    $(starBox).html('<img src="../img/rarity/' + rarity + '.png">');

                    //affil
                    var affiBox = row.cells[5];
                    var affil = affiBox.textContent;

                    if (affil.indexOf(',') >= 0) {
                      var affiSplit = affil.split(', ');
                      $(affiBox).html('<div class="doubleAffil"><img src="../img/affi/' + affiSplit[0] + '.png"><img src="../img/affi/' + affiSplit[1] + '.png"></div>');
                    }
                    else {
                      $(affiBox).html('<img src="../img/affi/' + affil + '.png">');
                    }

					// compile
					$compile($(row).contents())($rootScope);
					if (window.units[id - 1].preview) $(row).addClass('preview');
					else if (window.units[id - 1].incomplete) $(row).addClass('incomplete');
					row.setAttribute('loaded','true');
				},
				headerCallback : function(header) {
					if (header.hasAttribute('loaded')) return;
					header.cells[header.cells.length - 1].setAttribute('title', 'Character Log');
					header.setAttribute('loaded',true);
				}
			});
			scope.table.refresh = function() {
				$rootScope.$emit('table.refresh');
				$timeout(function() { element.fnDraw(); });
			};
            // report link
            var link = $('<span class="help-link">Want to report or suggest something? <a> Join our discord</a>.</span>');
            link.find('a').attr('href', 'https://discord.gg/MRhRrbF');
            link.insertAfter($('.dataTables_length'));
            // night toggle
            var nightToggle = $('<label class="night-toggle"><input type="checkbox">Night mode</input></label>');
            nightToggle.find('input').change(function(e) {
                $rootScope.nightMode = e.target.checked;
                if (!$rootScope.$$phase) $rootScope.$apply();
            });
            if ($rootScope.nightMode) nightToggle.find('input').attr('checked', 'checked');
            nightToggle.insertBefore($('.dataTables_length'));
            // fuzzy toggle
            var fuzzyToggle = $('<label class="fuzzy-toggle"><input type="checkbox">Enable fuzzy search</input></label>');
            fuzzyToggle.attr('title','When enabled, searches will also display units whose name is not an exact match to the search keywords.\nUseful if you don\'t know the correct spelling of a certain unit.');
            fuzzyToggle.find('input').prop('checked', scope.table.fuzzy);
            fuzzyToggle.find('input').change(function() {
                var checked = $(this).is(':checked');
                if (checked == scope.table.fuzzy) return;
                scope.table.fuzzy = checked;
                $storage.set('fuzzy', scope.table.fuzzy);
                scope.table.refresh();
            });
            fuzzyToggle.insertBefore($('.dataTables_length'));
        }
    };
};

//modal full art and scrolls
directives.decorateSlot = function() {
    return {
        restrict: 'A',
        scope: { uid: '=', big: '@' },
        link: function(scope, element, attrs) {
            if (scope.big)
                element[0].style.backgroundImage = 'url(' + Utils.getBigThumbnailUrl(scope.uid) + ')';
            else
                element[0].innerHTML = '<img src="' + Utils.getScroll(scope.uid) + '"></img>';
        }
    };
};

//modal 'evolves to'
directives.decorateSlot2 = function() {
    return {
        restrict: 'A',
        scope: { uid: '='},
        link: function(scope, element, attrs) {
                element[0].style.backgroundImage = 'url(' + Utils.getThumbnailUrl(scope.uid) + ')';
        }
    };
};

directives.autoFocus = function($timeout) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$timeout(function(){ element[0].focus(); });
		}
	};
};

directives.addSailorOptions = function($timeout, $compile, MATCHER_IDS) {
    //TO DO ONCE WE FIND OUT WHAT SAILOR ABILITIES DO ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    var TARGET = MATCHER_IDS['sailor.ClassBoostingSailors'];
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            if (scope.n !== TARGET) return;
            var filter = $('<div id="class-filters" ng-class="{ enabled: filters.custom[' + TARGET + '] }"></div>');
            var classes = [ 'Fighter', 'Shooter', 'Slasher', 'Striker', 'Free Spirit', 'Cerebral', 'Powerhouse', 'Driven' ];
            classes.forEach(function(x,n) {
                var template = '<span class="filter subclass %c" ng-class="{ active: filters.classSailor == \'%s\' }" ' +
                    'ng-click="onSailorClick($event,\'%s\')">%s</span>';
                filter.append($(template.replace(/%s/g,x).replace(/%c/,'width-6')));
            });
            element.after(filter);
            $compile(filter)(scope);
            scope.onSailorClick = function(e,type) {
                scope.filters.classSailor = (scope.filters.classSailor == type ? null : type);
            };
        }
    };
};

directives.addSpecialOptions = function($timeout, $compile, MATCHER_IDS) {
    var TARGET = MATCHER_IDS['special.ClassBoostingSpecials'];
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            if (scope.n !== TARGET) return;
            var filter = $('<div id="class-filters" ng-class="{ enabled: filters.custom[' + TARGET + '] }"></div>');
            var classes = [ 'Fighter', 'Shooter', 'Slasher', 'Striker', 'Free Spirit', 'Cerebral', 'Powerhouse', 'Driven' ];
            classes.forEach(function(x,n) {
                var template = '<span class="filter subclass %c" ng-class="{ active: filters.classSpecial == \'%s\' }" ' +
                    'ng-click="onSpecialClick($event,\'%s\')">%s</span>';
                filter.append($(template.replace(/%s/g,x).replace(/%c/,'width-6')));
            });
            element.after(filter);
            $compile(filter)(scope);
            scope.onSpecialClick = function(e,type) {
                scope.filters.classSpecial = (scope.filters.classSpecial == type ? null : type);
            };
        }
    };
};

directives.addOrbOptions = function($timeout, $compile, MATCHER_IDS) {
    var TARGET = MATCHER_IDS['special.OrbControllers'];
    return {
        restrict: 'A',
        link: function(scope,element,attrs) {
            if (scope.n !== TARGET) return;
            var orbs = { ctrlFrom: [ ], ctrlTo: [ ] };
            var filter = $('<div id="controllers" ng-class="{ enabled: filters.custom[' + TARGET + '] }">' +
                    '<span class="separator">&darr;</span></div>');
            var separator = filter.find('.separator');
            [ 'STR', 'DEX', 'QCK', 'PSY', 'INT', 'RCV', 'TND', 'BLOCK', 'EMPTY', 'BOMB', 'G' ].forEach(function(type) {
                var template = '<span class="filter orb %s" ng-class="{ active: filters.%f.indexOf(\'%s\') > -1 }" ' +
                    'ng-model="filters.%f" ng-click="onOrbClick($event,\'%s\')">%S</span>';
                separator.before($(template.replace(/%s/g,type).replace(/%S/g,type[0]).replace(/%f/g,'ctrlFrom')));
                filter.append($(template.replace(/%s/g,type).replace(/%S/g,type[0]).replace(/%f/g,'ctrlTo')));
            });
            element.after(filter);
            $compile(filter)(scope);
            scope.onOrbClick = function(e,type) {
                var target = e.target.getAttribute('ng-model');
                if (!target) return;
                target = target.match(/filters\.(.+)$/)[1];
                if (orbs[target].indexOf(type) == -1) orbs[target].push(type);
                else orbs[target].splice(orbs[target].indexOf(type), 1);
                orbs[target] = orbs[target].slice(-2);
                scope.filters[target] = orbs[target];
            };
        }
    };
};

directives.addDebuffOptions = function($timeout, $compile, MATCHER_IDS) {
    var TARGET = MATCHER_IDS['special.DebuffReducingSpecials'];
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            if (scope.n !== TARGET) return;
            var filter = $('<div id="debuff" ng-class="{ enabled: filters.custom[' + TARGET + '] }"></div>');
            var debuffs = [ 'Bind', 'Despair', 'Silence', 'Paralysis', 'Blindness', 'Poison', 'Anti-Healing', 'Chain Limit' ];
            debuffs.forEach(function(x,n) {
                var template = '<span class="filter debuff %c" ng-class="{ active: filters.debuffs == \'%s\' }" ' +
                    'ng-click="onDebuffClick($event,\'%s\')">%s</span>';
                filter.append($(template.replace(/%s/g,x).replace(/%c/,'width-6')));
            });
            element.after(filter);
            $compile(filter)(scope);
            scope.onDebuffClick = function(e,type) {
                //console.log(scope.filters.debuffs);
                scope.filters.debuffs = (scope.filters.debuffs == type ? null : type);
            };
        }
    };
};

directives.goBack = function($state) {
	return {
		restrict: 'A',
        link: function(scope, element, attrs) {
            element.click(function(e) {
                if (!e.target || e.target.className.indexOf('inner-container') == -1) return;
                element.find('.modal-content').addClass('rollOut');
                $('.backdrop').addClass('closing');
                setTimeout(function() { $state.go('^'); },300);
            });
        }
    };
};

directives.evolution = function($state, $stateParams) {
    return {
        restrict: 'E',
        replace: true,
        scope: { unit: '=', base: '=', evolvers: '=', evolution: '=', size: '@' },
        templateUrl: 'views/evolution.html',
        link: function(scope, element, attrs) {
            scope.goToState = function(id) {
                if (!Number.isInteger(id)) return;
                if (id == parseInt($stateParams.id,10)) return;
                var previous = $stateParams.previous.concat([ $stateParams.id ]);
                $state.go('main.search.view',{ id: id, previous: previous });
            };
        }
    };
};

directives.unit = function($state, $stateParams) {
    return {
        restrict: 'E',
        scope: { uid: '=' },
        template: '<a class="slot medium" decorate-slot uid="uid" ng-click="goToState(uid)"></a>',
        link: function(scope, element, attrs) {
            scope.goToState = function(id) {
                if (id == parseInt($stateParams.id,10)) return;
                var previous = $stateParams.previous.concat([ $stateParams.id ]);
                $state.go('main.search.view',{ id: id, previous: previous });
            };
        }
    };

};

directives.addNames = function($stateParams, $rootScope) {
    var name = window.aliases;
    return {
        restrict: 'E',
        replace: true,
        template: '<table class="table table-striped-column abilities"><tbody></tbody></table>',
        link: function(scope, element, attrs) {
            var id = $stateParams.id, data = details[id];

                var currentAliases = name[id];
                if(typeof currentAliases != 'undefined'){
                    var otherAliases = currentAliases.toString().replace(/(.*?), (.*?),/,"");
                    element.append($('<tr><td>'+ otherAliases +'</td></tr>'));
                }
                else {
                  element.append($('<tr><td>None</td></tr>'));
                }
        }
    }
};

directives.addField = function($stateParams, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        template: '<td></td>',
        link: function(scope, element, attrs) {
          var field = window.details[$stateParams.id].field;
          var key = field[0];
          var desc = window.fieldbuddy[0][key];
          var value= field[1];
          var fullText = desc.toString().replace('[x]', value);
          var decorated = fullText.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');

          element.append($('<tr><td>' + decorated + '</td></tr>'));
        }
    }
};

directives.addBuddy = function($stateParams, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        template: '<td></td>',
        link: function(scope, element, attrs) {
          var buddy = window.details[$stateParams.id].buddy;
          var key = buddy[0];
          var desc = window.fieldbuddy[0][key];
          var value= buddy[1];
          var fullText = desc.toString().replace('[x]', value);
          var decorated = fullText.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');

          element.append($('<tr><td>' + decorated + '</td></tr>'));
        }
    }
};

directives.addAbilities = function($stateParams, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        template: '<td></td>',
        link: function(scope, element, attrs) {
          var loop = window.details[$stateParams.id].abl;
          for(var y = 0; y < loop.length; y++){
            var abl = loop[y];
            var desc= window.abilities[0][abl];
            var value= window.details[$stateParams.id]['ablD'][y];
            var fullAbility = desc.toString().replace('[x]', value);
            var decorated = fullAbility.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');

              if(desc){

                  element.append($('<tr><td><img src="../img/ability/'+ abl + '.png"> ' + decorated + '</td></tr>'));
                }
              }
          }
    }
};

directives.addPvpAbilities = function($stateParams, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        template: '<td></td>',
        link: function(scope, element, attrs) {
            var loop = window.details[$stateParams.id].abl;

            //regular abilities
            for(var y = 0; y < loop.length; y++){
              var abl = loop[y];
              var desc= window.abilities[0][abl];
              var value= window.details[$stateParams.id]['ablD'][y];
              var fullAbility = desc.toString().replace('[x]', value);
              var decorated = fullAbility.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');

                //pvp abilities
                if (typeof window.details[$stateParams.id].PVPabl != 'undefined') {
                  var PVPloop = window.details[$stateParams.id].PVPabl;
                  var PVPabl = PVPloop[y];

                  if (PVPabl != '') {
                    var PVPdesc= window.abilities[0][PVPabl];
                    var PVPvalue= window.details[$stateParams.id]['PVPablD'][y];
                    var PVPfullAbility = PVPdesc.toString().replace('[x]', PVPvalue);
                    var PVPdecorated = PVPfullAbility.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');
                    element.append($('<tr><td><img src="../img/ability/'+ abl + '.png"> ' + PVPdecorated + '</td></tr>'));
                  }
                  //fallback to regular ablity if blank
                  else
                    element.append($('<tr><td><img src="../img/ability/'+ abl + '.png"> ' + decorated + '</td></tr>'));
                }
                //fallback to regular ablity if blank
                else
                  element.append($('<tr><td><img src="../img/ability/'+ abl + '.png"> ' + decorated + '</td></tr>'));
                }
        }
    }
};

directives.addSync = function($stateParams, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        template: '<td></td>',
        link: function(scope, element, attrs) {
          var loop = window.details[$stateParams.id].sync;
          var syncDesc = window.details[$stateParams.id].syncD;
          for(var y = 0; y < loop.length; y++){
            var sync = loop[y];
            var syncWith = window.sync[0][sync];
            var desc= syncDesc[y];
            var descFull = window.sync[0][desc];
            var value= window.details[$stateParams.id]['syncV'][y];
            var fullSync = descFull.toString().replace('[x]', value);
            var decoratedName = syncWith.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');
            var decorated = fullSync.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');

              if(desc){
                  element.append($('<b>'+ (y+1) + '. Sync with ' + decoratedName + '</b>'));
                  element.append($('<td>' + decorated + '</td>'));
                }
              }
          }
    }
};

directives.addPvpSync = function($stateParams, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        template: '<td></td>',
        link: function(scope, element, attrs) {
          var loop = window.details[$stateParams.id].sync;
          var syncDesc = window.details[$stateParams.id].syncD;

            //regular sync
            for(var y = 0; y < loop.length; y++){
              var sync = loop[y];
              var syncWith = window.sync[0][sync];
              var desc= syncDesc[y];
              var descFull = window.sync[0][desc];
              var value= window.details[$stateParams.id]['syncV'][y];
              var fullSync = descFull.toString().replace('[x]', value);
              var decoratedName = syncWith.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');
              var decorated = fullSync.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');

                //pvp sync
                if (typeof window.details[$stateParams.id].PVPsyncD != 'undefined') {
                  var PVPloop = window.details[$stateParams.id].PVPsyncD;
                  var PVPsync = PVPloop[y];

                  if (PVPsync != '') {
                    var PVPdesc= window.sync[0][PVPsync];
                    var PVPvalue= window.details[$stateParams.id]['PVPsyncV'][y];
                    var PVPfullSync = PVPdesc.toString().replace('[x]', PVPvalue);
                    var PVPdecorated = PVPfullSync.replace(/\[?(HRT|BOD|SKL|BRV|WIS)\]?/g,'<span class="badge $1">$1</span>');
                    element.append($('<b>'+ (y+1) + '. Sync with ' + decoratedName + '</b>'));
                    element.append($('<td>' + PVPdecorated + '</td>'));
                  }
                  //fallback to regular sync if blank
                  else {
                    element.append($('<b>'+ (y+1) + '. Sync with ' + decoratedName + '</b>'));
                    element.append($('<td>' + decorated + '</td>'));
                  }
                }
                //fallback to regular sync if blank
                else {
                  element.append($('<b>'+ (y+1) + '. Sync with ' + decoratedName + '</b>'));
                  element.append($('<td>' + decorated + '</td>'));
                }
            }
        }
    }
};

directives.addTags = function($stateParams, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="tag-container"></div>',
        link: function(scope, element, attrs) {
            var id = $stateParams.id, data = details[id];
            // flags
            var flags = window.flags[id] || { };
            element.append($('<span class="tag flag">' + (flags.global ? 'Global unit' : 'Japan unit') + '</div>'));
            if (flags.rr) element.append($('<span class="tag flag">Rare Recruit only</div>'));
            if (flags.lrr) element.append($('<span class="tag flag">Limited Rare Recruit only</div>'));
            if (flags.promo) element.append($('<span class="tag flag">Promo-code only</div>'));
            if (flags.shop) element.append($('<span class="tag flag">Rayleigh Shop Unit</div>'));
            if (flags.special) element.append($('<span class="tag flag">One time only characters</div>'));
            // matchers
            if (!data) return;
            matchers.forEach(function(matcher) {
                var name;
                // sailor effects
                if (matcher.target.indexOf('sailor') === 0 && !(data[matcher.target] === undefined)) {
                    if (data[matcher.target].base){
                        for (var sailor in data[matcher.target]){
                            if (matcher.matcher.test(data[matcher.target][sailor])){
                                name = matcher.name;
                                if (!/sailor$/.test(name)) name = name.replace(/ers$/,'ing').replace(/s$/,'') + ' sailor';
                                else name = name.replace(/s$/,'');
                                name = name.replace(/iing/,'ying');
                                element.append($('<span class="tag sailor">' + name + '</div>'));
                            }
                        }
                    }
                    else{
                        if (matcher.matcher.test(data[matcher.target])){
                            name = matcher.name;
                            if (!/sailor$/.test(name)) name = name.replace(/ers$/,'ing').replace(/s$/,'') + ' sailor';
                            else name = name.replace(/s$/,'');
                            name = name.replace(/iing/,'ying');
                            element.append($('<span class="tag sailor">' + name + '</div>'));
                        }
                    }
                }
                // specials
                if (matcher.target.indexOf('special') === 0 && matcher.matcher.test(data[matcher.target])) {
                    name = matcher.name;
                    if (!/specials$/.test(name)) name = name.replace(/ers$/,'ing').replace(/s$/,'') + ' special';
                    else name = name.replace(/s$/,'');
                    name = name.replace(/iing/,'ying');
                    element.append($('<span class="tag special">' + name + '</div>'));
                }
                // limit
                if (matcher.target.indexOf('limit') === 0 && matcher.matcher.test(data[matcher.target])) {
                    name = matcher.name;
                    if (!/limit$/.test(name)) name = name.replace(/ers$/,'ing').replace(/s$/,'') + ' limit';
                    else name = name.replace(/s$/,'');
                    name = name.replace(/iing/,'ying');
                    if (name != "Has Limit Break limit"){
                        element.append($('<span class="tag limit">' + name + '</div>'));
                    }
                }
            });
        }
    };
};

directives.costSlider = function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.ionRangeSlider({
                grid: true,
                type: 'double',
                min: scope.filters.cost[0],
                max: scope.filters.cost[1],
                from: scope.filters.cost[0],
                to: scope.filters.cost[1],
                postfix: ' cost',
                onFinish: function(data) {
                    scope.filters.cost[0] = data.from;
                    scope.filters.cost[1] = data.to;
                    if (!scope.$$phase) scope.$apply();
                }
            });
        }
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
