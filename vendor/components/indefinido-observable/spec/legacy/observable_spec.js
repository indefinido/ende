var $, observable, root;

observable = require('observable').mixin;

root = typeof exports !== "undefined" && exports !== null ? exports : window;

$ = require('jquery');

describe('observable #()', function() {
  var object;

  object = null;
  beforeEach(function() {
    return object = {
      property: 'value'
    };
  });
  it('should not have observed property', function() {
    return expect(object.observed).toBeUndefined();
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
      return expect(spy.called).toBe(true);
    });
    it('should let multiple function subscriptions to property', function() {
      var also_also_called, also_called;

      also_called = false;
      also_also_called = false;
      object.subscribe('other', function() {
        return called = true;
      });
      object.subscribe('other', function() {
        return also_called = true;
      });
      object.subscribe('other', function() {
        return also_also_called = true;
      });
      object.other = 'mafagafo';
      expect(called).toBe(true);
      return expect(also_called).toBe(true);
    });
    it('should handle truth comparisons well', function() {
      var block_called, spy;

      spy = sinon.spy;
      block_called = false;
      object.invert = true;
      object.truthy = true;
      object.falsey = false;
      object.subscribe('truthy', spy);
      object.subscribe('falsey', spy);
      object.subscribe('invert', spy);
      block_called = false;
      if (object.truthy) {
        block_called = true;
      }
      expect(block_called).toBe(true);
      block_called = false;
      if (!object.falsey) {
        block_called = true;
      }
      expect(block_called).toBe(true);
      block_called = false;
      if (object.invert) {
        block_called = true;
      }
      object.invert = false;
      block_called = false;
      if (object.invert === false) {
        block_called = true;
      }
      return expect(block_called).toBe(true);
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
        friend = object.friends[0];
        expect(friend.domo).toBeDefined();
        expect(friend.observed).toBeDefined();
        friend.subscribe('domo', spy);
        friend.domo = 2;
        return expect(spy.callCount).toBe(1);
      });
      it('should override native methods');
      return it('should preserve array bindings when setting new array', function() {
        var spy;

        spy = sinon.spy();
        object.friends = [];
        object.subscribe('friends', spy);
        object.friends.push(1);
        object.friends = [];
        object.friends.push(2);
        expect(object.friends.length).toBe(1);
        return expect(spy.callCount).toBe(3);
      });
    });
    return it('should create a observed property', function() {});
  });
  return xdescribe('#publish', function() {
    return xit('should let element publish to property', function() {});
  });
});
