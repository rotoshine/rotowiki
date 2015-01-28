'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('rotowikiApp'));

  var DocumentCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DocumentCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
