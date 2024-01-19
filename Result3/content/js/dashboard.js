/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 89.43765281173594, "KoPercent": 10.56234718826406};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8449327628361858, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8094132029339853, 500, 1500, "HTTP Request для GET /character/id"], "isController": false}, {"data": [0.7198349633251834, 500, 1500, "HTTP Request для GET /characters."], "isController": false}, {"data": [0.8505501222493888, 500, 1500, "HTTP Request для POST /character"], "isController": false}, {"data": [0.9087408312958435, 500, 1500, "HTTP Request для PUT /character/id"], "isController": false}, {"data": [0.9361246943765281, 500, 1500, "HTTP Request для DELETE /character/id"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 81800, 8640, 10.56234718826406, 1823.2855745721097, 0, 55161, 14.0, 50.0, 10007.0, 28049.99, 1134.850166481687, 578.1753590845242, 186.05308066991537], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["HTTP Request для GET /character/id", 16360, 2445, 14.944987775061124, 2392.8772004890025, 0, 55161, 21.0, 10001.0, 10251.0, 26615.079999998678, 227.16227662144712, 128.25868867937626, 23.962928294096], "isController": false}, {"data": ["HTTP Request для GET /characters.", 16360, 3118, 19.058679706601467, 2886.2269559902343, 1, 28157, 30.0, 10002.0, 10240.0, 16638.79999999999, 226.98892804617478, 186.8237202389211, 22.60713598176874], "isController": false}, {"data": ["HTTP Request для POST /character", 16360, 1493, 9.125916870415647, 1999.3108801955898, 1, 54672, 20.0, 10001.0, 10016.949999999999, 28027.0, 227.3453676296883, 100.03521058715832, 46.20209590524729], "isController": false}, {"data": ["HTTP Request для PUT /character/id", 16360, 1045, 6.387530562347188, 1092.409290953546, 0, 31730, 19.0, 220.89999999999964, 10002.949999999999, 13021.289999999994, 227.36116515648453, 91.13723794749569, 47.80550027968481], "isController": false}, {"data": ["HTTP Request для DELETE /character/id", 16360, 539, 3.2946210268948657, 745.6035452322741, 1, 28058, 19.0, 202.0, 10000.0, 12099.429999999978, 227.38328538270164, 72.49829306175208, 45.739226418192054], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 8320, 96.29629629629629, 10.17114914425428], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 52, 0.6018518518518519, 0.06356968215158924], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 268, 3.1018518518518516, 0.3276283618581907], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 81800, 8640, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 8320, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 268, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 52, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["HTTP Request для GET /character/id", 16360, 2445, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2151, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 243, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 51, "", "", "", ""], "isController": false}, {"data": ["HTTP Request для GET /characters.", 16360, 3118, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3103, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 15, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request для POST /character", 16360, 1493, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1482, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 1, "", "", "", ""], "isController": false}, {"data": ["HTTP Request для PUT /character/id", 16360, 1045, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1045, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request для DELETE /character/id", 16360, 539, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 539, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
