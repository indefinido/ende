var observable, root;

observable = require('observable').mixin;

root = typeof exports !== "undefined" && exports !== null ? exports : window;

describe('observable #()', function() {
  var object;

  if (!root.should) {
    return;
  }
  object = null;
  beforeEach(function() {
    return object = {
      property: 'value'
    };
  });
  it('should not have observed property', function() {
    return object.should.not.have.property('observed');
  });
  xit('should let element unsubscribe to property', function() {});
  describe('#subscribe', function() {
    var called;

    called = null;
    beforeEach(function() {
      object = observable({});
      called = false;
      return true;
    });
    it('should subscribe to property', function() {
      var spy;

      spy = sinon.spy();
      object.subscribe('other', spy);
      object.other = 'mafagafo';
      return spy.called.should.be["true"];
    });
    it('should let multiple function subscriptions to property', function() {
      var also_called;

      also_called = false;
      object.subscribe('other', function() {
        return called = true;
      });
      object.subscribe('other', function() {
        return also_called = true;
      });
      object.other = 'mafagafo';
      called.should.be["true"];
      return also_called.should.be["true"];
    });
    describe('subscribes to properties of type array', function() {
      it('should observe objects added to array', function() {
        var friend, spy;

        spy = sinon.spy();
        friend = {
          domo: 1
        };
        object.friends = [];
        object.subscribe('friends', function() {});
        object.friends = [friend];
        object.friends[0].should.be.eq(friend);
        friend.should.have.property('observed');
        friend.subscribe('domo', spy);
        friend.domo = 2;
        return spy.callCount.should.be.eq(1);
      });
      xit('should override native methods');
      return it('should preserve array bindings when setting new array', function() {
        var spy;

        spy = sinon.spy();
        object.friends = [];
        object.subscribe('friends', spy);
        object.friends.push(1);
        object.friends = [];
        object.friends.push(2);
        object.friends.length.should.be.eq(1);
        return spy.callCount.should.be.eq(3);
      });
    });
    return it('should create a observed property', function() {
      return object.should.have.property('observed');
    });
  });
  return xdescribe('#publish', function() {
    return xit('should let element publish to property', function() {});
  });
});
