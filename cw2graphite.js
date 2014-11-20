// load metric and credentials configuration
var conf = require('nconf');

conf.use('file', { file: './config/credentials.json' });
credentials = conf.stores.file.store;

conf.file('./config/metric.json');
metricConf = conf.stores.file.store;

// set cloudwatch connection 
var cloudwatch = require('aws2js').load('cloudwatch', credentials.accessKeyId, credentials.secretAccessKey);
cloudwatch.setRegion(metricConf.region);

require('./lib/metric.js').getMetrics(cloudwatch, metricConf);

