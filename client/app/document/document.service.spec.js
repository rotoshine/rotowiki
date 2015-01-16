'use strict';

describe('Service: document', function () {

  // load the service's module
  beforeEach(module('rotowikiApp'));

  // instantiate service
  var document;
  beforeEach(inject(function (_document_) {
    document = _document_;
  }));

  it('should do something', function () {
    expect(!!document).toBe(true);
  });

});
