'use strict';

angular.module('mnemonicDictionaryApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('add', {
                url: '/add',
                templateUrl: 'app/add/add.html',
                controller: 'AddCtrl'
            });
    })
    .controller('AddCtrl', function($scope, $state, $mdDialog, Dictionary) {

        $scope.dictionary = {
            items: [{}, {}, {}, {}, {}]
        };

        $scope.done = function() {
            for(var i = 0, l = $scope.dictionary.items.length; i < l; i++){
                var k = _.keys($scope.dictionary.items[i]).length;
                if(k < 5){
                    $mdDialog.show(
                        $mdDialog.alert()
                        .title('Error')
                        .content('All fields are required.')
                        .ok('Ok')
                    );
                    return;
                }
            }

            var dictionary = new Dictionary();
            dictionary.items = $scope.dictionary.items;
            dictionary.$save(function(){
                $state.go('main');
            }, function(resp){
                $mdDialog.show(
                    $mdDialog.alert()
                    .title('Error')
                    .content(resp)
                    .ok('Ok')
                );
            });
        };

        $scope.cancel = function() {
            $state.go('main');
        };
    });