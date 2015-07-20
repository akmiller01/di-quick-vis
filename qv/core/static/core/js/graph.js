//Tooltip functions
$(document).ready(function(){
    $("body").append("<div class='tooltip' id='tooltip' style='position:absolute;background-color: rgb(255, 255, 255); border: 1px solid rgb(128, 128, 128); opacity: 0.9; padding: 1px 5px;'></div>");
    window.hideTooltip = function() {
        return $('#tooltip').hide();
    };

    window.hideTooltip();
});

window.updatePosition = function(event) {
  var curX, curY, tth, ttleft, tttop, ttw, wscrX, wscrY, xOffset, yOffset;
  xOffset = 20;
  yOffset = 10;
  ttw = $("#tooltip").width();
  tth = $("#tooltip").height();
  wscrY = $(window).scrollTop();
  wscrX = $(window).scrollLeft();
  curX = document.all ? event.clientX + wscrX : event.pageX;
  curY = document.all ? event.clientY + wscrY : event.pageY;
  ttleft = (curX - wscrX + xOffset * 2 + ttw) > $(window).width() ? curX - ttw - xOffset * 2 : curX + xOffset;
  if (ttleft < wscrX + xOffset) {
    ttleft = wscrX + xOffset;
  }
  tttop = (curY - wscrY + yOffset * 2 + tth) > $(window).height() ? curY - tth - yOffset * 2 : curY + yOffset;
  if (tttop < wscrY + yOffset) {
    tttop = curY + yOffset;
  }
  return $("#tooltip").css('top', tttop + 'px').css('left', ttleft + 'px');
};

window.showTooltip = function(content, event) {
  $('#tooltip').html(content);
  $('#tooltip').show();
  return window.updatePosition(event);
};

show_details = function(data, i, element) {
    var content;
    d3.select(element)
    .attr("stroke-width","2px");
    content = "<span class=\"tooltip\"> " + data + "</span><br/>";
    return showTooltip(content, d3.event);};
hide_details = function(data, i, element) {
    d3.select(element)
    .attr("stroke-width","1px");
    return hideTooltip();}


function table(conf) {
    //Draw table
    var data = conf.data
    $tableDiv = $(conf.selector)
    var dataLen = data.length>1001?1001:data.length;
    var html = "<table>"
    var header = Object.keys(data[0]),
        headerLen = header.length;
        html += "<tr>"
        html += "<th>row</th>"
        for (var j = 0; j < headerLen; j++) {
            html += "<th>"
            html += header[j]
            html += "</th>"
        }
        html += "</tr>"
    for (var i = 0; i < dataLen; i++) {
        var row = data[i];
        html += "<tr>"
        html += "<td>"+i+"</td>"
        for (var key in row) {
            html += "<td>"
            html += row[key]
            html += "</td>"
        }
        html += "</tr>"
    }
    html += "</table>"
    $tableDiv.html(html)
};

function slider(timeVar){
    var html = "<div id='sliderHolder'>"
    html += "<p>"
	html += "<label for='year'>"+timeVar+": </label>"
	html += "<input type='text' id='year' style='border:0; color:#0800FF; font-weight:bold;' />"
    html += "<button id='play'>&#9658;</button>"
    html += "</p>"
    html += "<div id='slider'></div>"
    html += "</div>"
    return html
};

