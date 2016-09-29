var obj = {
  uid : "",
  fname : "",
  lname : "",
  username : "",
  password : "",
  email : ""
}
function initializeDB(){
  db = sqlitePlugin.openDatabase('sync.db');
  if(db){
    alert("DB initialised");
    db.transaction(function(transaction) {
      transaction.executeSql('CREATE TABLE IF NOT EXISTS user_data (uid text primary key, fname text, lname text, username text , password text, email text, is_synched INTEGER)', [],
      function(tx, result) {
        alert("Table created successfully");
      },
      function(error) {
        alert("Error occurred while creating the table.");
      });
    });
    return db;
  }
}
// returns true if device is online , false otherwise
function isNetworkAvailable(){
  var networkState = navigator.connection.type;
  alert(networkState);
  if(networkState == Connection.NONE){
    return false;
  }
  return true;
}
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}
function onOnline(){
  alert("Device is online");
  // get objects that are not synched, with is_synched = 0
  db.transaction(function(transaction) {
      transaction.executeSql('SELECT * FROM user_data WHERE is_synched=?', [0], function (tx, results) {
        var noOfRecords = results.rows.length, i;
        for (i = 0; i < noOfRecords; i++){
          var obj = {
            fname : results.rows.item(i).fname,
            lname : results.rows.item(i).lname,
            username : results.rows.item(i).username,
            password : results.rows.item(i).password,
            email : results.rows.item(i).email,
            uid : results.rows.item(i).uid,
          }
          sendToServer(obj);

        }

      }, null);
  });

}
function onOffline(){
  alert("Your device is offline");
}

function storeLocal(db){
  obj.uid = generateUUID();
  alert("UID : "+obj.uid);
  obj.fname = $('#first_name').val();
  obj.lname = $('#last_name').val();
  obj.username = $('#username').val();
  obj.password = $('#password').val();
  obj.email = $('#email').val();
  // for this variable , 0 = not synched , 1 = synched
  obj.isSynched = 0;
  alert(JSON.stringify(obj));
  db.transaction(function(transaction) {
    var executeQuery = "INSERT INTO user_data (uid, fname , lname, username, password, email, is_synched) VALUES (?,?,?,?,?,?,?)";
    transaction.executeSql(executeQuery, [obj.uid, obj.fname, obj.lname, obj.username, obj.password, obj.email, obj.isSynched]
    , function(tx, result) {
      alert("Form submitted successfully");
      // if online
      sendToServer(obj);
    },
    function(error){
      alert('Error occurred');
    });
  });
}
function sendToServer(object){
  alert("send called");
  if(isNetworkAvailable()){
    $.ajax({
      url : 'http://sixlines.in/save.php',
      type : 'POST',
      data : {data : JSON.stringify(object)},
      beforeSend : function(){
        alert("Sending to server");
      },
      success : function(response){
        alert("Response : "+response);
         // update is_synched flag to 1
         db.transaction(function(transaction) {
         var executeQuery = "UPDATE user_data SET is_synched=? WHERE uid=?";
         transaction.executeSql(executeQuery, [1,object.uid],
            function(tx, result)
            {
              alert('Updated successfully');
              return true;
            },
            function(error)
            {
              alert('Something went Wrong');
            }
          );
         });
      },
      error : function(err){
        alert("Error in sending : "+JSON.stringify(err));
      },
      complete : function(){
        alert("AJAX complete");
      }
    })
  } else {
    alert("Network not available");
  }
}
function getAllData(){
  alert("get all data call");
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
}
