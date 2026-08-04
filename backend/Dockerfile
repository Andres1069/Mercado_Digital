FROM php:8.2-apache

# Habilitar mod_rewrite para CodeIgniter
RUN a2enmod rewrite

# Instalar extensiones de PHP requeridas para conectar con MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Cambiar el DocumentRoot a la carpeta public de CodeIgniter
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Pasar variables de entorno a PHP
RUN echo "PassEnv DB_HOST DB_PORT DB_NAME DB_USER DB_PASS" >> /etc/apache2/conf-available/environment.conf && a2enconf environment

# Aumentar límites de subida de archivos (fotos pesadas de celulares)
RUN echo "upload_max_filesize = 20M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 25M" >> /usr/local/etc/php/conf.d/uploads.ini

# Copiar el código fuente
COPY . /var/www/html/

# Dar permisos a logs y crear carpeta de subidas para las evidencias
RUN chown -R www-data:www-data /var/www/html/storage && chmod -R 775 /var/www/html/storage
RUN mkdir -p /var/www/html/public/uploads/evidencias && chown -R www-data:www-data /var/www/html/public/uploads && chmod -R 777 /var/www/html/public/uploads

EXPOSE 80
