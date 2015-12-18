/**

......,,,,,,,,,:::::,                                                                               
'+++++++++++++++++++;                                                                               
'+++''''+++++''''+++;                                                                               
'+++    +++++   `+++;                                        ;++++++++++++'                         
'+++    +++++    +++;                                        `+++++++++++++++                      
        +++++     :;''''++':`   .;''''++++++';;''''    `;'''''..++++    :+++++,                     
        +++++     ;+++++++++++  ,+++++++++++'+++++++   `++++++.,++++      +++++                     
        +++++       ++++   ++++'  ++++    ++'  ++++++    '++'  ,++++       ++++'                    
        +++++       ++++    ++++  ++++    ++'  ++++++,   '++'  ,++++       +++++                    
        +++++       ++++   ++++`  +++++++++    +++`++++  '++'  ,++++       +++++  ++++++++++++   .++
        +++++       +++++++++,    +++++++++    +++` ++++`'++'  ,++++       ++++'  ++++++++,  :+  +++
        +++++       ++++  '+++`   ++++         +++`  '++++++'  ,++++      +++++   ++++++ +++;+++  '+
        +++++       ++++   ++++   ++++    `++  +++`   ++++++'  ,++++     :++++'   +++++ ,+++++++`  +
      :+++++++:     ++++   '+++`  ++++    '++  +++`   ,+++++'  .++++ ``,++++++    +++++ .++++++++   
     +++++++++++   .++++.   ++++``+++++++++++ .+++;    +++++',+++++++++++++++     +++++  ++++++`++`:
     +++++++++++  ;++++++;  ++++++++++++++++++++++++    ++++';+++++++++++++       +++++  `++++ :++++

    
    TrendDataMapper - DataMaps-based map maker for tabbed and small-multiple maps.

    (C) 2015 Jake Kara / TrendCT.org

    Github: https://github.com/trendct/TrendDataMapper.git
    Live demo:  http://projects.ctmirror.org/content/trend/2015/12/TrendDataMapper/demo/
    Working dir: http://projects.ctmirror.org/dev/git/TrendDataMapper

**/

// constructor method for DataMaps map maker object
DmMapMaker = function (options) {
    return this.construct(options);
}

DmMapMaker.prototype.construct = function (options){
    this.colored_once = false;
    this.options = options;
    this.done_count = 0;
    this.color_field = false;
    //this.color_range = {min: false, max: false};
    this.value_range = {min: false, max: false};
    this.excludes = [];
    this.categories = [];
    this.data = this.removeSpaces(options.data);
    this.color_range = options.color_range;
    this.small_multiples = options.small_multiples;
    this.datamap_options = options.datamap_options;
    this.div_id = options.div_id;
    
    if (options.hasOwnProperty("categories")) {
        this.categories = options.categories;
    }
    
    if (options.hasOwnProperty("default_category")) {
        this.default_category = options.default_category;
    }
    
    if (options.hasOwnProperty("toggle_div_id")) {
        this.toggle_div_id = options.toggle_div_id;
    }
    else {
        this.toggle_div_id = "";
    }
    
    // don't generate a choropleth for these fields
    if (options.hasOwnProperty("excludes")) {
        this.excludes = options.excludes;
    }


    // start trying to color the maps
    this.colorItUpNah();

    if (this.small_multiples == true) {
        
        var ret = this.smallMultiples();
        //ret.colorAllMaps();
        return ret;
    }

    this.draw(options);
        
    

    return this;
}

// keep all small multiples the same height
DmMapMaker.prototype.resizeSmallMultiples = function() {
    //http://stackoverflow.com/questions/6060992/element-with-the-max-height-from-a-set-of-elements
    var maxHeight = Math.max.apply(null, $("div.dmmapmaker_small_multiple_header").map(function ()
        {
            return $(this).height();
        }).get());
    
    $("div.dmmapmaker_small_multiple_header").height(maxHeight);

}

// change spaces to underscores in data
// because datamaps doesn't support spaces in 
// geography ids :(
DmMapMaker.prototype.removeSpaces = function(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (key.indexOf(' ') >= 0){
                var new_key = key.replace(' ', '_');
                obj[new_key] = obj[key];
                delete obj.key;
            }
        }
    }
    
    return obj;
}

// start trying to re-color
DmMapMaker.prototype.colorItUpNah = function () {
    var that = this;
    if (this.small_multiples) {
        
        that.interval = setInterval(function () {
            
            if (that.colored_once == true) {
                clearInterval(that.interval);
                that.resizeSmallMultiples();
                return false;
            }

            try {
                that.colorAllMaps();
            }
            catch (err){
                //console.error("color_failed");
            }
        }, 10);
    }   
}

