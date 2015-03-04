'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('rotowikiApp'));
  beforeEach(module('socketMock'));

  var DocumentCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, socket) {
    scope = $rootScope.$new();
    DocumentCtrl = $controller('MainCtrl', {
      $scope: scope,
      socket: socket
    });
  }));

  it('should be init', function () {
    expect(1).toEqual(1);
  });
});
