
        $(function () {
                        
            //Sample XML Data
            var xmlDoc = '' +
                '' +
                    '' +
                '' +
                '' +
                    '' +
                '' +
                '' +
                    '' +
                '' +
            '';

            //Binding to XML requires a schema to define data fields
            var xmlSchema = new $.ig.DataSchema("xml",
                { 
                    //searchField serves as the base node(s) for the XPaths
                    searchField: "//Person", 
                    fields: [
                        { name: "Name", xpath: "./@Name" },
                        { name: "Email", xpath: "Details/@Email" },
                        { name: "Age", xpath: "Details/@Age" }
                    ]
                }
            );

            //This creates an Infragistics datasource from the XML 
            //and the Schema which can be consumed by the grid.
            var ds = new $.ig.DataSource({
                type: "xml",
                dataSource: xmlDoc,
                schema: xmlSchema 
            });

            $("#grid").igGrid({
                dataSource: ds //$.ig.DataSource defined above
            });

        });

    