// throttle drawing, execute after delay
DmMapMaker.prototype.draw = function (options) {
    
    // do nothing if receiving redraw events
    if (this.redrawing) return;
    
    this.redrawing = true;
    var that = this;
    setTimeout(function () {
        that.drawNow(options);
        that.redrawing = false;
    }, 500);
        
}

// draw function for initializing and redrawing (updating and resizing)
DmMapMaker.prototype.drawNow = function (options) {
    
    this.current_location = false;
    this.redrawing = false;
    d3.select("#" + options.div_id)
        .html("");
    var that = this;
    // use default popup template if none is defined
    if (! options.hasOwnProperty("geographyConfig")) {
        options.geographyConfig = {};
    };

    // probably "deprecated" ...
    if (! options.geographyConfig.hasOwnProperty("popupTemplate")){
        options.geographyConfig.popupTemplate = function (geography, data) {
            // allow passing main object to popup callback;]
            return that.defaultPopup(geography, data, that);
        };
    } 

    // allow customer inner_html for popup inside the standard popup div
    if (options.hasOwnProperty("popup_html")) {
        options.geographyConfig.popupTemplate = function (geography, data) {

            return that.defaultPopupWithString({
                string:options.popup_html(geography, data, that)
            });
        }
    }

    options.geographyConfig.highlightFillColor = (options.geographyConfig.highlightFillColor || "#8c0c04"); //#0062A2

    // disable popups manually
    if (options.popup == false) {
        console.log("disable popup");
        options.geographyConfig.highlightOnHover = false;
        options.geographyConfig.popupOnHover = false;
    }

    var datamap_options = {
        scope: 'usa',
        element: document.getElementById(options.div_id),
        responsive: true,
        geographyConfig: options.geographyConfig,
        highlightBorderWidth: 3,
        data: this.data,
    }; 


    // set custom projection
    var custom_projection = false;
    if (options.hasOwnProperty("level")) {
        this.level = options.level;
        if (this.level == "ct_towns") {

            // set border shape file
            //datamap_options.geographyConfig.dataUrl = "http://projects.ctmirror.org/dev/libs/ct_towns.topojson";
            // avoid json call to x-domain
            datamap_options.geographyConfig.dataJson = ct_town_borders;
            datamap_options.scope = 'ct_towns_s';

            //set zoom to CT
             datamap_options.setProjection = function (element) {

                var projection = d3.geo.albers(element)
                    .rotate([72.7, 0, 0])
                    .scale(element.offsetWidth * 30)
                    .center([0, 41.5])
                    .translate([element.offsetWidth/ 2, element.offsetHeight / 2]);
                
                var path = d3.geo.path().projection(projection);

                return {path: path, projection: projection};
            }   
        }
    }

    // enable passing DataMaps-specified fills options
    datamap_options.fills = ( options.fills || { defaultFill:"white"});

    var that = this;
    datamap_options.done = function (map) {
        that.done_count ++;
//       map.setColorField(options.default_category);
    }
    this.map = new Datamap(datamap_options);
    
    var that = this;
    
    window.addEventListener('resize', function() {
        // not using this right now, handling at the app level
    });


    /*
    if (options.hasOwnProperty("color_locations")){
        // callback for custom coloring 
        this.color_locations = options["color_locations"];
        this.color_locations();
    }
    else {
        this.color_locations = this.colorLocations;
    }*/

    //this.setColorField(this.default_category);
    //this.colorLocations();
    this.makeToggleMenu();
    
    if (this.options.hasOwnProperty("dash_array")){
        $("#" + this.options.div_id + " path.datamaps-subunit")
            .attr("stroke-dasharray", this.options["dash_array"]);
    }

    else {
    }

    this.setCategory(this.default_category);

    return this;
}

// set the field that is used to calculate the choropleth gradient color
DmMapMaker.prototype.setColorField = function(field_name) {
    this.color_field = field_name;
    // calculate min and max values
    this.setValueRange();
    
    /*
    console.log(this.color_locations);
    this.color_locations();
    */
    this.colorLocations();
    
    return this;
}

// set the color_rage{min: [200,200,200], max:[0,0,0]} for the choropleth gradient
DmMapMaker.prototype.setColorRange = function(color_range) {
    this.color_range = color_range;
    
    return this;
}

