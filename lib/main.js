(function() {
  if (typeof DataPlot === 'undefined') {
    window.DataPlot = {};
  };


  /////////////////////////////////////////////////////////////////
  /// INITIALIZE AND LOAD DATA/////////////////////////////////////
  /////////////////////////////////////////////////////////////////

  var actvitySums, chart, data, femaleSum, maleSum, dates,
      desktopSum, meanVal, mobileSum, pie, pressedButton, tabletSum;

  // Load and parse csv data
  Papa.parse("data/sample_data.csv", {
    dynamicTyping: true,
    header: true,
  	download: true,
  	complete: function(results){
      data = results.data;
      prepCharts(data);
      segSums(0,14);
      $('#container-today').hide();
      setColors();
      configGeneralChart();
      configPieChart();
      configTodayChart();
    }
  });


  /////////////////////////////////////////////////////////////////
  /// PREPARE CHARTS //////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////

  // Prepare variables for use in chart drawing
  var prepCharts = DataPlot.prepCharts = function(data) {
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
    meanVal = calcMean(activitySums);
    mobileSum = _(deviceSums).pluck('mobile');
    tabletSum = _(deviceSums).pluck('tablet');
    desktopSum = _(deviceSums).pluck('desktop');
    femaleSum = _(genderSums).pluck('female');
    maleSum = _(genderSums).pluck('male');
  };

  // Update charts based on selected population segment
  $('.list-group-item').on('click', function() {
    $('.list-group-item').removeClass('active');
    var clickedID = $('span', this).attr('id');
    var segData = _(data).where({ Gender: clickedID });
    if (segData.length < 1) { segData = data };
    prepCharts(segData);
    $('#timeRange button.active').click();
    $(this).addClass('active');
  });

  // Update charts based on selected time range
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

  // Toggle mean and trend lines
  $('#stats button').on('click', function() {
    $(this).button('toggle');
    var pressedStats = $(this).prop('id');
    if ($('#container').attr('style') === "display: none;") {
      var seriesMean = $('#container-today').highcharts().series[1];
      var seriesTrend = $('#container-today').highcharts().series[2];
    } else {
      var seriesMean = $('#container').highcharts().series[1];
      var seriesTrend = $('#container').highcharts().series[2];
    };
    if (pressedStats === "mean") {
      seriesMean.visible ? seriesMean.hide() : seriesMean.show();
    } else {
      seriesTrend.visible ? seriesTrend.hide() : seriesTrend.show();
    };
  });

  function calcMean(activitySums) {
    return ss.mean(activitySums);
  };

  function calcTrend(activitySums) {
    var activitySumsDouble = [];
    for (var i = 0, len = activitySums.length; i < len; i++) {
      activitySumsDouble.push([i, activitySums[i]]);
    };
    var trendFunc = ss.linear_regression().data(activitySumsDouble).line();
    return _.map(activitySumsDouble, function(arr) {
      return [arr[0], trendFunc(arr[0])];
    });
  };


  /////////////////////////////////////////////////////////////////
  /// DISPLAY CHARTS //////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////

  // Display population segment data
  var segSums = DataPlot.segSums = function(start_date, end_date) {
    var maleSegSum = maleSum.slice(start_date, end_date).sum();
    var femaleSegSum = femaleSum.slice(start_date, end_date).sum();
    var totalSegSum = maleSegSum + femaleSegSum;
    $('#male').html(maleSegSum);
    $('#female').html(femaleSegSum);
    $('#total').html(totalSegSum);
  };

  // Update charts for 14 day time window
  var fourteenChart = DataPlot.fourteenChart = function() {
    chart.xAxis[0].setCategories(dates.slice(0,14));
    chart.series[0].setData(activitySums.slice(0,14));
    meanVal = calcMean(activitySums.slice(0,14));
    chart.series[1].setData([[0, meanVal], [13, (meanVal + 0.000001)]]);
    chart.series[2].setData(calcTrend(activitySums.slice(0,14)));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(0,14).sum()],
      ['Tablet', tabletSum.slice(0,14).sum()],
      ['Desktop', desktopSum.slice(0,14).sum()]
    ]);
    segSums(0,14);
  };

  // Update charts for 7 day time window
  var sevenChart = DataPlot.sevenChart = function() {
    chart.xAxis[0].setCategories(dates.slice(7,14));
    chart.series[0].setData(activitySums.slice(7,14));
    meanVal = calcMean(activitySums.slice(7,14));
    chart.series[1].setData([[0, meanVal], [6, (meanVal + 0.000001)]])
    chart.series[2].setData(calcTrend(activitySums.slice(7,14)));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(7,14).sum()],
      ['Tablet', tabletSum.slice(7,14).sum()],
      ['Desktop', desktopSum.slice(7,14).sum()]
    ]);
    segSums(7,14);
  };

  // Update charts for 3 day time window
  var threeChart = DataPlot.threeChart = function() {
    chart.xAxis[0].setCategories(dates.slice(11,14));
    chart.series[0].setData(activitySums.slice(11,14));
    meanVal = calcMean(activitySums.slice(11,14));
    chart.series[1].setData([[0, meanVal], [2, (meanVal + 0.000001)]]);
    chart.series[2].setData(calcTrend(activitySums.slice(11,14)));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(11,14).sum()],
      ['Tablet', tabletSum.slice(11,14).sum()],
      ['Desktop', desktopSum.slice(11,14).sum()]
    ]);
    segSums(11,14);
  };

  // Update charts same day time window
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
    meanVal = calcMean(hourlyActivityPercents);
    chart.series[1].setData([[0, meanVal], [23, (meanVal + 0.000001)]]);
    chart.series[2].setData(calcTrend(hourlyActivityPercents));
    segSums(14,15);
    configTodayChart(todayHours, hourlyActivitySums, hourlyActivityPercents);
  };


  /////////////////////////////////////////////////////////////////
  /// CONFIGS /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////

  // Config color settings
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

  // Config pie chart
  var configPieChart = DataPlot.configPieChart = function() {
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

  // Config line chart for multi-day selections
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
      }, {
        type: 'line',
        color: '#33b419',
        data: [[0, meanVal], [13, (meanVal + 0.000001)]],
        marker: { enabled: false },
        enableMouseTracking: false,
        visible: ((typeof $('#container-today').highcharts()) !== 'undefined')
                       && ($('#container-today').highcharts().series[1].visible)
      }, {
        type: 'line',
        color: '#d3660a',
        data: calcTrend(activitySums.slice(0,14)),
        marker: { enabled: false },
        enableMouseTracking: false,
        visible: ((typeof $('#container-today').highcharts()) !== 'undefined')
                       && ($('#container-today').highcharts().series[2].visible)
      }]
    });
    debugger
  };

  // Config line chart for single-day selection
  var configTodayChart = DataPlot.configTodayChart = function(
    todayHours,
    hourlyActivitySums,
    hourlyActivityPercents
  ){
    $('#container-today').highcharts({
      credits: { enabled: false },
      title: { text: 'Sum Activity' },
      xAxis: {
        title: {
          margin: 12,
          text: 'Hours (24hr)',
          style: {
            "color": "757575",
            "fontSize": "15"
          }
        },
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
      }, {
        type: 'line',
        color: '#33b419',
        data: [[0, meanVal], [23, (meanVal + 0.000001)]],
        marker: { enabled: false },
        enableMouseTracking: false,
        visible: $('#container').highcharts().series[1].visible
      }, {
        type: 'line',
        color: '#d3660a',
        data: calcTrend(hourlyActivityPercents),
        marker: { enabled: false },
        enableMouseTracking: false,
        visible: $('#container').highcharts().series[2].visible
      }]
    });
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(14).sum()],
      ['Tablet', tabletSum.slice(14).sum()],
      ['Desktop', desktopSum.slice(14).sum()]
    ]);
  };
}());
