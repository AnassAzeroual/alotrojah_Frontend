<?php
// SPA fallback for prod-build verification (Lighthouse): serve real files from
// dist/, route everything else to index.html. Usage:
//   php -S 127.0.0.1:8090 -t dist/alotrojah scripts/serve-dist.php
$root = realpath(__DIR__ . '/../dist/alotrojah/browser');
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = realpath($root . $path);
if ($path !== '/' && $file !== false && str_starts_with($file, $root) && is_file($file)) {
    return false;
}
readfile($root . '/index.html');
