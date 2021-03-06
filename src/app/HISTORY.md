App Framework Change History
============================

3.5.0
-----

### Controller

* [!] The signature for route handlers has changed. Route handlers now receive
  three arguments: `req`, `res`, and `next`. To preserve backcompat, `res` is a
  function that, when executed, calls `next()`. This behavior is deprecated and
  will be removed in a future version of YUI, so please update your route
  handlers to expect `next` as the third param.

* "*" can now be used to create a catch-all route that will match any path
  (previously it was necessary to use a regex to do this).

* The `hasRoute()` method now accepts full URLs as well as paths.

* When multiple Controller instances exist on a page, calling `save()` in one
  will now cause matching routes to be dispatched in all controllers, rather
  than only the controller that was the source of the change.

* Added `url` and `src` properties to the request object that's passed to route
  handlers.

* Added an `html5` config option to the constructor. This allows you to force a
  controller to use (`true`) or not use (`false`) HTML5 history. Please don't
  set it to `false` unless you understand the consequences.

### ModelList

* Added a `filter()` method that returns a filtered array of models. [Ticket
  #2531250]


3.4.1
-----

### Controller

* Added a workaround for an iOS 4 bug that causes the previous URL to be
  displayed in the location bar after calling `save()` or `replace()` with a
  new URL.

* Fixed a bug that caused the controller to get stuck in a "dispatching" state
  if `save()` was called with no routes defined.

### Model

* The `validate()` method is now only called when `save()` is called, rather
  than on every attribute change. If validation fails, the save operation will
  be aborted.


3.4.0
-----

* Initial release.
