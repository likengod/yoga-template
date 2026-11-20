<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$envFile = __DIR__ . '/.env';
$serverEnvFile = __DIR__ . '/server/.env';

function parseCustomEnv($path) {
    if (!file_exists($path)) return [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $vars = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0 || strpos($line, ';') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            if (preg_match('/^(["\'])(.*)\1$/s', $val, $matches)) {
                $val = $matches[2];
            }
            $vars[$key] = $val;
        }
    }
    return $vars;
}

function executeSchemaMigration($mysqli, $schemaFile) {
    if (!$schemaFile || !file_exists($schemaFile)) {
        return 0;
    }
    $sql = file_get_contents($schemaFile);
    if (empty($sql)) {
        return 0;
    }

    // Disable foreign key checks during migration
    @$mysqli->query("SET FOREIGN_KEY_CHECKS = 0;");

    // Ensure CREATE TABLE IF NOT EXISTS
    $sql = preg_replace('/CREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS)/i', 'CREATE TABLE IF NOT EXISTS ', $sql);

    // Remove comments
    $lines = explode("\n", $sql);
    $cleanSql = '';
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if (strpos($trimmed, '--') === 0 || strpos($trimmed, '#') === 0) continue;
        $cleanSql .= $line . "\n";
    }

    $statements = array_filter(array_map('trim', explode(';', $cleanSql)));
    $successCount = 0;

    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            if (@$mysqli->query($stmt)) {
                $successCount++;
            }
        }
    }

    @$mysqli->query("SET FOREIGN_KEY_CHECKS = 1;");
    return $successCount;
}

// Action: Status Check (Tests actual database connection and table existence)
if ($_SERVER['REQUEST_METHOD'] === 'GET' || (isset($_GET['action']) && $_GET['action'] === 'status')) {
    $isConfigured = false;
    $dbError = null;

    $candidates = [
        $envFile,
        $serverEnvFile,
        dirname(__DIR__) . '/.env',
        dirname(__DIR__) . '/server/.env'
    ];

    $foundEnv = null;
    foreach ($candidates as $c) {
        if (file_exists($c)) {
            $foundEnv = $c;
            break;
        }
    }

    if ($foundEnv) {
        $env = parseCustomEnv($foundEnv);
        if ($env && (!empty($env['DATABASE_URL']) || !empty($env['DB_HOST'])) && !empty($env['ADMIN_PASSWORD'])) {
            $dbHost = $env['DB_HOST'] ?? '127.0.0.1';
            $dbPort = isset($env['DB_PORT']) ? (int)$env['DB_PORT'] : 3306;
            $dbUser = $env['DB_USER'] ?? '';
            $dbPass = $env['DB_PASSWORD'] ?? '';
            $dbName = $env['DB_NAME'] ?? '';

            if (empty($dbUser) && !empty($env['DATABASE_URL'])) {
                $dbUrl = $env['DATABASE_URL'];
                if (preg_match('#mysql://([^:]+):([^@]+)@([^:/]+)(?::(\d+))?/(.+)$#', $dbUrl, $m)) {
                    $dbHost = $m[3];
                    $dbPort = !empty($m[4]) ? (int)$m[4] : 3306;
                    $dbUser = urldecode($m[1]);
                    $dbPass = urldecode($m[2]);
                    $dbName = urldecode($m[5]);
                }
            }

            if (!empty($dbUser) && !empty($dbName)) {
                $mysqli = @new mysqli($dbHost, $dbUser, $dbPass, $dbName, $dbPort);
                if (!$mysqli->connect_errno) {
                    $tblCheck = $mysqli->query("SHOW TABLES LIKE 'users'");
                    if ($tblCheck && $tblCheck->num_rows > 0) {
                        $isConfigured = true;
                    }
                    $mysqli->close();
                } else {
                    $dbError = $mysqli->connect_error;
                }
            }
        }
    }

    echo json_encode([
        'isConfigured' => $isConfigured,
        'databaseConnected' => $isConfigured,
        'error' => $dbError
    ]);
    exit;
}

