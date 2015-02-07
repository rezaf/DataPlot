(function() {
  if (typeof DataPlot === 'undefined') {
    window.DataPlot = {};
  };

  var data,
      dataDate,
      dataFemale,
      dataMale,
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
      dataMale = _.where(data, { Gender: 'male' });
      dataFemale = _.where(data, { Gender: 'female' });

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

      _.each(dataDate, function(arr){
        deviceSums.push((_.countBy(arr, 'Device')));
      });
      mobileSum = _.pluck(deviceSums, 'mobile');
      tabletSum = _.pluck(deviceSums, 'tablet');
      desktopSum = _.pluck(deviceSums, 'desktop');

      $('#male').html(dataMale.length);
      $('#female').html(dataFemale.length);
      $('#total').html(data.length);

      $('#container-today').hide();

      setColors();
      configGeneralChart();
      configPieChart();
    }
  });

  $('.list-group-item').on('click', function(){
    $('.list-group-item').removeClass('active');
    $(this).addClass('active');
    var clickedID = $("span", this).attr('id');
    dataDateGender = _.each(dataDate, function(dDate){
      return _(dDate).where({ Gender: clickedID });
    });

    _.each(dataDateGender, function(arr){
      activitySums.push((_.pluck(arr, 'Activity')).sum());
    });
    totalActivity = activitySums.sum();
    activitySums = _.map(activitySums, function(num){
      return (num / totalActivity * 100);
    });
    $('.btn.active').click();
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
        fourteenChart();
        break;
      case "seven":
        sevenChart();
        break;
      case "three":
        threeChart();
        break;
      case "today":
        todayChart();
        break;
    }
  });

  var setColors = DataPlot.setColors = function() {
    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
      return {
        radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
        stops: [
          [0, color],
          [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
        ]
      };
    });
  };

  var configPieChart = DataPlot.configPieChart = function(){
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
        pointFormat: '{series.name}: <b>{point.y}</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          borderWidth: 3,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (
                Highcharts.theme && Highcharts.theme.contrastTextColor
              ) || 'black'
            }
          },
        }
      },
      series: [{
        type: 'pie',
        name: 'Device count',
        data: [
          ['Mobile', mobileSum.sum()],
          ['Tablet', tabletSum.sum()],
          ['Desktop', desktopSum.sum()]
        ]
      }]
    });
	};

  var configGeneralChart = DataPlot.configGeneralChart = function() {
    $('#container').highcharts({
      credits: {
        enabled: false
      },
      title: {
        text: 'Sum Activity'
      },
      xAxis: {
        title: {
          margin: 12,
          text: 'Dates',
          style: {
            "color": "757575",
            "fontSize": "15"
          }
        },
        type: 'datetime',
        categories: dates
      },
      yAxis: {
        title: {
          margin: 15,
          text: 'Percentage of Total Activity (%)',
          style: {
            "color": "757575",
            "fontSize": "14"
          }
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
  };

  var fourteenChart = DataPlot.fourteenChart = function() {
    chart.series[0].setData(activitySums.slice(0,14));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(0,14).sum()],
      ['Tablet', tabletSum.slice(0,14).sum()],
      ['Desktop', desktopSum.slice(0,14).sum()]
    ]);
  };

  var sevenChart = DataPlot.sevenChart = function() {
    chart.series[0].setData(activitySums.slice(7,14));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(7,14).sum()],
      ['Tablet', tabletSum.slice(7,14).sum()],
      ['Desktop', desktopSum.slice(7,14).sum()]
    ]);
  };

  var threeChart = DataPlot.threeChart = function() {
    chart.series[0].setData(activitySums.slice(11,14));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(11,14).sum()],
      ['Tablet', tabletSum.slice(11,14).sum()],
      ['Desktop', desktopSum.slice(11,14).sum()]
    ]);
  };

  var todayChart = DataPlot.todayChart = function() {
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

    configTodayChart(todayHours, hourlyActivitySums, hourlyActivityPercents);
  };

  var configTodayChart = DataPlot.configTodayChart = function(
    todayHours,
    hourlyActivitySums,
    hourlyActivityPercents
  ){
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
  };
}());
