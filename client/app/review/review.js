'use strict';

angular.module('mnemonicDictionaryApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('review', {
                url: '/review/:id',
                templateUrl: 'app/review/review.html',
                controller: 'ReviewCtrl'
            });
    })
    .controller('ReviewCtrl', function($scope, $state, $stateParams, $modal, $mdDialog, Dictionary) {
        $scope.reviewing = true;
        $scope.saving = false;
        $scope.loading = true;

        $scope.doneLabel = "ALL GOOD";

        $scope.dictionary = Dictionary.get({
            id: $stateParams.id
        }, function(dictionary) {
            dictionary.items = _.shuffle(dictionary.items);
            $scope.loading = false;
        });

        $scope.checked = function($event){
            var ok = 0;
            _.each($scope.dictionary.items, function(item) {
                if (item.ok) {
                    ok += 1;
                }
            });
            if(ok === 0){
                $scope.doneLabel = "ALL GOOD";
            }else{
                $scope.doneLabel = ok+" of "+$scope.dictionary.items.length;
            }            
        };

        $scope.back = function() {
            $state.go('main');
        };

        $scope.grade = function() {
            $scope.reviewing = false;
        };

        $scope.done = function() {
            $scope.saving = true;

            var ok = 0;
            _.each($scope.dictionary.items, function(item) {
                if (item.ok) {
                    ok += 1;
                }
            });

            if (ok === 0) {
                _.each($scope.dictionary.items, function(item) {
                    item.ok = true;
                });
            }

            $scope.save();
        };

        $scope.save = function() {
            var total = 0,
                correct = 0;
            _.each($scope.dictionary.items, function(item) {
                if (item.ok) {
                    item.correct += 1;
                } else {
                    item.incorrect += 1;
                }
                correct += item.correct;
                total += (item.correct + item.incorrect);
            });

            $scope.dictionary.reviewed = Date.now();
            $scope.dictionary.review = false;
            $scope.dictionary.score = (correct / total).toFixed(2, 0);

            $scope.dictionary.$update(function() {
                $state.go('main');
            }, function(resp) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .title('Error')
                    .content(resp)
                    .ok('Ok')
                );
                $scope.saving = false;
            }, function() {
                $scope.saving = false;
            });
        };

        $scope.info = function(item) {
            $mdDialog.show({
                templateUrl: 'info-template.html',
                controller: 'InfoCtrl',
                resolve: {
                    item: function() {
                        return item;
                    }
                }
            });
        };

    });

angular.module('mnemonicDictionaryApp').controller('InfoCtrl', function($scope, $mdDialog, item) {

    $scope.item = item;

    $scope.ok = function() {
        $mdDialog.cancel();
    };
});