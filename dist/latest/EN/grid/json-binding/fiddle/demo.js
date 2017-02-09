
        $(function () {

            var data = [
                      { "Name": "John Smith", "Age": 45 },
                      { "Name": "Mary Johnson", "Age": 32 },
                      { "Name": "Bob Ferguson", "Age": 27 }
                ];
            
            $("#grid").igGrid({
                dataSource: data //JSON Array defined above                     
            });
        });
    