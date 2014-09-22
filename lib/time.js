'use strict';

var hour = (60 * 60 * 1000);
var day = (60 * 60 * 24 * 1000);
var week = (day * 7);
var month = (week * 4);
var year = (month * 12);

module.exports = {
  hours: function(hours) {
    return (new Date().getTime() + (hours * hour));
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
  ,hoursAgo: function(hours) {
    return (new Date().getTime() - (hours * hour));
  }
  ,daysAgo: function(days) {
    return (new Date().getTime() - (day * days));
  }
  ,weeksAgo: function(weeks) {
    return (new Date().getTime() - (week * weeks));
  }
};