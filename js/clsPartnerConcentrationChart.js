function clsPartnerConcentrationChart(p_Config){
    var me = this;
    me.renderTo = '';
    me.width = 500;
    me.height = 300;
    me.margin = {
        top : 10,
        right : 10,
        bottom : 10,
        left : 40
    };
    me.graphwidth = me.width - 100 - me.margin.left - me.margin.right;
    me.graphheight = me.height - me.margin.top - me.margin.bottom;
    me.leftGraphData = [];
    me.rightGraphData = [];
    me.xAxisTopPadding = 30;
    me.formatPercent = d3.format(".0%");
    me.brushStarEdgeSize = 10;

//    me.leftChartColor = "#ABC3D3";
    me.leftChartColor = "#95CDEF";
//    me.rightChartColor = "#4D6395";
    me.rightChartColor = "#3491CD";
    me.disabledBarColor = "#DCE8EF";

    me.svg = null;

    me.defaultBrushPercentage = 0.8;
    me.tableDiv = '';

    me.currencyFormatter = d3.format(',');

    me.spaceBetweenHerfindleIndexTxt = 10;
    me.spaceBetweenTwoBars = 3;

    me.extraBrushExtension = 30;

    me.brushHandlerBottomMargin = 10;
    me.brushHandlerHeight = 12;

    //---------------------------------------------------------------
    me.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            me[p_Name] = LValue;
        }

        me.graphwidth = me.width - 100 - me.margin.left - me.margin.right;
        me.graphheight = me.height - me.margin.top - me.margin.bottom - me.xAxisTopPadding;
    };

    //---------------------------------------------------------------
    me.draw = function(pCountryName){
        //function to draw the graph
        me.drawLayout();
        me.drawAxis();
        me.drawGraph();
        me.createFilterLines();
        me.resetLeftBrush();
        me.resetRightBrush();
        me.setHerfindahlValues(pCountryName);
    };

    //---------------------------------------------------------------
    me.drawLayout = function(){
        //function to draw the graph
        //Add svg
        me.svg = d3.select("#" + me.renderTo).append("svg")
            .attr("height", me.height)
            .attr("width", me.width);
        me.svg
            .append('defs')
            .append('pattern')
            .attr('id', 'diagonalExportBg')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 32)
            .attr('height', 32)
            //<image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>
            .append("image")
            .attr("height", 32)
            .attr("width", 32)
            .attr('xlink:href', "img/exportChartFilterBG.gif");

        me.svg
            .append('defs')
            .append('pattern')
            .attr('id', 'diagonalImportBg')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 32)
            .attr('height', 32)
            .append("image")
            .attr("height", 32)
            .attr("width", 32)
            .attr('xlink:href', "img/importChartFilterBG.gif");

        me.tooltip = d3.select("#tooltip");

        var addLeftPadding = parseInt(me.margin.left)+10;

        me.chartContainer = me.svg.append("g")
            .attr("transform", "translate(" + addLeftPadding + "," + me.margin.top + ")");

        me.leftChartContainer = me.chartContainer.append("g")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        me.rightChartContainer = me.chartContainer.append("g")
            .attr("transform", "translate(" + me.graphwidth/2 + "," + 0 + ")");

        me.rightChartBrushContainer = me.chartContainer.append("g")
            .attr("transform", "translate(" + me.graphwidth/2 + "," + 0 + ")");

        me.leftChartBrushContainer = me.chartContainer.append("g")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");
    };

    //---------------------------------------------------------------
    me.drawAxis = function(){
        //function to draw the graph
        me.leftX = d3.scale.linear()
            .clamp(true)
            .range([0, me.graphwidth/2])
            .domain([1, 0]);
        me.leftXAxis = d3.svg.axis()
            .scale(me.leftX)
            .orient("bottom")
            .ticks(5)
            .tickFormat(function(d){return d*100;});


        var g = me.leftChartContainer.append("g")
            .attr("transform", "translate(" + 0 + "," + (me.graphheight + me.xAxisTopPadding) + ")")
            .attr("class", "x axis")
            .call(me.leftXAxis);

        g.append("line")
            .attr("class", "straight-line-axis")
            .attr("x1", 0)
            .attr("x2", me.graphwidth/2)
            .attr("y1", 0)
            .attr("y2", 0);


        me.chartContainer.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", me.graphwidth/2)
            .attr("y", 430)
            .text("Cumulative Share (%)");


        //function to draw the graph
        me.rightX = d3.scale.linear()
            .clamp(true)
            .range([0, me.graphwidth/2])
            .domain([0, 1]);
        me.rightXAxis = d3.svg.axis()
            .scale(me.rightX)
            .orient("bottom")
            .ticks(5)
            .tickFormat(function(d){return d*100;});
        var g1 = me.rightChartContainer.append("g")
            .attr("transform", "translate(" + 0 + "," + (me.graphheight + me.xAxisTopPadding) + ")")
            .attr("class", "x axis")
            .call(me.rightXAxis);

        g1.append("line")
            .attr("class", "straight-line-axis")
            .attr("x1", 0)
            .attr("x2", me.graphwidth/2)
            .attr("y1", 0)
            .attr("y2", 0);

        //function to draw the graph
        me.leftY = d3.scale.linear()
            .clamp(true)
            .range([0, me.graphheight])
            .domain([0, 25]);
        me.leftYAxis = d3.svg.axis()
            .scale(me.leftY)
            .orient("left")
            .ticks(0)
            .tickValues([1, 5, 10, 15, 20, 25])
            .tickFormat(function(d){
                var str = '';
                if(d == 1)
                    str = 'Top Partner';
                else
                    str = d + 'th';

                return str;
            });

        me.leftChartContainer.append("g")
            .attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("class", "y axis axis-path-invisible")
            .call(me.leftYAxis);

        me.rightY = d3.scale.linear()
            .clamp(true)
            .range([0, me.graphheight])
            .domain([0, 25]);
        me.rightYAxis = d3.svg.axis()
            .scale(me.rightY)
            .orient("right")
            .ticks(0)
            .tickValues([1, 5, 10, 15, 20, 25])
            .tickFormat(function(d){
                var str = '';
                if(d == 1)
                    str = 'Top Partner';
                else
                    str = d + 'th';

                return str;
            });
        me.leftChartContainer.append("g")
            .attr("transform", "translate(" + me.graphwidth + "," + 0 + ")")
            .attr("class", "y axis axis-path-invisible")
            .attr("width","60px")
            .call(me.rightYAxis);
    };

    //---------------------------------------------------------------
    me.drawGraph = function(){

        //Process data and prepare for the chart
        me.processDataForChart();

        //remove previous bars
        me.leftChartContainer.selectAll(".left-row-bars")
            .data([])
            .exit()
            .remove();

        me.leftChartContainer.selectAll(".left-row-bars")
            .data(me.leftGraphData)
            .enter()
            .append("rect")
            //.attr("class", function(d) { return d.type == "import" ? "bar negative" : "bar positive"; })
            .on("mouseover", me.onChartBarMouseHover)
            .on("mousemove", me.onChartBarMouseMove)
            .on("mouseout", me.onChartBarMouseOut)
            .on("click", me.onChartBarClick)
            .attr("class", "left-row-bars")
            .attr("fill", me.leftChartColor)
            //.attr("title", function(d){ return d.Import_percent; })
            .attr("x", function(d) { return me.leftX(d._Import_percent) - me.spaceBetweenTwoBars; })
            .attr("y", function(d, i) { return me.leftY(i); })
            .attr("width", function(d) {
                return Math.abs(me.leftX(d._Import_percent) - me.leftX(0) - me.spaceBetweenTwoBars);
            })
            .attr("height", (me.graphheight/25 - me.spaceBetweenTwoBars));

        //remvoe previos bars
        me.rightChartContainer.selectAll(".right-row-bars")
            .data([])
            .exit()
            .remove();

        me.rightChartContainer.selectAll(".right-row-bars")
            .data(me.rightGraphData)
            .enter()
            .append("rect")
            //.transition()
            .attr("class", "right-row-bars")
            .on("mouseover", me.onChartBarMouseHover)
            .on("mousemove", me.onChartBarMouseMove)
            .on("mouseout", me.onChartBarMouseOut)
            .on("click", me.onChartBarClick)
            .attr("fill", me.rightChartColor)
            //.attr("title", function(d){ return d.Export_percent; })
            .attr("x", function(d) { return 0 + me.spaceBetweenTwoBars; })
            .attr("y", function(d, i) { return me.rightY(i); })
            //.attr("class", function(d) { return d.type == "import" ? "bar negative" : "bar positive"; })
            //.attr("x", function(d) { return me.rightX(d.Export_percent/100); })
            .attr("width", function(d) {
                return Math.abs(me.rightX(d._Export_percent) - me.rightX(0) - me.spaceBetweenTwoBars);
            })
            .attr("height", (me.graphheight/25 - me.spaceBetweenTwoBars));
    };

    //---------------------------------------------------------------
    me.processDataForChart = function(){
        var LSum = 0,
            leftChartNewData = [];
        for(var lloopIndex = 0; lloopIndex < me.leftGraphData.length; lloopIndex++)
        {
            var lItem = me.leftGraphData[lloopIndex];
            var clonedItem = JSON.parse(JSON.stringify( lItem ));
            LSum += clonedItem.Import_percent;
            clonedItem._Import_percent = LSum/100;
            clonedItem.type = "import";
            clonedItem.rank = lloopIndex + 1;
            leftChartNewData.push(clonedItem);
        }

        LSum = 0;
        var rightChartNewData = [];
        for(var lloopIndex = 0; lloopIndex < me.rightGraphData.length; lloopIndex++)
        {
            var lItem = me.rightGraphData[lloopIndex];
            var clonedItem = JSON.parse(JSON.stringify( lItem ));
            LSum += clonedItem.Export_percent;
            clonedItem._Export_percent = LSum/100;
            clonedItem.type = "export";
            clonedItem.rank = lloopIndex + 1;
            rightChartNewData.push(clonedItem);
        }

        me.leftGraphData = leftChartNewData;
        me.rightGraphData= rightChartNewData;
    };

    //---------------------------------------------------------------
    me.update = function(pLeftChartData, pRightChartData, pCountryName){
        me.leftGraphData = pLeftChartData;
        me.rightGraphData = pRightChartData;
        me.drawGraph();
        me.resetRightBrush();
        me.resetLeftBrush();
        me.setHerfindahlValues(pCountryName);
        //$("#tbl-cntnr").hide();
    };

    //---------------------------------------------------------------
    me.createFilterLines = function(){
        me.createRightFileterLine();
        me.createLeftFileterLine();
    };

    //---------------------------------------------------------------
    me.createRightFileterLine = function(){
        me.dragRightBrushHLine = d3.behavior.drag()
            .on("drag", me.dragmoveRightBrushHLine)
            .on("dragend", me.afterRightBrushHDragEnd);

        me.dragRightBrushVLine = d3.behavior.drag()
            .on("drag", me.dragmoveRightBrushVLine)
            .on("dragend", me.afterRightBrushVDragEnd);

        var lastItemsY = me.rightY(me.rightGraphData.length - 1);
        var lastItemsX = me.rightX(me.rightGraphData[me.rightGraphData.length - 1]._Export_percent);

        me.rightBrushData = {
            x1 : lastItemsX,
            y1 : lastItemsY,
            vx2 : lastItemsX,
            vy2 : me.graphheight + me.xAxisTopPadding,
            hx2 : me.graphwidth/2,
            hy2 : lastItemsY
        };

        me.rightBrushVHandleLine = me.rightChartBrushContainer.append('line')
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", me.graphheight + me.xAxisTopPadding - me.brushHandlerBottomMargin - me.brushHandlerHeight)
            .attr("y2", me.graphheight + me.xAxisTopPadding - me.brushHandlerBottomMargin)
            .datum(me.rightBrushData)
            .attr("class", "brush-line draggable-line right-graph-v-handle-line brush-handle")
            .call(me.dragRightBrushVLine);

//        me.rightBrushVLine = me.rightChartContainer.append('line')
        me.rightBrushVLine = me.rightChartBrushContainer.append('line')
            .datum(me.rightBrushData)
            .attr("class", "brush-line draggable-line right-graph-v-line")
            /*.attr("x1", function(d){ return d.x1; })
             .attr("y1", function(d){ return d.y1; })
             .attr("x2", function(d){ return d.vx2; })
             .attr("y2", function(d){ return d.vy2; })*/
            .call(me.dragRightBrushVLine);


//        me.rightBrushHLine = me.rightChartContainer.append('line')
        me.rightBrushHLine = me.rightChartBrushContainer.append('line')
            .datum(me.rightBrushData)
            .attr("class", "brush-line right-graph-h-line")
            /*.attr("x1", function(d){ return d.x1; })
             .attr("y1", function(d){ return d.y1; })
             .attr("x2", function(d){ return d.hx2; })
             .attr("y2", function(d){ return d.hy2; })*/
            .call(me.dragRightBrushHLine);

        //me.rightBrushStar = me.rightChartContainer.append('rect')
        me.rightBrushStar = me.rightChartBrushContainer.append('rect')
            .datum(me.rightBrushData)
            .attr("class", "brush-star")
            .attr("width", me.brushStarEdgeSize)
            .attr("height", me.brushStarEdgeSize)
            /*.attr("transform", function(d){
             return "rotate(45 " + d.x1 + " " + d.y1 + ")";
             })
             .attr("x", function(d){ return d.x1 - me.brushStarEdgeSize/2; })
             .attr("y", function(d){ return d.y1 - me.brushStarEdgeSize/2; })*/;
        me.rightBrushData.y1 += (me.graphheight/25);
        me.rightBrushData.hy2 += (me.graphheight/25);
        me.adjustRightBrush();

        //add text
        me.rightChartBrushContainer.append("text")
            .text("Exports")
            .attr("class", "graph-type-title graph-type-main-caption")
            .attr("x", me.spaceBetweenHerfindleIndexTxt)
            .attr("fill", me.rightChartColor)
            .attr("y", -35);

        //add text
        me.herfindahlIndexExportTxt = me.rightChartBrushContainer.append("text")
            .text("Exports")
            .attr("class", "graph-type-title")
            .attr("fill", me.rightChartColor)
            .attr("x", me.spaceBetweenHerfindleIndexTxt)
            .attr("y", -20);
    };

    //---------------------------------------------------------------
    me.createLeftFileterLine = function(){
        me.dragLeftBrushHLine = d3.behavior.drag()
            .on("drag", me.dragmoveLeftBrushHLine)
            .on("dragend", me.afterLeftBrushHDragEnd);
        me.dragLeftBrushVLine = d3.behavior.drag()
            .on("drag", me.dragmoveLeftBrushVLine)
            .on("dragend", me.afterLeftBrushVDragEnd);

        var lastItemsY = me.leftY(me.leftGraphData.length - 1);
        var lastItemsX = me.leftX(me.leftGraphData[me.leftGraphData.length - 1]._Import_percent);

        me.leftBrushData = {
            x1 : lastItemsX,
            y1 : lastItemsY,
            vx2 : lastItemsX,
            vy2 : me.graphheight + me.xAxisTopPadding,
            hx2 : 0,
            hy2 : lastItemsY
        };


        me.leftBrushVHandleLine = me.leftChartBrushContainer.append('line')
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", me.graphheight + me.xAxisTopPadding - me.brushHandlerBottomMargin - me.brushHandlerHeight)
            .attr("y2", me.graphheight + me.xAxisTopPadding - me.brushHandlerBottomMargin)
            .datum(me.leftBrushData)
            .attr("class", "brush-line draggable-line left-graph-v-handle-line brush-handle")
            .call(me.dragLeftBrushVLine);

        me.leftBrushVLine = me.leftChartBrushContainer.append('line')
            .datum(me.leftBrushData)
            .attr("class", "brush-line draggable-line left-graph-v-line")
            .call(me.dragLeftBrushVLine);

        me.leftBrushHLine = me.leftChartBrushContainer.append('line')
            .datum(me.leftBrushData)
            .attr("class", "brush-line left-graph-h-line")
            .call(me.dragLeftBrushHLine);

        me.leftBrushStar = me.leftChartBrushContainer.append('rect')
            .datum(me.leftBrushData)
            .attr("class", "brush-star")
            .attr("width", me.brushStarEdgeSize)
            .attr("height", me.brushStarEdgeSize);

        me.leftBrushData.y1 += (me.graphheight/25);
        me.leftBrushData.hy2 += (me.graphheight/25);
        me.adjustLeftBrush();
        //add text
        me.leftChartBrushContainer.append("text")
            .text("Imports")
            .attr("class", "graph-type-title svg-text-right-align graph-type-main-caption")
            .attr("x", me.graphwidth/2 - me.spaceBetweenHerfindleIndexTxt)
            .attr("fill", me.leftChartColor)
            .attr("y", -35)
            .attr("text-anchor", "middle");

        //add text
        me.herfindahlIndexImportTxt = me.leftChartBrushContainer.append("text")
            .text("Imports")
            .attr("class", "graph-type-title svg-text-right-align")
            .attr("x", me.graphwidth/2 - me.spaceBetweenHerfindleIndexTxt)
            .attr("fill", me.leftChartColor)
            .attr("y", -20)
            .attr("text-anchor", "middle");
    };

    //---------------------------------------------------------------
    me.resetRightBrush = function(){
        var lastItemsY = me.rightY(me.rightGraphData.length - 1);
        //var lastItemsX = me.rightX(me.rightGraphData[me.rightGraphData.length - 1]._Export_percent);
        var lastItemsX = me.rightX(me.defaultBrushPercentage);

        me.rightBrushData.x1 = lastItemsX;
        me.rightBrushData.y1 = lastItemsY;
        me.rightBrushData.vx2 = lastItemsX;
        me.rightBrushData.hy2 = lastItemsY;
        me.rightBrushData.y1 += (me.graphheight/25);
        me.rightBrushData.hy2 += (me.graphheight/25);
        me.adjustRightBrush();
        me.afterRightBrushVDragEnd();
    };

    //---------------------------------------------------------------
    me.resetLeftBrush = function(){
        var lastItemsY = me.leftY(me.leftGraphData.length - 1);
        //var lastItemsX = me.leftX(me.leftGraphData[me.leftGraphData.length - 1]._Import_percent);
        var lastItemsX = me.leftX(me.defaultBrushPercentage);

        me.leftBrushData.x1 = lastItemsX;
        me.leftBrushData.y1 = lastItemsY;
        me.leftBrushData.vx2 = lastItemsX;
        me.leftBrushData.hy2 = lastItemsY;

        me.leftBrushData.y1 += (me.graphheight/25);
        me.leftBrushData.hy2 += (me.graphheight/25);
        me.adjustLeftBrush();
        me.afterLeftBrushVDragEnd();
    };

    //---------------------------------------------------------------
    me.dragmoveRightBrushVLine = function(d) {
        me.rightBrushData.x1 = me.rightBrushData.x1 + d3.event.dx;
        me.rightBrushData.x1 = Math.max(0, Math.min(me.graphwidth/2, me.rightBrushData.x1));
        me.rightBrushData.vx2 = me.rightBrushData.vx2 + d3.event.dx;
        me.rightBrushData.vx2 = Math.max(0, Math.min(me.graphwidth/2, me.rightBrushData.vx2));
        var xn, itemX, itemY, percentage;
        //get x values
        for(var lloopIndex = 0; lloopIndex < me.rightGraphData.length; lloopIndex++)
        {
            var lItem = me.rightGraphData[lloopIndex];
            var n = Math.abs(me.rightX(lItem._Export_percent) - me.rightX(0));
            if(n > me.rightBrushData.x1)
            {   xn = n;
                var index = lloopIndex - 1;
                if(index < 0)
                    index = 0;

                itemY = me.rightY(index);
                percentage = me.rightGraphData[index]._Export_percent;
                itemX = me.rightX(me.rightGraphData[index]._Export_percent);
                break;
            }
        }
        if(lloopIndex < 1)
        {
            lloopIndex = 1;
        }
        if(!xn)
        {
            //The line is not in the range
            //set it to the last item
            itemY = me.rightY(me.rightGraphData.length - 1);
            percentage = me.rightGraphData[me.rightGraphData.length - 1]._Export_percent;
            itemX = me.rightX(me.rightGraphData[me.rightGraphData.length - 1]._Export_percent);
        }

        //me.rightBrushData.x1 = itemX;
        me.rightBrushData.y1 = itemY;
        //me.rightBrushData.vx2 = itemX;
        me.rightBrushData.hy2 = itemY;

        me.rightBrushData.y1 += (me.graphheight/25);
        me.rightBrushData.hy2 += (me.graphheight/25);

        percentage = percentage * 100;
        percentage = percentage.toFixed(1);
        me.showBrushToolTip(percentage + '%', lloopIndex, itemX + me.width/2, itemY + me.margin.top);
        me.adjustRightBrush();
        me.filterExport();
        //me.adjustRightBrush();
        //me.afterRightBrushVDragEnd();
    };

    //---------------------------------------------------------------
    me.dragmoveLeftBrushVLine = function(d) {
        me.leftBrushData.x1 = me.leftBrushData.x1 + d3.event.dx;
        me.leftBrushData.x1 = Math.max(0, Math.min(me.graphwidth/2, me.leftBrushData.x1));
        me.leftBrushData.vx2 = me.leftBrushData.vx2 + d3.event.dx;
        me.leftBrushData.vx2 = Math.max(0, Math.min(me.graphwidth/2, me.leftBrushData.vx2));
        //me.adjustLeftBrush();

        var xn, itemX, itemY, percentage;
        //get x values
        for(var lloopIndex = 0; lloopIndex < me.leftGraphData.length; lloopIndex++)
        {
            var lItem = me.leftGraphData[lloopIndex];
            var n = Math.abs(me.rightX(lItem._Import_percent) - me.leftX(0));
            if(n < me.leftBrushData.x1)
            {   xn = n;
                var index = lloopIndex - 1;
                if(index < 0)
                    index = 0;

                itemY = me.leftY(index);
                percentage = me.leftGraphData[index]._Import_percent;
                itemX = me.leftX(me.leftGraphData[index]._Import_percent);
                break;
            }
        }

        if(lloopIndex < 1)
            lloopIndex = 1;

        if(!xn)
        {
            //The line is not in the range
            //set it to the last item
            itemY = me.leftY(me.leftGraphData.length - 1);
            percentage = me.leftGraphData[me.leftGraphData.length - 1]._Import_percent;
            itemX = me.leftX(me.leftGraphData[me.leftGraphData.length - 1]._Import_percent);
        }

        //me.leftBrushData.x1 = itemX;
        me.leftBrushData.y1 = itemY;
        //me.leftBrushData.vx2 = itemX;
        me.leftBrushData.hy2 = itemY;

        me.leftBrushData.y1 += (me.graphheight/25);
        me.leftBrushData.hy2 += (me.graphheight/25);

        percentage = percentage * 100;
        percentage = percentage.toFixed(1);
        me.showBrushToolTip(percentage + '%', lloopIndex, itemX + me.margin.left, itemY + me.margin.top);

        me.adjustLeftBrush();
        me.filterImport();
    };

    //---------------------------------------------------------------
    me.dragmoveRightBrushHLine = function(d) {
        me.rightBrushData.y1 = me.rightBrushData.y1 + d3.event.dy;
        me.rightBrushData.y1 = Math.max(0, Math.min(me.graphheight, me.rightBrushData.y1));
        me.rightBrushData.hy2 = me.rightBrushData.hy2 + d3.event.dy;
        me.rightBrushData.hy2 = Math.max(0, Math.min(me.graphheight, me.rightBrushData.hy2));

        var xn, itemX, itemY, percentage;
        //get x values
        for(var lloopIndex = 0; lloopIndex < me.rightGraphData.length; lloopIndex++)
        {
            var lItem = me.rightGraphData[lloopIndex];
            var n = Math.abs(me.rightY(lloopIndex));
            if(n > me.rightBrushData.y1)
            {   xn = n;
                var index = lloopIndex-1;
                if((lloopIndex == me.rightGraphData.length - 2))
                    index = lloopIndex;

                itemY = me.rightY(index);
                percentage = me.rightGraphData[index]._Export_percent;
                itemX = me.rightX(me.rightGraphData[index]._Export_percent);
                break;
            }
        }
        if(!xn)
        {
            //The line is not in the range
            //set it to the last item
            itemY = me.rightY(me.rightGraphData.length - 1);
            percentage = me.rightGraphData[me.rightGraphData.length - 1]._Export_percent;
            itemX = me.rightX(me.rightGraphData[me.rightGraphData.length - 1]._Export_percent);
        }

        me.rightBrushData.x1 = itemX;
        me.rightBrushData.vx2 = itemX;

        percentage = percentage * 100;
        percentage = percentage.toFixed(1);
        me.showBrushToolTip(percentage + '%', lloopIndex, itemX + me.width/2, itemY + me.margin.top);
        me.adjustRightBrush();
        me.filterExport();
    };

    //---------------------------------------------------------------
    me.dragmoveLeftBrushHLine = function(d) {
        me.leftBrushData.y1 = me.leftBrushData.y1 + d3.event.dy;
        me.leftBrushData.y1 = Math.max(0, Math.min(me.graphheight, me.leftBrushData.y1));
        me.leftBrushData.hy2 = me.leftBrushData.hy2 + d3.event.dy;
        me.leftBrushData.hy2 = Math.max(0, Math.min(me.graphheight, me.leftBrushData.hy2));
        //me.adjustLeftBrush();

        var yn, itemX, itemY, percentage;
        //get y values
        for(var lloopIndex = 0; lloopIndex < me.leftGraphData.length; lloopIndex++)
        {
            var lItem = me.leftGraphData[lloopIndex];
            var n = me.leftY(lloopIndex);
            if(n > me.leftBrushData.y1)
            {   yn = n;
                var index = lloopIndex - 1;
                if(index < 0)
                    index = 0;


                itemY = me.leftY(index);
                percentage = me.leftGraphData[index]._Import_percent;
                itemX = me.leftX(me.leftGraphData[index]._Import_percent);
                break;
            }
        }
        if(!yn)
        {
            //The line is not in the range
            //set it to the last item
            itemY = me.leftY(me.leftGraphData.length - 1);
            percentage = me.leftGraphData[me.leftGraphData.length - 1]._Import_percent;
            itemX = me.leftX(me.leftGraphData[me.leftGraphData.length - 1]._Import_percent);
        }

        me.leftBrushData.x1 = itemX;
        //me.leftBrushData.y1 = itemY;
        me.leftBrushData.vx2 = itemX;
        //me.leftBrushData.hy2 = itemY;

        percentage = percentage * 100;
        percentage = percentage.toFixed(1);
        me.showBrushToolTip(percentage + '%', lloopIndex, itemX + me.margin.left, itemY + me.margin.top);
        //me.leftBrushData.y1 += (me.graphheight/25);
        //me.leftBrushData.hy2 += (me.graphheight/25);
        me.adjustLeftBrush();
        me.filterImport();
    };

    //---------------------------------------------------------------
    me.afterRightBrushVDragEnd = function(){
        var xn, itemX, itemY;
        me.hideBrushToolTip();
        //get x values
        for(var lloopIndex = 0; lloopIndex < me.rightGraphData.length; lloopIndex++)
        {
            var lItem = me.rightGraphData[lloopIndex];
            var n = Math.abs(me.rightX(lItem._Export_percent) - me.rightX(0));
            if(n > me.rightBrushData.x1)
            {   xn = n;
                var index = lloopIndex;// - 1;
                if(index < 0)
                    index = 0;

                itemY = me.rightY(index);
                itemX = me.rightX(me.rightGraphData[index]._Export_percent);
                break;
            }
        }
        if(!xn)
        {
            //The line is not in the range
            //set it to the last item
            itemY = me.rightY(me.rightGraphData.length - 1);
            itemX = me.rightX(me.rightGraphData[me.rightGraphData.length - 1]._Export_percent);
        }

        me.rightBrushData.x1 = itemX;
        me.rightBrushData.y1 = itemY;
        me.rightBrushData.vx2 = itemX;
        me.rightBrushData.hy2 = itemY;

        me.rightBrushData.y1 += (me.graphheight/25);
        me.rightBrushData.hy2 += (me.graphheight/25);
        me.adjustRightBrush();
        me.filterExport();
    };

    //---------------------------------------------------------------
    me.afterLeftBrushVDragEnd = function(){
        var xn, itemX, itemY;
        me.hideBrushToolTip();
        //get x values
        for(var lloopIndex = 0; lloopIndex < me.leftGraphData.length; lloopIndex++)
        {
            var lItem = me.leftGraphData[lloopIndex];
            var n = Math.abs(me.rightX(lItem._Import_percent) - me.leftX(0));
            if(n < me.leftBrushData.x1)
            {   xn = n;
                var index = lloopIndex;// - 1;
                if(index < 0)
                    index = 0;

                itemY = me.leftY(index);
                itemX = me.leftX(me.leftGraphData[index]._Import_percent);
                break;
            }
        }
        if(!xn)
        {
            //The line is not in the range
            //set it to the last item
            itemY = me.leftY(me.leftGraphData.length - 1);
            itemX = me.leftX(me.leftGraphData[me.leftGraphData.length - 1]._Import_percent);
        }

        me.leftBrushData.x1 = itemX;
        me.leftBrushData.y1 = itemY;
        me.leftBrushData.vx2 = itemX;
        me.leftBrushData.hy2 = itemY;

        me.leftBrushData.y1 += (me.graphheight/25);
        me.leftBrushData.hy2 += (me.graphheight/25);
        me.adjustLeftBrush();
        me.filterImport();
    };

    //---------------------------------------------------------------
    me.afterRightBrushHDragEnd = function(){
        var yn, itemX, itemY;
        me.hideBrushToolTip();
        //get y values
        for(var lloopIndex = 0; lloopIndex < me.rightGraphData.length; lloopIndex++)
        {
            var lItem = me.rightGraphData[lloopIndex];
            var n = me.rightY(lloopIndex);
            if(n > me.rightBrushData.y1)
            {   yn = n;
                var index = lloopIndex - 1;
                if(index < 0)
                    index = 0;

                itemY = me.rightY(index);
                itemX = me.rightX(me.rightGraphData[index]._Export_percent);
                break;
            }
        }
        if(!yn)
        {
            //The line is not in the range
            //set it to the last item
            itemY = me.rightY(me.rightGraphData.length - 1);
            itemX = me.rightX(me.rightGraphData[me.rightGraphData.length - 1]._Export_percent);
        }

        me.rightBrushData.x1 = itemX;
        me.rightBrushData.y1 = itemY;
        me.rightBrushData.vx2 = itemX;
        me.rightBrushData.hy2 = itemY;

        me.rightBrushData.y1 += (me.graphheight/25);
        me.rightBrushData.hy2 += (me.graphheight/25);
        me.adjustRightBrush();
        me.filterExport();
    };

    //---------------------------------------------------------------
    me.afterLeftBrushHDragEnd = function(){
        var yn, itemX, itemY;
        me.hideBrushToolTip();
        //get y values
        for(var lloopIndex = 0; lloopIndex < me.leftGraphData.length; lloopIndex++)
        {
            var lItem = me.leftGraphData[lloopIndex];
            var n = me.leftY(lloopIndex);
            if(n > me.leftBrushData.y1)
            {   yn = n;
                var index = lloopIndex - 1;
                if(index < 0)
                    index = 0;

                itemY = me.leftY(index);
                itemX = me.leftX(me.leftGraphData[index]._Import_percent);
                break;
            }
        }
        if(!yn)
        {
            //The line is not in the range
            //set it to the last item
            itemY = me.leftY(me.leftGraphData.length - 1);
            itemX = me.leftX(me.leftGraphData[me.leftGraphData.length - 1]._Import_percent);
        }

        me.leftBrushData.x1 = itemX;
        me.leftBrushData.y1 = itemY;
        me.leftBrushData.vx2 = itemX;
        me.leftBrushData.hy2 = itemY;

        me.leftBrushData.y1 += (me.graphheight/25);
        me.leftBrushData.hy2 += (me.graphheight/25);
        me.adjustLeftBrush();
        me.filterImport();
    };

    //---------------------------------------------------------------
    me.adjustRightBrush = function(){
        d3.select(".right-graph-v-line")
            .attr("x1", function(d){ return d.x1; })
            .attr("y1", function(d){ return d.y1; })
            .attr("x2", function(d){ return d.vx2; })
            .attr("y2", function(d){ return d.vy2; });

        d3.select(".right-graph-v-handle-line")
            .attr("x1", function(d){ return d.x1; })
            //.attr("y1", function(d){ return d.y1; })
            .attr("x2", function(d){ return d.vx2; });
            //.attr("y2", function(d){ return d.vy2; });

        d3.select(".right-graph-h-line")
            .attr("x1", function(d){ return d.x1; })
            .attr("y1", function(d){ return d.y1; })
            .attr("x2", function(d){ return d.hx2 + me.extraBrushExtension; })
            .attr("y2", function(d){ return d.hy2; });

        me.rightBrushStar
            .attr("x", function(d){ return d.x1 - me.brushStarEdgeSize/2; })
            .attr("y", function(d){ return d.y1 - me.brushStarEdgeSize/2; })
            .attr("transform", function(d){
                return "rotate(45 " + d.x1 + " " + d.y1 + ")";
            });
    };

    //---------------------------------------------------------------
    me.adjustLeftBrush = function(){
        d3.select(".left-graph-v-line")
            .attr("x1", function(d){ return d.x1; })
            .attr("y1", function(d){ return d.y1; })
            .attr("x2", function(d){ return d.vx2; })
            .attr("y2", function(d){ return d.vy2; });

        d3.select(".left-graph-v-handle-line")
            .attr("x1", function(d){ return d.x1; })
            .attr("x2", function(d){ return d.vx2; });

        d3.select(".left-graph-h-line")
            .attr("x1", function(d){ return d.x1; })
            .attr("y1", function(d){ return d.y1; })
            .attr("x2", function(d){ return d.hx2 - me.extraBrushExtension; })
            .attr("y2", function(d){ return d.hy2; });

        me.leftBrushStar
            .attr("x", function(d){ return d.x1 - me.brushStarEdgeSize/2; })
            .attr("y", function(d){ return d.y1 - me.brushStarEdgeSize/2; })
            .attr("transform", function(d){
                return "rotate(45 " + d.x1 + " " + d.y1 + ")";
            });
    };

    //---------------------------------------------------------------
    me.filterExport = function(){
        me.rightChartContainer.selectAll(".right-row-bars").each(function(d, i){
            var lBar = d3.select(this),
                yVal = me.rightY(i);
            if(me.rightBrushData.y1 <= (yVal + 1))
            {
                lBar.attr("fill", me.disabledBarColor)
            }
            else{
                lBar.attr("fill", me.rightChartColor)
            }
        });
    };

    //---------------------------------------------------------------
    me.filterImport = function(){
        me.leftChartContainer.selectAll(".left-row-bars").each(function(d, i){
            var lBar = d3.select(this),
                yVal = me.leftY(i);
            if(me.leftBrushData.y1 <= (yVal + 1))
            {
                lBar.attr("fill", me.disabledBarColor)
            }
            else{
                lBar.attr("fill", me.leftChartColor)
            }
        });
    };

    //---------------------------------------------------------------
    me.showToolTip = function(){
        var currHeight = me.tooltip.style("height").slice(0,-2);
        var height = $("#tooltip").height(),
            width = $("#tooltip").width();
        me.tooltip
            .style("top", (d3.event.pageY - height - 30) + "px")
            .style("left",(d3.event.pageX - width/2) + "px");
    };
    //---------------------------------------------------------------
    me.hideToolTip = function(){
        me.tooltip.style("visibility", "hidden")
    };

    //---------------------------------------------------------------
    me.onChartBarMouseHover = function(d){
        var lPercentageTxt = '';
        d3.select("#tooltip-country-name")
            .text(d.ptTitle);

        d3.select("#tooltip-partner-rank")
            .text(me.getFormattedRank(d.rank));

        var lNo,
            percent;
        if(d.type == "import")
        {
            lNo = d._Import_percent * 100;
            lNo = lNo.toFixed(1);
            percent = d.Import_percent;
            me.highlightImportCountry(this, d)
        }
        else if(d.type == "export")
        {
            lNo = d._Export_percent * 100;
            lNo = lNo.toFixed(1);
            percent = d.Export_percent;
            me.highlightExportCountry(this, d);
        }

        d3.select("#tooltip-country-percentage")
            .text(percent);
        d3.select("#tooltip-total-percentage")
            .text("(" + lNo + "%)");

        me.tooltip.style("visibility", "visible");
        me.showToolTip();
    };

    //---------------------------------------------------------------
    me.onChartBarMouseMove = function(){
        me.showToolTip();
    };

    //---------------------------------------------------------------
    me.onChartBarMouseOut = function(){
        d3.selectAll('.graph-highlighted-rect-hover').classed('graph-highlighted-rect-hover', false);
        me.hideToolTip();
    };

    //---------------------------------------------------------------
    me.showBrushToolTip = function(pPercentage, pPartnerCount, pBrushX, pBrushY){
        d3.select("#brushtip-percentage").text(pPercentage);
        d3.select("#brushtip-partners").text(pPartnerCount + " Partners");
        /*d3.select("#brush-tooltip-percentage").text(pPercentage);
        d3.select("#brush-tooltip-partner-count").text(pPartnerCount);*/
        var width = $("#brush-tooltip").height();
        d3.select("#brush-tooltip")
            .style('visibility', 'visible')
            .style('left', (pBrushX + width/2) + "px")
            .style('top', pBrushY + "px");
    };

    //---------------------------------------------------------------
    me.hideBrushToolTip = function(){
        d3.select("#brush-tooltip")
            .style('visibility', 'hidden');
    };

    //---------------------------------------------------------------
    me.getFormattedRank = function(pRank){
        if(pRank == 1)
        {
            return 'TOP PARTNER';
        }
        else if(pRank == 2)
        {
            return '2ND PARTNER';
        }
        else if(pRank == 3)
        {
            return '3RD PARTNER';
        }
        else{
            return pRank + 'TH PARTNER';
        }
    };

    //---------------------------------------------------------------
    me.highlightImportCountry = function(pImportCountryRectDomObj, importObjData){
        var lFound = false;
        d3.select(pImportCountryRectDomObj).classed('graph-highlighted-rect-hover', true);
        me.rightChartContainer.selectAll(".right-row-bars").each(function(d){
            if(d.ptTitle == importObjData.ptTitle)
            {
                d3.select(this).classed('graph-highlighted-rect-hover', true);
                lFound = true;
            }
        });

        if(! lFound)
        {
            //The country was not found in exports
            var txt = 'The hovered country ' + importObjData.ptTitle + ' was not found in Exports';
            me.displaySlideInHint(txt);
        }
    };

    //---------------------------------------------------------------
    me.highlightExportCountry = function(pExportCountryRectDomObj, exportObjData){
        var lFound = false;
        d3.select(pExportCountryRectDomObj).classed('graph-highlighted-rect-hover', true);
        me.leftChartContainer.selectAll(".left-row-bars").each(function(d){
            if(d.ptTitle == exportObjData.ptTitle)
            {
                d3.select(this).classed('graph-highlighted-rect-hover', true);
                lFound = true;
            }
        });

        if(! lFound)
        {
            //The country was not found in imports
            var txt = 'The hovered country ' + exportObjData.ptTitle + ' was not found in Imports';
            me.displaySlideInHint(txt);
        }
    };

    //---------------------------------------------------------------
    me.onChartBarClick = function(d){
        var LData = [],
            caption;

        //$("#tbl-cntnr").show();
        if(d.type == "import")
        {
            LData = me.dataMgr.partnerImportData.getData(d.rtTitle, d.ptTitle);
            caption = '<p>Commodity breakdown of import from <span class="tbl-hdr-pt">' + d.ptTitle + '</span> to <span class="tbl-hdr-rt">' + d.rtTitle + '</span></p><p class="tbl-hdr-subtext">'+ d.yr+' | By SITC Rev. 4</p>';

            if(! me.dataTable){
                    me.createTable(LData);
            }
                else{
                    me.loadTable(LData);
            }
        }
        else if(d.type == "export")
        {
            LData = me.dataMgr.partnerExportData.getData(d.rtTitle, d.ptTitle);
            caption = 'Commodity breakdown of export from <span class="tbl-hdr-rt">' + d.rtTitle + '</span> to <span class="tbl-hdr-pt">' + d.ptTitle + '</span></p><p class="tbl-hdr-subtext">'+ d.yr+' | By SITC Rev. 4</p>';

            if(! me.dataTable){
                me.createTable(LData);
            }
            else{
                me.loadTable(LData);
            }
        }

        $("#" + me.tableDiv).jqGrid('setCaption', caption);
        me.modalForm.open();

    };

    //---------------------------------------------------------------
    me.createTable = function(pTableData){
        me.dataTable = $("#" + me.tableDiv).jqGrid({
            datatype: "local",
            data : pTableData,
            colNames: [
                'Commodity Name',
                'Value'
            ],
            colModel: [
                {name: 'cmdDescE', index: 'commodityName', title: false, width: 400},
                {name: '_Value', index: 'value',title: false, width: 100, sorttype : me.myCustomCurrencySort, formatter:me.currencyFmatter}
            ],
            gridview: true,
            rownumbers: false,
//            rowNum: LData.length,
            rowNum: 100,
//            rowList: [5, 10, 15],
//            pager: 'pager',
            sortname: '_Value',
            sortorder: 'desc',
            //sortname: 'VALUE',
            loadonce: false,
            viewrecords: true,
            cellLayout: 100,
//            caption: 'Preserving Selection on Client-side sorting',
            height: 350,
            onSelectRow: function() {
                return false;
            },
            beforeSelectRow: function() {
                return false;
            },
            onSortCol: function () {
                //saveSelectedRow.call(this);
            },
            loadComplete: function () {
                //selectSavedRow.call(this);
            }
        });


//        cm = me.dataTable.getGridParam("colModel")[1];
//        cm.sorttype = me.myCustomCurrencySort;
    };

    //---------------------------------------------------------------
    me.currencyFmatter = function(cellvalue, options, rowObject){
        rowObject._val = cellvalue;
        var num = me.currencyFormatter(cellvalue);
        return '<table width="100%"><tr><td align="left">$</td><td style="text-align : right">' + num + '</td></tr></table>';
    };

    //---------------------------------------------------------------
    me.myCustomCurrencySort = function(cell,rowObject) {
        var val = cell;
        return val;
    };

    //---------------------------------------------------------------
    me.loadTable = function(p_Data){
        $("#" + me.tableDiv).clearGridData();
        $("#" + me.tableDiv).jqGrid('setGridParam',{data:p_Data}).trigger("reloadGrid")
    };

    //---------------------------------------------------------------
    //---------------------------------------------------------------
    me.displaySlideInHint = function(p_Text){
        var LAppHint = d3.select(".app-slide-in-hint");
        LAppHint.text(p_Text);

        var LScreenWd = $(window).width(),
            LHintWd = $(".app-slide-in-hint").width(),
            LHintLeft = LScreenWd/2 - LHintWd/2;

        LAppHint
            .style("display", "block")
            .style("top", "-50px")
            .style("left", LHintLeft + "px");
        LAppHint.transition().duration(1000).style("top", "20px");

        if(me.hintTimer)
        {
            //The timer was already started and hasn't finished yet
            window.clearTimeout(me.hintTimer);
            me.hintTimer = null;
        }

        me.hintTimer = setTimeout(function(){
            LAppHint.transition().duration(1000).style("display", "none");
        }, 2500);
    };

    //---------------------------------------------------------------
    me.setHerfindahlValues = function(pCountry){
        var lHerfindahlIndexRec = me.dataMgr.getHerfindahlIndexForCountry(pCountry);
        var txt = 'Herfindahl Index = ';
        me.herfindahlIndexExportTxt.text(txt +  lHerfindahlIndexRec.Exports);
        me.herfindahlIndexImportTxt.text(txt +  lHerfindahlIndexRec.Imports);
    };

    //---------------------------------------------------------------

    //construct the object and return the new object
    me.constructor(p_Config);
    return me;
}
