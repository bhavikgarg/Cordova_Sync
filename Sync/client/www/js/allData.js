$(document).ready(function(){
  $('#message').html("Getting all data");
  db.transaction(function(transaction) {
      transaction.executeSql('SELECT * FROM user_data', [], function (tx, results) {
        var noOfRecords = results.rows.length, i;
        for (i = 0; i < noOfRecords; i++){
          var row = "<tr><td>"+results.rows.item(i).uid+
                    "</td><td>"+results.rows.item(i).fname+
                    "</td><td>"+results.rows.item(i).lname+
                    "</td><td>"+results.rows.item(i).username+
                    "</td><td>"+results.rows.item(i).password+
                    "</td><td>"+results.rows.item(i).email+
                    "</td><td>"+results.rows.item(i).is_synched+
                    "</td></tr>";
          $("#tbody").append(row);

        }

      }, null);
  });
})
