(function (global) {
    var chartId = 0;
    var chartsContainer;

function OnCalcPrime(numb)
{
	var s = [];
	console.time('Calc:');
	if (!isNaN(numb)){
		if (numb > 0 && Math.round(numb) == numb) {
			var prime = 2;
			var temp = numb;
			var isPrime = true;
			
			while (prime <= (Math.sqrt(temp) + 1)){
				if (temp % prime == 0) {
					s.push(prime);
					isPrime = false;
					
					temp = Math.round(temp / prime);
				}
				else {
					prime++;
				}
			}
			
			if (isPrime) {
				s.push(numb + " - is prime");
			}
			else {
				if (temp > 1) {
					s.push(temp);
				}
			}
		}
		else{
			console.log("Число должно быть целым и не отрицательным");
		}
	}
	else{
		console.log("Это не число");
	}
console.timeEnd('Calc:');
return s;
};
global.OnCalcPrime=OnCalcPrime;

    var dw;
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
                "html, body, div":"margin: 0px;padding: 0px;",
                "#chartsContainer svg": "position: relative;min-height: 1px;padding-right: 0px;padding-left: 0px;float: left;height: 45%;width:30%;",
                "#chartsContainer": "overflow:hidden;width: 100%;"
            };
            for (var sl in rules) {
                dw.addStyleRule(sl, rules[sl]);
            }
        })();
        
        //Методы преобразования приходящих данных к формату внешней библиотеки
        var adapters;
        (function (adapters) {
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
                var data = [];
                if (input_data.length > 0) {
                    var maxlen = input_data.reduce(function (maxlen, v) { return Math.max(maxlen, v.length - 1) }, 0);

                    data=input_data.map(function (element, index) {
                        return { 
                            key: element[0], 
                        values: element.slice(1,maxlen+1)
                        .slice(0,maxlen).concat((Array(Math.abs(maxlen-Math.min(element.length-1,maxlen))+1).join(",0").split(",").splice(1).map(function(v){return Number(v)})))
                        .map(function(val,ind){return {x:ind,y:val};})};
                    });
                }
                return data;
            };
            adapters.toStackedBar = toStackedBar;


        })(adapters = dw.adapters || (dw.adapters = {}));
        
        var graphs=[];
        dw.graphs = graphs;
        var charts;
        (function (charts) {
            function appendToGraphList(graph){dw.graphs.push(graph);}
            
            function Histogram(i, data) {
                nv.addGraph( function () {
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
                },appendToGraphList);
            }
            charts.Histogram = Histogram;

            function Scatter(i, data) {
                nv.addGraph(function () {

                    var chart = nv.models.scatterChart()
                        .pointSize(function (d) {
                            return d.r
                        })
                        .showDistX(true)
                        .showDistY(true)
                        .duration(300)
                        .color(d3.scale.category10().range());


                    chart.xAxis.tickFormat(d3.format('.2f'));
                    chart.yAxis.tickFormat(d3.format('.2f'));


                    d3.select('#chart' + i)
                        .datum(data)
                        .call(chart);

                    nv.utils.windowResize(chart.update);
                    return chart;
                },appendToGraphList);
            };
            charts.Scatter = Scatter;

            function Line(i, data) {
                nv.addGraph(function () {
                    var chart = nv.models.lineChart()
                    chart.dispatch.on('renderEnd', function () {
                        console.log('render line chart complete');
                    });
                    chart.xAxis.tickFormat(d3.format('.02f'));
                    chart.yAxis.tickFormat(d3.format('.02f'));
                    d3.select('#chart' + i)
                        .datum(data)
                        .call(chart);
                    nv.utils.windowResize(chart.update);
                    return chart;
                },appendToGraphList);
            };
            charts.Line = Line;

            function StackedBar(i, data) {
                nv.addGraph( function () {

                    var chart = nv.models.multiBarChart()
                        .barColor(d3.scale.category20().range())
                        .stacked(true)
                        .options({showControls:false})
                        .duration(250)
                        .rotateLabels(360)
                        .groupSpacing(0.3)
                        ;

                    chart.reduceXTicks(false).staggerLabels(true);

                    chart.xAxis
                        .axisLabelDistance(5)
                        .showMaxMin(false)
                        .tickFormat(d3.format(',.0f'))
                    ;

                    chart.yAxis
                        .axisLabelDistance(-5)
                        .tickFormat(d3.format(',.01f'))
                    ;

                    chart.dispatch.on('renderEnd', function () {
                        nv.log('Render Complete');
                    });

                    d3.select('#chart' + i)
                        .datum(data)
                        .call(chart);

                    nv.utils.windowResize(chart.update);

                    chart.dispatch.on('stateChange', function (e) {
                        nv.log('New State:', JSON.stringify(e));
                    });
                    chart.state.dispatch.on('change', function (state) {
                        nv.log('state', JSON.stringify(state));
                    });

                    return chart;
                },appendToGraphList);
            }
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
                    dw.charts.Line(chId, data);

                    break;
                case TypeChart.Scatter:
                    chId = createChartElement();
                    data = dw.adapters.toScatter(_self);
                    dw.charts.Scatter(chId, data);
                    break;
                case TypeChart.Histogram:
                    chId = createChartElement();
                    data = dw.adapters.toHistogram(_self);
                    dw.charts.Histogram(chId, data);
                    break;
                    case TypeChart.StackedBar:
                    chId = createChartElement();
                    data = dw.adapters.toStackedBar(_self);
                    dw.charts.StackedBar(chId, data);
                    break;
                default:
                    console.log('Unavalible chart');
                    break;
            }
            console.log("Prime muls:",OnCalcPrime(document.querySelectorAll("#chartsContainer svg").length));
        }

        console.log('Drawing chart type: ', TypeChart[detectType(this)]);
        console.log('Source data', this);
        loadLib(appendChart);
    }
    Object.defineProperty(Object.prototype, 'draw', { enumerable: false, value: draw });
    global.dw = dw;
})(window);