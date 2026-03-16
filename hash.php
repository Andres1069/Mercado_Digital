<?php
// temp: generate bcrypt hash for admin password
header('Content-Type: text/plain; charset=UTF-8');
echo password_hash('3333', PASSWORD_BCRYPT);
