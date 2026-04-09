-- Crear base de datos y usuario para RRHH APS
CREATE DATABASE IF NOT EXISTS rrhh_aps CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario dedicado con mysql_native_password (compatible con Prisma/Node.js)
CREATE USER IF NOT EXISTS 'rrhh_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'rrhh_aps_2024';
GRANT ALL PRIVILEGES ON rrhh_aps.* TO 'rrhh_user'@'127.0.0.1';
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES LIKE 'rrhh_aps';
SELECT User, Host, plugin FROM mysql.user WHERE User = 'rrhh_user';
