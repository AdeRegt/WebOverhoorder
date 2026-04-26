<?php 
    header("Content-Type: application/javascript");
?>
window.githubversion = "<?php echo substr(file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . ".git" . DIRECTORY_SEPARATOR . "ORIG_HEAD"),0,7); ?>";