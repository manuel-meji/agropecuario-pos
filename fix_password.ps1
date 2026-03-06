$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
$sql = "UPDATE users SET password='$hash' WHERE username='admin'; SELECT username, LEFT(password,20) as hash_preview, LENGTH(password) as len FROM users WHERE username='admin';"
& $mysqlExe -u root -p1234 agropecuario_pos -e $sql
