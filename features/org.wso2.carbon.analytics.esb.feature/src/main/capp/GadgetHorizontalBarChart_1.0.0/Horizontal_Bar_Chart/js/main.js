    var TOPIC = "subscriber";

    var timeFrom;
    var timeTo;
    var prefs = new gadgets.Prefs();
    var config = gadgetUtil.getGadgetConfig(prefs.getString(PARAM_TYPE));
     
    $(function() {
        if(config == null) {
            $("#canvas").html(gadgetUtil.getErrorText("Initialise gadget type first."));
            return;
        }
        timeFrom = gadgetUtil.timeFrom();
        timeTo = gadgetUtil.timeTo();
        console.log("TOP_FIVE[" + config.name + "]: TimeFrom: " + timeFrom + " TimeTo: " + timeTo);
        gadgetUtil.fetchData(CONTEXT, {
            type: config.type,
            timeFrom: timeFrom,
            timeTo: timeTo
        }, onData, onError);
    });

    gadgets.HubSettings.onConnect = function() {
        gadgets.Hub.subscribe(TOPIC, function(topic, data, subscriberData) {
            onTimeRangeChanged(data);
        });
    };

    function onTimeRangeChanged(data) {
        timeFrom = data.timeFrom;
        timeTo = data.timeTo;
        gadgetUtil.fetchData(CONTEXT, {
           type: config.type,
           timeFrom: timeFrom,
           timeTo: timeTo
       }, onData, onError);
    }

    function onData(data) {
        try {
            if (data.message.length == 0) {
                $("#canvas").html('<div align="center" style="margin-top:20px"><h4>No records found.</h4></div>');
                return;
            }
            $("#canvas").empty();
            var schema = [{
                "metadata": {
                    "names": ["name", "requests"],
                    "types": ["ordinal", "linear"]
                },
                "data": []
            }];

            var config = {
                type: "bar",
                x : "name",
                charts : [{type: "bar",  y : "requests", orientation : "left"}],
                width: 500,
                height: 200,
                padding: { "top": 10, "left": 140, "bottom": 40, "right": 50 }
            };

            data.message.forEach(function(row,i) {
                schema[0].data.push([row.name,row.requests]);
            });

            var onChartClick = function(event, item) {
                var proxyName = -1;
                if(item != null) {
                    proxyName = item.datum.name;
                }
                parent.window.location = PROXY_PAGE_URL + "?" + PARAM_ID + "=" + proxyName + "&timeFrom=" + timeFrom + "&timeTo=" + timeTo;
            };

            var chart = new vizg(schema, config);
            chart.draw("#canvas", [{ type: "click", callback: onChartClick }]);
        }
        catch(e) {
            $("#canvas").html(gadgetUtil.getErrorText(e));
        }
    };

    function onError(msg) {
        $("#canvas").html(gadgetUtil.getErrorText(msg));
    };

    