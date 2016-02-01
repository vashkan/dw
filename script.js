(function (global) {
    var chartId = 0;
    var chartsContainer;
    var TypeChart;
    (function (TypeChart) {
        TypeChart[TypeChart["Unknown"] = 0] = "Unknown";
        TypeChart[TypeChart["Histogram"] = 1] = "Histogram";
        TypeChart[TypeChart["Scatter"] = 2] = "Scatter";
        TypeChart[TypeChart["Line"] = 3] = "Line";
        TypeChart[TypeChart["StackedBar"] = 4] = "StackedBar";
    })(TypeChart || (TypeChart = {}));
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
        var context = this;
        this.typeChart = detectType(this);
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

        function appendChart() {
            chartId++;
            chartsContainer = chartsContainer||document.getElementById("chartsContainer")||(function(){ var re = document.createElement('div'); return re.id='chartsContainer',document.body.appendChild(re),re;})();
            switch (context.typeChart) {
                case TypeChart.Line:
                    chartsContainer.insertBefore((function (i) {
                        var el = document.createElementNS("http://www.w3.org/2000/svg","svg")
                        el.id = "test" + i;
                        return el
                    })(chartId), chartsContainer.firstChild);
                    nv.addGraph((function (i) {
                            return function () {
                                var width = chartsContainer.clientWidth - 40,
                                    height = chartsContainer.clientHeight - 40;

                                var chart = nv.models.line()
                                    .width(width)
                                    .height(height)
                                    .margin({ top: 20, right: 20, bottom: 20, left: 20 });

                                chart.dispatch.on('renderEnd', function () {
                                    console.log('render complete');
                                });

                                d3.select('#test' + i)
                                    .attr('width', width)
                                    .attr('height', height)
                                    .datum(sinAndCos())
                                    .call(chart);

                                return chart;
                            }
                        })(chartId),
                        (function (i) {
                            return function (graph) {
                                window.onresize = function () {
                                    var width = chartsContainer.clientWidth - 40,
                                    height = chartsContainer.clientHeight - 40,
                                        margin = graph.margin();

                                    if (width < margin.left + margin.right + 20)
                                        width = margin.left + margin.right + 20;

                                    if (height < margin.top + margin.bottom + 20)
                                        height = margin.top + margin.bottom + 20;

                                    graph.width(width).height(height);

                                    d3.select('#test' + i)
                                        .attr('width', width)
                                        .attr('height', height)
                                        .call(graph);
                                };
                            }
                        })(chartId)
                    );

                    break;
                case TypeChart.Scatter:
                    chartsContainer.insertBefore((function (i) {
                        var el = document.createElementNS("http://www.w3.org/2000/svg","svg")
                        el.id = "test" + i;
                        return el
                    })(chartId), chartsContainer.firstChild);
                    nv.addGraph((function (i) {
                        return function () {

                            var chart = nv.models.scatter()
                                .margin({ top: 20, right: 20, bottom: 20, left: 20 })
                                .pointSize(function (d) {
                                    return d.z
                                })
                                .useVoronoi(false);

                            d3.select('#test' + i)
                                .datum(randomData())
                                .transition().duration(500)
                                .call(chart);

                            nv.utils.windowResize(chart.update);
                            return chart;
                        }
                    })(chartId));

                    function randomData() {
                        var data = [];

                        for (var i = 0; i < 2; i++) {
                            data.push({
                                key: 'Group ' + i,
                                values: []
                            });

                            for (var j = 0; j < 10; j++) {
                                data[i].values.push({ x: Math.random(), y: Math.random(), z: Math.random() * 10 });
                            }
                        }

                        return data;
                    }

                    break;
                default:
                    break;
            }

            function sinAndCos() {
                var sin = [],
                    cos = [];

                for (var i = 0; i < 100; i++) {
                    sin.push({ x: i, y: Math.sin(i / 10) });
                    cos.push({ x: i, y: .5 * Math.cos(i / 10) });
                }

                return [
                    {
                        values: sin,
                        key: "Sine Wave",
                        color: "#ff7f0e"
                    },
                    {
                        values: cos,
                        key: "Cosine Wave",
                        color: "#2ca02c",
                        strokeWidth: 3
                    }
                ];
            }
        }

        console.log('Drawing chart type: ', TypeChart[detectType(this)]);
        console.log('Source data',this);
        loadLib(appendChart);
    }
    Object.defineProperty(Object.prototype, 'draw', { enumerable: false, value: draw });
})(window);