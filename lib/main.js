(function() {
  if (typeof DataPlot === 'undefined') {
    window.DataPlot = {};
  };

  $(document).ready(function() {
    $('#introModal').modal('show');
  });

  /////////////////////////////////////////////////////////////////
  /// INITIALIZE AND LOAD DATA/////////////////////////////////////
  /////////////////////////////////////////////////////////////////

  var actvitySums, femaleSum, maleSum, desktopSum, chart, data, dates,
      mobileSum, tabletSum, pie, pressedButton;

  // Load and parse csv data
  Papa.parse('data/sample_data.csv', {
    dynamicTyping: true,
    header: true,
  	download: true,
  	complete: function(results) {
      data = results.data;
      prepCharts(data);
      segSums(0, 14);
      setColors();
      configLineChart();
      configPieChart();
    }
  });

  /////////////////////////////////////////////////////////////////
  /// PREPARE CHARTS //////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////

  // Prepare variables for use in chart drawing
  var prepCharts = DataPlot.prepCharts = function(data) {
    var dataDate = _(data).groupBy('Date');
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

    calcTrend(activitySums);

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

    switch (pressedButton) {
      case "fourteen":
        updateCharts(0, 14);
        break;
      case "seven":
        updateCharts(7, 14)
        break;
      case "three":
        updateCharts(11, 14)
        break;
    }
  });

  // Toggle mean and trend lines
  var calcMean = DataPlot.calcMean = function(activitySums) {
    return ss.mean(activitySums);
  };

  var calcTrend = DataPlot.calcTrend = function(activitySums) {
    var activitySumsDouble = [];
    for (var i = 0; i < activitySums.length; i++) {
      activitySumsDouble.push([i, activitySums[i]]);
    };

    var trendFunc = ss.linear_regression().data(activitySumsDouble).line();
    return _.map(activitySumsDouble, function(arr) {
      return [arr[0], trendFunc(arr[0])];
    });
  };

  var seriesMean, seriesTrend;

  $('#stats button').on('click', function() {
    $(this).button('toggle');
    var pressedStats = $(this).prop('id');
    seriesTrend = $('#container').highcharts().series[1];
    seriesTrend.visible ? seriesTrend.hide() : seriesTrend.show();
  });

  /////////////////////////////////////////////////////////////////
  /// DISPLAY CHARTS //////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////

  // Display population segment data
  var segSums = DataPlot.segSums = function(start, end) {
    var maleSegSum = maleSum.slice(start, end).sum();
    var femaleSegSum = femaleSum.slice(start, end).sum();
    var totalSegSum = maleSegSum + femaleSegSum;
    $('#male').html(maleSegSum);
    $('#female').html(femaleSegSum);
    $('#total').html(totalSegSum);
  };

  var updateCharts = DataPlot.updateCharts = function(start, end) {
    chart.xAxis[0].setCategories(dates.slice(start, end));
    chart.series[0].setData(activitySums.slice(start, end));
    pie.series[0].setData([
      ['Mobile', mobileSum.slice(start, end).sum()],
      ['Tablet', tabletSum.slice(start, end).sum()],
      ['Desktop', desktopSum.slice(start, end).sum()]
    ]);
    segSums(start, end);
    chart.series[1].setData(calcTrend(activitySums.slice(start, end)));
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
        marginTop: 30,
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
          ['Mobile', mobileSum.slice(0, 14).sum()],
          ['Tablet', tabletSum.slice(0, 14).sum()],
          ['Desktop', desktopSum.slice(0, 14).sum()]
        ]
      }]
    });
	};

  // Config line chart
  var configLineChart = DataPlot.configLineChart = function() {
    $('#container').highcharts({
      credits: { enabled: false },
      title: { text: 'Sum Activity' },
      xAxis: {
        title: {
          margin: 12,
          text: 'Dates',
          style: {
            color: '#757575',
            fontSize: 15
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
            color: '#757575',
            fontSize: 14
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
        data: activitySums.slice(0, 14),
        marker: { enabled: true }
      }, {
        type: 'line',
        color: '#d3660a',
        data: calcTrend(activitySums.slice(0, 14)),
        marker: { enabled: false },
        enableMouseTracking: false,
        visible: false
      }]
    });
  };
}());
