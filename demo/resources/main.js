// project object

// conditionally create project object
if (typeof(road_condition_map_usDEC2015) == "undefined") var road_condition_map_usDEC2015 = {};

// this object is all you should have to modify
road_condition_map_usDEC2015 = {
    div_id: "road_condition_us_map_2015",
    toggle_div_id: "road_condition_us_map_2015_toggle_container",
    data: road_condition_percents_12082015,
    default_excludes: ["state"],
    // use small multiples instead of default tabs
    //small_multiples: true,
    //popup: false,
    // toggle or small maps to make
    categories: [
        "very good",
        "good",
        "fair",
        "mediocre",
        "poor"],
    default_category: "very good",
    // dotted lines
    dash_array: "3, 3",
    color_range: {
        min: [230,230,235],
        max: [0,0,0]
    },
    // yellow borders
    geographyConfig: {
        borderColor: "rgb(240,240,0)",
        borderWidth: 2
    }
};

/** Shouldn't need to modify from here down **/


/*
// optionally define custom html content for the popup window
road_condition_map_usDEC2015.popup_html = function (geography, data, obj) {
    var key = obj["color_field"];
    var title = geography.properties.name;
    var heading =  "<h5 .dmmapmaker_popup_heading>" + title.replace('_', ' ') + "</h5>" ;
    var content = 
        "<div>"
        + "<strong><span class='dmmapmaker_popup_main_value'>"
        + data[key].toString() + "% "
        + "</span></strong>"
        + "<div>"
        + " " + key 
        + "</div>"
        + "</div>";
        
    return heading + content;

};

*/


// initiation function to be called on page load
road_condition_map_usDEC2015.init = function(obj) {
   
    obj.map = new DmMapMaker( obj);
    
}

// when the page loads, go for it;
jQuery(function () {
    // define $ as jQuery if we need to
    if (typeof(window.$) == "undefined" ) $=jQuery;

    road_condition_map_usDEC2015.init(road_condition_map_usDEC2015);
    
    // handle responsiveness from here, for now. DataMaps can be responsive, too
    $(window).resize(function () {
        $("#" + road_condition_map_usDEC2015.div_id).html();
            road_condition_map_usDEC2015.init(road_condition_map_usDEC2015);
    });
});


