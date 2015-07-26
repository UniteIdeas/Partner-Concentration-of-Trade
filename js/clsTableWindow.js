/**
 * Created with JetBrains WebStorm.
 * User: Digvijay.Upadhyay
 * Date: 2/25/14
 * Time: 5:44 PM
 * To change this template use File | Settings | File Templates.
 */
function clsTableWindow(p_Config){
    var me = this;

    me.modal = null;
    me.overlay = null;
    me.closeCmp = null;
    //---------------------------------------------------------------
    me.constructor = function(p_Config){
        //Assign the configuration attributes
        for (p_Name in p_Config)
        {
            var LValue = null;
            LValue = p_Config[p_Name];
            me[p_Name] = LValue;
        }

        me.closeCmp.click(function(e){
            e.preventDefault();
            me.close();
        });

        me.overlay.click(function(e){
            e.preventDefault();
            me.close();
        });
    };

    //---------------------------------------------------------------
    me.center = function(){
        var top, left;
        top = Math.max($(window).height() - me.modal.outerHeight(), 0) / 2;
        left = Math.max($(window).width() - me.modal.outerWidth(), 0) / 2;
        /*me.modal.css({
            top:top + $(window).scrollTop(),
            left:left + $(window).scrollLeft()
        });*/
        me.modal.css({
            top:top,
            left:left
        });
    };


    //---------------------------------------------------------------
    me.open = function(){
       /* me.modal.css({
            width: settings.width || 'auto',
            height: settings.height || 'auto'
        });*/

        me.center();

        $(window).bind('resize.modal', me.center);

        me.modal.show();
        me.overlay.show();
    };

    //---------------------------------------------------------------
    me.close = function () {
        me.modal.hide();
        me.overlay.hide();
        $(window).unbind('resize.modal');
    };

    //---------------------------------------------------------------

    //construct the object and return the new object
    me.constructor(p_Config);
    return me;
}
