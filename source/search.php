<?php
/*$path = realpath('/\\THUIS-SERVER\Muziek\Caro Emerald');

$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path), RecursiveIteratorIterator::SELF_FIRST);

foreach($objects as $name => $object){
        $paths[] = $object->getPathname();
}

print_r($paths);*/



$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("/\\THUIS-SERVER\Muziek\Caro Emerald"), RecursiveIteratorIterator::SELF_FIRST);
foreach ($iterator as $fileinfo) {
    if (!$iterator->isDot()) {
        echo $fileinfo->getFilename() . "<p>";
    }
}



?>