function bar(conf){
    var data = conf.data;
    //Make chart
    var margin = {
        top: 10,
        right: 60,
        bottom: 30,
        left: 60
    };
    var svg = d3.select(conf.selector).append('svg');
    svg.html("")
    svg.attr('viewBox','0 0 1120 440'); 
    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    var yScale = d3.scale.linear();
    
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
        
    var yAxisContainer = g.append("g")
        .attr("class", "axis");
    
    var barContainer = g.append('g')
        .attr('class', 'barContainer');
        
    var availableWidth = 1000;
    var height = 400;
    
    var yMin = 0;
    var yMax = d3.max(data, function (d){
        return parseFloat(d[conf.yVar]);
    })
    
    yScale.domain([yMin, yMax]);
    yScale.range([height, 0])
    yScale.nice();
    
    if (conf.timeVar) {
        var timeExtent = d3.extent(data,function (d){
            return d[conf.timeVar];
        })
        var maxEntriesPerYear = d3.max(_.values(_.countBy(data, function(d) {
            return d[conf.timeVar];
        })));
        
        var yearMin = timeExtent[0];
        var yearMax = timeExtent[1];
        
        var filteredData = _.filter(data, function (d){
            return d[conf.timeVar] == yearMin;
        });
        //Slider config
        $(conf.selector).append(slider(conf.timeVar));
        $( "#year" ).val( yearMin );
        $( "#slider" ).slider({value:yearMin,
			min: yearMin,
			max: yearMax,
			step: 1,
			slide: function( event, ui ) {$( "#year" ).val( ui.value );}});
        $('#slider').slider({animate: 1000 });
        var timeouts = [];
        play = function(){
            for(var timeout in timeouts){
                clearTimeout(timeouts[timeout])
            };
            timeouts = [];
            yearLen = yearMax-yearMin
            for(i=0;i<yearLen;i++){
                $('#slider').slider( "option", "value", yearMin)
                $('#year').val( yearMin)
                slideAnimate = setTimeout(function(){
                    var newTime = parseFloat($('#slider').slider( "option", "value" ))+1;
                    if (newTime<=yearMax) {
                        $('#slider').slider( "option", "value", newTime );
                        $('#year').val(newTime);
                    }
                },(i+1)*1000)
                timeouts.push(slideAnimate);
            }
        };
        $('#play').click(function(){play()})
        $('#slider').slider({slide: function (event,ui){
            $( "#year" ).val( ui.value );
            var filteredData = _.filter(data, function (d){
                return d[conf.timeVar] == $( "#slider" ).slider( "value" );
            });
            filteredData.sort(function (a,b){
                return b[conf.yVar] - a[conf.yVar];
            });
            drawBars(filteredData);
        }});
        $('#slider').slider({change: function (event,ui){
            $( "#year" ).val( ui.value );
            var filteredData = _.filter(data, function (d){
                return d[conf.timeVar] == $( "#slider" ).slider( "value" );
            });
            filteredData.sort(function (a,b){
                return b[conf.yVar] - a[conf.yVar];
            });
            drawBars(filteredData);
        }});
    } else {
        var maxEntriesPerYear = data.length,
        filteredData = data;
    };
    
    var padding = 2;
    var barWidth = (availableWidth / maxEntriesPerYear - padding) > 1 ? (availableWidth / maxEntriesPerYear - padding) : 1;

    filteredData.sort(function (a,b){
        return b[conf.yVar] - a[conf.yVar];
    });
    yAxis
        .ticks(4)
        //.tickFormat(function(d) {
        //    return logFormat(d)
        //})
        .tickPadding(15);
    
        yAxisContainer.transition().duration(500)
        .call(yAxis);
    
    function drawBars(data){
        var bars =  barContainer.selectAll('.bar')
            .data(data, function (d, i){
                return conf.xUnique ? d[conf.xVar] : i;
            })
        
        bars.enter()
            .append('rect')
            .on("mouseover", function(d, i) {return show_details(
                conf.xVar + ": " + d[conf.xVar]
                + "<br/>"
                + conf.yVar + ": " + d[conf.yVar]
                + (conf.timeVar ? "<br/>" + conf.timeVar + ": " + d[conf.timeVar] : "")
                , i, this)})
            .on("mouseout", function(d, i) {return hide_details(d[conf.xVar], i, this);});
        
        bars.transition().duration(50)
            .attr({
                height: function (d) {
                    return height - yScale(d[conf.yVar]);
                },
                y: function (d) {
                    return yScale(d[conf.yVar]);
                },
        
                width: function (d) {
                    return barWidth;
                },
        
                x: function (d, i) {
                    return i * barWidth + i * padding;
                },
                class: "bar"
            })

        bars.exit().remove();
    };
    
    drawBars(filteredData);
};