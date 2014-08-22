'use strict';

var day = (60 * 60 * 24 * 1000);
var week = (day * 7);
var month = (week * 4);
var year = (month * 12);

module.exports = {
  hour: function() {
    return (new Date().getTime() + (60 * 60));
  }
  ,day: function() {
    return (new Date().getTime() + day);
  }
  ,week: function() {
    return (new Date().getTime() + week);
  }
  ,weeks: function(weeks) {
    return (new Date().getTime() + (week * weeks));
  }
  ,month: function() {
    return (new Date().getTime() + month);
  }
  ,year: function() {
    return (new Date().getTime() + year);
  }
  ,daysAgo: function(days) {
    return (new Date().getTime() - (day * days));
  }
  ,weeksAgo: function(weeks) {
    return (new Date().getTime() - (week * weeks));
  }
};