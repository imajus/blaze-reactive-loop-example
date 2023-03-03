import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.parent.onCreated(function() {
  this.list = new ReactiveVar([]);
});

Template.parent.helpers({
  list() {
    return Template.instance().list.get();
  },
});

Template.parent.events({
  'customEvent'(e, tmpl) {
    tmpl.list.set([]);
  },
});

Template.child.onRendered(function() {
  let count = 0;
  this.autorun((comp) => {
    this.$(this.firstNode).trigger('customEvent');
    if (count++ > 1000) {
      alert('We are in a loop!');
      comp.stop();
    }
  });
});