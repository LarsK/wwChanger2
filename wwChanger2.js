'use strict';
/**
* jQuery.wwChanger2
* Picture changer plugin with basic settings. It is kept minimalistic on purpose - every customization
* should be done by using the given methods and callbacks of the plugin (every callback returns full
* settings of the plugin).
*/

/**
* Picture changer plugin
*/
$.wwChanger2 = function(element, options){

    // Plugin defaults
    var defaults = {

        // Pictures
        pics : [],

        // Automatically change pics
        anim : true,

        // Time in milliseconds a picture is shown
        animTime : 2500,

        // Time in milliseconds a picture is faded out
        animEffectTime : 1500,

        // Current picture index
        currentPic : 0,

        width : 0,

        height : 0,

        animEffect : 'fade',

        customAnimShow : {},

        customAnimHide : {},

        // Callback when initialising the plugin
        onInit : function() {},

        // Callback when pic changes
        onChange : function() {},

        // Callback when pause / play button is clicked
        onPausePlay : function() {},

        // Callback when plugin is destroyed
        onDestroy : function() {}

    };

    // Store reference to current instance of object
    var plugin = this;

    // Merged defaults and options
    plugin.settings = {};

    // Reference to the jQuery version of DOM element
    var $element = $(element);

    // Figures
    var fig = [];

    // Timeout for animation
    var timeout;

    /**
      * Private method to initialize plugin (will be called immediately when the
      * object is created)
      */
    var init = function(){

        // Merge defaults and options
        plugin.settings = $.extend({}, defaults, options);

        // If there is only one pic (or none at all) it makes no sense to init a pic changer...
        if(plugin.settings.pics.length > 1) {

            // Get figure in plugin element
            fig[0] = $element.find('figure');

            // Set height of plugin element to height of image
            $element.height(fig[0].find('img').height());

            plugin.settings.width = $element.width();
            plugin.settings.height = $element.height();

            var transition = transitions[plugin.settings.animEffect];
            if ($.isFunction(transition)){
                transition();
            }

            // Create second figure (clone from original figure)
            fig[1] = fig[0].clone();

            // Set z-index of cloned figure one less than original figure so the clone is hidden
            fig[1].css({
                zIndex : (parseInt(fig[0].css('z-index'))-1)
            });

            // Set image of cloned figure to second pic
            fig[1].find('img').attr('src', plugin.settings.pics[1]);

            // Append cloned figure to plugin element
            $element.append(fig[1]);

            // Check if animation is enabled
            if(plugin.settings.anim === true){

                // Start animation
                timeout = setTimeout(function(){
                    plugin.next(true);
                }, plugin.settings.animTime);

            }

            // Callback that plugin is initialized
            plugin.settings.onInit(plugin.settings);

        }

    };

    // Transition examples. Feel free to add/remove transitions as you like,
    var transitions = {
        fade : function(){
            plugin.settings.animShow = {opacity : 0};
            plugin.settings.animHide = {opacity : 1};
        },
        slideLeft : function(){
            plugin.settings.animShow = {left : -plugin.settings.width};
            plugin.settings.animHide = {left : 0};
        },
        slideRight : function(){
            plugin.settings.animShow = {left : plugin.settings.width};
            plugin.settings.animHide = {left : 0};
        },
        slideTop : function(){
            plugin.settings.animShow = {top : -plugin.settings.height};
            plugin.settings.animHide = {top : 0};
        },
        slideBottom : function(){
            plugin.settings.animShow = {top : plugin.settings.height};
            plugin.settings.animHide = {top : 0};
        },
        slideTopLeft : function(){
            plugin.settings.animShow = {top : plugin.settings.height, left : -plugin.settings.width};
            plugin.settings.animHide = {top : 0, left : 0};
        },
        shrinkLeft : function(){
            plugin.settings.animShow = {width : 0};
            plugin.settings.animHide = {width : plugin.settings.width};
        },
        shrinkTopLeft : function(){
            plugin.settings.animShow = {width : 0, height : 0};
            plugin.settings.animHide = {width : plugin.settings.width, height : plugin.settings.height};
        },
        shrinkCenter : function(){
            plugin.settings.animShow = {width : 0, height : 0, margin: (plugin.settings.height/2)+'px 0 0 '+(plugin.settings.width/2)};
            plugin.settings.animHide = {width : plugin.settings.width, height : plugin.settings.height, margin : 0};
        },
        custom : function(){
            plugin.settings.animShow = plugin.settings.customAnimShow;
            plugin.settings.animHide = plugin.settings.customAnimHide;
        }
    };

    // Toggle animation mode
    plugin.toggleAnimation = function(anim){

        // Clear animation timeout
        clearTimeout(timeout);

        // If no animation mode specified toggle current mode
        if(typeof anim === 'undefined'){
            anim = !plugin.settings.anim;
        }

        // Toggle animation settings status
        plugin.settings.anim = anim;//!plugin.settings.anim;

        // Callback that animation mode changed
        plugin.settings.onPausePlay(plugin.settings);

        // If animation is active...
        if(plugin.settings.anim === true){

            // Start animation with current pic
            plugin.show(plugin.settings.currentPic);

        }

        return plugin;

    };

    // Set pointer to previous pic
    // @param Boolean if animation should be continued
    plugin.prev = function(continueAnimation) {

        // Set animation settings
        plugin.settings.anim = continueAnimation;

        // Callback that animation mode changed
        plugin.settings.onPausePlay(plugin.settings);

        // Set current pic -1
        plugin.settings.currentPic--;

        // Show current pic
        plugin.show(plugin.settings.currentPic);

        return plugin;

    };

    // Set pointer to next pic
    // @param Boolean if animation should be continued
    plugin.next = function(continueAnimation) {

        // Set animation settings
        plugin.settings.anim = continueAnimation;

        // Callback that animation mode changed
        plugin.settings.onPausePlay(plugin.settings);

        // Set current pic +1
        plugin.settings.currentPic++;

        // Show current pic
        plugin.show(plugin.settings.currentPic);

        return plugin;

    };

    // Show pic
    // @param Integer pic index
    plugin.show = function(i){

        // Set current pic
        plugin.settings.currentPic = i;

        // If current pic index is out of bounds...
        if (plugin.settings.currentPic < 0) {

            // ... set to last pic
            plugin.settings.currentPic = plugin.settings.pics.length - 1;

        }
        else if(plugin.settings.currentPic >= plugin.settings.pics.length) {

            // ... set to first pic
            plugin.settings.currentPic = 0;

        }

        // Clear animation timeout
        clearTimeout(timeout);

        // Placeholders for fig[0] and fig[1]
        var fig1, fig2;

        // Variable for new zIndex of cloned figure
        var zIndex;

        // Check which figure is on top
        if(parseInt(fig[0].css('z-index')) > parseInt(fig[1].css('z-index'))){
            fig1 = fig[0];
            fig2 = fig[1];
            zIndex = parseInt(fig1.css('z-index')) + 1;
        }
        else{
            fig1 = fig[1];
            fig2 = fig[0];
            zIndex = parseInt(fig2.css('z-index')) - 1;
        }

        // Set img source of cloned figure
        fig2.find('img').attr({
            src : plugin.settings.pics[plugin.settings.currentPic]
        });

        fig2.css(plugin.settings.animHide);

        // If slideshow is active
        if(plugin.settings.anim === true) {

            // Animate original figure
            fig1.animate(plugin.settings.animShow,plugin.settings.animEffectTime, function(){

                // Callback that pic has changed
                plugin.settings.onChange(plugin.settings);

                // Set z-index of cloned figure above original figure
                fig[1].css({
                    zIndex : zIndex
                });

                // Show original figure (due to the lower z-index it is still hidden behind the cloned figure)
                $(this).show();

                // Continue animation
                timeout = setTimeout(function(){

                    // Check again for animation mode (maybe it has changed since the timeout was initialized)
                    if(plugin.settings.anim){
                        plugin.next(true);
                    }

                },plugin.settings.animTime);

            });

        }
        else{

            // If animation is inactive hide original figure without any effect
            fig1.hide();

            // Callback that pic has changed
            plugin.settings.onChange(plugin.settings);

        }

        return plugin;

    };

    // Destroy plugin
    // @todo is this useful for a pic changer? If we implement this there must be a fallback to the elements original state
    plugin.destroy = function(){

        // Remove data from plugin object
        $element.removeData('wwChanger2');

        // Callback that plugin is destroyed
        plugin.settings.onDestroy();

    };

    // Call "constructor" method
    init();

};

// Add plugin to jQuery.fn object
$.fn.wwChanger2 = function(options){

    // Iterate through the DOM elements we are attaching the plugin to
    return this.each(function(){

        // If plugin has not already been attached to the element
        if(undefined === $(this).data('wwChanger2')){

            // Create new instance of plugin
            var plugin = new $.wwChanger2(this, options);

            // Store reference to access methods and properties
            // Example: $('#wwChanger').data('wwChanger2').test();
            $(this).data('wwChanger2', plugin);

        }

    });

};