// Action: Configure
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON payload received.']);
        exit;
    }

    $dbHost = !empty($data['dbHost']) ? trim($data['dbHost']) : '127.0.0.1';
    $dbPort = !empty($data['dbPort']) ? (int)$data['dbPort'] : 3306;
    $dbUser = !empty($data['dbUser']) ? trim($data['dbUser']) : '';
    $dbPassword = isset($data['dbPassword']) ? $data['dbPassword'] : '';
    $dbName = !empty($data['dbName']) ? trim($data['dbName']) : '';
    $adminEmail = !empty($data['adminEmail']) ? trim($data['adminEmail']) : 'admin@shaktiyogaraai.com';
    $adminPassword = !empty($data['adminPassword']) ? trim($data['adminPassword']) : '';
    $jwtSecret = !empty($data['jwtSecret']) ? trim($data['jwtSecret']) : bin2hex(random_bytes(16));
    $appPort = !empty($data['port']) ? (int)$data['port'] : 3000;

    if (empty($dbUser) || empty($dbName)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Database username and database name are required.']);
        exit;
    }

    // 1. Connect to MySQL Database directly (automatically tries localhost and 127.0.0.1)
    $hostsToTry = array_values(array_unique([$dbHost, 'localhost', '127.0.0.1']));
    $mysqli = null;
    $connectedHost = null;
    $lastError = '';
    $lastErrno = 0;

    foreach ($hostsToTry as $candidateHost) {
        $mysqli = @new mysqli($candidateHost, $dbUser, $dbPassword, $dbName, $dbPort);
        if (!$mysqli->connect_errno) {
            $connectedHost = $candidateHost;
            $dbHost = $candidateHost;
            break;
        }
        $lastError = $mysqli->connect_error;
        $lastErrno = $mysqli->connect_errno;
    }

    if (!$connectedHost) {
        // If connecting to the specific DB fails, try connecting without DB name to attempt database creation (for VPS / root)
        foreach ($hostsToTry as $candidateHost) {
            $mysqliRoot = @new mysqli($candidateHost, $dbUser, $dbPassword, '', $dbPort);
            if (!$mysqliRoot->connect_errno) {
                $mysqliRoot->query("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                $mysqliRoot->close();
                $mysqli = @new mysqli($candidateHost, $dbUser, $dbPassword, $dbName, $dbPort);
                if (!$mysqli->connect_errno) {
                    $connectedHost = $candidateHost;
                    $dbHost = $candidateHost;
                    break;
                }
            }
        }
    }

    if (!$connectedHost || $mysqli->connect_errno) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => "Database Connection Failed: [Error {$lastErrno}] {$lastError}\n\nTried connecting via: " . implode(', ', $hostsToTry) . ".\nPlease verify that your database password is correct in Hostinger, and that user '{$dbUser}' has full privileges on '{$dbName}'."
        ]);
        exit;
    }

    $mysqli->set_charset('utf8mb4');

    // 2. Execute schema.sql to create all 20 tables statement by statement
    $schemaCandidates = [
        __DIR__ . '/schema.sql',
        __DIR__ . '/server/schema.sql',
        dirname(__DIR__) . '/server/schema.sql',
        __DIR__ . '/public/schema.sql'
    ];
    $schemaFile = null;
    foreach ($schemaCandidates as $candidate) {
        if (file_exists($candidate)) {
            $schemaFile = $candidate;
            break;
        }
    }

    $migratedCount = executeSchemaMigration($mysqli, $schemaFile);

    // 3. Insert or update Admin User
    $cleanPass = $mysqli->real_escape_string($adminPassword);
    $cleanEmail = $mysqli->real_escape_string($adminEmail);
    @$mysqli->query("
        INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `phone`, `created_at`, `updated_at`)
        VALUES ('admin-01', 'admin', '{$cleanEmail}', '{$cleanPass}', 'admin', '', NOW(3), NOW(3))
        ON DUPLICATE KEY UPDATE `password` = '{$cleanPass}', `role` = 'admin', `email` = '{$cleanEmail}';
    ");

    // Insert Default Site Settings
    $checkSettings = @$mysqli->query("SELECT id FROM site_settings LIMIT 1");
    if (!$checkSettings || $checkSettings->num_rows === 0) {
        @$mysqli->query("INSERT INTO site_settings (id, site_name, site_title, contact_email, phone, address, updated_at) VALUES ('settings-01', 'Shakti Yoga', 'Shakti Yoga - Find Your Inner Peace', '{$cleanEmail}', '+91 94365 88990', 'Agartala, Tripura', NOW(3))");
    }

    // Insert Default Home Content
    $checkHome = @$mysqli->query("SELECT id FROM home_content LIMIT 1");
    if (!$checkHome || $checkHome->num_rows === 0) {
        $statsJson = json_encode(['years' => '15+', 'students' => '20k+', 'classes' => '50+']);
        $featuresJson = json_encode([
            ['title' => 'Expert Teachers', 'description' => 'Certified instructors with years of experience.'],
            ['title' => 'Flexible Schedule', 'description' => 'Classes from early morning to late evening.']
        ]);
        @$mysqli->query("INSERT INTO home_content (id, heroTitle, heroSubtitle, heroButtonText, heroImage, heroStats, aboutTitle, aboutDescription, aboutPhilosophy1, aboutPhilosophy2, aboutButtonText, aboutImage, aboutFeatures, updated_at) VALUES ('home-1', 'DISCOVER YOUR | INNER PEACE', 'Join our vibrant yoga community to transform your mind, body, and spirit. Expert instruction for all levels.', 'Start Your Journey | View Classes', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', '{$statsJson}', 'Our Philosophy', 'We believe yoga is for everyone. Our approach combines ancient wisdom with modern understanding.', 'Mind-Body Harmony | Through conscious breath and mindful movement, we create space for profound transformation.', 'Our inclusive environment supports each student\'s unique journey toward wellness.', 'Learn More', 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '{$featuresJson}', NOW(3))");
    }

    $mysqli->close();

    // 4. Write .env configuration file (with direct DB fields and DATABASE_URL)
    $encodedPass = urlencode($dbPassword);
    $databaseUrl = "mysql://{$dbUser}:{$encodedPass}@{$dbHost}:{$dbPort}/{$dbName}";

    $envContent = "DB_HOST=\"{$dbHost}\"\n" .
                  "DB_PORT={$dbPort}\n" .
                  "DB_USER=\"{$dbUser}\"\n" .
                  "DB_PASSWORD=\"{$dbPassword}\"\n" .
                  "DB_NAME=\"{$dbName}\"\n" .
                  "PORT={$appPort}\n" .
                  "DATABASE_URL=\"{$databaseUrl}\"\n" .
                  "ADMIN_EMAIL=\"{$adminEmail}\"\n" .
                  "ADMIN_PASSWORD=\"{$adminPassword}\"\n" .
                  "JWT_SECRET=\"{$jwtSecret}\"\n" .
                  "NODE_ENV=\"production\"\n";

    @file_put_contents($envFile, $envContent);
    if (is_dir(__DIR__ . '/server')) {
        @file_put_contents($serverEnvFile, $envContent);
    }
    if (is_dir(dirname(__DIR__) . '/server')) {
        @file_put_contents(dirname(__DIR__) . '/.env', $envContent);
        @file_put_contents(dirname(__DIR__) . '/server/.env', $envContent);
    }

    echo json_encode([
        'success' => true,
        'migratedStatements' => $migratedCount,
        'message' => 'Configuration saved, all MySQL database tables migrated, and administrator created successfully!'
    ]);
    exit;
}
