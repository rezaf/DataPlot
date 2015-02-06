(function() {
  var data,
      dataDate,
      dates,
      actvitySums,
      pressedButton,
      chart,
      pie,
      deviceSums,
      mobileSum,
      tabletSum,
      desktopSum;

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
      mobileSum = _.pluck(deviceSums, 'mobile');
      tabletSum = _.pluck(deviceSums, 'tablet');
      desktopSum = _.pluck(deviceSums, 'desktop');

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
      $('#container-today').hide();
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
          data: [
            ['Mobile', mobileSum.sum()],
            ['Tablet', tabletSum.sum()],
            ['Desktop', desktopSum.sum()]
          ]
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

    switch (pressedButton) {
      case "fourteen":
        chart.series[0].setData(activitySums.slice(0,14));
        pie.series[0].setData([
          ['Mobile', mobileSum.slice(0,14).sum()],
          ['Tablet', tabletSum.slice(0,14).sum()],
          ['Desktop', desktopSum.slice(0,14).sum()]
        ]);
        break;
      case "seven":
        chart.series[0].setData(activitySums.slice(7,14));
        pie.series[0].setData([
          ['Mobile', mobileSum.slice(7,14).sum()],
          ['Tablet', tabletSum.slice(7,14).sum()],
          ['Desktop', desktopSum.slice(7,14).sum()]
        ]);
        break;
      case "three":
        chart.series[0].setData(activitySums.slice(11,14));
        pie.series[0].setData([
          ['Mobile', mobileSum.slice(11,14).sum()],
          ['Tablet', tabletSum.slice(11,14).sum()],
          ['Desktop', desktopSum.slice(11,14).sum()]
        ]);
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
        pie.series[0].setData([
          ['Mobile', mobileSum.slice(14).sum()],
          ['Tablet', tabletSum.slice(14).sum()],
          ['Desktop', desktopSum.slice(14).sum()]
        ]);
        break;
    }
  });
}());
