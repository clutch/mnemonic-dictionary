'use strict';

angular.module('mnemonicDictionaryApp')
  .factory('Dictionary', function ($resource) {
    return $resource('/api/dictionary/:id', {id: '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  });
