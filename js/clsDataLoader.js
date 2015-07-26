function clsDataLoader(p_Config){
    var me = this;
    me.dataFileName = '';
    me.herfindahlIndexFileName = '';
    me.importDetailsFileName = '';
    me.exportDetailsFileName = '';
    me.data = [];
    me.recordCount = 10;

    me.crossfilteredData = null;
    me.importDimension = null;
    me.exportDimension = null;
    me.importsGraphFilterFn = null;
    me.exportsGraphFilterFn = null;

    //---------------------------------------------------------------
    me.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            me[p_Name] = LValue;
        }
    };

    //---------------------------------------------------------------
    me.loadData = function(pCallBackFn){
        //load the data
        d3.csv(me.dataFileName, function(pData){
            //The file is loaded
            me.data = pData;
            me.crossfilteredData = crossfilter(me.data);
            me.importDimension = me.crossfilteredData.dimension(function(d){
                if(d.Import_percent == "NULL")
                    d.Import_percent = 0;
                else
                    d.Import_percent = parseFloat(d.Import_percent);

                return d.Import_percent;
            });
            me.exportDimension = me.crossfilteredData.dimension(function(d){
                if(d.Export_percent == "NULL")
                    d.Export_percent = 0;
                else
                    d.Export_percent = parseFloat(d.Export_percent);

                return d.Export_percent;
            });

            me.partnerCodeDimesion = me.crossfilteredData.dimension(function(d){ return d.ptCode; });
            me.countryDimesion = me.crossfilteredData.dimension(function(d){ return d.rtTitle; });
            me.countryGroup = me.countryDimesion.group();
            me.applyFilters();
            pCallBackFn(me.data);
        });
    };

    //---------------------------------------------------------------
    me.applyFilters = function(){
        if(me.importsGraphFilterFn)
            me.importDimension.filter(me.importsGraphFilterFn);
        if(me.exportsGraphFilterFn)
            me.exportDimension.filter(me.exportsGraphFilterFn);

        me.partnerCodeDimesion.filter(function(d){
            return d != 0;
        });
    };

    //---------------------------------------------------------------
    me.getExportRecords = function(){
        return me.exportDimension.top(me.recordCount);
    };

    //---------------------------------------------------------------
    me.getImportRecords = function(){
        return me.importDimension.top(me.recordCount);
    };

    //---------------------------------------------------------------
    me.getCountries = function(){
        return me.countryGroup.top(Infinity);
    };
    //---------------------------------------------------------------
    me.changeCountry = function(pCountryName){
        me.countryDimesion.filter(pCountryName);
    };



    //---------------------------------------------------------------

    //construct the object and return the new object
    me.constructor(p_Config);
    return me;
}
