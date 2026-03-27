USE mercado_digital;

CREATE TABLE IF NOT EXISTS oferta (
  Cod_Oferta INT NOT NULL AUTO_INCREMENT,
  Titulo VARCHAR(120) NOT NULL,
  Descripcion VARCHAR(255) DEFAULT NULL,
  Porcentaje_Descuento INT NOT NULL,
  Fecha_Inicio DATETIME NOT NULL,
  Fecha_Fin DATETIME NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  Cod_Producto INT DEFAULT NULL,
  imagen_banner VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (Cod_Oferta),
  KEY idx_oferta_producto (Cod_Producto),
  CONSTRAINT fk_oferta_producto
    FOREIGN KEY (Cod_Producto) REFERENCES producto (Cod_Producto)
    ON DELETE SET NULL ON UPDATE CASCADE
);
