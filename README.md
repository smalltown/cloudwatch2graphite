AWS Cloudwatch2Graphite
==================

This application will output graphite counters for a list of AWS CloudWatch metrics. All you need to do is :

* Fill in AWS accessid and secretkey into the configuration config/credentials.json.
* Modify the Namespace which you want to backup and other paramter related to CloudWatch in the configuration config/metric.json

You'll find here the [reference](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html "Amazon AWS Cloudwatch reference to NameSpaces, metrics, units and dimensions") to NameSpaces, metrics, units and dimensions you'll want to refer to to set up your `metrics.json` (`metrics.json.sample` is a good starting point). Thus far this has been tested with EC2, ELB & DynamoDB.

Usage
-------------------

typically, to test you should simply run:

	node cw2graphite.js


Pre-requisites
--------------
You'll need to install a few modules, including:
* dateformat
* datejs
* aws2js
* nconf


	simply running this should do the job :
	> npm install


Example output
--------------

	aws.dynamodb.rad_impressions.throttledrequests.updateitem.sum.count 28.0 1359407920
	aws.elb.radimp.requestcount.sum.count 933.0 1359407920
	aws.dynamodb.rad_impressions.consumedwritecapacityunits.sum.count 890.0 1359407920

Sending to Graphite
-------------------

typically, in a cron, you'd run:

	node cw2graphite.js | nc host 2003
