<?php

declare(strict_types=1);

/**
 * Build the production frontend archive.
 *
 * Usage: php deploy_script/Build-Zip.php
 *
 * The archive root is the Angular browser output, so the server extractor can
 * unpack it directly into public_html/.
 */
$appRoot = dirname(__DIR__);
$source = $appRoot.'/dist/alotrojah/browser';
$outZip = $appRoot.'/deploy_script/frontend.zip';

if (! is_dir($source)) {
    fwrite(STDERR, "Missing frontend build: $source. Run npm run build first.\n");
    exit(1);
}
if (! class_exists('ZipArchive')) {
    fwrite(STDERR, "php-zip missing. Enable ext-zip.\n");
    exit(1);
}

@unlink($outZip);
$zip = new ZipArchive;
if ($zip->open($outZip, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    fwrite(STDERR, "Cannot create $outZip\n");
    exit(1);
}

$exclude = ['.DS_Store', 'Thumbs.db'];
$count = 0;
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($source, FilesystemIterator::SKIP_DOTS),
);
foreach ($files as $file) {
    if (! $file->isFile()) {
        continue;
    }
    $relative = str_replace('\\', '/', substr($file->getPathname(), strlen($source) + 1));
    if (in_array(basename($relative), $exclude, true)) {
        continue;
    }
    $zip->addFile($file->getPathname(), $relative);
    $count++;
}
$zip->close();

printf("frontend.zip built: %d files, %.2f MB\n", $count, filesize($outZip) / 1048576);
