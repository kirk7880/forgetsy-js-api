forgetsy-js-api
===============

The beginning of a trending API using [forgetsy-js](https://github.com/kirk7880/forgetsy-js) library. This is not production ready and a first iteration at creating an API to track trends in a non-stationary, categorial distribtion. Please fork and help make this a super production quality application. 

The basic idea is the notion of a category and at type. Let's say, for example, you have two productions: video and articles. 
You may have videos and articles which is in the category "food." To trend both the articles and the videos separately, we would make a request to the API recording the impression as follows:

Video:
- /incr/?category=food&type=video&bin=video_id

Article:
- /incr/?category=food&type=article&bin=article_id


