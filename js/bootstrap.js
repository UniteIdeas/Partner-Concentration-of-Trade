/**
 * Created with JetBrains WebStorm.
 * User: Digvijay.Upadhyay
 * Date: 1/14/14
 * Time: 12:34 PM
 * To change this template use File | Settings | File Templates.
 */

var gSettings = {
    noOfPartners : 25
};

var gEnviornmentIsReady = false;

var gObjects = {};

function bootstrap(){

    showMask();

    var lGraphConfig = {
            renderTo : 'partner-conc-chart',
            width : 800,
            height : 500,
            tableDiv : 'details-table-container',
            margin : {
                top : 50,
                right : 70,
                bottom : 80,
                left : 70
            }
        },
        lDataLoaderConfig = {
            dataFileName : 'data/Yearbook2013DataForHerfindahl_percent.csv',
            herfindahlIndexFileName : 'data/Yearbook2012HerfindahlIndices.csv',
            importDetailsFileName : 'data/2013_SITC4_By_Partner-Import.csv',
            exportDetailsFileName : 'data/2013_SITC4_By_Partner-Export.csv',
            recordCount : gSettings.noOfPartners
        };

    var lDataLoader = new clsDataMgr(lDataLoaderConfig);
    gObjects.dataloader = lDataLoader;

    //load the data
    lDataLoader.loadData(function(pData){
        //Create country selector chart
        var countriesChart = new clsCountryChart({
            width : 240,
            height : 2500,
            renderTo : 'country-chart',
            dimension : lDataLoader.herfindahlData.countryDimesion,
            group : lDataLoader.herfindahlData.countryGroup,
            onCountrySelect : handleOnCountrySelect,
            sortByNameBtnId : 'mission-sort-by-name',
            sortByCountBtnId : 'mission-sort-by-demand'
        });



        gObjects.countriesChart = countriesChart;

        /*var lCountries = lDataLoader.importExportData.getCountries();
        d3.select("#country-selector").selectAll("*").remove();
        for(var lloopIndex = 0; lloopIndex < lCountries.length; lloopIndex++)
        {
            var item = lCountries[lloopIndex];
            d3.select("#country-selector").append("option")
                .text(item.key)
                .attr("value", item.key);
        }

        //sort the combobox items
        $("#country-selector").html($("#country-selector option").sort(function (a, b) {
            return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
        }));*/


        window.onhashchange = handleOnHashChange;
        //get selected country
        //var combo = document.getElementById("country-selector");
        //handleOnHashChange();
        //var selectedCountry = combo.options[combo.selectedIndex].value;

        var hashURL = location.hash,
            countryStr = hashURL.slice(1);

        var selectedCountry = '';
        if(hashURL.length > 2){
            selectedCountry = countryStr;
        }
        else{
            selectedCountry = gObjects.countriesChart.getFirstCountry();
        }


        //set the country
        lDataLoader.importExportData.changeCountry(selectedCountry);
        d3.select("#slected-country-name").text(selectedCountry);

        //draw chart for selected country
        lGraphConfig.leftGraphData = lDataLoader.importExportData.getImportRecords();
        lGraphConfig.rightGraphData = lDataLoader.importExportData.getExportRecords();
        lGraphConfig.dataMgr = lDataLoader;

        var modalForm = new clsTableWindow({
            modal : $('#modal'),
            overlay : $('#overlay'),
            closeCmp : $('#close')
        });
//        modalForm.close();
        lGraphConfig.modalForm = modalForm;

        var lChart = new clsPartnerConcentrationChart(lGraphConfig);
        gObjects.chart = lChart;
        lChart.draw(selectedCountry);
        gObjects.countriesChart.selectCountry(selectedCountry, false);

        hideMask();

        //bind on change of the combo
        /*d3.select("#country-selector")
            .on("change", function(d){
                //get selected country
                var combo = document.getElementById("country-selector"),
                    selectedCountry = combo.options[combo.selectedIndex].value;
                d3.select("#slected-country-name").text(selectedCountry);
                //set the URL location
                location.hash = "#" + selectedCountry;
                showChartForCountry(selectedCountry);
            });
        gEnviornmentIsReady = true;*/
        gEnviornmentIsReady = true;
    });
}

//---------------------------------------------------------------
function showChartForCountry(pCountry){
    d3.select("#slected-country-name").text(pCountry);
    gObjects.dataloader.importExportData.changeCountry(pCountry);
    //update the chart
    gObjects.chart.update(
                          gObjects.dataloader.importExportData.getImportRecords(),
                          gObjects.dataloader.importExportData.getExportRecords(),
                          pCountry
                         );
}

//---------------------------------------------------------------
function handleOnCountrySelect(pCountry){
    location.hash = "#" + pCountry;
    //the chart will get loaded automatically
    //after changing the hash
    showChartForCountry(pCountry);
}

//---------------------------------------------------------------
function showMask(){
    d3.select("#screen-mask").style("display", "block");
}

//---------------------------------------------------------------
function hideMask(){
    d3.select("#screen-mask").style("display", "none");
}

//---------------------------------------------------------------
function handleOnHashChange(){
    /*//get selected country
    var combo = document.getElementById("country-selector");*/

    //get the hash part of the URL
    var hashURL = location.hash,
        countryStr = hashURL.slice(1);

    /*if(hashURL.length < 2)
    {
        //There is no hash URL presend
        combo.selectedIndex = 0;
    }
    else{
        //there is some value in the hash url
        var lFound = false;
        for(var lloopIndex = 0; lloopIndex < combo.options.length; lloopIndex++)
        {
            if(combo.options[lloopIndex].value == countryStr)
            {
                combo.selectedIndex = lloopIndex;
                lFound = true;
            }
        }
        if(lFound == false){
            combo.selectedIndex = 0;
        }

    }*/

    if(! gEnviornmentIsReady)
    {
        return;
    }
    showChartForCountry(countryStr);
    gObjects.countriesChart.selectCountry(countryStr, false);
}

var modal = (function(){
    var
        method = {},
        $overlay,
        $modal,
        $content,
        $close;

    // Append the HTML

    // Center the modal in the viewport
    method.center = function () {
        var top, left;

        top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
        left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;

        $modal.css({
            top:top + $(window).scrollTop(),
            left:left + $(window).scrollLeft()
        });
    };

    // Open the modal
    method.open = function (settings) {
        $content.empty().append(settings.content);

        $modal.css({
            width: settings.width || 'auto',
            height: settings.height || 'auto'
        })

        method.center();

        $(window).bind('resize.modal', method.center);

        $modal.show();
        $overlay.show();
    };

    // Close the modal
    method.close = function () {
        $modal.hide();
        $overlay.hide();
        $content.empty();
        $(window).unbind('resize.modal');
    };

    return method;
}());

//---------------------------------------------------------------