// set the minimum and maximum values
DmMapMaker.prototype.setValueRange = function() {
        
    if (! this.hasOwnProperty("map")) {
        return;
    }
    
    this.value_range = {min: false, max: false};
    
    for (i in this.map.options.data) {
        var data = this.map.options.data[i];

        var raw_val = data[this.color_field];

        if (raw_val === false) { 
            continue;
        }

        var val = Number(raw_val);

        //console.log( this.value_range.min + " > " + data[this.color_field] + "?")
        // set min value 
        if (this.value_range.min === false || data[this.color_field] < this.value_range.min ) {
            this.value_range.min = data[this.color_field];
            //console.log("min: " + this.value_range.min);
        }
        else {
        }
        if (this.value_range.max === false ||  data[this.color_field] > this.value_range.max) {
            this.value_range.max = data[this.color_field];
            //console.log("max: " + this.value_range.max);
        }
    }
    
    return this;
}

// 

// define a generic popup function
DmMapMaker.prototype.defaultPopup = function (geography, data, obj) {

    // bad hack to accomodate the ct_towns topojson file not being structured
    // the same way as the built in d3 toposjons
    var title = geography.properties.name;

    if (data[obj.color_field] === false ) { return };

    if (geography.id.length > 2) {
        title = geography.id;
    }

    var html_string = "<h5 class='dmmapmaker_popup_heading'>" + title.replace('_', ' ') + "</h5>" ;
    
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if (key == obj.color_field) {
            html_string += "<div><div><strong>" + key + ": </strong></div>  <span class='dmmapmaker_popup_main_value'>" + Trendy.comma(data[key]) + "</span></div>";
            }
            else {
               // html_string += "<div class='dmmapmaker_popup_sub_value'><strong>" + key + ": </strong>" + data[key] + "</div>";

            }
        }
    }
    
    // allow popup data to be added to existing div instead of used as a standard popup
    if (this.options.pop_in == true && typeof(this.options.pop_in_div) != "undefined") {
        console.log("popping in", html_string);
        $("#" + this.options.pop_in_div).html(html_string);
    }
    else {
        return obj.defaultPopupWithString({string: html_string});
    }

}

// pop text into popup
DmMapMaker.prototype.defaultPopupWithString = function (options) {
    
    // allow "false" to prevent popup from showing
    if (options.string === false) return;

    // boilerplate for all default popups
    var html_string = "<div class='dmmapmaker_popup'>";
    html_string += options.string;
    html_string += "</div>";

    return html_string;

}

// get a choropleth color
DmMapMaker.prototype.getColorByKey = function(key) {


    var value = this.map.options.data[key][this.color_field];

    if (value === false) { 
        return false;
        return this.map.options.fills.defaultFill; 
    }

    // if there's no color range, go white to black;
    if (typeof(this.color_range) == "undefined") {
        this.setColorRange({min: [255,255,255], max: [0,0,0]});
    }
    
    // check that all requirements are set
    if (this.color_field === false) {
        console.error("no color_field");
        return false;
    } else if (this.value_range.max === false){
        console.error("no value_range.max");
        return false;
    } else if (this.value_range.min === false) {
        console.error("no value_range.min");
        return false;
    } else if ( this.color_range.min === false) {
        console.error("no color_range.min");
        return false;
    } else if (this.color_range.max === false) {
        console.error("no color_range.max");
        return false;
    }
        
    // the possible rgb values
    var rgb_range = [
        this.color_range.max[0] - this.color_range.min[0],
        this.color_range.max[1] - this.color_range.min[1],
        this.color_range.max[2] - this.color_range.min[2]
        ];
    
    // calculate the coefficient to multiply each rgb val by
    var coef = (value - this.value_range.min)
                / (this.value_range.max - this.value_range.min);
    
    // calculate color
    var color = [
        Math.floor(this.color_range.min[0] + rgb_range[0] * coef),
        Math.floor(this.color_range.min[1] + rgb_range[1] * coef),
        Math.floor(this.color_range.min[2] + rgb_range[2] * coef)
    ];

    // return rgb formatted value
    return ("rgb(" + color[0] + "," + color[1] + "," + color[2] + ")");
}

// default choropleth logic
DmMapMaker.prototype.colorLocations = function () {
    for (var key in this.map.options.data){
        var data = this.map.options.data[key];

        console.log();

        var obj = {}
        var color = this.getColorByKey(key);
        if (color === false) {
            color = this.map.options.fills.defaultFill;
            //return false;
        }
        obj[ key.toString().replace(' ','_') ] =  color; //this.getColorByKey(key);

        var data = this.map.options.data[key];

        this.map.updateChoropleth(obj);
    }

    if (this.options.hasOwnProperty("draw_callback")) {
        this.options.draw_callback();
    }
    
    return this;

}

// return a list of categories for toggling 
// base it on the first data object
DmMapMaker.prototype.listCategories = function () {
    
    return this.categories;
    
}

// color maps
DmMapMaker.prototype.colorAllMaps = function () {

    if (this.small_multiples == false ) return;

    var categories = this.listCategories();

    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        this.child_maps[category].setColorField(category);
    }
    
    this.colored_once = true;

}


