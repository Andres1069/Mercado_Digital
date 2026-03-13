-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 14, 2026 at 12:48 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mercado_digital`
--

-- --------------------------------------------------------

--
-- Table structure for table `carrito`
--

CREATE TABLE `carrito` (
  `Cod_Carrito` int(11) NOT NULL,
  `Fecha_creacion` datetime NOT NULL,
  `Fecha_modificacion` datetime NOT NULL,
  `Cantidad_articulos` int(11) NOT NULL,
  `Total` int(11) NOT NULL,
  `Num_Documento` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carrito`
--

INSERT INTO `carrito` (`Cod_Carrito`, `Fecha_creacion`, `Fecha_modificacion`, `Cantidad_articulos`, `Total`, `Num_Documento`) VALUES
(1, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 2, 7600, 1024587963),
(2, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 3, 14800, 1002569841),
(3, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 1, 10500, 1012457896),
(4, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 2, 10000, 1036587421),
(5, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 3, 23900, 1023654789),
(6, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 2, 7600, 1096587421),
(7, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 1, 11500, 1087456398),
(8, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 3, 14900, 1047852361),
(9, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 2, 8100, 1058965213),
(10, '2025-11-23 14:02:15', '2025-11-23 14:41:27', 1, 5200, 1023654781),
(11, '2026-03-03 12:42:52', '2026-03-03 12:42:52', 0, 0, 1069582666),
(12, '2026-03-11 18:51:37', '2026-03-11 18:51:37', 0, 0, 1000349255);

--
-- Triggers `carrito`
--
DELIMITER $$
CREATE TRIGGER `tr_un_carrito_por_usuario` BEFORE INSERT ON `carrito` FOR EACH ROW BEGIN
    DECLARE total_carritos INT;

    SELECT COUNT(*) INTO total_carritos
    FROM carrito
    WHERE Num_Documento = NEW.Num_Documento;

    IF total_carritos >= 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Este usuario ya tiene un carrito asignado.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `carrito_item`
--

