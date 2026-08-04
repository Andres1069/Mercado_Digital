FROM php:8.2-apache

# Habilitar mod_rewrite para CodeIgniter
RUN a2enmod rewrite

# Instalar extensiones de PHP requeridas para conectar con MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Cambiar el DocumentRoot a la carpeta public de CodeIgniter
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copiar el código fuente
COPY . /var/www/html/

# Dar permisos a la carpeta de almacenamiento de logs de CodeIgniter
RUN chown -R www-data:www-data /var/www/html/storage && chmod -R 775 /var/www/html/storage

EXPOSE 80
