<?php

$db = mysqli_connect("localhost", "root", "root", "morena_db");
 
if($db === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
 
echo "Connect Successfully. Host info: " . mysqli_get_host_info($db);
?>
