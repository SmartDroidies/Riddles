'use strict';

// Register `header` component, along with its associated controller and template
angular.
  module('header').
  component('header', {
    templateUrl: 'header/header.template.html',
    controller: ['$log', '$rootScope',
      function HeaderController($log, $rootScope) {
        var self = this;
		
		//GoTo Home
		self.home = function() {
			$rootScope.home();
        }
      }
    ]
  });