// make small multiples instead of toggle
DmMapMaker.prototype.smallMultiples = function () {
   

    var categories = this.listCategories();
    
    if (categories.length <= 1) {
        return;
    }

    // copy the main object
    
    var master_options = jQuery.extend(true, {}, this.options);
    //$("#" + master_options.div_id).parent().html("");
    this.child_maps = {};
    
    
$(".dmmapmaker_small_multiple").remove();
    
    var width = 100 / categories.length;
    // make a map for 
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        var copy_options = jQuery.extend(true, {}, master_options);
        var new_div =  master_options.div_id + "_" + Trendy.underscore(category.replace(/\W/g, ''));
        
        //repackage
        copy_options.div_id = new_div;
        copy_options.small_multiples = false;
        copy_options.categories = [category];
        copy_options.color_field = category;
        copy_options.default_category = category;
        // create new div
        
        
         $("#" + master_options.div_id).append("<div class='dmmapmaker_small_multiple' data-category='"+category+"'  data-multiples="+categories.length+"><div class='dmmapmaker_small_multiple_header'>"+category.toUpperCase()+"</div><div class='dmmapmaker_map dmmapmaker_small_multiple_map' id='"+new_div+"'>"+"</div></div>");
        
        this.child_maps[category] = new DmMapMaker(copy_options);

        
    }
    $("#" + master_options.div_id).append("<div style='clear:both'></div>");
    
    return this;
    
}

// set selected tab 
DmMapMaker.prototype.setCategory = function ( category ) {
    $(".dmmapmaker_toggle").removeClass("dmmapmaker_toggle_selected");
    this.setColorField(category);
    $("#" + this.div_id + "_" + Trendy.underscore(category)).addClass("dmmapmaker_toggle_selected");

}

// create toggle menu HTML, add it to toggle menu div
DmMapMaker.prototype.makeToggleMenu = function(){
        
    var categories = this.listCategories();
    
    // if there's only one cateogry, don't make a toggle.
    if (categories.length <= 1) return;
    
    var html_text = "";
    
    var that = this;
    categories.forEach(function (element) {
        html_text +=  "<div id='" + that.div_id + "_" +  Trendy.underscore(element) + "' class='dmmapmaker_toggle ";
        html_text += "' data-condition='" + element + "'>" + element.toUpperCase() + "</div>";
    });
    
    $("#" + this.toggle_div_id).html(html_text + "<div style='clear:both'></div>");
    var that = this;
    jQuery(".dmmapmaker_toggle").on('click touchend', function () {

        that.setCategory($(this).attr("data-condition"));
    });

}

console.log(
    "......,,,,,,,,,::::: \n"+                                                                              
    "'+++++++++++++++++++;            \n"+                                                                   
    "'+++''''+++++''''+++;     \n"+                                                                         
    "'+++    +++++   `+++;                                        ;++++++++++++'            \n"+             
    "'+++    +++++    +++;                                        `+++++++++++++++            \n"+          
    "        +++++     :;''''++':`   .;''''++++++';;''''    `;'''''..++++    :+++++,         \n"+           
    "        +++++     ;+++++++++++  ,+++++++++++'+++++++   `++++++.,++++      +++++           \n"+         
    "        +++++       ++++   ++++'  ++++    ++'  ++++++    '++'  ,++++       ++++'            \n"+       
    "        +++++       ++++    ++++  ++++    ++'  ++++++,   '++'  ,++++       +++++             \n"+       
    "        +++++       ++++   ++++`  +++++++++    +++`++++  '++'  ,++++       +++++  ++++++++++++   .++\n"+
    "        +++++       +++++++++,    +++++++++    +++` ++++`'++'  ,++++       ++++'  ++++++++,  :+  +++\n"+
    "        +++++       ++++  '+++`   ++++         +++`  '++++++'  ,++++      +++++   ++++++ +++;+++  '+\n"+
    "        +++++       ++++   ++++   ++++    `++  +++`   ++++++'  ,++++     :++++'   +++++ ,+++++++`  +\n"+
    "      :+++++++:     ++++   '+++`  ++++    '++  +++`   ,+++++'  .++++ ``,++++++    +++++ .++++++++   \n"+
    "     +++++++++++   .++++.   ++++``+++++++++++ .+++;    +++++',+++++++++++++++     +++++  ++++++`++`:\n"+
    "     +++++++++++  ;++++++;  ++++++++++++++++++++++++    ++++';+++++++++++++       +++++  `++++ :++++\n" + 
    "                             -=[ TrendCT.org - The Story In Numbers ]=-");