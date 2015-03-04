'use strict';

describe('Service: document', function () {

  // load the service's module
  beforeEach(module('rotowikiApp'));

  // instantiate service
  var Document;
  beforeEach(inject(function (_Document_) {
    Document = _Document_;
  }));

  it('should do Document module init', function () {
    expect(!!Document).toBe(true);
  });

});
