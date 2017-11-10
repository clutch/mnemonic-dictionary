'use strict';

angular.module('mnemonicDictionaryApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  })
  .controller('MainCtrl', function($scope, $state, $q, Dictionary, $http) {

    $scope.loading = true;

    $scope.selectedIndex = 0;

    var load = function() {
      $scope.loading = true;

      $scope.dictionaries = Dictionary.query(function() {
        $scope.reviews = _.filter($scope.dictionaries, 'review').length;

        var items = [];

        _.each($scope.dictionaries, function(dictionary) {

          _.each(dictionary.items, function(item) {
            item.score = ((item.correct) / (item.correct + item.incorrect)).toFixed(2, 0);
            items.push(item);
          });

          dictionary.avgcorrect = Math.floor(ss.mean(_.map(dictionary.items, function(i){return i.correct;}))),
          dictionary.avgincorrect = Math.ceil(ss.mean(_.map(dictionary.items, function(i){return i.incorrect;})));

          var created = moment(dictionary.created),
              reviewed = moment(dictionary.reviewed),
              now = moment();
          var mcreated = moment.duration(created.diff(now)),
              mreviewed = moment.duration(reviewed.diff(now));
          dictionary.mcreated = mcreated.humanize(true);
          dictionary.mreviewed = _.isUndefined(dictionary.reviewed) ? 'never' : mreviewed.humanize(true);
        });

        $scope.items = _.sortBy(items, 'score');

        $scope.least = _.sortBy(items, 'correct').slice(0, 100);

        var tcorrect = ss.sum(_.map($scope.items, function(i){return i.correct;})),
            tincorrect = ss.sum(_.map($scope.items, function(i){return i.incorrect;}));
        $scope.totalScore = ((tcorrect) / (tcorrect + tincorrect)).toFixed(2, 0);

        $scope.dictionaries = _.sortBy($scope.dictionaries, function(dictionary) {
          return dictionary.avgcorrect;
        });

        $scope.worst = $scope.items.slice(0, 100);

        $('.tabpanel-container').height($scope.items.length * 152);

        $scope.loading = false;
      });
    };

    $scope.next = function() {
      $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 2);
    };

    $scope.previous = function() {
      $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
    };

    $scope.review = function(dictionary) {
      $state.go('review', {
        id: dictionary._id
      });
    };

    $scope.view = function(dictionary) {
      $state.go('view', {
        id: dictionary._id
      });
    };

    $scope.add = function() {
      $state.go('add');
    };

    $scope.shuffle = function() {
      $scope.shuffling = true;

      $http.get('/api/dictionary/shuffle').
      then(function(response) {
        $scope.shuffling = false;
        load();
      }, function(response) {});
    };

    $scope.prune = function() {
      $scope.pruning = true;

      $http.get('/api/dictionary/prune').
      then(function(response) {
        $scope.pruning = false;
        load();
      }, function(response) {});
    };

    $scope.curate = function() {
      $scope.curating = true;

      var items = [],
          dictionaries = [];

      _.each($scope.dictionaries, function(dictionary) {
        var created = moment(dictionary.created);
        var now = moment();
        var duration = moment.duration(created.diff(now));
        var days = Math.floor(duration.asDays());

        if (days < -3) {
          dictionaries.push(dictionary);
          _.each(dictionary.items, function(item) {
            items.push(item);
          });
        }
      });
      $scope.curateCount = dictionaries.length;

      items = _.sortBy(items, function(item) {
        return -1 * (item.correct / (item.correct + item.incorrect));
      });

      items = _.uniq(items, false, function(item) {
        return item.word;
      });

      var chunks = _.chunk(items, 5);
      for (var i = 0; i < chunks.length; i++) {
        dictionaries[i].items = chunks[i];
      }

      _.each(dictionaries, function(dictionary) {
        var total = 0,
            correct = 0;
        _.each(dictionary.items, function(item) {
          if (item.ok) {
            item.correct += 1;
          } else {
            item.incorrect += 1;
          }
          correct += item.correct;
          total += (item.correct + item.incorrect);
        });
        dictionary.reviewed = Date.now();
        dictionary.review = false;
        dictionary.score = (correct / total).toFixed(2, 0);
      });

      var updateDictionaries = function() {
        if (dictionaries.length === 0) {
          $scope.curating = false;

        } else {
          var dictionary = dictionaries.pop();
          dictionary.$update(function() {
            updateDictionaries();
          });
        }
      };

      updateDictionaries();
    };

    load();
  });