'use strict';

angular.module('mnemonicDictionaryApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('view', {
                url: '/view/:id',
                templateUrl: 'app/view/view.html',
                controller: 'ViewCtrl'
            });
    })
    .controller('ViewCtrl', function($scope, $state, $stateParams, $modal, $mdDialog, Dictionary) {

        $scope.loading = true;

        $scope.dictionary = Dictionary.get({
            id: $stateParams.id
        }, function(){
            $scope.loading = false;
        });

        $scope.remove = function(target){
          $scope.edited = true;
          $scope.dictionary.items = _.filter($scope.dictionary.items, function(item){
            return item.word !== target.word;
          })
        };

        $scope.save = function() {
          $scope.updating = true;
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
            $scope.edited = false;
          }, function(resp) {
            $mdDialog.show(
              $mdDialog.alert()
                .title('Error')
                .content(resp)
                .ok('Ok')
            );
            $scope.updating = false;
            $scope.edited = false;
          }, function() {
            $scope.updating = false;
          });
        };

      $scope.delete = function() {

        $scope.dictionary.$delete(function() {
          $state.go('main');
        }, function(resp) {
          $mdDialog.show(
            $mdDialog.alert()
              .title('Error')
              .content(resp)
              .ok('Ok')
          );
          $scope.updating = false;
        }, function() {
          $scope.updating = false;
        });

      };

      $scope.back = function(){
        $state.go('main');
      };

    });