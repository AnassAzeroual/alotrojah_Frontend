<?php

declare(strict_types=1);

/**
 * One-shot server-side frontend extractor.
 *
 * Upload to public_html/deploy.php and public_html/frontend.zip, then call:
 *   https://alotrojah.ma/deploy.php?action=extract
 *
 * 1. Authenticate with DEPLOY_TOKEN.
 * 2. Back up the current public_html release outside the web root.
 * 3. Replace the release while preserving hosting metadata.
 * 4. Extract frontend.zip, remove it, reset opcache and self-delete.
 */

define('DEPLOY_TOKEN', '__DEPLOY_TOKEN__');

header('Content-Type: application/json');

$token = (string) ($_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? $_GET['token'] ?? '');
if (! hash_equals(DEPLOY_TOKEN, $token)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'forbidden']);
    exit;
}
if (! class_exists('ZipArchive')) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'ziparchive-missing']);
    exit;
}

set_time_limit(600);

$dest = __DIR__;
$incoming = $dest.'/frontend.zip';
$home = dirname($dest);
$lockPath = $home.'/.frontend-deploy.lock';
$backupDir = $home.'/.frontend-backups';

if (! is_file($incoming)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'frontend.zip-missing']);
    exit;
}

$deployLock = @fopen($lockPath, 'c');
if ($deployLock === false || ! flock($deployLock, LOCK_EX | LOCK_NB)) {
    http_response_code(423);
    echo json_encode(['ok' => false, 'error' => 'deploy-already-running']);
    exit;
}

function wipe_path(string $path): void
{
    if (is_link($path)) {
        @unlink($path);

        return;
    }
    if (is_file($path)) {
        @unlink($path);

        return;
    }
    if (! is_dir($path)) {
        return;
    }
    foreach (@scandir($path) ?: [] as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        wipe_path($path.'/'.$item);
    }
    @rmdir($path);
}

function backup_release(string $dest, string $backupDir): ?string
{
    if (! @mkdir($backupDir, 0700, true) && ! is_dir($backupDir)) {
        return null;
    }
    $filename = 'release-'.date('Ymd-His').'.zip';
    $path = $backupDir.'/'.$filename;
    $zip = new ZipArchive;
    if ($zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        return null;
    }

    $skipExact = ['deploy.php', 'frontend.zip'];
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dest, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST,
    );
    foreach ($files as $file) {
        $name = str_replace('\\', '/', substr($file->getPathname(), strlen($dest) + 1));
        if ($name === '' || $file->isDir() || in_array($name, $skipExact, true)) {
            continue;
        }
        $zip->addFile($file->getPathname(), $name);
    }
    $zip->close();

    $backups = glob($backupDir.'/release-*.zip') ?: [];
    sort($backups);
    while (count($backups) > 5) {
        @unlink(array_shift($backups));
    }

    return $filename;
}

$backup = backup_release($dest, $backupDir);
if ($backup === null) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'backup-failed']);
    exit;
}

$reserved = ['.well-known', 'cgi-bin', '.user.ini', 'php.ini', '.ftpquota', 'deploy.php', 'frontend.zip'];
foreach (@scandir($dest) ?: [] as $entry) {
    if ($entry === '.' || $entry === '..' || in_array($entry, $reserved, true)) {
        continue;
    }
    wipe_path($dest.'/'.$entry);
}

$zip = new ZipArchive;
if ($zip->open($incoming) !== true) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'zip-open-failed']);
    exit;
}
$count = $zip->numFiles;
for ($i = 0; $i < $count; $i++) {
    $name = str_replace('\\', '/', (string) $zip->getNameIndex($i));
    if (
        $name === ''
        || str_starts_with($name, '/')
        || preg_match('#^[A-Za-z]:#', $name)
        || preg_match('#(^|/)\.\.(/|$)#', $name)
    ) {
        $zip->close();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'unsafe-zip-entry']);
        exit;
    }
}
if (! $zip->extractTo($dest)) {
    $zip->close();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'extract-failed']);
    exit;
}
$zip->close();

if (function_exists('opcache_reset')) {
    @opcache_reset();
}

@unlink($incoming);
@unlink(__FILE__);
$extractorGone = ! file_exists(__FILE__);
$ok = $extractorGone;

if (! $ok) {
    http_response_code(500);
}

echo json_encode([
    'ok' => $ok,
    'files' => $count,
    'backup' => $backup,
    'extractor_deleted' => $extractorGone,
]);
