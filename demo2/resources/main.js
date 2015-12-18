// project object

// conditionally create project object
if (typeof(road_condition_map_usDEC2015) == "undefined") var state_to_state_movers = {};

// this object is all you should have to modify
state_to_state_movers = {
    div_id: "state_to_state_movers_2015",
    toggle_div_id: "state_to_state_movers__2015_toggle_container",
    data: state_to_state_movers_data,
    default_excludes: ["state"],
    // use small multiples instead of default tabs
    //small_multiples: true,
    //popup: false,
    // toggle or small maps to make
    categories: [
        "from Connecticut",
        "to Connecticut"
        ],
    default_category: "to Connecticut",
    // dotted lines

//    dash_array: "3, 3",
    color_range: {
        min: [208,236,253],
        max: [0,0,153]
    },
    // yellow borders
    geographyConfig: {
        borderColor: "lightblue",//"rgb(255,165,0)",
        borderWidth: 0.25
    },
    fills: {
        defaultFill: "white"
    },
    //pop_in: true,
    pop_in_div: "state_to_state_movers_2015_pop_in",
    draw_callback: function () {
        blurMap();
    }
};

/** Shouldn't need to modify from here down **/



// use a custom popup_html to either generate html and return it (to be put in a default popup)
// or perform some other action and return false to prevent default popup from showing.
state_to_state_movers.popup_html = function (geography, data, obj) {


    var key = obj["color_field"];
    var movers = Trendy.comma(data[key]);
    var movers_text = movers;

    if (data[key] === false) {
        movers_text = "Somewhere between nobody and " + Trendy.comma(data[key + ".MOE"]) + " people  moved " + key + ".";
    }
    else {
        var floor = data[key] - data[key + ".MOE"];
        if (floor <= 0) {
            floor = "nobody"
        }
        else {
            floor = Trendy.comma(floor);
        }

        movers_text = "Somewhere between "
            + floor
            + " and " 
            + Trendy.comma(data[key] + data[key + ".MOE"]) 
            + " people moved " + key + ".";
    }

    var title = geography.properties.name;

    var moe_percent = "";
    if (data[key] != 0) {
        moe_percent = Math.round(data[key + ".MOE"] * 1000 / data[key]) / 10;
        moe_percent = " (" + moe_percent + "%)"
    };

    var heading =  "<h5 class='dmmapmaker_popup_heading'>" + title.replace('_', ' ') + "</h5>" ;
    var content = 
        "<div>"
        + "<strong><span class='dmmapmaker_popup_main_value'>"
        + movers_text 
        + "</span></strong>"
        + "<div class='dmmapmaker_popup_footer'>"
        + "<hr>"
        + "<strong>Estimate:</strong> " + (movers || 0)
        + "; "
        + "<strong>Margin of error:</strong> " + Trendy.comma(data[key + ".MOE"]) 
        + moe_percent
        + "</div>"
        + "</div>"
        + "<div style='clear:both'></div>"
        ;
    
    $(".datamaps-hoverover").on('touchend', function() {
        var that = this;
        setTimeout(function () {
            $(that).hide();
        }, 250);
    });

    clearInterval(state_to_state_movers.popup_interval);
    //$(".datamaps-hoverover").css("right", "inherit");

        //$(".dmmapmaker_popup").hide();

        var margin = Math.max(10, ($("#" + this.div_id).width() - 400) / 2) + "px";

        state_to_state_movers.popup_interval = setInterval(function (){

            var top = $(".datamaps-hoverover").css("top"); 
            var top_num = Number(top.replace("px",""));
            var height = $(".datamaps-hoverover").outerHeight() - 50;


/*            if (top_num + height > window.innerHeight) {
                var beyond = Math.abs(window.innerHeight - (top_num + height));
                top = window.innerHeight - height + "px";
                //top -= height - 10;

                //top = "none";


                //top = Math.max(10, window.innerHeight / 2 - height / 2);
                //console.log(top);
            }
*/
            $(".datamaps-hoverover").css("right", margin);
            $(".datamaps-hoverover").css("left", margin);
            $(".datamaps-hoverover").css("top", top );
            $(".dmmapmaker_popup").show();
        }, 100);



    if (geography.properties.name == "Connecticut") {
        content = ""
        + "<div>"
        + "An estimated 95,501 people (+/-7,273) moved from Connecticut to another state, while 82,746 (+/-8,190) moved here from another state."
        + "</span>"
    }

    return "<div class='dmmapmaker_popup_content'>" + heading + content + "</div>";

    //return heading + content;
};



// initiation function to be called on page load
state_to_state_movers.init = function(obj) {
   
    obj.map = new DmMapMaker( obj);
    
}

// when the page loads, go for it;
jQuery(function () {
    // define $ as jQuery if we need to
    if (typeof(window.$) == "undefined" ) $=jQuery;

    state_to_state_movers.init(state_to_state_movers);
    
    // handle responsiveness from here, for now. DataMaps can be responsive, too
    $(window).resize(function () {

        // use a temp arg to turn off popup if screen is too narrow

        var obj = jQuery.extend(true, {}, state_to_state_movers);

        if ($(window).width() < 200) obj.popup = false;

        $("#" + state_to_state_movers.div_id).html();
         state_to_state_movers.init(obj);

    });
});

function blur(id, how_much) {

    if (d3.select("#state_to_state_movers_2015 svg defs").empty()) {
        d3.select("#state_to_state_movers_2015 svg")
            .append("defs");
    }
    else {
    }

    d3.select("#state_to_state_movers_2015 svg defs")
        .append("filter")
        .attr("id", "blur_filter")
        .append("feGaussianBlur")
        .attr("stdDeviation", how_much);

    d3.selectAll(id).attr("filter", "url(#blur_filter)");
}

function blurMap() {

    blur ("#state_to_state_movers_2015 svg path", 2.4);
}

function unblur(id) {
     d3.selectAll(id).attr("filter", "none");
}

var trend_ct_org_ascii = "......,,,,,,,,,::::: \n"+                                                                              
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
"                             -=[ TrendCT.org - The Story In Numbers ]=-";
console.log(trend_ct_org_ascii);



