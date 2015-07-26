/**
 * Created with JetBrains WebStorm.
 * User: Digvijay.Upadhyay
 * Date: 2/6/14
 * Time: 1:18 PM
 * To change this template use File | Settings | File Templates.
 */
function clsFileLoader(p_Config){
    var me = this;
    me.url = '';
    me.data = [];
    //event on will be triggered after the event has been loaded
    me.onLoadData = null;
    me.fileLoaded = false;

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
        me.onLoadData = pCallBackFn;
        me.fileLoaded = false;
        //load the data
        d3.csv(me.url, function(pData){
            //The file is loaded
            me.data = pData;
            me.fileLoaded = true;
            if(me.onLoadData)
                me.onLoadData(me.data);
        });
    };

    //---------------------------------------------------------------
    me.getData = function(){
        return me.data;
    };

    //---------------------------------------------------------------

    //construct the object and return the new object
    me.constructor(p_Config);
    return me;
}