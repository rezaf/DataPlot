(function() {
  var data, dataDate, dates, actvitySums, pressedButton, chart;

  Papa.parse("data/sample_data.csv", {
    dynamicTyping: true,
    header: true,
  	download: true,

  	complete: function(results){
      data = results.data;
      dataDate = _.groupBy(data, 'Date');
      dates = Object.keys(dataDate);
      activitySums = [];
      pressedButton = "fourteen";

      _.each(dataDate, function(arr){
        activitySums.push((_.pluck(arr, 'Activity')).sum());
      });
      totalActivity = activitySums.sum();
      activitySums = _.map(activitySums, function(num){
        return (num / totalActivity * 100);
      });

      $('#container').highcharts({
        credits: {
          enabled: false
        },
        title: {
          text: 'Sum Activity'
        },
        xAxis: {
          type: 'datetime',
          categories: dates
        },
        yAxis: {
          title: {
            text: 'Percentage of Total Activity (%)'
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          series: {
            tooltip: {
              pointFormat: '<span style="color:{series.color}"></span> <b>{point.y}%</b><br/>',
              valueDecimals: 2
            }
          }
        },
        series: [{
          data: activitySums,
          marker: {
            enabled: true
          }
        }]
      });
  	}
  });

  $('.btn').on('click', function(){
    $('.active').button('toggle');
    $(this).button('toggle');
    pressedButton = $('.active').prop('id');
    chart = $('#container').highcharts();

    switch (pressedButton) {
      case "fourteen":
        chart.series[0].setData(activitySums.slice(0,14));
        break;
      case "seven":
        chart.series[0].setData(activitySums.slice(7,14));
        break;
      case "three":
        chart.series[0].setData(activitySums.slice(11,14));
        break;
      case "today":
        var todayDay = dates.last();
        var todayTimes = _.pluck(dataDate[todayDay], 'Time');
        todayTimes = _.map(todayTimes, function(time){
          return todayDay.concat(" " + time);
        });
        var daySums = _.pluck(dataDate[dates.last()], 'Activity');
        chart.series[0].setData(daySums);




        //   dataDate, function(arr){
        //     activitySums.push((_.pluck(arr, 'Activity')).sum());
        //   });
        //   totalActivity = activitySums.sum();
        //   activitySums = _.map(activitySums, function(num){
        //     return (num / totalActivity * 100);
        //   });
        // chart.series[0].setData(activitySums);
        break;
    }
  });
}());
