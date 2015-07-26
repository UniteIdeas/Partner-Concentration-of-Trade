/**
 * Created with JetBrains WebStorm.
 * User: Digvijay.Upadhyay
 * Date: 2/6/14
 * Time: 1:18 PM
 * To change this template use File | Settings | File Templates.
 */
function clsDataMgr(p_Config){
    var me = this;

    me.dataFileName = '';
    me.herfindahlIndexFileName = '';
    me.importDetailsFileName = '';
    me.exportDetailsFileName = '';

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
            var LTradeValue  = null;
            LTradeValue = p_Config[p_Name];
            me[p_Name] = LTradeValue;
        }
    };

    //---------------------------------------------------------------
    me.loadData = function(pCallBackFn){
        function l_CheckIfAllFilesAreLoaded(){

            //console.log(me.partnerExportData.getData());
            /*console.log('all loaded??', me.importExportData.fileLoaded &&
                me.herfindahlData.fileLoaded &&
                me.partnerExportData.fileLoaded &&
                me.partnerImportData.fileLoaded);*/
            if(
                me.importExportData.fileLoaded &&
                me.herfindahlData.fileLoaded &&
                me.partnerExportData.fileLoaded &&
                me.partnerImportData.fileLoaded
            ){
                //All files are loaded
                pCallBackFn();
            }
        }
        me.loadImportExportData(l_CheckIfAllFilesAreLoaded);
        me.loadHerfindahlDataFile(l_CheckIfAllFilesAreLoaded);
        me.loadPartnerExportsDataFile(l_CheckIfAllFilesAreLoaded);
        me.loadPartnerImportsDataFile(l_CheckIfAllFilesAreLoaded);
    };

    //---------------------------------------------------------------
    me.loadImportExportData = function(pCallBackFn){
        var lConfig = {
            url : me.dataFileName
        };

        me.importExportData = new clsFileLoader(lConfig);
        me.importExportData.loadData(function(pData){

            //create cross filter dimensions
            me.importExportData.crossfilteredData = crossfilter(me.importExportData.data);
            me.importExportData.importDimension = me.importExportData.crossfilteredData.dimension(function(d){
                if(d.Import_percent == "NULL")
                    d.Import_percent = 0;
                else
                    d.Import_percent = parseFloat(d.Import_percent);

                return d.Import_percent;
            });
            me.importExportData.exportDimension = me.importExportData.crossfilteredData.dimension(function(d){
                if(d.Export_percent == "NULL")
                    d.Export_percent = 0;
                else
                    d.Export_percent = parseFloat(d.Export_percent);

                return d.Export_percent;
            });

            me.importExportData.partnerCodeDimesion = me.importExportData.crossfilteredData.dimension(function(d){ return d.ptCode; });
            me.importExportData.countryDimesion = me.importExportData.crossfilteredData.dimension(function(d){ return d.rtTitle; });
            me.importExportData.countryGroup = me.importExportData.countryDimesion.group();

            me.importExportData.getExportRecords = function(){
                return me.importExportData.exportDimension.top(me.recordCount);
            };

            me.importExportData.getImportRecords = function(){
                return me.importExportData.importDimension.top(me.recordCount);
            };

            me.importExportData.getCountries = function(){
                return me.importExportData.countryGroup.top(Infinity);
            };

            me.importExportData.changeCountry = function(pCountryName){
                me.importExportData.countryDimesion.filter(pCountryName);
            };

            me.importExportData.partnerCodeDimesion.filter(function(d){
                return d != 0;
            });

            pCallBackFn(me.data);
        });
    };

    //---------------------------------------------------------------
    me.loadHerfindahlDataFile = function(pCallBack){
        var lConfig = {
            url : me.herfindahlIndexFileName
        };

        me.herfindahlData = new clsFileLoader(lConfig);
        me.herfindahlData.loadData(function(pData){
            pCallBack(pData);
            var crossfilterData = [];
            for(var lloopIndex = 0; lloopIndex < pData.length; lloopIndex++){
                var item = pData[lloopIndex];
                for(var lloopIndex1 = 0; lloopIndex1 < item.Demand; lloopIndex1++){
                    var cfrec = {
                        rtTitle : item.rtTitle
                    };
                    crossfilterData.push(cfrec);
                }
            }
            me.herfindahlData.crossfilteredData = crossfilter(crossfilterData);
            me.herfindahlData.countryDimesion = me.herfindahlData.crossfilteredData.dimension(function(d){ return d.rtTitle; });
            me.herfindahlData.countryGroup = me.herfindahlData.countryDimesion.group();
        });
    };

    //---------------------------------------------------------------
    me.loadPartnerExportsDataFile = function(pCallBack){
        var lConfig = {
            url : me.exportDetailsFileName
        };

        me.partnerExportData = new clsFileLoader(lConfig);
        me.partnerExportData.loadData(function(pData){
            for(var lloopIndex = 0 ; lloopIndex < pData.length; lloopIndex++){
                var currency = pData[lloopIndex].TradeValue;
                pData[lloopIndex]._Value = Number(currency.replace(/[^0-9\.]+/g,""));
            }
            me.partnerExportData.crossfilteredData =  crossfilter(pData);
            me.partnerExportData.partnerIndDim = me.partnerExportData.crossfilteredData.dimension(function(d){ return d.ptTitle; });
            me.partnerExportData.reporterIndDim = me.partnerExportData.crossfilteredData.dimension(function(d){ return d.rtTitle; });

            me.partnerExportData.getData = function(pReporter, pPartner){

                me.partnerExportData.partnerIndDim.filter(pPartner);
                me.partnerExportData.reporterIndDim.filter(pReporter);
                var data = me.partnerExportData.reporterIndDim.top(Infinity);

                //sort the data, largest no on top
                data.sort(function(a,b){return 1/(a._Value- b._Value); });
                return data;
            };
            pCallBack(pData);
        });
    };

    //---------------------------------------------------------------
    me.loadPartnerImportsDataFile = function(pCallBack){
        var lConfig = {
            url : me.importDetailsFileName
        };

        me.partnerImportData = new clsFileLoader(lConfig);
        me.partnerImportData.loadData(function(pData){
            for(var lloopIndex = 0 ; lloopIndex < pData.length; lloopIndex++){
                var currency = pData[lloopIndex].TradeValue;
                pData[lloopIndex]._Value = Number(currency.replace(/[^0-9\.]+/g,""));
            }

            me.partnerImportData.crossfilteredData =  crossfilter(pData);
            me.partnerImportData.partnerIndDim = me.partnerImportData.crossfilteredData.dimension(function(d){ return d.ptTitle; });
            me.partnerImportData.reporterIndDim = me.partnerImportData.crossfilteredData.dimension(function(d){ return d.rtTitle; });

            me.partnerImportData.getData = function(pReporterIndicator, pPartnerIndicator){
                me.partnerImportData.partnerIndDim.filter(pPartnerIndicator);
                me.partnerImportData.reporterIndDim.filter(pReporterIndicator);

                var data = me.partnerImportData.reporterIndDim.top(Infinity);
                //sort the data, largest no on top
                data.sort(function(a,b){return 1/(a._Value- b._Value); });
                return data;
            };

            pCallBack(pData);
        });
    };

    //---------------------------------------------------------------

    me.getHerfindahlIndexForCountry = function(pCountryName){
        for(var lloopIndex = 0; lloopIndex < me.herfindahlData.data.length; lloopIndex++){
            var item = me.herfindahlData.data[lloopIndex];
            if(pCountryName == item.rtTitle)
                return item;
        }
    };

    //---------------------------------------------------------------

    //construct the object and return the new object
    me.constructor(p_Config);
    return me;
}
