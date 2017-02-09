
            $.ig.loader({
                scriptPath: "https://secure-cdn-na.infragistics.com/igniteui/latest/js/",
                cssPath: "https://secure-cdn-na.infragistics.com/igniteui/latest/css/",
                resources:'igGrid,' +
                    'modules/infragistics.documents.core.js,' +
                    'modules/infragistics.excel.js,' +
                    'modules/infragistics.gridexcelexporter.js' 
            });

        $.ig.loader(function () {
            $(function () {
                    var data = [
                        { 'ProductID': 1, 'Name': 'Omnis ut illum nisi.', 'ProductNumber': '2973311236' },
                        { 'ProductID': 2, 'Name': 'Quis quibusdam qui.', 'ProductNumber': '5907101619' },
                        { 'ProductID': 3, 'Name': 'Sint laudantium et.', 'ProductNumber': '3057803521' },
                        { 'ProductID': 17, 'Name': 'Tempore eos.', 'ProductNumber': '3576608248' },
                        { 'ProductID': 18, 'Name': 'Maiores aut ducimus.', 'ProductNumber': '7079645227' },
                        { 'ProductID': 19, 'Name': 'Vel inventore.', 'ProductNumber': '191484500' },
                        { 'ProductID': 20, 'Name': 'Ut molestiae.', 'ProductNumber': '2994899561' },
                        { 'ProductID': 31, 'Name': 'Nihil magnam aut ut.', 'ProductNumber': '5652753011' },
                        { 'ProductID': 32, 'Name': 'Repellendus dolorum.', 'ProductNumber': '8807902556' },
                        { 'ProductID': 43, 'Name': 'Odit ut quo minus.', 'ProductNumber': '1083007847' }
                    ];

                    $("#grid").igGrid({
                        autoGenerateColumns: false,
                        width: "100%",
                        height: "200px",
                        columns: [
                            { key: "ProductID", headerText: "Product ID", width: "100px", dataType: "number" },
                            { key: "Name", headerText: "Product Name", width: "150px", dataType: "string" },
                            { key: "ProductNumber", headerText: "Product Number", width: "200px", dataType: "number" }
                        ],
                        dataSource: data,
                        primaryKey: "ProductID"
                    });

                    $("#exportButton").on("click", function () {
                        $.ig.GridExcelExporter.exportGrid($("#grid"), {
                            fileName: "igGrid"
                        });
                    });
                });
            });
        