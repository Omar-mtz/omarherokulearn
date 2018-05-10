<?php

$db = mysqli_connect("us-cdbr-iron-east-04.cleardb.net/heroku_58696cbe5477847", "b1129d569e3212", "c6278534");
 
if($db === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
 
echo "Connect Successfully. Host info: " . mysqli_get_host_info($db);


//mysql://b1129d569e3212:c6278534@us-cdbr-iron-east-04.cleardb.net/heroku_58696cbe5477847?reconnect=true


