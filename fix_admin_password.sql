-- BCrypt hash of 'admin123' (generated with strength 10)
UPDATE users SET password='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE username='admin';
SELECT id, username, email, password FROM users WHERE username='admin';
