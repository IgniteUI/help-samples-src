
        $(function () {

            var data = [
                      { "名前": "John Smith", "年齢": 45 },
                      { "名前": "Mary Johnson", "年齢": 32 },
                      { "名前": "Bob Ferguson", "年齢": 27 }
                ];
            
            $("#grid").igGrid({
                dataSource: data //JSON Array defined above                     
            });
        });
    