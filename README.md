# Purpose

This sample Meteor project was created to demonstrate the issue of hidden reactive dependencies that are attached to a reactive computation by the Blaze Template event listeners.

# Explanation

The reactive computation defined in `{{child}}` Blaze template controller does not explicitly define any reactive dependencies, nor does it call any functions which would establish any reactive dependencies. Therefore, it is not expected to be executed more than once:

```js
this.autorun(() => {
  this.$(this.firstNode).trigger('customEvent');    
});
```

But in reality, some reactive dependencies are established behind the scenes and this causes two reactive computations to become stuck in an mutual invalidation loop, which continues indefinitely.

The stack trace analysis revealed a problem in the implementation of the `Template.prototype.events` function:

1. In `template.js@533` the implicit dependency is established with event emitting Template instance's data (see [here](https://github.com/meteor/blaze/blob/master/packages/blaze/template.js#L533)):
    ```js
    var data = Blaze.getData(event.currentTarget);
    ```
2. In `template.js@173` another implicit dependency is established with listening Template instance's data (see [here](https://github.com/meteor/blaze/blob/master/packages/blaze/template.js#L173)):
    ```js
    inst.data = Blaze.getData(view);
    ```

Since the event handlers are executed synchronously with events emitting, this logic is executed in the same reactive context as the reactive computation where the event was triggered. As a result, it establishes additional and unnecessary reactive dependencies.

# Why this is a problem

As the reactive computation does not define any explicit reactive dependencies, nor does it call functions that are expected to establish such dependencies, the invalidation of the computation would be unexpected for the developer.
