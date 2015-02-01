(function() {
  var dataDate;
  var dates;
  var actvitySums;
  var pressedButton;

  Papa.parse("data/sample_data.csv", {
    dynamicTyping: true,
    header: true,
  	download: true,

  	complete: function(results){
      var data = results.data;
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
        }],
        rangeSelector: {
          allButtonsEnabled: true
        }
      });
  	}
  });

  $('.btn').on('click', function(){
    $('.active').button('toggle');
    $(this).button('toggle');
    pressedButton = $('.active').prop('id');

    var chart = $('#container').highcharts();
    switch (pressedButton) {
      case "fourteen":
        // var shownDates = dates.slice(0,14);
        chart.series[0].setData(activitySums.slice(0,14));
        break;
      case "seven":
        // var shownDates = dates.slice(7,14);
        chart.series[0].setData(activitySums.slice(7,14));
        break;
      case "three":
        // var shownDates = dates.slice(11,14);
        chart.series[0].setData(activitySums.slice(11,14));
        break;
      case "today":
        //using shownDates for time of the day instead
        // var shownDates = _.pluck(dataDate[dates.last()], 'Time');
        activitySums = _.pluck(dataDate[dates.last()], 'Activity');
        debugger
          // dataDate, function(arr){
          //   activitySums.push((_.pluck(arr, 'Activity')).sum());
          // });
          // totalActivity = activitySums.sum();
          // activitySums = _.map(activitySums, function(num){
          //   return (num / totalActivity * 100);
          // });
        chart.series[0].setData(activitySums);
        break;
    }
  });
}());
