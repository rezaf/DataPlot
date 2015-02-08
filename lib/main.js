(function() {
  if (typeof DataPlot === 'undefined') {
    window.DataPlot = {};
  };

  var actvitySums, chart, data, femaleSum, maleSum, dates,
      desktopSum, mobileSum, pie, pressedButton, tabletSum;

  Papa.parse("data/sample_data.csv", {
    dynamicTyping: true,
    header: true,
  	download: true,

  	complete: function(results){
      data = results.data;

      drawCharts(data);
      segSums(0,14);

      $('#container-today').hide();
      setColors();
      configGeneralChart();
      configPieChart();
    }
  });

  function drawCharts(data) {
    dataDate = _(data).groupBy('Date');
    dates = _(dataDate).keys();
    activitySums = [];
    var deviceSums = [];
    var genderSums = [];

    _(dataDate).each(function(arr) {
      activitySums.push(_(arr).pluck('Activity').sum());
      deviceSums.push(_(arr).countBy('Device'));
      genderSums.push(_(arr).countBy('Gender'));
    });

    totalActivity = activitySums.sum();
    activitySums = _(activitySums).map(function(num) {
      return (num / totalActivity * 100);
    });

    mobileSum = _(deviceSums).pluck('mobile');
    tabletSum = _(deviceSums).pluck('tablet');
    desktopSum = _(deviceSums).pluck('desktop');
    femaleSum = _(genderSums).pluck('female');
    maleSum = _(genderSums).pluck('male');
  };

  $('.list-group-item').on('click', function() {
    $('.list-group-item').removeClass('active');
    var clickedID = $('span', this).attr('id');
    var segData = _(data).where({ Gender: clickedID });
    if (segData.length < 1) { segData = data };

    drawCharts(segData);

    $('#timeRange button.active').click();
    $(this).addClass('active');
  });

  $('#timeRange button').on('click', function() {
    $('#timeRange button.active').button('toggle');
    $(this).button('toggle');
    pressedButton = $('#timeRange button.active').prop('id');
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

  $('#stats button').on('click', function() {
    $(this).button('toggle');
    var pressedStats = $('#stats button.active').prop('id');
debugger
    calcMean(activitySums);
    calcTrend();

    if (pressedButton === "mean") {
      $('#').toggle();
    } else {
      $('#').toggle();
    };
  });

  function calcMean(activitySums) {
    var mean_line = ss.mean(activitySums);
  };

  function calcTrend(argument) {
    var linear_regression_line = ss.linear_regression().data([[0, 1], [2, 2], [3, 3]]).line();
  };

  var segSums = DataPlot.segSums = function(start_date, end_date) {
    var maleSegSum = maleSum.slice(start_date, end_date).sum();
    var femaleSegSum = femaleSum.slice(start_date, end_date).sum();
    var totalSegSum = maleSegSum + femaleSegSum;

    $('#male').html(maleSegSum);
    $('#female').html(femaleSegSum);
    $('#total').html(totalSegSum);
  };

  var fourteenChart = DataPlot.fourteenChart = function() {
    chart.series[0].setData(activitySums.slice(0,14));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(0,14).sum()],
      ['Tablet', tabletSum.slice(0,14).sum()],
      ['Desktop', desktopSum.slice(0,14).sum()]
    ]);
    segSums(0,14);
  };

  var sevenChart = DataPlot.sevenChart = function() {
    chart.series[0].setData(activitySums.slice(7,14));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(7,14).sum()],
      ['Tablet', tabletSum.slice(7,14).sum()],
      ['Desktop', desktopSum.slice(7,14).sum()]
    ]);
    segSums(7,14);
  };

  var threeChart = DataPlot.threeChart = function() {
    chart.series[0].setData(activitySums.slice(11,14));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(11,14).sum()],
      ['Tablet', tabletSum.slice(11,14).sum()],
      ['Desktop', desktopSum.slice(11,14).sum()]
    ]);
    segSums(11,14);
  };

  var todayChart = DataPlot.todayChart = function() {
    var todayData = dataDate[dates.last()];

    _(todayData).each(function(dataPoint) {
      dataPoint.Time = dataPoint.Date.concat(" " + dataPoint.Time);
      dataPoint.Time = moment(dataPoint.Time, "MM-DD-YY HH:mm A").format("HH");
    });

    var groupedByTime = _(todayData).groupBy('Time');
    var todayHours = _(groupedByTime).keys();

    var hourlyActivitySums = [];
    _(groupedByTime).each(function(arr) {
      hourlyActivitySums.push(_(arr).pluck('Activity').sum());
    });
    var totalDayActivity = hourlyActivitySums.sum();
    var hourlyActivityPercents = hourlyActivitySums.map(function(num) {
      return (num / totalDayActivity * 100).round(2);
    });
    segSums(14,15);
    configTodayChart(todayHours, hourlyActivitySums, hourlyActivityPercents);
  };

  var setColors = DataPlot.setColors = function() {
    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
      return {
        radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
        stops: [
          [0, color],
          [1, Highcharts.Color(color).brighten(-0.3).get('rgb')]
        ]
      };
    });
  };

  var configPieChart = DataPlot.configPieChart = function(){
    $('#pie-chart').highcharts({
      credits: { enabled: false },
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false
      },
      title: { text: 'Devices' },
      tooltip: { pointFormat: '{series.name}: <b>{point.y}</b>' },
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
          ['Mobile', mobileSum.slice(0,14).sum()],
          ['Tablet', tabletSum.slice(0,14).sum()],
          ['Desktop', desktopSum.slice(0,14).sum()]
        ]
      }]
    });
	};

  var configGeneralChart = DataPlot.configGeneralChart = function() {
    $('#container').highcharts({
      credits: { enabled: false },
      title: { text: 'Sum Activity' },
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
      legend: { enabled: false },
      plotOptions: {
        series: {
          tooltip: {
            pointFormat: '<span style="color:{series.color}"></span> <b>{point.y}%</b><br/>',
            valueDecimals: 2
          }
        }
      },
      series: [{
        data: activitySums.slice(0,14),
        marker: { enabled: true }
      }]
    });
  };

  var configTodayChart = DataPlot.configTodayChart = function(
    todayHours,
    hourlyActivitySums,
    hourlyActivityPercents
  ){
    $('#container-today').highcharts({
      credits: { enabled: false },
      title: { text: 'Sum Activity' },
      xAxis: {
        type: 'datetime',
        categories: todayHours
      },
      yAxis: {
        title: { text: 'Percentage of Total Activity (%)' }
      },
      legend: { enabled: false },
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
        marker: { enabled: true }
      }]
    });

    pie.series[0].setData([
      ['Mobile', mobileSum.slice(14).sum()],
      ['Tablet', tabletSum.slice(14).sum()],
      ['Desktop', desktopSum.slice(14).sum()]
    ]);
  };
}());
