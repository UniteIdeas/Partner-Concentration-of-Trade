function clsCountryChart(p_Config){
    var me = this;
    me.renderTo = '';
    me.width = 500;
    me.height = 300;
    me.margin = {
        top : 10,
        right : 10,
        bottom : 10,
        left : 20
    };

    me.dimension = null;
    me.group = null;
    me.sortByNameBtnId = '';
    me.sortByCountBtnId = '';

    me.chartReady = false;

    //---------------------------------------------------------------
    me.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            me[p_Name] = LValue;
        }

        me.drawGraph();
    };

    //---------------------------------------------------------------
    me.drawGraph = function(){
        me.rowChart = dc.rowChart("#" + me.renderTo);
        me.rowChart.width(me.width)
            .height(me.height)
            .dimension(me.dimension)
            .group(me.group)
            .renderLabel(true)
            .title(function (d) {
                return d.value;
            })
            .margins(me.margin)
            //.ordinalColors(['#F7931E'])
            .label(function (d) {
                return d.key + " " + "(" + d.value + ")";
            })
            .ordering(function(d){
                return 1- d.value
            })
            .renderlet(function(chart){
                chart.selectAll(".dc-chart g.row")
                    .on("mouseover", function(d){
                    })
                    .on("click", function(d){
                        me.selectCountry(d.key);
                    });
            })
            .labelOffsetY(10)
            .labelOffsetX(3)
            //.gap(10)
            .elasticX(true)
            .xAxis()
            .ticks(0);

        me.chartReady = true;

        /*me.rowChart.on("filtered", function (chart, filter) {
            dc.events.trigger(function () {
                //me.rowChart.filter(chart.filter());
            });
        });*/

        //dc.renderAll();
        /*me.rowChart.on("filtered", function(chart, filter){
            //update the filter count
            alert(' filtered -- ' + filter);
        });*/

        me.rowChart.render();

        me.rowChart.on("postRender", function(chart){
            me.sortByRecordCount();
        });

        if(me.sortByNameBtnId)
        {
            d3.select("#" + me.sortByNameBtnId).on('click', function(){
                me.sortByName();
            });
        }

        if(me.sortByCountBtnId)
        {
            d3.select("#" + me.sortByCountBtnId).on('click', function(){
                me.sortByRecordCount();
            });
        }


    };

    //---------------------------------------------------------------
    me.selectCountry = function(pCountry, pTriggerEvent){
        if(! me.chartReady){
            return;
        }

        me.rowChart.filterAll();
        me.rowChart.filter(pCountry);
        //redraw the chart
        me.rowChart.redraw();
        if(me.onCountrySelect && (pTriggerEvent!== false)){
            me.onCountrySelect(pCountry);
        }
    };

    //---------------------------------------------------------------
    me.sortByRecordCount = function(){
        me.rowChart.ordering(function(d){
            return 1/d.value;
        });
        me.rowChart.redraw();

        if(me.sortByNameBtnId)
            d3.select("#" + me.sortByNameBtnId).classed("filter-btn-selected", false);

        if(me.sortByCountBtnId)
            d3.select("#" + me.sortByCountBtnId).classed("filter-btn-selected", true);
    };

    //---------------------------------------------------------------
    me.sortByName = function(){
        me.rowChart.ordering(function(d){
            return d.key;
        });
        me.rowChart.redraw();
        if(me.sortByNameBtnId)
            d3.select("#" + me.sortByNameBtnId).classed("filter-btn-selected", true);

        if(me.sortByCountBtnId)
            d3.select("#" + me.sortByCountBtnId).classed("filter-btn-selected", false);
    };

    //---------------------------------------------------------------
    me.getFirstCountry = function(){
        var lTop = me.group.top(1)[0];
        return lTop.key;
    };

    //---------------------------------------------------------------

    //construct the object and return the new object
    me.constructor(p_Config);
    return me;
}
