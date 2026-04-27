<?php 
    header("Content-Type: application/javascript");
    $filepath = __DIR__ . DIRECTORY_SEPARATOR . "cgi-bin" . DIRECTORY_SEPARATOR . "hash.txt";
    if(file_exists($filepath)){
?>
window.githubversion = "<?php echo substr(file_get_contents($filepath),0,7); ?>";
<?php 
    }else{
?>
window.githubversion = "ontwikkeling";
<?php 
    }
?>