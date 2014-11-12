require('datejs');

var namespaceConf = require('nconf');
var namespaceFs    = require('fs');
var global_options = require('./options.js').readCmdOptions();
var cloudwatch = require('aws2js').load('cloudwatch', global_options.credentials.accessKeyId, global_options.credentials.secretAccessKey);
cloudwatch.setRegion(global_options.region_name);

// load Namespace configuration
namespaceConf.file('./config/namespace.json');
namespace = namespaceConf.get('Namespace');

for(element in namespace){
  // console.log(namespace[element]);

  namespaceFs.writeFile('./config/'+namespace[element]+'.json', '', function(err) {
  // create configuration by Namespace
    if(err) {
      console.log(err);
    } 
    else {
      console.log('./config/'+namespace[element]+'.json has been created.');
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
      console.error('ERROR ! response.ListMetricsResult  is undefined for Namespace ' +  namespace[element]);
      return;
    }

    //metrics = response.ListMetricsResult.Metrics.member;

    //metricConf = require('nconf');
    //metricfs   = require('fs');

    //for(index in metrics){
    //  console.log("ttaf");
    //}
  
  });
}


/*


for(index in metrics) {
        getOneStat(metrics[index], global_options.region_name);
        //console.log("Session: %j \n", metrics[index]);
        //}

console.log('foo: ' + nconf.get('Customer:dbConfig:host'));


nconf.set('database:host', '127.0.0.1');
nconf.set('database:port', 5984);

nconf.save(function (err) {
    fs.readFile('./config/test.json', function (err, data) {
          console.dir(JSON.parse(data.toString()))
              });
              });
*/
