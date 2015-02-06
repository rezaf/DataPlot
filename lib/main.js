(function() {
  var data, dataDate, dates, actvitySums, pressedButton, chart, pie, deviceSums;

  Papa.parse("data/sample_data.csv", {
    dynamicTyping: true,
    header: true,
  	download: true,

  	complete: function(results){
      data = results.data;
      dataDate = _.groupBy(data, 'Date');
      dates = Object.keys(dataDate);
      activitySums = [];
      deviceSums = [];
      pressedButton = "fourteen";

      _.each(dataDate, function(arr){
        activitySums.push((_.pluck(arr, 'Activity')).sum());
      });
      totalActivity = activitySums.sum();
      activitySums = _.map(activitySums, function(num){
        return (num / totalActivity * 100);
      });

      //
      _.each(dataDate, function(arr){
        deviceSums.push((_.countBy(arr, 'Device')));
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

      $('#pie-chart').highcharts({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: 'Devices'
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Device share',
          data: deviceSums
        }]
      });
  	}
  });

  $('.btn').on('click', function(){
    $('.active').button('toggle');
    $(this).button('toggle');
    pressedButton = $('.active').prop('id');
    chart = $('#container').highcharts();
    pie = $('#pie-chart').highcharts();

    if (pressedButton !== "today") {
      $('#container').show();
      $('#container-today').hide();
    } else {
      $('#container').hide();
      $('#container-today').show();
    };
debugger
    switch (pressedButton) {
      case "fourteen":
        chart.series[0].setData(activitySums.slice(0,14));
        pie.series[0].setData(deviceSums.slice(0,14));
        break;
      case "seven":
        chart.series[0].setData(activitySums.slice(7,14));
        pie.series[0].setData(deviceSums.slice(7,14));
        break;
      case "three":
        chart.series[0].setData(activitySums.slice(11,14));
        pie.series[0].setData(deviceSums.slice(11,14));
        break;
      case "today":
        var todayDay = dates.last();
        var todayData = dataDate[todayDay];

        _.each(todayData, function(dataPoint){
           dataPoint.Time = dataPoint.Date.concat(" " + dataPoint.Time);
           dataPoint.Time = moment(dataPoint.Time, "MM-DD-YY HH:mm A")
                                  .format("HH");
        });

        var groupedData = _.groupBy(todayData, 'Time');
        var todayHours = _.keys(groupedData)

        var hourlyActivitySums = [];
        _.each(groupedData, function(arr){
          hourlyActivitySums.push((_.pluck(arr, 'Activity')).sum());
        });
        var totalDayActivity = hourlyActivitySums.sum();
        var hourlyActivityPercents = _.map(hourlyActivitySums, function(num){
          return (num / totalDayActivity * 100).round(2);
        });

        $('#container-today').highcharts({
          credits: {
            enabled: false
          },
          title: {
            text: 'Sum Activity'
          },
          xAxis: {
            type: 'datetime',
            categories: todayHours
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
            data: hourlyActivityPercents,
            marker: {
              enabled: true
            }
          }]
        });
        break;
    }
  });
}());
