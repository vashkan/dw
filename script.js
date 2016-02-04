(function (global) {
    var chartId = 0;
    var chartsContainer;

    var dw = dw || {};
    (function (dw) {
        function addStyleRule(selector, styleString) {
            if (!dw.styleSheet) {
                var style = document.createElement('style');
                style.appendChild(document.createTextNode(''));
                document.head.appendChild(style);
                dw.styleSheet = style.sheet;
            }
            var styleSheet = dw.styleSheet;

            if (styleSheet.insertRule) {
                styleSheet.insertRule(selector + '{' + styleString + '}', 0);
            }
            else if (styleSheet.addRule) {
                styleSheet.addRule(selector, styleString, 0);
            }
            else console.warn('addStyleRule failed');
        };
        dw.addStyleRule = addStyleRule;
        (function () {
            var rules = {
                "#chartsContainer svg": "position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;float: left;height: 45%;width:45%;",
                "#chartsContainer": "overflow:hidden;width: 100%;"
            };
            for (var sl in rules) {
                dw.addStyleRule(sl, rules[sl]);
            }
        })();
        var adapters;
        (function (adapters) {
            //Гистограммы
            function toHistogram(input_data) {

                var dat = {};
                input_data.forEach(function (v, i, a) {
                    if (v in dat) {
                        dat[v] += 1;
                    }
                    else {
                        dat[v] = 1;
                    }
                });
                var data = [{ key: "Cumulative Return", values: [] }];
                for (var l in dat) {
                    data[0].values.push({ "label": l, "value": dat[l] });
                }
                return data;
            };
            adapters.toHistogram = toHistogram;


            function toScatter(input_data) {
                return [{ key: 'Data ', values: input_data }];
            };
            adapters.toScatter = toScatter;


            function toLine(input_data) {
                var data = [];
                for (var k in input_data) {
                    var dat = input_data[k].map(function (v, i) {
                        return { x: i, y: v };
                    });
                    data.push({ key: k, values: dat })
                }
                return data;
            };
            adapters.toLine = toLine;


            function toStackedBar(input_data) {
                return {};
            };
            adapters.toStackedBar = toStackedBar;


        })(adapters = dw.adapters || (dw.adapters = {}));

        var charts;
        (function (charts) {
            function Histogram(i, data) {
                return function () {
                    var chart = nv.models.discreteBarChart()
                        .x(function (d) { return d.label })
                        .y(function (d) { return d.value })
                        .staggerLabels(true)
                    //.staggerLabels(historicalBarChart[0].values.length > 8)
                        .showValues(true)
                        .duration(250);

                    d3.select('#chart' + i)
                        .datum(data)
                        .call(chart);

                    nv.utils.windowResize(chart.update);
                    return chart;
                }
            };
            charts.Histogram = Histogram;
            
            function Scatter(i, data) {
                return function () {

                    var chart = nv.models.scatterChart()
                        .margin({ top: 20, right: 20, bottom: 20, left: 30 })
                        .pointSize(function (d) {
                            return d.r
                        })
                        .showDistX(true)
                        .showDistY(true)
                        .duration(300)
                        .useVoronoi(true)
                        .color(d3.scale.category10().range());


                    chart.xAxis.tickFormat(d3.format('.02f'));
                    chart.yAxis.tickFormat(d3.format('.02f'));


                    d3.select('#chart' + i)
                        .datum(data)
                    //.transition().duration(100)
                        .call(chart);

                    nv.utils.windowResize(chart.update);
                    return chart;
                }
            };
            charts.Scatter = Scatter;
            
            function Line(i, data) {
                return function () {
                    var width = chartsContainer.clientWidth - 40,
                        height = chartsContainer.clientHeight - 40;

                    var chart = nv.models.lineChart()
                    //.width(width)
                    //.height(height)
                        .margin({ top: 20, right: 30, bottom: 20, left: 30 });

                    chart.dispatch.on('renderEnd', function () {
                        console.log('render complete');
                    });
                    chart.xAxis.tickFormat(d3.format('.02f'));
                    chart.yAxis.tickFormat(d3.format('.02f'));
                    d3.select('#chart' + i)
                    //.attr('width', width)
                    //.attr('height', height)
                        .datum(data)
                        .call(chart);
                    nv.utils.windowResize(chart.update);
                    return chart;
                }
            };
            charts.Line = Line;
            
            function StackedBar(i, data) {
                
            };
            charts.StackedBar = StackedBar;
            
        })(charts = dw.charts || (dw.charts = {}));

    })(dw = dw || {});
    var TypeChart;
    (function (TypeChart) {
        TypeChart[TypeChart["Unknown"] = 0] = "Unknown";
        TypeChart[TypeChart["Histogram"] = 1] = "Histogram";
        TypeChart[TypeChart["Scatter"] = 2] = "Scatter";
        TypeChart[TypeChart["Line"] = 3] = "Line";
        TypeChart[TypeChart["StackedBar"] = 4] = "StackedBar";
    })(TypeChart || (TypeChart = {}));
    function detectType(obj) {
        if (obj instanceof Array) {
            if (obj.length > 0) {
                if (typeof obj[0] == 'number' || typeof obj[0] == 'string') {
                    return TypeChart.Histogram;
                } else if (obj[0] instanceof Array) {
                    return TypeChart.StackedBar;
                } else if (obj[0] instanceof Object) {
                    return TypeChart.Scatter;
                }
                return TypeChart.Unknown;
            }
        } else if (obj instanceof Object) {
            return TypeChart.Line;
        }
    }

    function loadLib(callback) {

        if (!global.d3lib) {
            global.d3lib = document.createElement('script');
            global.d3lib.type = 'text/javascript';
            global.d3lib.charset = 'UTF-8';
            global.d3lib.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.2/d3.js';
            global.d3lib.onload = (function (callback) {
                return function () {
                    if (typeof (global.nvlib) === 'undefined') {
                        var nvcss = document.createElement('link');
                        nvcss.rel = 'stylesheet';
                        nvcss.type = 'text/css';
                        nvcss.href = 'nv.d3.css';
                        document.head.appendChild(nvcss);
                        global.nvlib = document.createElement('script');
                        global.nvlib.type = 'text/javascript';
                        global.nvlib.src = 'nv.d3.js';
                        global.nvlib.onload = callback;
                        document.head.appendChild(global.nvlib);
                    } else {
                        (function ff() {
                            if (global.d3 && global.nv) {
                                callback();
                            } else {
                                setTimeout(ff, 100)
                            }
                        })();
                    }
                }
            })(callback);
            document.head.appendChild(global.d3lib);
        } else {
            (function ff() {
                if (global.d3 && global.nv) {
                    callback();
                } else {
                    setTimeout(ff, 100)
                }
            })();
        }
    }

    function draw() {
        var _self = this;
        function createChartElement() {
            var chId = chartId++;
            chartsContainer = chartsContainer
            || document.getElementById("chartsContainer")
            || (function () {
                var re = document.createElement('div');
                re.id = 'chartsContainer';
                re.style.cssText = "overflow:hidden; width: 100%;";
                re.style.height = (window.innerHeight - 16) + 'px';
                document.body.appendChild(re)
                window.onresize = function () {
                    re.style.height = (window.innerHeight - 16) + 'px';
                    re.style.width = (window.innerWidth - 16) + 'px';
                }
                return document.body.appendChild(re), re;
            })();
            chartsContainer.appendChild((function (i) {
                var el = document.createElementNS("http://www.w3.org/2000/svg", "svg")
                el.id = "chart" + i;
                return el
            })(chId));
            return chId;
        }

        function appendChart() {
            var chId;
            var data;
            switch (detectType(_self)) {
                case TypeChart.Line:
                    chId = createChartElement();
                    data = dw.adapters.toLine(_self);
                    nv.addGraph(dw.charts.Line(chId, data));

                    break;
                case TypeChart.Scatter:
                    chId = createChartElement();
                    data = dw.adapters.toScatter(_self);
                    nv.addGraph(dw.charts.Scatter(chId, data));
                    break;
                case TypeChart.Histogram:
                    chId = createChartElement();
                    data = dw.adapters.toHistogram(_self);
                    nv.addGraph(dw.charts.Histogram(chId, data));
                    break;
                default:
                    console.log('Unavalible chart');
                    break;
            }
        }

        console.log('Drawing chart type: ', TypeChart[detectType(this)]);
        console.log('Source data', this);
        loadLib(appendChart);
    }
    Object.defineProperty(Object.prototype, 'draw', { enumerable: false, value: draw });
    global.dw = dw;
})(window);