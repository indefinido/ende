
# observable

  Observable, observer capabilities built upon the observable shim

## Summary

 - We need a pretty sintax to listen to single properties
 - Requirements
   - ES5 Getters and Setters (Shim ships with component, IE 10+)
   - ES7 Observer            (Shim ships with component, IE ?+)

## Installation

    $ component install indefinido/observable

## API

### Functionality (Single Property, All Properties)

Just implements a nicer interface:

```javascript

  require('observable');

  arthur = observable.call({
    name     : function () { return this.firstname + " " + this.surname; },
    firstname: "Arthur Philip",
    surname  : "Dent",
    species  : "Humam"
  });

  // Subscribe to all changes
  arthur.subscribe(function (updates) {
    var i = updates.length,  update;
    while (i--) {
       update = updates[i];
      console.log(update.name, update.type, update.oldValue, '→', update.object[update.name]); // also this[update.name]
    }
  });

  // Subscribe to single property change
  arthur.subscribe('firstname', function ( update) {
    console.log( update.name,  update.type,  update.oldValue, '→',  update.object[ update.name]); // also this[ update.name]
  });

```

! Warning all properties and configuration is stored in a per object
  basis on the observed property:

```javascript
  require('observable');

  arthur = observable.call({
    name     : function () { return this.firstname + " " + this.surname; },
    firstname: "Arthur Philip",
    surname  : "Dent",
    species  : "Humam"
  });

  // Don't mess with this properties
  // they change between browsers!
  arthur.observed.name; // "Arthur Philip"

  // Also in some browsers it is not possible to create unreadable
  // properties, the it will apear on for in loops!
  for (attribute in arthur) {
    if (attribute == "observed") alert("Im not hidden!");
  }

```

### Adapters

#### Rivets

```javascript
  require('observable/adapters/rivets');

  arthur = observable.call({
    name     : function () { return this.firstname + " " + this.surname; },
    firstname: "Arthur Philip",
    surname  : "Dent",
    species  : "Humam"
  }),

  template = '<div class="person">' +
			 '  <span data-html="person.name"></span>    ' +
			 '  <span data-html="person.species"></span> ' +
			 '</div>';

  document.body.innerHTML = template;
  element = document.body.children[0];

  rivets.bind(element, {person: arthur});

  arthur.species = "Homo Sapiens";

```

## TODO

## TESTS!

A tiny part of tests has been written, but more on the go!

## License

  WTFPL

## Credits

  Built upon the lovely coffeescript language
  Uses heavily https://github.com/KapIT/observe-shim and https://github.com/KapIT/observe-utils
