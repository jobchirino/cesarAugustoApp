# Usamos una imagen oficial de PHP con Apache
FROM php:8.2-apache

# 1. Instalamos las dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Limpiamos la caché de apt para que la imagen sea más ligera
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Instalamos las extensiones de PHP (pdo_mysql es la que conecta con Aiven)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# 3. Habilitamos el módulo rewrite de Apache (vital para las rutas de Laravel)
RUN a2enmod rewrite

# 4. Instalamos Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Establecemos el directorio de trabajo
WORKDIR /var/www/html

# 6. Copiamos todo el código de tu proyecto al contenedor
COPY . .

# 7. Instalamos las dependencias de Laravel (sin las de desarrollo)
RUN composer install --no-dev --optimize-autoloader

# 8. Asignamos los permisos correctos a las carpetas que Laravel necesita escribir
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 9. Le decimos a Apache que la carpeta pública es /public (donde está el index.php)
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 10. Exponemos el puerto 80
EXPOSE 80