
exports.getMetrics = function(cloudwatch, metricConf){

  namespace = metricConf.Namespace;

  for(element in namespace){

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

      currentMetrics = response.ListMetricsResult.Metrics.member

      getStat(cloudwatch, currentMetrics, metricConf);

    });
  }
};

function getStat(cloudwatch, metrics, metricConf) {

  require('datejs');
  var dateFormat = require('dateformat');

  var interval = metricConf.interval;
  var now = new Date();
  var then = (interval).minutes().ago();

  for(element in metrics) {

    if ( metrics[element].Namespace.match(/Billing/) ) {
      then.setHours(then.getHours() - 30)
    }

    var end_time = dateFormat(now, "isoUtcDateTime");
    var start_time = dateFormat(then, "isoUtcDateTime");

    var options = {
      Namespace: metrics[element].Namespace,
      MetricName: metrics[element].MetricName,
      Period: metricConf.PeriodOthers,
      StartTime: start_time,
      EndTime: end_time,
      "Statistics.member.1": metricConf.Statistics
    }

    if ( metrics[element].Namespace.match(/Billing/) ) {
      options["Period"] = metricConf.PeriodBilling;
    }

    metrics[element].graphite = 'cloudwatch.';
    //metric.name = metric.name.replace("{regionName}",regionName);

    metrics[element].graphite += metrics[element].Namespace.replace("/", ".");

    if (metrics[element].Dimensions.member) {

      var counter = 1;

      if(!metrics[element].Dimensions.member[0]) {
      // only one dimension
        options["Dimensions.member."+counter+".Name"] = metrics[element].Dimensions.member.Name;
        options["Dimensions.member."+counter+".Value"] = metrics[element].Dimensions.member.Value;
        metrics[element].graphite += "." + metrics[element].Dimensions.member.Value.replace(/\./g,'_');
      }

      else {
      // multiple dimensions
        for (index in metrics[element].Dimensions.member) {
          options["Dimensions.member."+counter+".Name"] = metrics[element].Dimensions.member[index].Name;
          options["Dimensions.member."+counter+".Value"] = metrics[element].Dimensions.member[index].Value;
          metrics[element].graphite += "." + metrics[element].Dimensions.member[index].Value.replace(/\./g,'_');
          counter++;
        }
      }
    }

    metrics[element].graphite += "." + metrics[element].MetricName.replace(/\./g,'_');
    metrics[element].graphite += "." +  metricConf.Statistics;

    //metrics[element].graphite = metrics[element].graphite.toLowerCase();

    cloudwatch.request('GetMetricStatistics', options, function(error, response) {

      if(error) {
        console.error("ERROR ! ",error);
        return;
      }
      if (! response.GetMetricStatisticsResult) {
        console.error("ERROR ! response.GetMetricStatisticsResult is undefined for metric " + this.graphite);
        return;
      }
      if (!response.GetMetricStatisticsResult.Datapoints) {
        //console.error("ERROR ! response.GetMetricStatisticsResult.Datapoints is undefined for metric " + this.graphite);
        return;
      }

      var memberObject = response.GetMetricStatisticsResult.Datapoints.member;
      if (memberObject == undefined) {
        console.error("WARNING ! no data point available for metric " + this.graphite);
        return;
      }

      var dataPoints;
      if(memberObject.length === undefined) {
        dataPoints = [memberObject];
      }
 
      else {
        dataPoints = memberObject.sort(function(m1,m2) {
          var d1 = new Date(m1.Timestamp), d2 = new Date(m2.Timestamp);
          return d1 - d2;
        });
      }

      if (dataPoints.length >  metricConf.numberOfOverlappingPoints) {
        dataPoints = dataPoints.slice(0, dataPoints.length);
      }

      for (var point in dataPoints) {

        if (point == 0) {this.graphite += "." + dataPoints[point].Unit;}

        console.log("%s %s %s", this.graphite, dataPoints[point][metricConf.Statistics], parseInt(new Date(dataPoints[point].Timestamp).getTime() / 1000.0));
      }
    }.bind({graphite: metrics[element].graphite}));
  }
}

