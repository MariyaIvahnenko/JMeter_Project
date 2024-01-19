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

    var data = {"OkPercent": 96.23792503430771, "KoPercent": 3.762074965692298};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9621732359562656, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9615593641971504, 500, 1500, "HTTP Request для GET /character/id"], "isController": false}, {"data": [0.9605959050426827, 500, 1500, "HTTP Request для GET /characters."], "isController": false}, {"data": [0.9626627426249037, 500, 1500, "HTTP Request для POST /character"], "isController": false}, {"data": [0.9629613010519585, 500, 1500, "HTTP Request для PUT /character/id"], "isController": false}, {"data": [0.9630904310395627, 500, 1500, "HTTP Request для DELETE /character/id"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1783856, 67110, 3.762074965692298, 842.4983827169962, 1, 154022, 95.0, 118.0, 126.0, 10002.0, 1173.2012366960146, 548.5787709673625, 205.88292266605197], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["HTTP Request для GET /character/id", 356966, 13617, 3.814649014191828, 860.7374791997132, 1, 87772, 97.0, 121.0, 129.0, 10001.990000000002, 234.78426729807944, 69.50195184038739, 28.280264059828003], "isController": false}, {"data": ["HTTP Request для GET /characters.", 357171, 13817, 3.8684551657329402, 887.7405276464184, 2, 154002, 97.0, 121.0, 133.0, 10002.0, 234.9031866428412, 262.699856509244, 28.06361483461394], "isController": false}, {"data": ["HTTP Request для POST /character", 356775, 13319, 3.7331651601149183, 832.3849120594363, 1, 91163, 97.0, 121.0, 130.0, 10001.0, 234.65895114305596, 69.22566813611469, 50.9894956113054], "isController": false}, {"data": ["HTTP Request для PUT /character/id", 356573, 13204, 3.7030285523581425, 815.4209124078567, 1, 154022, 97.0, 121.0, 133.0, 10003.0, 234.52794224624537, 74.99478134171191, 51.1813899562348], "isController": false}, {"data": ["HTTP Request для DELETE /character/id", 356371, 13153, 3.6908165928204033, 816.1028815476114, 2, 154002, 97.0, 121.0, 137.95000000000073, 10015.980000000003, 234.3980104803643, 72.17822833853603, 47.381771401658284], "isController": false}]}, function(index, item){
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
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1783856, 67110, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 50952, "The operation lasted too long: It took 60,034 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 13, "The operation lasted too long: It took 60,025 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 13, "The operation lasted too long: It took 60,030 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 11, "The operation lasted too long: It took 60,027 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 10], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["HTTP Request для GET /character/id", 356966, 13617, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 10279, "The operation lasted too long: It took 50,804 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 47,032 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 3, "The operation lasted too long: It took 51,309 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 3, "The operation lasted too long: It took 46,573 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 3], "isController": false}, {"data": ["HTTP Request для GET /characters.", 357171, 13817, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 10385, "The operation lasted too long: It took 60,025 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 13, "The operation lasted too long: It took 60,034 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 13, "The operation lasted too long: It took 60,030 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 11, "The operation lasted too long: It took 60,027 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 10], "isController": false}, {"data": ["HTTP Request для POST /character", 356775, 13319, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 10116, "The operation lasted too long: It took 53,469 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 46,355 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 46,647 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 48,165 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 3], "isController": false}, {"data": ["HTTP Request для PUT /character/id", 356573, 13204, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 10124, "The operation lasted too long: It took 46,525 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 51,005 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 46,448 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 50,669 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 3], "isController": false}, {"data": ["HTTP Request для DELETE /character/id", 356371, 13153, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 10048, "The operation lasted too long: It took 50,530 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 53,919 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 47,488 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4, "The operation lasted too long: It took 46,566 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 4], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});