CREATE TABLE `carrito_item` (
  `Cod_carrito_item` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Precio` int(11) NOT NULL,
  `Cod_producto` int(11) DEFAULT NULL,
  `Cod_carrito` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carrito_item`
--

INSERT INTO `carrito_item` (`Cod_carrito_item`, `Cantidad`, `Precio`, `Cod_producto`, `Cod_carrito`) VALUES
(1, 1, 3800, 1, 1),
(2, 1, 3800, 1, 1),
(3, 1, 6200, 2, 2),
(4, 1, 4800, 3, 2),
(5, 1, 3800, 1, 2),
(6, 1, 10500, 4, 3),
(7, 1, 5200, 5, 4),
(8, 1, 4800, 3, 4),
(9, 1, 8900, 9, 5),
(10, 1, 5200, 5, 5),
(11, 1, 9800, 8, 5),
(12, 1, 3800, 1, 6),
(13, 1, 3800, 1, 6),
(14, 1, 11500, 6, 7),
(15, 1, 4300, 8, 8),
(16, 1, 5200, 5, 8),
(17, 1, 5400, 7, 8),
(18, 1, 3200, 7, 9),
(19, 1, 4900, 3, 9),
(20, 1, 5200, 10, 10);

--
-- Triggers `carrito_item`
--
DELIMITER $$
CREATE TRIGGER `tr_actualizar_carrito` AFTER INSERT ON `carrito_item` FOR EACH ROW UPDATE carrito c
SET 
    c.Cantidad_articulos = (
        SELECT SUM(ci.Cantidad) 
        FROM carrito_item ci 
        WHERE ci.Cod_Carrito = NEW.Cod_Carrito
    ),
    c.Total = (
        SELECT SUM(ci.Precio)
        FROM carrito_item ci
        WHERE ci.Cod_Carrito = NEW.Cod_Carrito
    ),
    c.Fecha_modificacion = NOW()
WHERE c.Cod_Carrito = NEW.Cod_Carrito
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `categoria`
--

CREATE TABLE `categoria` (
  `Cod_Categoria` int(11) NOT NULL,
  `Nombre` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categoria`
--

INSERT INTO `categoria` (`Cod_Categoria`, `Nombre`) VALUES
(1, 'Aseo Personal'),
(2, 'Lácteos'),
(3, 'Panadería'),
(4, 'Bebidas'),
(5, 'Granos'),
(6, 'Snacks'),
(7, 'Cereales'),
(8, 'Aceites'),
(9, 'Dulces'),
(10, 'Productos Hogar');

-- --------------------------------------------------------

--
-- Table structure for table `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `Id_Detalle_Pedido` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Precio_unitario` int(11) NOT NULL,
  `Subtotal` int(11) NOT NULL,
  `Cod_Pedido` int(11) NOT NULL,
  `Cod_Producto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`Id_Detalle_Pedido`, `Cantidad`, `Precio_unitario`, `Subtotal`, `Cod_Pedido`, `Cod_Producto`) VALUES
(1, 1, 3800, 3800, 16, 1),
(2, 1, 3800, 3800, 16, 1),
(3, 1, 3800, 3800, 17, 1),
(4, 1, 3800, 3800, 17, 1),
(5, 1, 6200, 6200, 18, 2),
(6, 1, 4800, 4800, 18, 3),
(7, 1, 3800, 3800, 18, 1),
(8, 1, 6200, 6200, 19, 2),
(9, 1, 4800, 4800, 19, 3),
(10, 1, 3800, 3800, 19, 1),
(11, 1, 10500, 10500, 20, 4),
(12, 1, 10500, 10500, 21, 4),
(13, 1, 5200, 5200, 22, 5),
(14, 1, 4800, 4800, 22, 3),
(15, 1, 5200, 5200, 23, 5),
(16, 1, 4800, 4800, 23, 3),
(17, 1, 8900, 8900, 24, 9),
(18, 1, 5200, 5200, 24, 5),
(19, 1, 9800, 9800, 24, 8),
(20, 1, 8900, 8900, 25, 9),
(21, 1, 5200, 5200, 25, 5),
(22, 1, 9800, 9800, 25, 8),
(23, 1, 3800, 3800, 26, 1),
(24, 1, 3800, 3800, 26, 1),
(25, 1, 3800, 3800, 27, 1),
(26, 1, 3800, 3800, 27, 1),
(27, 1, 11500, 11500, 28, 6),
(28, 1, 11500, 11500, 29, 6),
(29, 1, 4300, 4300, 30, 8),
(30, 1, 5200, 5200, 30, 5),
(31, 1, 5400, 5400, 30, 7),
(32, 1, 4300, 4300, 31, 8),
(33, 1, 5200, 5200, 31, 5),
(34, 1, 5400, 5400, 31, 7),
(35, 1, 3200, 3200, 32, 7),
(36, 1, 4900, 4900, 32, 3),
(37, 1, 3200, 3200, 33, 7),
(38, 1, 4900, 4900, 33, 3),
(39, 1, 5200, 5200, 34, 10),
(40, 1, 5200, 5200, 35, 10);

--
-- Triggers `detalle_pedido`
--
DELIMITER $$
CREATE TRIGGER `tr_bajar_inventario` AFTER INSERT ON `detalle_pedido` FOR EACH ROW UPDATE inventario 
SET Cantidad = Cantidad - NEW.Cantidad
WHERE Cod_Producto = NEW.Cod_Producto
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `detalle_reporte`
--

CREATE TABLE `detalle_reporte` (
  `Id_Detalle` int(11) NOT NULL,
  `Tipo_Entidad` enum('carrito','producto','inventario','pedido','pago','domicilio') DEFAULT NULL,
  `Cod_Reporte` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detalle_reporte`
--

INSERT INTO `detalle_reporte` (`Id_Detalle`, `Tipo_Entidad`, `Cod_Reporte`) VALUES
(1, 'pedido', 1),
(2, 'pago', 2),
(3, 'inventario', 3),
(4, 'domicilio', 4),
(5, 'pedido', 5),
(6, 'pago', 6),
(7, 'inventario', 7),
(8, 'domicilio', 8),
(9, 'carrito', 9),
(10, 'pago', 10),
(11, 'pedido', 11),
(12, 'pedido', 12),
(13, 'pedido', 13),
(14, 'pedido', 14),
(15, 'pedido', 15),
(16, 'pedido', 16),
(17, 'pedido', 17),
(18, 'pedido', 18),
(19, 'pedido', 19),
(20, 'pedido', 20),
(21, 'pedido', 21),
(22, 'pedido', 22),
(23, 'pedido', 23),
(24, 'pedido', 24),
(25, 'pedido', 25),
(26, 'pedido', 26),
(27, 'pedido', 27),
(28, 'pedido', 28),
(29, 'pedido', 29),
(30, 'pedido', 30),
(42, 'pago', 11),
(43, 'pago', 12),
(44, 'pago', 13),
(45, 'pago', 14),
(46, 'pago', 15),
(47, 'pago', 16),
(48, 'pago', 17),
(49, 'pago', 18),
(50, 'pago', 19),
(51, 'pago', 20),
(52, 'pago', 21),
(53, 'pago', 22),
(54, 'pago', 23),
(55, 'pago', 24),
(56, 'pago', 25),
(57, 'pago', 26),
(58, 'pago', 27),
(59, 'pago', 28),
(60, 'pago', 29),
(61, 'pago', 30),
(73, 'domicilio', 11),
(74, 'domicilio', 12),
(75, 'domicilio', 13),
(76, 'domicilio', 14),
(77, 'domicilio', 15),
(78, 'domicilio', 16),
(79, 'domicilio', 17),
(80, 'domicilio', 18),
(81, 'domicilio', 19),
(82, 'domicilio', 20),
(83, 'domicilio', 21),
(84, 'domicilio', 22),
(85, 'domicilio', 23),
(86, 'domicilio', 24),
(87, 'domicilio', 25),
(88, 'domicilio', 26),
(89, 'domicilio', 27),
(90, 'domicilio', 28),
(91, 'domicilio', 29),
(92, 'domicilio', 30);

-- --------------------------------------------------------

--
-- Table structure for table `domicilio`
--

CREATE TABLE `domicilio` (
  `Cod_Domicilio` int(11) NOT NULL,
  `Fecha` datetime NOT NULL,
  `Estado` varchar(30) NOT NULL,
  `Cod_Usuario_Pedido` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `domicilio`
--

INSERT INTO `domicilio` (`Cod_Domicilio`, `Fecha`, `Estado`, `Cod_Usuario_Pedido`) VALUES
(16, '2025-11-24 10:40:00', 'En camino', 16),
(17, '2025-11-25 14:50:00', 'En preparación', 17),
(18, '2025-11-24 09:55:00', 'En camino', 18),
(19, '2025-11-25 12:40:00', 'En camino', 19),
(20, '2025-11-24 12:30:00', 'En revisión', 20),
(21, '2025-11-25 16:10:00', 'Entregado', 21),
(22, '2025-11-24 08:50:00', 'Cancelado', 22),
(23, '2025-11-25 17:50:00', 'En preparación', 23),
(24, '2025-11-24 13:40:00', 'Pendiente', 24),
(25, '2025-11-25 19:40:00', 'En camino', 25),
(26, '2025-11-24 10:30:00', 'En camino', 26),
(27, '2025-11-25 16:55:00', 'En preparación', 27),
(28, '2025-11-24 11:40:00', 'En camino', 28),
(29, '2025-11-25 15:25:00', 'Entregado', 29),
(30, '2025-11-24 10:10:00', 'Rechazado', 30),
(31, '2025-11-25 19:05:00', 'En camino', 31),
(32, '2025-11-24 07:50:00', 'En camino', 32),
(33, '2025-11-25 14:15:00', 'En revisión', 33),
(34, '2025-11-24 16:35:00', 'Preparando envío', 34),
(35, '2025-11-25 21:00:00', 'Entregado', 35);

-- --------------------------------------------------------

--
-- Table structure for table `inventario`
--

CREATE TABLE `inventario` (
  `Cod_Inventario` int(11) NOT NULL,
  `Stock` int(11) NOT NULL,
  `Registrar_Entradas` int(11) NOT NULL,
  `Registrar_Salidas` int(11) NOT NULL,
  `Fecha_Actualizacion` datetime NOT NULL,
  `Novedades` varchar(255) DEFAULT NULL,
  `Cod_Producto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventario`
--

INSERT INTO `inventario` (`Cod_Inventario`, `Stock`, `Registrar_Entradas`, `Registrar_Salidas`, `Fecha_Actualizacion`, `Novedades`, `Cod_Producto`) VALUES
(1, 150, 50, 10, '2025-11-23 14:02:15', 'Actualizado', 1),
(2, 200, 40, 15, '2025-11-23 14:02:15', 'Alta rotación', 2),
(3, 300, 60, 20, '2025-11-23 14:02:15', 'Revisión', 3),
(4, 180, 30, 10, '2025-11-23 14:02:15', 'Reposición', 4),
(5, 120, 25, 5, '2025-11-23 14:02:15', 'Normal', 5),
(6, 90, 15, 12, '2025-11-23 14:02:15', 'Control cereal', 6),
(7, 250, 35, 20, '2025-11-23 14:02:15', 'Entrada yogurt', 7),
(8, 210, 28, 9, '2025-11-23 14:02:15', 'Actualización', 8),
(9, 160, 18, 10, '2025-11-23 14:02:15', 'Stock alto', 9),
(10, 140, 22, 8, '2025-11-23 14:02:15', 'Estable', 10);

-- --------------------------------------------------------

--
-- Table structure for table `oferta`
--

CREATE TABLE `oferta` (
  `Cod_Oferta` int(11) NOT NULL,
  `Titulo` varchar(120) NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Porcentaje_Descuento` int(11) NOT NULL,
  `Fecha_Inicio` datetime NOT NULL,
  `Fecha_Fin` datetime NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `Cod_Producto` int(11) DEFAULT NULL,
  `imagen_banner` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pago`
--

CREATE TABLE `pago` (
  `Cod_Pago` int(11) NOT NULL,
  `Metodo_Pago` varchar(50) NOT NULL,
  `Fecha_Pago` datetime NOT NULL,
  `Monto_Pago` int(11) NOT NULL,
  `Cod_pedido` int(11) DEFAULT NULL,
  `Estado_Pago` enum('Pendiente','Completado','Fallido') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pago`
--

INSERT INTO `pago` (`Cod_Pago`, `Metodo_Pago`, `Fecha_Pago`, `Monto_Pago`, `Cod_pedido`, `Estado_Pago`) VALUES
(16, 'Efectivo', '2025-11-24 10:20:00', 7600, 16, 'Completado'),
(17, 'Nequi', '2025-11-25 14:25:00', 7600, 17, 'Pendiente'),
(18, 'Tarjeta', '2025-11-24 09:45:00', 14800, 18, 'Completado'),
(19, 'Efectivo', '2025-11-25 12:15:00', 14800, 19, 'Pendiente'),
(20, 'Tarjeta', '2025-11-24 12:00:00', 10500, 20, 'Completado'),
(21, 'Nequi', '2025-11-25 15:50:00', 10500, 21, 'Completado'),
(22, 'Efectivo', '2025-11-24 08:35:00', 10000, 22, 'Fallido'),
(23, 'Tarjeta', '2025-11-25 17:25:00', 10000, 23, 'Completado'),
(24, 'Nequi', '2025-11-24 13:15:00', 23900, 24, 'Pendiente'),
(25, 'Efectivo', '2025-11-25 19:10:00', 23900, 25, 'Completado'),
(26, 'Tarjeta', '2025-11-24 10:05:00', 7600, 26, 'Completado'),
(27, 'Daviplata', '2025-11-25 16:35:00', 7600, 27, 'Pendiente'),
(28, 'Efectivo', '2025-11-24 11:15:00', 11500, 28, 'Completado'),
(29, 'Nequi', '2025-11-25 15:05:00', 11500, 29, 'Completado'),
(30, 'Tarjeta', '2025-11-24 09:55:00', 14900, 30, 'Fallido'),
(31, 'Efectivo', '2025-11-25 18:45:00', 14900, 31, 'Completado'),
(32, 'Nequi', '2025-11-24 07:30:00', 8100, 32, 'Completado'),
(33, 'Tarjeta', '2025-11-25 13:55:00', 8100, 33, 'Pendiente'),
(34, 'Efectivo', '2025-11-24 16:15:00', 5200, 34, 'Completado'),
(35, 'Nequi', '2025-11-25 20:35:00', 5200, 35, 'Completado');

-- --------------------------------------------------------

--
-- Table structure for table `pedido`
--

CREATE TABLE `pedido` (
  `Cod_Pedido` int(11) NOT NULL,
  `Fecha_Pedido` datetime NOT NULL,
  `Estado_Pedido` varchar(50) NOT NULL,
  `Cod_Carrito` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pedido`
--

INSERT INTO `pedido` (`Cod_Pedido`, `Fecha_Pedido`, `Estado_Pedido`, `Cod_Carrito`) VALUES
(16, '2025-11-24 10:15:00', 'Confirmado', 1),
(17, '2025-11-25 14:22:00', 'En preparación', 1),
(18, '2025-11-24 09:40:00', 'Confirmado', 2),
(19, '2025-11-25 12:10:00', 'En camino', 2),
(20, '2025-11-24 11:55:00', 'En revisión', 3),
(21, '2025-11-25 15:45:00', 'Entregado', 3),
(22, '2025-11-24 08:30:00', 'Cancelado', 4),
(23, '2025-11-25 17:20:00', 'En preparación', 4),
(24, '2025-11-24 13:10:00', 'Pendiente', 5),
(25, '2025-11-25 19:05:00', 'Confirmado', 5),
(26, '2025-11-24 10:00:00', 'Confirmado', 6),
(27, '2025-11-25 16:30:00', 'En preparación', 6),
(28, '2025-11-24 11:10:00', 'En camino', 7),
(29, '2025-11-25 15:00:00', 'Entregado', 7),
(30, '2025-11-24 09:50:00', 'Rechazado', 8),
(31, '2025-11-25 18:40:00', 'Confirmado', 8),
(32, '2025-11-24 07:25:00', 'Confirmado', 9),
(33, '2025-11-25 13:50:00', 'En camino', 9),
(34, '2025-11-24 16:12:00', 'Preparando envío', 10),
(35, '2025-11-25 20:30:00', 'Entregado', 10);

-- --------------------------------------------------------

--
-- Table structure for table `persona`
--

CREATE TABLE `persona` (
  `Num_Documento` int(11) NOT NULL,
  `Nombre` varchar(30) NOT NULL,
  `Apellido` varchar(30) NOT NULL,
  `ContrasenaHash` varchar(65) NOT NULL,
  `Telefono` varchar(11) NOT NULL,
  `Correo` varchar(100) NOT NULL,
  `Barrio` varchar(50) NOT NULL,
  `Direccion` varchar(100) NOT NULL,
  `Id_Rol` int(11) DEFAULT NULL,
  `Id_Usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `persona`
--

INSERT INTO `persona` (`Num_Documento`, `Nombre`, `Apellido`, `ContrasenaHash`, `Telefono`, `Correo`, `Barrio`, `Direccion`, `Id_Rol`, `Id_Usuario`) VALUES
(1000349255, 'Monica Liceth', 'Toloza Corredor', '$2y$10$647xGmrVwiOlDs0GfgYhF.g1g4/m/z5syTITaK4xaVS1YsB127XV.', '3124185287', 'eroteko2@gmail.com', '', '', 2, 12),
(1002569841, 'Sofía', 'Herrera', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3114589632', 'sofia@correo.com', 'San José', 'Cll 22 #14-10', 2, 2),
(1012457896, 'Carlos', 'Gómez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3124589632', 'carlos@correo.com', 'El Prado', 'Cra 45 #22-60', 2, 3),
(1023654781, 'Ana', 'Rodríguez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3194502368', 'ana@correo.com', 'Los Almendros', 'Cll 42 #65-12', 4, 10),
(1023654789, 'Andrés', 'López', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3147852369', 'andres@correo.com', 'Chicó', 'Cra 82 #20-11', 2, 5),
(1024587963, 'Juan', 'Mejía', '$2y$10$RbgTeiMMJkOlGMfnKJsHfOldrfF7mayjr5G2oYhBGMTvId39q2Bji', '3102567894', 'juan@correo.com', 'Centro', 'Cra 10 #15-22', 1, 1),
(1036587421, 'Laura', 'Torres', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3138745210', 'laura@correo.com', 'La Esperanza', 'Cll 50 #8-20', 2, 4),
(1047852361, 'Marta', 'Salinas', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3174502369', 'marta@correo.com', 'San José', 'Cll 25 #20-15', 3, 8),
(1058965213, 'Pedro', 'Suárez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3185201478', 'pedro@correo.com', 'La Playa', 'Cra 58 #32-14', 4, 9),
(1069582666, 'Raul Andres', 'Gonzalez', '$2y$10$bppJhrkrQRnWQoDMTQNB4uv.rGz9iyPzu5adP8anB5caAu0jpUI7W', '3244314271', 'raul.gonzalez@mercado.digital.com', 'Madrid', 'Cra 20B #4-82', 4, 11),
(1087456398, 'Ricardo', 'Díaz', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3164781259', 'ricardo@correo.com', 'Centro', 'Cra 6 #18-25', 3, 7),
(1096587421, 'Camila', 'Pérez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3158741256', 'camila@correo.com', 'Cedritos', 'Cll 150 #12-05', 2, 6);

-- --------------------------------------------------------

--
-- Table structure for table `producto`
--

CREATE TABLE `producto` (
  `Cod_Producto` int(11) NOT NULL,
  `Nombre` varchar(30) NOT NULL,
  `Precio` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Fecha_vencimiento` date NOT NULL,
  `Descripcion` varchar(150) DEFAULT NULL,
  `Imagen_url` varchar(200) DEFAULT NULL,
  `Cod_Categoria` int(11) DEFAULT NULL,
  `Cod_Proveedor` int(11) DEFAULT NULL,
  `Imagen_zoom` decimal(4,2) NOT NULL DEFAULT 1.00,
  `Imagen_pos_x` decimal(5,2) NOT NULL DEFAULT 50.00,
  `Imagen_pos_y` decimal(5,2) NOT NULL DEFAULT 50.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `producto`
--

INSERT INTO `producto` (`Cod_Producto`, `Nombre`, `Precio`, `Cantidad`, `Fecha_vencimiento`, `Descripcion`, `Imagen_url`, `Cod_Categoria`, `Cod_Proveedor`, `Imagen_zoom`, `Imagen_pos_x`, `Imagen_pos_y`) VALUES
(1, 'Leche Alquería 1L', 3800, 150, '2026-02-15', 'Leche entera 1L', 'https://s3.amazonaws.com/coreecommerce.imagenes/uploads/html/81931_h1.jpg', 2, 1, 1.00, 50.00, 50.00),
(2, 'Pan Tajado Bimbo', 6200, 200, '2025-12-20', 'Pan tajado familiar', 'https://exitocol.vteximg.com.br/arquivos/ids/25464115/Pan-tajado-Actidefensis-BIMBO-730-gr-3107865_a.jpg?v=638666269327730000', 3, 3, 1.00, 50.00, 50.00),
(3, 'Galletas Festival', 4800, 300, '2026-03-10', 'Galletas dulces', 'https://mercasur.com.co/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NTAxMjYxLCJwdXIiOiJibG9iX2lkIn19--a59e7e3f4e559f3a7184e2e6242e72afbca2ee09/7702025103744-1.jpg?locale=es', 6, 4, 1.00, 50.00, 50.00),
(4, 'Aceite Premier 1L', 10500, 180, '2026-01-05', 'Aceite vegetal', 'https://gldosas.com/wp-content/uploads/2024/03/Aceite-Vegetal-de-Soya-Orlandesa-1000-ml.jpeg', 8, 5, 1.00, 0.00, 0.00),
(5, 'Harina Pan 1Kg', 5200, 120, '2026-04-01', 'Harina de trigo', 'https://olimpica.vtexassets.com/arquivos/ids/685195/7702084137520.jpg?v=637684581490100000', 5, 7, 1.00, 50.00, 50.00),
(6, 'Zucaritas 300g', 11500, 90, '2026-05-12', 'Cereal zucaritas', 'https://arteli.vtexassets.com/arquivos/ids/244532/7501008042946_00.jpg?v=638635767517130000', 7, 6, 1.00, 50.00, 50.00),
(7, 'Yogurt Alquería Fresa', 3200, 250, '2025-12-15', 'Yogurt sabor fresa', 'https://www.fonalcanzar.com/wp-content/uploads/2022/07/yogurt-fresa-.png', 2, 1, 1.00, 50.00, 50.00),
(8, 'Gaseosa Manzana 1.5L', 4300, 210, '2026-02-10', 'Manzana Postobón', 'https://infonutricional.tomatelavida.com.co/wp-content/uploads/2023/06/MANZANA_postobon_250ML-ret-2.png', 4, 2, 1.00, 50.00, 50.00),
(9, 'Chocolate Corona', 8900, 160, '2026-04-30', 'Chocolate en polvo', 'https://vaquitaexpress.com.co/media/catalog/product/cache/e89ece728e3939ca368b457071d3c0be/7/7/7702007083354.jpg', 9, 8, 1.00, 50.00, 50.00),
(10, 'Margarina La Fina 500g', 5200, 140, '2025-12-28', 'Margarina de mesa', 'https://web.superboom.net/web/image/product.product/35639/image_1024/%5B002436%5D%20Margarina%20Barra%20La%20Fina%20500Gr?unique=b509d77', 8, 5, 1.00, 50.00, 50.00),
(11, 'Galletas ', 8000, 1, '2025-06-09', 'Galletas jajaj', 'https://exitocol.vtexassets.com/arquivos/ids/29101190/Galleta-Dedito-647090_a.jpg?v=638881159129900000', 8, 5, 1.00, 50.00, 50.00);

-- --------------------------------------------------------

--
-- Table structure for table `proveedor`
--

CREATE TABLE `proveedor` (
  `Cod_Proveedor` int(11) NOT NULL,
  `Nombre_proveedor` varchar(80) NOT NULL,
  `Telefono_proveedor` varchar(11) NOT NULL,
  `Correo_proveedor` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proveedor`
--

INSERT INTO `proveedor` (`Cod_Proveedor`, `Nombre_proveedor`, `Telefono_proveedor`, `Correo_proveedor`) VALUES
(1, 'Alquería Colombia S.A.S', '6017458900', 'contacto@alqueria.com'),
(2, 'Postobón S.A', '6012947200', 'servicio@postobon.com'),
(3, 'Bimbo Colombia S.A', '6016102020', 'ventas@bimbo.com'),
(4, 'Colombina S.A', '6012807000', 'info@colombina.com'),
(5, 'Team Foods Colombia', '6013204300', 'contacto@teamfoods.com'),
(6, 'Nestlé Colombia', '6015875500', 'atencion@nestle.com'),
(7, 'Levapan Colombia', '6017451000', 'ventas@levapan.com'),
(8, 'Nutresa Colombia', '6012304000', 'clientes@nutresa.com'),
(9, 'Bavaria Colombia', '6013219500', 'servicio@bavaria.com'),
(10, 'Pan Pa Ya Colombia', '6014102589', 'info@panpaya.com');

-- --------------------------------------------------------

--
-- Table structure for table `reporte`
--

CREATE TABLE `reporte` (
  `Cod_Reporte` int(11) NOT NULL,
  `Fecha_Reporte` datetime DEFAULT current_timestamp(),
  `Tipo_reporte` varchar(100) DEFAULT NULL,
  `Descripcion` text DEFAULT NULL,
  `Num_Documento` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reporte`
--

INSERT INTO `reporte` (`Cod_Reporte`, `Fecha_Reporte`, `Tipo_reporte`, `Descripcion`, `Num_Documento`) VALUES
(1, '2025-11-23 14:02:15', 'Pedido', 'Procesado correctamente', 1024587963),
(2, '2025-11-23 14:02:15', 'Pago', 'Pago recibido exitosamente', 1002569841),
(3, '2025-11-23 14:02:15', 'Inventario', 'Actualización de stock', 1012457896),
(4, '2025-11-23 14:02:15', 'Entrega', 'Domicilio entregado', 1036587421),
(5, '2025-11-23 14:02:15', 'Pedido', 'Nuevo pedido registrado', 1023654789),
(6, '2025-11-23 14:02:15', 'Pago', 'Pago en espera', 1096587421),
(7, '2025-11-23 14:02:15', 'Inventario', 'Stock actualizado', 1087456398),
(8, '2025-11-23 14:02:15', 'Entrega', 'Entrega finalizada', 1047852361),
(9, '2025-11-23 14:02:15', 'Pedido', 'Solicitud generada', 1058965213),
(10, '2025-11-23 14:02:15', 'Pago', 'Pago confirmado', 1023654781),
(11, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 16 generado', 1024587963),
(12, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 17 generado', 1024587963),
(13, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 18 generado', 1002569841),
(14, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 19 generado', 1002569841),
(15, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 20 generado', 1012457896),
(16, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 21 generado', 1012457896),
(17, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 22 generado', 1036587421),
(18, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 23 generado', 1036587421),
(19, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 24 generado', 1023654789),
(20, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 25 generado', 1023654789),
(21, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 26 generado', 1096587421),
(22, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 27 generado', 1096587421),
(23, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 28 generado', 1087456398),
(24, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 29 generado', 1087456398),
(25, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 30 generado', 1047852361),
(26, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 31 generado', 1047852361),
(27, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 32 generado', 1058965213),
(28, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 33 generado', 1058965213),
(29, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 34 generado', 1023654781),
(30, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 35 generado', 1023654781);

-- --------------------------------------------------------

--
-- Table structure for table `rol_usuario`
--

CREATE TABLE `rol_usuario` (
  `Id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rol_usuario`
--

INSERT INTO `rol_usuario` (`Id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Cliente'),
(3, 'Empleado'),
(4, 'Proveedor');

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

CREATE TABLE `usuario` (
  `Id_usuario` int(11) NOT NULL,
  `Id_Rol` int(11) DEFAULT NULL,
  `Estado` varchar(20) NOT NULL DEFAULT 'Activo',
  `SesionId` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`Id_usuario`, `Id_Rol`, `Estado`, `SesionId`) VALUES
(1, 1, 'Activo', 'e8f0da9815a62ae526f80090708199882e8209b2d2ec3f78'),
(2, 2, 'Activo', NULL),
(3, 2, 'Activo', NULL),
(4, 2, 'Activo', NULL),
(5, 2, 'Activo', NULL),
(6, 2, 'Activo', NULL),
(7, 3, 'Activo', NULL),
(8, 3, 'Activo', NULL),
(9, 4, 'Activo', NULL),
(10, 4, 'Activo', NULL),
(11, 4, 'Activo', '59fb1e79ccebffa98ecd606f416e09045eeedbdba62cb45c'),
(12, 2, 'Activo', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `usuario_pedido`
--

CREATE TABLE `usuario_pedido` (
  `Cod_usuario_pedido` int(11) NOT NULL,
  `Num_Documento` int(11) DEFAULT NULL,
  `Cod_pedido` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuario_pedido`
--

INSERT INTO `usuario_pedido` (`Cod_usuario_pedido`, `Num_Documento`, `Cod_pedido`) VALUES
(16, 1024587963, 16),
(17, 1024587963, 17),
(18, 1002569841, 18),
(19, 1002569841, 19),
(20, 1012457896, 20),
(21, 1012457896, 21),
(22, 1036587421, 22),
(23, 1036587421, 23),
(24, 1023654789, 24),
(25, 1023654789, 25),
(26, 1096587421, 26),
(27, 1096587421, 27),
(28, 1087456398, 28),
(29, 1087456398, 29),
(30, 1047852361, 30),
(31, 1047852361, 31),
(32, 1058965213, 32),
(33, 1058965213, 33),
(34, 1023654781, 34),
(35, 1023654781, 35);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_carritos_resumen`
-- (See below for the actual view)
--
CREATE TABLE `vista_carritos_resumen` (
`Cod_Carrito` int(11)
,`Num_Documento` int(11)
,`Nombre` varchar(30)
,`Cantidad_articulos` int(11)
,`Total` int(11)
,`Fecha_modificacion` datetime
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_pedidos_completos`
-- (See below for the actual view)
--
CREATE TABLE `vista_pedidos_completos` (
`Cod_Pedido` int(11)
,`Fecha_Pedido` datetime
,`Estado_Pedido` varchar(50)
,`Nombre_Usuario` varchar(30)
,`Num_Documento` int(11)
,`Cod_Carrito` int(11)
,`Total_Carrito` int(11)
,`Monto_Pago` int(11)
,`Metodo_Pago` varchar(50)
,`Estado_Pago` enum('Pendiente','Completado','Fallido')
,`Estado_Domicilio` varchar(30)
,`Fecha_Domicilio` datetime
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_productos_mas_vendidos`
-- (See below for the actual view)
--
CREATE TABLE `vista_productos_mas_vendidos` (
`Cod_Producto` int(11)
,`Nombre` varchar(30)
,`Total_Vendido` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Structure for view `vista_carritos_resumen`
--
DROP TABLE IF EXISTS `vista_carritos_resumen`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_carritos_resumen`  AS SELECT `c`.`Cod_Carrito` AS `Cod_Carrito`, `per`.`Num_Documento` AS `Num_Documento`, `per`.`Nombre` AS `Nombre`, `c`.`Cantidad_articulos` AS `Cantidad_articulos`, `c`.`Total` AS `Total`, `c`.`Fecha_modificacion` AS `Fecha_modificacion` FROM (`carrito` `c` join `persona` `per` on(`per`.`Num_Documento` = `c`.`Num_Documento`)) ;

-- --------------------------------------------------------

--
-- Structure for view `vista_pedidos_completos`
--
DROP TABLE IF EXISTS `vista_pedidos_completos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_pedidos_completos`  AS SELECT `p`.`Cod_Pedido` AS `Cod_Pedido`, `p`.`Fecha_Pedido` AS `Fecha_Pedido`, `p`.`Estado_Pedido` AS `Estado_Pedido`, `per`.`Nombre` AS `Nombre_Usuario`, `per`.`Num_Documento` AS `Num_Documento`, `c`.`Cod_Carrito` AS `Cod_Carrito`, `c`.`Total` AS `Total_Carrito`, `pa`.`Monto_Pago` AS `Monto_Pago`, `pa`.`Metodo_Pago` AS `Metodo_Pago`, `pa`.`Estado_Pago` AS `Estado_Pago`, `d`.`Estado` AS `Estado_Domicilio`, `d`.`Fecha` AS `Fecha_Domicilio` FROM (((((`pedido` `p` left join `carrito` `c` on(`c`.`Cod_Carrito` = `p`.`Cod_Carrito`)) left join `usuario_pedido` `up` on(`up`.`Cod_pedido` = `p`.`Cod_Pedido`)) left join `persona` `per` on(`per`.`Num_Documento` = `per`.`Num_Documento`)) left join `pago` `pa` on(`pa`.`Cod_pedido` = `p`.`Cod_Pedido`)) left join `domicilio` `d` on(`d`.`Cod_Usuario_Pedido` = `up`.`Cod_usuario_pedido`)) ;

-- --------------------------------------------------------

--
-- Structure for view `vista_productos_mas_vendidos`
--
DROP TABLE IF EXISTS `vista_productos_mas_vendidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_productos_mas_vendidos`  AS SELECT `pr`.`Cod_Producto` AS `Cod_Producto`, `pr`.`Nombre` AS `Nombre`, sum(`dp`.`Cantidad`) AS `Total_Vendido` FROM (`producto` `pr` left join `detalle_pedido` `dp` on(`dp`.`Cod_Producto` = `pr`.`Cod_Producto`)) GROUP BY `pr`.`Cod_Producto`, `pr`.`Nombre` ORDER BY sum(`dp`.`Cantidad`) DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`Cod_Carrito`),
  ADD KEY `Num_Documento` (`Num_Documento`);

--
-- Indexes for table `carrito_item`
--
ALTER TABLE `carrito_item`
  ADD PRIMARY KEY (`Cod_carrito_item`),
  ADD KEY `Cod_producto` (`Cod_producto`),
  ADD KEY `Cod_carrito` (`Cod_carrito`);

--
-- Indexes for table `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`Cod_Categoria`);

--
-- Indexes for table `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`Id_Detalle_Pedido`),
  ADD KEY `Cod_Pedido` (`Cod_Pedido`),
  ADD KEY `Cod_Producto` (`Cod_Producto`);

--
-- Indexes for table `detalle_reporte`
--
ALTER TABLE `detalle_reporte`
  ADD PRIMARY KEY (`Id_Detalle`),
  ADD KEY `Cod_Reporte` (`Cod_Reporte`);

--
-- Indexes for table `domicilio`
--
ALTER TABLE `domicilio`
  ADD PRIMARY KEY (`Cod_Domicilio`),
  ADD KEY `Cod_Usuario_Pedido` (`Cod_Usuario_Pedido`);

--
-- Indexes for table `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`Cod_Inventario`),
  ADD KEY `Cod_Producto` (`Cod_Producto`);

--
-- Indexes for table `oferta`
--
ALTER TABLE `oferta`
  ADD PRIMARY KEY (`Cod_Oferta`),
  ADD KEY `idx_oferta_producto` (`Cod_Producto`);

--
-- Indexes for table `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`Cod_Pago`),
  ADD KEY `Cod_pedido` (`Cod_pedido`);

--
-- Indexes for table `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`Cod_Pedido`),
  ADD KEY `Cod_Carrito` (`Cod_Carrito`);

--
-- Indexes for table `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`Num_Documento`),
  ADD KEY `Id_Rol` (`Id_Rol`),
  ADD KEY `Id_Usuario` (`Id_Usuario`);

--
-- Indexes for table `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`Cod_Producto`),
  ADD KEY `Cod_Categoria` (`Cod_Categoria`),
  ADD KEY `Cod_Proveedor` (`Cod_Proveedor`);

--
-- Indexes for table `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`Cod_Proveedor`);

--
-- Indexes for table `reporte`
--
ALTER TABLE `reporte`
  ADD PRIMARY KEY (`Cod_Reporte`),
  ADD KEY `Num_Documento` (`Num_Documento`);

--
-- Indexes for table `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD PRIMARY KEY (`Id_rol`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`Id_usuario`),
  ADD KEY `Id_Rol` (`Id_Rol`);

--
-- Indexes for table `usuario_pedido`
--
ALTER TABLE `usuario_pedido`
  ADD PRIMARY KEY (`Cod_usuario_pedido`),
  ADD KEY `Num_Documento` (`Num_Documento`),
  ADD KEY `Cod_pedido` (`Cod_pedido`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carrito`
--
ALTER TABLE `carrito`
  MODIFY `Cod_Carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `carrito_item`
--
ALTER TABLE `carrito_item`
  MODIFY `Cod_carrito_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `categoria`
--
ALTER TABLE `categoria`
  MODIFY `Cod_Categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `Id_Detalle_Pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `detalle_reporte`
--
ALTER TABLE `detalle_reporte`
  MODIFY `Id_Detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `domicilio`
--
ALTER TABLE `domicilio`
  MODIFY `Cod_Domicilio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `inventario`
--
ALTER TABLE `inventario`
  MODIFY `Cod_Inventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `oferta`
--
ALTER TABLE `oferta`
  MODIFY `Cod_Oferta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pago`
--
ALTER TABLE `pago`
  MODIFY `Cod_Pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `pedido`
--
ALTER TABLE `pedido`
  MODIFY `Cod_Pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `producto`
--
ALTER TABLE `producto`
  MODIFY `Cod_Producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `Cod_Proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reporte`
--
ALTER TABLE `reporte`
  MODIFY `Cod_Reporte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `rol_usuario`
--
ALTER TABLE `rol_usuario`
  MODIFY `Id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `Id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `usuario_pedido`
--
ALTER TABLE `usuario_pedido`
  MODIFY `Cod_usuario_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`Num_Documento`) REFERENCES `persona` (`Num_Documento`);

--
-- Constraints for table `carrito_item`
--
ALTER TABLE `carrito_item`
  ADD CONSTRAINT `carrito_item_ibfk_1` FOREIGN KEY (`Cod_producto`) REFERENCES `producto` (`Cod_Producto`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `carrito_item_ibfk_2` FOREIGN KEY (`Cod_carrito`) REFERENCES `carrito` (`Cod_Carrito`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`Cod_Pedido`) REFERENCES `pedido` (`Cod_Pedido`) ON UPDATE CASCADE,
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`Cod_Producto`) REFERENCES `producto` (`Cod_Producto`) ON UPDATE CASCADE;

--
-- Constraints for table `detalle_reporte`
--
ALTER TABLE `detalle_reporte`
  ADD CONSTRAINT `detalle_reporte_ibfk_1` FOREIGN KEY (`Cod_Reporte`) REFERENCES `reporte` (`Cod_Reporte`) ON DELETE CASCADE;

--
-- Constraints for table `domicilio`
--
ALTER TABLE `domicilio`
  ADD CONSTRAINT `domicilio_ibfk_1` FOREIGN KEY (`Cod_Usuario_Pedido`) REFERENCES `usuario_pedido` (`Cod_usuario_pedido`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`Cod_Producto`) REFERENCES `producto` (`Cod_Producto`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `oferta`
--
ALTER TABLE `oferta`
  ADD CONSTRAINT `fk_oferta_producto` FOREIGN KEY (`Cod_Producto`) REFERENCES `producto` (`Cod_Producto`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`Cod_pedido`) REFERENCES `pedido` (`Cod_Pedido`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`Cod_Carrito`) REFERENCES `carrito` (`Cod_Carrito`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `persona`
--
ALTER TABLE `persona`
  ADD CONSTRAINT `persona_ibfk_1` FOREIGN KEY (`Id_Rol`) REFERENCES `rol_usuario` (`Id_rol`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `persona_ibfk_2` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuario` (`Id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`Cod_Categoria`) REFERENCES `categoria` (`Cod_Categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`Cod_Proveedor`) REFERENCES `proveedor` (`Cod_Proveedor`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `reporte`
--
ALTER TABLE `reporte`
  ADD CONSTRAINT `reporte_ibfk_1` FOREIGN KEY (`Num_Documento`) REFERENCES `persona` (`Num_Documento`);

--
-- Constraints for table `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`Id_Rol`) REFERENCES `rol_usuario` (`Id_rol`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `usuario_pedido`
--
ALTER TABLE `usuario_pedido`
  ADD CONSTRAINT `usuario_pedido_ibfk_1` FOREIGN KEY (`Num_Documento`) REFERENCES `persona` (`Num_Documento`),
  ADD CONSTRAINT `usuario_pedido_ibfk_2` FOREIGN KEY (`Cod_pedido`) REFERENCES `pedido` (`Cod_Pedido`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
