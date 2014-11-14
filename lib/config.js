require('datejs');

var namespaceConf = require('nconf');
var namespaceFs    = require('fs');
var namespaceFs2    = require('fs');
var global_options = require('./options.js').readCmdOptions();
var cloudwatch = require('aws2js').load('cloudwatch', global_options.credentials.accessKeyId, global_options.credentials.secretAccessKey);
cloudwatch.setRegion(global_options.region_name);

// load Namespace configuration
namespaceConf.file('./config/namespace.json');
var namespace = namespaceConf.get('Namespace');

for(element in namespace){

  //console.log(namespace[element]);
 
  namespaceFs.writeFile('./config/Namespace_'+namespace[element]+'.json', '{}', function(err) {
  // create configuration by Namespace
    if(err) {
      console.log(err);
    } 
    else {
      //console.log('configuration has been saved in ./config/ folder');
    }
  });

  
  var options = {
    Namespace: namespace[element],
  }
  

  cloudwatch.request('ListMetrics', options, function(error, response){
  // List metrics
    if(error) {
      console.error('ERROR ! ',error);
      return;
    }
 
    if (! response.ListMetricsResult){
      console.error('ERROR ! response.ListMetricsResult is undefined for Namespace ' +  namespace[element]);
      return;
    }

    currentNamesapce = response.ListMetricsResult.Metrics.member[0].Namespace;

    // Choose configuration file
    namespaceConf.use('file', { file: './config/Namespace_'+currentNamesapce+'.json' });    
  
    // Set metric to memory
    namespaceConf.set('Metrics', response.ListMetricsResult.Metrics.member);

    namespaceConf.save(function (err){
    // Store metric to configuraiton file
      namespaceFs2.readFile('./config/Namespace_'+currentNamesapce+'.json', function (err, data) {
        //console.dir(JSON.parse(data.toString()))
      });
    });
  });
}

