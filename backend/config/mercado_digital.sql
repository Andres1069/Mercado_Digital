-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-08-2026 a las 17:25:46
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mercado_digital`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario` int(11) DEFAULT NULL,
  `accion` varchar(20) NOT NULL,
  `entidad` varchar(50) NOT NULL,
  `entidad_id` varchar(50) DEFAULT NULL,
  `ip` varchar(45) NOT NULL,
  `detalle` text DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `audit_log`
--

INSERT INTO `audit_log` (`id`, `usuario`, `accion`, `entidad`, `entidad_id`, `ip`, `detalle`, `creado_en`) VALUES
(1, 1024587963, 'cambiar_estado', 'pedido', '71', '::1', 'En preparacion', '2026-06-24 15:54:28'),
(2, 1024587963, 'cambiar_estado', 'pedido', '69', '::1', 'En preparacion', '2026-06-24 15:54:31'),
(3, 1024587963, 'cambiar_estado', 'pedido', '70', '::1', 'Confirmado', '2026-06-24 15:54:37'),
(4, 1024587963, 'cambiar_estado', 'domicilio', '40', '::1', 'Entregado', '2026-06-24 16:06:27'),
(5, 1024587963, 'cambiar_estado', 'domicilio', '40', '::1', 'Entregado', '2026-06-24 16:08:47'),
(6, 1024587963, 'cambiar_estado', 'domicilio', '40', '::1', 'Entregado', '2026-06-24 16:08:52'),
(7, 1024587963, 'cambiar_estado', 'domicilio', '38', '::1', 'Entregado', '2026-06-24 16:11:46'),
(8, 1024587963, 'cambiar_estado', 'domicilio', '39', '::1', 'Cancelado', '2026-06-24 16:12:02'),
(9, 1024587963, 'cambiar_estado', 'domicilio', '37', '::1', 'Cancelado', '2026-06-24 16:12:10'),
(10, 1024587963, 'cambiar_estado', 'domicilio', '36', '::1', 'Cancelado', '2026-06-24 16:12:13'),
(11, 1024587963, 'cambiar_estado', 'domicilio', '24', '::1', 'Cancelado', '2026-06-24 16:12:15'),
(12, 1024587963, 'cambiar_estado', 'domicilio', '25', '::1', 'Cancelado', '2026-06-24 16:12:22'),
(13, 1024587963, 'cambiar_estado', 'domicilio', '31', '::1', 'Cancelado', '2026-06-24 16:12:24'),
(14, 1024587963, 'cambiar_estado', 'domicilio', '19', '::1', 'Cancelado', '2026-06-24 16:12:26'),
(15, 1024587963, 'cambiar_estado', 'domicilio', '28', '::1', 'Cancelado', '2026-06-24 16:12:28'),
(16, 1024587963, 'cambiar_estado', 'domicilio', '16', '::1', 'Cancelado', '2026-06-24 16:12:30'),
(17, 1024587963, 'cambiar_estado', 'domicilio', '26', '::1', 'Cancelado', '2026-06-24 16:12:32'),
(18, 1024587963, 'cambiar_estado', 'domicilio', '18', '::1', 'Cancelado', '2026-06-24 16:12:34'),
(19, 1024587963, 'cambiar_estado', 'domicilio', '32', '::1', 'Cancelado', '2026-06-24 16:12:36'),
(20, 1024587963, 'cambiar_estado', 'pedido', '69', '::1', 'Cancelado', '2026-06-24 16:16:10'),
(21, 1024587963, 'cambiar_estado', 'pedido', '67', '::1', 'Cancelado', '2026-06-24 16:16:16'),
(22, 1024587963, 'cambiar_estado', 'pedido', '66', '::1', 'Cancelado', '2026-06-24 16:16:21'),
(23, 1024587963, 'cambiar_estado', 'pedido', '68', '::1', 'Cancelado', '2026-06-24 16:16:26'),
(24, 1024587963, 'cambiar_estado', 'pedido', '64', '::1', 'Cancelado', '2026-06-24 16:16:32'),
(25, 1024587963, 'cambiar_estado', 'pedido', '62', '::1', 'Cancelado', '2026-06-24 16:16:39'),
(26, 1024587963, 'cambiar_estado', 'pedido', '63', '::1', 'Cancelado', '2026-06-24 16:16:42'),
(27, 1024587963, 'cambiar_estado', 'pedido', '60', '::1', 'Entregado', '2026-06-24 16:16:46'),
(28, 1024587963, 'cambiar_estado', 'pedido', '30', '::1', 'Cancelado', '2026-06-24 16:17:12'),
(29, 1024587963, 'cambiar_estado', 'pedido', '20', '::1', 'Entregado', '2026-06-24 16:17:19'),
(30, 1024587963, 'cambiar_estado', 'pedido', '34', '::1', 'Entregado', '2026-06-24 16:17:24'),
(31, 1024587963, 'cambiar_estado', 'pedido', '33', '::1', 'Cancelado', '2026-06-24 16:17:29'),
(32, 1024587963, 'cambiar_estado', 'pedido', '17', '::1', 'Cancelado', '2026-06-24 16:17:32'),
(33, 1024587963, 'cambiar_estado', 'pedido', '27', '::1', 'Cancelado', '2026-06-24 16:17:35'),
(34, 1024587963, 'cambiar_estado', 'pedido', '23', '::1', 'Entregado', '2026-06-24 16:17:40'),
(35, 1024587963, 'cambiar_estado', 'pedido', '43', '::1', 'Cancelado', '2026-06-24 16:17:44'),
(36, 1024587963, 'cambiar_estado', 'pedido', '44', '::1', 'Cancelado', '2026-06-24 16:17:49'),
(37, 1024587963, 'cambiar_estado', 'pedido', '45', '::1', 'Entregado', '2026-06-24 16:17:52'),
(38, 1024587963, 'cambiar_estado', 'pedido', '46', '::1', 'Entregado', '2026-06-24 16:17:57'),
(39, 1024587963, 'cambiar_estado', 'pedido', '47', '::1', 'Cancelado', '2026-06-24 16:18:00'),
(40, 1024587963, 'cambiar_estado', 'pedido', '48', '::1', 'Cancelado', '2026-06-24 16:18:02'),
(41, 1024587963, 'cambiar_estado', 'pedido', '49', '::1', 'Cancelado', '2026-06-24 16:18:08'),
(42, 1024587963, 'cambiar_estado', 'pedido', '50', '::1', 'Cancelado', '2026-06-24 16:18:11'),
(43, 1024587963, 'cambiar_estado', 'pedido', '51', '::1', 'Cancelado', '2026-06-24 16:18:14'),
(44, 1024587963, 'cambiar_estado', 'pedido', '52', '::1', 'Cancelado', '2026-06-24 16:18:17'),
(45, 1024587963, 'cambiar_estado', 'pedido', '53', '::1', 'Cancelado', '2026-06-24 16:18:19'),
(46, 1024587963, 'cambiar_estado', 'pedido', '54', '::1', 'Cancelado', '2026-06-24 16:18:23'),
(47, 1024587963, 'cambiar_estado', 'pedido', '55', '::1', 'Cancelado', '2026-06-24 16:18:30'),
(48, 1024587963, 'cambiar_estado', 'pedido', '56', '::1', 'Cancelado', '2026-06-24 16:18:38'),
(49, 1024587963, 'cambiar_estado', 'pedido', '57', '::1', 'Cancelado', '2026-06-24 16:18:41'),
(50, 1024587963, 'cambiar_estado', 'pedido', '58', '::1', 'Cancelado', '2026-06-24 16:18:56'),
(51, 1024587963, 'cambiar_estado', 'pedido', '59', '::1', 'Entregado', '2026-06-24 16:18:59'),
(52, 1024587963, 'cambiar_estado', 'pedido', '61', '::1', 'Cancelado', '2026-06-24 16:19:02'),
(53, 1024587963, 'editar', 'oferta', '4', '::1', 'Oferta', '2026-06-24 16:21:29'),
(54, 1024587963, 'cambiar_estado', 'pedido', '74', '::1', 'Confirmado', '2026-06-24 16:33:26'),
(55, 1024587963, 'cambiar_estado', 'pedido', '74', '::1', 'En preparacion', '2026-06-24 16:33:45'),
(56, 1024587963, 'cambiar_estado', 'domicilio', '41', '::1', 'En camino', '2026-06-24 16:34:05'),
(57, 1024587963, 'cambiar_estado', 'domicilio', '41', '::1', 'Entregado', '2026-06-24 16:34:53'),
(58, 1024587963, 'editar', 'oferta', '4', '::1', 'Oferta', '2026-06-24 17:08:33'),
(59, 1024587963, 'editar', 'oferta', '4', '::1', 'Oferta', '2026-06-24 17:15:50'),
(60, 1024587963, 'crear', 'oferta', '5', '::1', 'Refresca tu día', '2026-06-24 17:18:50'),
(61, 1024587963, 'crear', 'oferta', '6', '::1', 'Refresca tu día', '2026-06-24 17:19:22'),
(62, 1024587963, 'eliminar', 'oferta', '6', '::1', NULL, '2026-06-24 17:19:30'),
(63, 1024587963, 'cambiar_estado', 'domicilio', '41', '::1', 'Entregado', '2026-06-24 19:20:08'),
(64, 1024587963, 'editar', 'oferta', '5', '::1', 'Refresca tu día', '2026-06-30 18:39:10'),
(65, 1024587963, 'editar', 'oferta', '5', '::1', 'Refresca tu día', '2026-06-30 18:39:19'),
(66, 1024587963, 'editar', 'oferta', '4', '::1', 'Oferta', '2026-06-30 18:39:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
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
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`Cod_Carrito`, `Fecha_creacion`, `Fecha_modificacion`, `Cantidad_articulos`, `Total`, `Num_Documento`) VALUES
(1, '2025-11-23 14:02:15', '2026-06-24 16:20:12', 5, 38900, 1024587963),
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
(12, '2026-03-11 18:51:37', '2026-05-26 15:26:55', 2, 6400, 1000349255),
(13, '2026-03-16 09:45:07', '2026-03-16 09:45:07', 0, 0, 1000349256),
(14, '2026-03-26 10:15:40', '2026-06-24 19:18:28', 1, 3200, 1069582667),
(15, '2026-03-26 12:24:53', '2026-03-26 12:24:53', 0, 0, 2147483647),
(16, '2026-05-05 14:42:00', '2026-05-05 14:42:00', 0, 0, 2222222),
(17, '2026-05-05 18:54:49', '2026-05-05 18:54:49', 0, 0, 1010166469),
(18, '2026-05-25 14:24:10', '2026-05-25 14:37:31', 2, 21000, 332239273),
(19, '2026-06-30 19:56:21', '2026-06-30 19:56:21', 0, 0, 123456789);

--
-- Disparadores `carrito`
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
-- Estructura de tabla para la tabla `carrito_item`
--

CREATE TABLE `carrito_item` (
  `Cod_carrito_item` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Precio` int(11) NOT NULL,
  `Cod_producto` int(11) DEFAULT NULL,
  `Cod_carrito` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carrito_item`
--

INSERT INTO `carrito_item` (`Cod_carrito_item`, `Cantidad`, `Precio`, `Cod_producto`, `Cod_carrito`) VALUES
(3, 1, 6200, 2, 2),
(4, 1, 4800, 3, 2),
(6, 1, 10500, 4, 3),
(7, 1, 5200, 5, 4),
(8, 1, 4800, 3, 4),
(9, 1, 8900, 9, 5),
(10, 1, 5200, 5, 5),
(11, 1, 9800, 8, 5),
(14, 1, 11500, 6, 7),
(15, 1, 4300, 8, 8),
(16, 1, 5200, 5, 8),
(17, 1, 5400, 7, 8),
(18, 1, 3200, 7, 9),
(19, 1, 4900, 3, 9),
(20, 1, 5200, 10, 10),
(52, 2, 21000, 4, 18),
(63, 2, 6400, 14, 12),
(80, 1, 10500, 4, 1),
(81, 1, 8900, 9, 1),
(82, 1, 4800, 3, 1),
(83, 1, 5200, 5, 1),
(84, 1, 9500, 21, 1),
(90, 1, 3200, 14, 14);

--
-- Disparadores `carrito_item`
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
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `Cod_Categoria` int(11) NOT NULL,
  `Nombre` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
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
-- Estructura de tabla para la tabla `detalle_pedido`
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
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`Id_Detalle_Pedido`, `Cantidad`, `Precio_unitario`, `Subtotal`, `Cod_Pedido`, `Cod_Producto`) VALUES
(5, 1, 6200, 6200, 18, 2),
(6, 1, 4800, 4800, 18, 3),
(8, 1, 6200, 6200, 19, 2),
(9, 1, 4800, 4800, 19, 3),
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
(40, 1, 5200, 5200, 35, 10),
(46, 4, 3200, 12800, 40, 7),
(47, 1, 10500, 10500, 41, 4),
(48, 1, 8900, 8900, 41, 9),
(49, 1, 4300, 4300, 41, 8),
(50, 1, 4800, 4800, 41, 3),
(51, 1, 10500, 10500, 42, 4),
(53, 1, 11500, 11500, 42, 6),
(54, 1, 6200, 6200, 42, 2),
(55, 1, 8900, 8900, 43, 9),
(56, 5, 10500, 52500, 44, 4),
(57, 1, 8900, 8900, 45, 9),
(58, 2, 3800, 7600, 45, 17),
(59, 2, 3200, 6400, 46, 14),
(60, 1, 10500, 10500, 47, 4),
(61, 1, 10500, 10500, 48, 4),
(62, 2, 8900, 17800, 49, 9),
(63, 2, 8900, 17800, 50, 9),
(64, 2, 8900, 17800, 51, 9),
(65, 2, 8900, 17800, 52, 9),
(66, 1, 10500, 10500, 53, 4),
(67, 3, 5500, 16500, 54, 12),
(68, 2, 10500, 21000, 55, 4),
(69, 2, 5500, 11000, 56, 12),
(70, 2, 5500, 11000, 57, 12),
(71, 2, 5500, 11000, 58, 12),
(72, 2, 10500, 21000, 58, 4),
(73, 2, 5500, 11000, 59, 12),
(74, 2, 10500, 21000, 59, 4),
(75, 2, 8900, 17800, 59, 9),
(76, 3, 10500, 31500, 60, 4),
(77, 1, 3200, 3200, 61, 14),
(78, 1, 3200, 3200, 62, 14),
(79, 2, 3200, 6400, 63, 14),
(80, 1, 10500, 10500, 64, 4),
(81, 1, 8500, 8500, 64, 18),
(84, 1, 10500, 10500, 66, 4),
(85, 1, 8500, 8500, 66, 18),
(86, 2, 3200, 6400, 67, 14),
(87, 2, 3200, 6400, 68, 14),
(88, 2, 3200, 6400, 69, 14),
(89, 2, 3200, 6400, 70, 14),
(90, 1, 10500, 10500, 71, 4),
(91, 1, 3200, 3200, 71, 14),
(92, 1, 3200, 3200, 72, 14),
(93, 1, 4800, 4800, 72, 3),
(94, 1, 5500, 5500, 72, 12),
(95, 1, 7500, 7500, 72, 16),
(96, 1, 10500, 10500, 73, 4),
(97, 1, 8900, 8900, 73, 9),
(98, 1, 4800, 4800, 73, 3),
(99, 1, 5200, 5200, 73, 5),
(100, 1, 9500, 9500, 73, 21),
(101, 1, 10500, 10500, 74, 4),
(102, 1, 8500, 8500, 74, 18),
(103, 1, 4800, 4800, 74, 3),
(104, 1, 2660, 2660, 74, 17),
(105, 1, 3200, 3200, 75, 14),
(106, 1, 3200, 3200, 76, 14);

--
-- Disparadores `detalle_pedido`
--
DELIMITER $$
CREATE TRIGGER `tr_bajar_inventario` AFTER INSERT ON `detalle_pedido` FOR EACH ROW UPDATE inventario
                 SET Stock = Stock - NEW.Cantidad,
                     Registrar_Salidas = Registrar_Salidas + NEW.Cantidad,
                     Fecha_Actualizacion = NOW()
                 WHERE Cod_Producto = NEW.Cod_Producto
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_reporte`
--

CREATE TABLE `detalle_reporte` (
  `Id_Detalle` int(11) NOT NULL,
  `Tipo_Entidad` enum('carrito','producto','inventario','pedido','pago','domicilio') DEFAULT NULL,
  `Cod_Reporte` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_reporte`
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
(92, 'domicilio', 30),
(93, 'pedido', 31),
(94, 'producto', 31),
(95, 'pedido', 33),
(96, 'producto', 33),
(97, 'pedido', 34),
(98, 'producto', 34),
(99, 'pedido', 35),
(100, 'producto', 35),
(101, 'pedido', 36),
(102, 'producto', 36),
(103, 'pedido', 37),
(104, 'producto', 37),
(105, 'pedido', 38),
(106, 'producto', 38),
(107, 'pedido', 39),
(108, 'pago', 39),
(109, 'producto', 39),
(110, 'pedido', 40),
(111, 'pago', 40),
(112, 'producto', 40),
(113, 'pedido', 41),
(114, 'producto', 41),
(115, 'pedido', 42),
(116, 'producto', 42),
(117, 'pedido', 43),
(118, 'producto', 43);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `domicilio`
--

CREATE TABLE `domicilio` (
  `Cod_Domicilio` int(11) NOT NULL,
  `Fecha` datetime NOT NULL,
  `Estado` varchar(30) NOT NULL,
  `Cod_Usuario_Pedido` int(11) DEFAULT NULL,
  `Direccion_entrega` varchar(70) DEFAULT NULL,
  `Telefono` varchar(15) DEFAULT NULL,
  `Notas` text DEFAULT NULL,
  `Costo_envio` int(11) DEFAULT NULL,
  `Distancia_km` decimal(5,2) DEFAULT NULL,
  `Tiempo_estimado` int(11) DEFAULT NULL,
  `Cod_pedido` int(11) DEFAULT NULL,
  `Comprobante_Entrega` mediumtext DEFAULT NULL,
  `Recibido_Por` varchar(120) DEFAULT NULL,
  `Documento_Recibe` varchar(40) DEFAULT NULL,
  `Observaciones_Entrega` varchar(255) DEFAULT NULL,
  `Fecha_Entrega` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `domicilio`
--

INSERT INTO `domicilio` (`Cod_Domicilio`, `Fecha`, `Estado`, `Cod_Usuario_Pedido`, `Direccion_entrega`, `Telefono`, `Notas`, `Costo_envio`, `Distancia_km`, `Tiempo_estimado`, `Cod_pedido`, `Comprobante_Entrega`, `Recibido_Por`, `Documento_Recibe`, `Observaciones_Entrega`, `Fecha_Entrega`) VALUES
(16, '2025-11-24 10:40:00', 'Cancelado', 16, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(17, '2025-11-25 14:50:00', 'En preparación', 17, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, '2025-11-24 09:55:00', 'Cancelado', 18, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(19, '2025-11-25 12:40:00', 'Cancelado', 19, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(20, '2025-11-24 12:30:00', 'En revisión', 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, '2025-11-25 16:10:00', 'Entregado', 21, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, '2025-11-24 08:50:00', 'Cancelado', 22, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, '2025-11-25 17:50:00', 'En preparación', 23, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, '2025-11-24 13:40:00', 'Cancelado', 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(25, '2025-11-25 19:40:00', 'Cancelado', 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(26, '2025-11-24 10:30:00', 'Cancelado', 26, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(27, '2025-11-25 16:55:00', 'En preparación', 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, '2025-11-24 11:40:00', 'Cancelado', 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(29, '2025-11-25 15:25:00', 'Entregado', 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, '2025-11-24 10:10:00', 'Rechazado', 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, '2025-11-25 19:05:00', 'Cancelado', 31, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(32, '2025-11-24 07:50:00', 'Cancelado', 32, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(33, '2025-11-25 14:15:00', 'En revisión', 33, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, '2025-11-24 16:35:00', 'Preparando envío', 34, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, '2025-11-25 21:00:00', 'Entregado', 35, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, '2026-03-16 17:21:39', 'Cancelado', 40, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(37, '2026-03-16 17:22:03', 'Cancelado', 41, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL),
(38, '2026-03-16 17:22:43', 'Entregado', 42, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'http://localhost/mercado_digital/backend/public/uploads/evidencias/evidencia_pedido_42_1782335504.png', 'Monica Liceth T', '300000000', 'Ninguna', '2026-06-24 16:11:46'),
(39, '2026-06-24 15:52:09', 'Cancelado', 70, 'Carrera 87J con Calle 49C Bis Sur', '3244314271', NULL, 1000, NULL, NULL, 70, NULL, '', '', '', NULL),
(40, '2026-06-24 15:53:16', 'Entregado', 71, 'Carrera 87J con Calle 49C Bis Sur', '3244314271', NULL, 1000, NULL, NULL, 71, 'http://localhost/mercado_digital/backend/public/uploads/evidencias/evidencia_pedido_71_1782335325.jpg', 'Raul Gonzalez', '1069582666', 'Ninguna', '2026-06-24 16:06:27'),
(41, '2026-06-24 16:32:25', 'Entregado', 74, 'Cl. 50a Sur #88c, Bogotá', '3244314271', NULL, 0, NULL, NULL, 74, 'http://localhost/mercado_digital/backend/public/uploads/evidencias/evidencia_pedido_74_1782336892.jpg', 'Raul Gonzalez', '3000000000', 'Ninguna', '2026-06-24 16:34:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_estado_pedido`
--

CREATE TABLE `historial_estado_pedido` (
  `Id_historial` int(11) NOT NULL,
  `Estado` varchar(50) DEFAULT NULL,
  `Fecha` datetime DEFAULT NULL,
  `Cod_pedido` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_estado_pedido`
--

INSERT INTO `historial_estado_pedido` (`Id_historial`, `Estado`, `Fecha`, `Cod_pedido`) VALUES
(1, 'En camino', '2026-03-26 14:36:37', 42),
(2, 'Pendiente', '2026-06-24 15:52:09', 70),
(3, 'Pendiente', '2026-06-24 15:53:16', 71),
(4, 'Entregado', '2026-06-24 16:06:27', 71),
(5, 'Entregado', '2026-06-24 16:08:47', 71),
(6, 'Entregado', '2026-06-24 16:08:52', 71),
(7, 'Entregado', '2026-06-24 16:11:46', 42),
(8, 'Cancelado', '2026-06-24 16:12:02', 70),
(9, 'Cancelado', '2026-06-24 16:12:10', 41),
(10, 'Cancelado', '2026-06-24 16:12:13', 40),
(11, 'Cancelado', '2026-06-24 16:12:15', 24),
(12, 'Cancelado', '2026-06-24 16:12:22', 25),
(13, 'Cancelado', '2026-06-24 16:12:24', 31),
(14, 'Cancelado', '2026-06-24 16:12:26', 19),
(15, 'Cancelado', '2026-06-24 16:12:28', 28),
(16, 'Cancelado', '2026-06-24 16:12:30', 16),
(17, 'Cancelado', '2026-06-24 16:12:32', 26),
(18, 'Cancelado', '2026-06-24 16:12:34', 18),
(19, 'Cancelado', '2026-06-24 16:12:36', 32),
(20, 'Pendiente', '2026-06-24 16:32:25', 74),
(21, 'En camino', '2026-06-24 16:34:05', 74),
(22, 'Entregado', '2026-06-24 16:34:53', 74),
(23, 'Entregado', '2026-06-24 19:20:08', 74);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
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
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`Cod_Inventario`, `Stock`, `Registrar_Entradas`, `Registrar_Salidas`, `Fecha_Actualizacion`, `Novedades`, `Cod_Producto`) VALUES
(2, 199, 40, 16, '2026-03-16 17:22:43', 'Alta rotación', 2),
(3, 296, 60, 24, '2026-06-24 16:29:42', 'Revisión', 3),
(4, 156, 30, 34, '2026-06-24 16:29:42', 'Actualizado desde productos', 4),
(5, 119, 25, 6, '2026-06-24 16:20:12', 'Normal', 5),
(6, 89, 15, 13, '2026-03-16 17:22:43', 'Control cereal', 6),
(7, 246, 35, 24, '2026-03-16 17:21:39', 'Entrada yogurt', 7),
(8, 209, 28, 10, '2026-03-16 17:22:03', 'Actualización', 8),
(9, 146, 18, 24, '2026-06-24 16:20:12', 'Stock alto', 9),
(10, 140, 22, 8, '2025-11-23 14:02:15', 'Estable', 10),
(11, 120, 120, 0, '2026-03-26 14:19:44', 'Stock inicial', NULL),
(12, 108, 120, 12, '2026-06-24 16:20:02', 'Actualizado desde productos', 12),
(13, 182, 200, 18, '2026-06-24 19:18:28', 'Stock inicial', 14),
(14, 80, 80, 0, '2026-03-26 14:25:47', 'Stock inicial', 15),
(15, 59, 60, 1, '2026-06-24 16:20:02', 'Stock inicial', 16),
(16, 147, 150, 3, '2026-06-24 16:29:42', 'Stock inicial', 17),
(18, 97, 100, 3, '2026-06-24 16:29:42', 'Stock inicial', 18),
(19, 120, 120, 0, '2026-06-22 00:37:16', 'Stock inicial', 19),
(20, 80, 80, 0, '2026-06-22 00:37:16', 'Stock inicial', 20),
(21, 59, 60, 1, '2026-06-24 16:20:12', 'Stock inicial', 21);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oferta`
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

--
-- Volcado de datos para la tabla `oferta`
--

INSERT INTO `oferta` (`Cod_Oferta`, `Titulo`, `Descripcion`, `Porcentaje_Descuento`, `Fecha_Inicio`, `Fecha_Fin`, `activo`, `Cod_Producto`, `imagen_banner`) VALUES
(4, 'Oferta', 'Lacteos', 30, '2026-03-26 15:00:00', '2026-07-10 14:52:00', 1, 17, 'uploads/ofertas/oferta_banner_20260624_171550_469d69b7.webp'),
(5, 'Refresca tu día', '', 20, '2026-06-24 17:18:00', '2026-07-07 18:00:00', 1, 12, 'uploads/ofertas/oferta_banner_20260624_171850_f3f3ba16.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `Cod_Pago` int(11) NOT NULL,
  `Metodo_Pago` varchar(50) NOT NULL,
  `Fecha_Pago` datetime NOT NULL,
  `Monto_Pago` int(11) NOT NULL,
  `Cod_pedido` int(11) DEFAULT NULL,
  `Estado_Pago` enum('Pendiente','Completado','Fallido') DEFAULT NULL,
  `stripe_reference` varchar(120) DEFAULT NULL,
  `stripe_session_id` varchar(120) DEFAULT NULL,
  `stripe_payment_intent_id` varchar(120) DEFAULT NULL,
  `stripe_session_status` varchar(30) DEFAULT NULL,
  `stripe_payment_status` varchar(30) DEFAULT NULL,
  `stripe_updated_at` datetime DEFAULT NULL,
  `is_simulated` tinyint(1) DEFAULT 0 COMMENT 'Marca si es un pago de prueba',
  `simulated_transaction_id` varchar(255) DEFAULT NULL COMMENT 'ID de transacción simulada',
  `mp_preference_id` varchar(100) DEFAULT NULL,
  `mp_payment_id` varchar(50) DEFAULT NULL,
  `mp_status` varchar(50) DEFAULT NULL,
  `mp_payment_method` varchar(50) DEFAULT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `monto_comprobante` int(11) DEFAULT NULL,
  `verificacion` varchar(20) DEFAULT NULL,
  `notas_verificacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`Cod_Pago`, `Metodo_Pago`, `Fecha_Pago`, `Monto_Pago`, `Cod_pedido`, `Estado_Pago`, `stripe_reference`, `stripe_session_id`, `stripe_payment_intent_id`, `stripe_session_status`, `stripe_payment_status`, `stripe_updated_at`, `is_simulated`, `simulated_transaction_id`, `mp_preference_id`, `mp_payment_id`, `mp_status`, `mp_payment_method`, `comprobante_url`, `monto_comprobante`, `verificacion`, `notas_verificacion`) VALUES
(16, 'Efectivo', '2025-11-24 10:20:00', 7600, 16, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'Nequi', '2025-11-25 14:25:00', 7600, 17, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'Tarjeta', '2025-11-24 09:45:00', 14800, 18, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'Efectivo', '2025-11-25 12:15:00', 14800, 19, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Tarjeta', '2025-11-24 12:00:00', 10500, 20, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'Nequi', '2025-11-25 15:50:00', 10500, 21, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'Efectivo', '2025-11-24 08:35:00', 10000, 22, 'Fallido', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 'Tarjeta', '2025-11-25 17:25:00', 10000, 23, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'Nequi', '2025-11-24 13:15:00', 23900, 24, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 'Efectivo', '2025-11-25 19:10:00', 23900, 25, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 'Tarjeta', '2025-11-24 10:05:00', 7600, 26, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'Daviplata', '2025-11-25 16:35:00', 7600, 27, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'Efectivo', '2025-11-24 11:15:00', 11500, 28, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'Nequi', '2025-11-25 15:05:00', 11500, 29, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'Tarjeta', '2025-11-24 09:55:00', 14900, 30, 'Fallido', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'Efectivo', '2025-11-25 18:45:00', 14900, 31, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'Nequi', '2025-11-24 07:30:00', 8100, 32, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'Tarjeta', '2025-11-25 13:55:00', 8100, 33, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'Efectivo', '2025-11-24 16:15:00', 5200, 34, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'Nequi', '2025-11-25 20:35:00', 5200, 35, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, 'Efectivo', '2026-03-16 17:21:39', 16600, 40, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'Efectivo', '2026-03-16 17:22:03', 28500, 41, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'Efectivo', '2026-03-16 17:22:43', 32000, 42, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'Daviplata', '0000-00-00 00:00:00', 16800, 43, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 'Nequi', '0000-00-00 00:00:00', 60400, 44, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'Daviplata', '0000-00-00 00:00:00', 24400, 45, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'Stripe', '0000-00-00 00:00:00', 14300, 46, 'Completado', 'MD-STRIPE-46-1774728419', 'cs_test_a1n5AtWLM3gLvaimzKF5Xxwthz0WXABeq4PceFFytg4xW8lp2snoYK4c3x', 'pi_3TG38UBrS8kXA3Zy0nQ3k3bF', 'complete', 'paid', '2026-03-28 15:10:49', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'Stripe', '0000-00-00 00:00:00', 18400, 47, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, 'Stripe', '0000-00-00 00:00:00', 18400, 48, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, 'Stripe', '0000-00-00 00:00:00', 25700, 49, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(46, 'Stripe', '0000-00-00 00:00:00', 25700, 50, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'Stripe', '0000-00-00 00:00:00', 25700, 51, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(48, 'Stripe', '0000-00-00 00:00:00', 25700, 52, 'Fallido', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(49, 'Stripe', '0000-00-00 00:00:00', 18400, 53, 'Fallido', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(50, 'MercadoPago', '0000-00-00 00:00:00', 24400, 54, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 'Simulado', '0000-00-00 00:00:00', 28900, 55, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'Simulado', '0000-00-00 00:00:00', 18900, 56, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 'Simulado', '0000-00-00 00:00:00', 18900, 57, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 'Simulado', '0000-00-00 00:00:00', 39900, 58, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'Tarjeta', '0000-00-00 00:00:00', 57700, 59, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aprobado', '¡Pago aprobado! Gracias por tu compra.'),
(56, 'Tarjeta', '0000-00-00 00:00:00', 39400, 60, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aprobado', '¡Pago aprobado! Gracias por tu compra.'),
(57, 'Tarjeta', '0000-00-00 00:00:00', 11100, 61, 'Fallido', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'rechazado', 'Fondos insuficientes.'),
(58, 'Simulado', '0000-00-00 00:00:00', 11100, 62, '', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 'Tarjeta', '0000-00-00 00:00:00', 14300, 63, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aprobado', '¡Pago aprobado! Gracias por tu compra.'),
(60, 'Simulado', '2026-06-23 23:39:28', 26900, 64, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(62, 'Simulado', '2026-06-24 15:14:31', 26900, 66, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(63, 'Simulado', '2026-06-24 15:14:40', 14300, 67, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(64, 'Simulado', '2026-06-24 15:30:17', 7400, 68, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(65, 'Simulado', '2026-06-24 15:43:07', 7400, 69, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(66, 'Tarjeta', '2026-06-24 15:50:03', 7400, 70, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aprobado', '¡Pago aprobado! Gracias por tu compra.'),
(67, 'Tarjeta', '2026-06-24 15:53:16', 14700, 71, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aprobado', '¡Pago aprobado! Gracias por tu compra.'),
(68, 'Efectivo', '2026-06-24 16:20:02', 21000, 72, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(69, 'Efectivo', '2026-06-24 16:20:12', 38900, 73, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(70, 'Nequi', '2026-06-24 16:32:25', 26460, 74, 'Completado', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aprobado', '¡Pago aprobado! Gracias por tu compra.'),
(71, 'Simulado', '2026-06-24 19:17:46', 4200, 75, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(72, 'Simulado', '2026-06-24 19:18:28', 4200, 76, 'Pendiente', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `Cod_Pedido` int(11) NOT NULL,
  `Fecha_Pedido` datetime NOT NULL,
  `Estado_Pedido` varchar(50) NOT NULL,
  `Cod_Carrito` int(11) DEFAULT NULL,
  `Canal_Venta` varchar(20) NOT NULL DEFAULT 'Online',
  `Tipo_Entrega` varchar(20) NOT NULL DEFAULT 'Domicilio',
  `Num_Documento_Vendedor` int(11) DEFAULT NULL,
  `Observaciones_Venta` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`Cod_Pedido`, `Fecha_Pedido`, `Estado_Pedido`, `Cod_Carrito`, `Canal_Venta`, `Tipo_Entrega`, `Num_Documento_Vendedor`, `Observaciones_Venta`) VALUES
(16, '2025-11-24 10:15:00', 'Cancelado', 1, 'Online', 'Domicilio', NULL, NULL),
(17, '2025-11-25 14:22:00', 'Cancelado', 1, 'Online', 'Domicilio', NULL, NULL),
(18, '2025-11-24 09:40:00', 'Cancelado', 2, 'Online', 'Domicilio', NULL, NULL),
(19, '2025-11-25 12:10:00', 'Cancelado', 2, 'Online', 'Domicilio', NULL, NULL),
(20, '2025-11-24 11:55:00', 'Entregado', 3, 'Online', 'Domicilio', NULL, NULL),
(21, '2025-11-25 15:45:00', 'Entregado', 3, 'Online', 'Domicilio', NULL, NULL),
(22, '2025-11-24 08:30:00', 'Cancelado', 4, 'Online', 'Domicilio', NULL, NULL),
(23, '2025-11-25 17:20:00', 'Entregado', 4, 'Online', 'Domicilio', NULL, NULL),
(24, '2025-11-24 13:10:00', 'Cancelado', 5, 'Online', 'Domicilio', NULL, NULL),
(25, '2025-11-25 19:05:00', 'Cancelado', 5, 'Online', 'Domicilio', NULL, NULL),
(26, '2025-11-24 10:00:00', 'Cancelado', 6, 'Online', 'Domicilio', NULL, NULL),
(27, '2025-11-25 16:30:00', 'Cancelado', 6, 'Online', 'Domicilio', NULL, NULL),
(28, '2025-11-24 11:10:00', 'Cancelado', 7, 'Online', 'Domicilio', NULL, NULL),
(29, '2025-11-25 15:00:00', 'Entregado', 7, 'Online', 'Domicilio', NULL, NULL),
(30, '2025-11-24 09:50:00', 'Cancelado', 8, 'Online', 'Domicilio', NULL, NULL),
(31, '2025-11-25 18:40:00', 'Cancelado', 8, 'Online', 'Domicilio', NULL, NULL),
(32, '2025-11-24 07:25:00', 'Cancelado', 9, 'Online', 'Domicilio', NULL, NULL),
(33, '2025-11-25 13:50:00', 'Cancelado', 9, 'Online', 'Domicilio', NULL, NULL),
(34, '2025-11-24 16:12:00', 'Entregado', 10, 'Online', 'Domicilio', NULL, NULL),
(35, '2025-11-25 20:30:00', 'Entregado', 10, 'Online', 'Domicilio', NULL, NULL),
(40, '2026-03-16 17:21:37', 'Cancelado', 12, 'Online', 'Domicilio', NULL, NULL),
(41, '2026-03-16 17:22:03', 'Cancelado', 12, 'Online', 'Domicilio', NULL, NULL),
(42, '2026-03-16 17:22:42', 'Entregado', 12, 'Online', 'Domicilio', NULL, NULL),
(43, '2026-03-25 12:00:05', 'Cancelado', 12, 'Online', 'Domicilio', NULL, NULL),
(44, '2026-03-26 10:17:23', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(45, '2026-03-26 14:39:25', 'Entregado', 14, 'Online', 'Domicilio', NULL, NULL),
(46, '2026-03-28 15:06:58', 'Entregado', 14, 'Online', 'Domicilio', NULL, NULL),
(47, '2026-03-28 15:14:13', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(48, '2026-03-28 15:15:23', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(49, '2026-04-27 15:27:45', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(50, '2026-04-27 15:40:39', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(51, '2026-04-27 18:17:14', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(52, '2026-04-27 18:27:05', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(53, '2026-05-01 12:31:20', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(54, '2026-05-11 19:00:44', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(55, '2026-05-25 14:37:31', 'Cancelado', 18, 'Online', 'Domicilio', NULL, NULL),
(56, '2026-05-25 18:42:40', 'Cancelado', 12, 'Online', 'Domicilio', NULL, NULL),
(57, '2026-05-25 19:11:35', 'Cancelado', 12, 'Online', 'Domicilio', NULL, NULL),
(58, '2026-05-25 19:22:10', 'Cancelado', 12, 'Online', 'Domicilio', NULL, NULL),
(59, '2026-05-25 19:30:25', 'Entregado', 12, 'Online', 'Domicilio', NULL, NULL),
(60, '2026-05-25 19:31:24', 'Entregado', 12, 'Online', 'Domicilio', NULL, NULL),
(61, '2026-05-25 19:33:57', 'Cancelado', 12, 'Online', 'Domicilio', NULL, NULL),
(62, '2026-05-26 13:28:19', 'Cancelado', 12, 'Online', 'Domicilio', NULL, NULL),
(63, '2026-05-26 15:26:55', 'Cancelado', 12, 'Online', 'Domicilio', NULL, NULL),
(64, '2026-06-23 23:39:28', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(66, '2026-06-24 15:14:31', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(67, '2026-06-24 15:14:40', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(68, '2026-06-24 15:30:17', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(69, '2026-06-24 15:43:07', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(70, '2026-06-24 15:45:06', 'Cancelado', 14, 'Online', 'Domicilio', NULL, NULL),
(71, '2026-06-24 15:52:43', 'Entregado', 14, 'Online', 'Domicilio', NULL, NULL),
(72, '2026-06-24 16:20:02', 'Entregado', 1, 'Tienda', 'Recoger_Tienda', 1024587963, 'Venta presencial en tienda'),
(73, '2026-06-24 16:20:12', 'Entregado', 1, 'Tienda', 'Recoger_Tienda', 1024587963, 'Venta presencial en tienda'),
(74, '2026-06-24 16:29:42', 'Entregado', 14, 'Online', 'Domicilio', NULL, NULL),
(75, '2026-06-24 19:17:46', 'Pendiente', 14, 'Online', 'Domicilio', NULL, NULL),
(76, '2026-06-24 19:18:28', 'Pendiente', 14, 'Online', 'Domicilio', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
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
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`Num_Documento`, `Nombre`, `Apellido`, `ContrasenaHash`, `Telefono`, `Correo`, `Barrio`, `Direccion`, `Id_Rol`, `Id_Usuario`) VALUES
(2222222, 'jean', 'lopez', '$2y$10$3fSQETz3h4bJsT.VT3hdN.7FNc92HiZXvIltwwNv/chTK3p8HTwwa', '', 'jeanlopez@gmail.com', 'Chicala del Sur', 'Cll 42 #65-12', 2, 16),
(123456789, 'Test', 'User', '$2y$10$Pvykxbh95y.bwO032odI8.Tzk5hwviOVd0HSBGZ6o0Y9ir6kBzpWi', '1234567890', 'test@test.com', 'Bosa Brasil', 'Calle Falsa 123', 2, 19),
(332239273, 'Jose', 'Lopez', '$2y$10$u7YYQIPDDOKdrA1O42lqmO9COnTXeFkyIGOMPJ5qevy1ZpXo1JEKq', '39229239', 'lopez2004@gmail.com', 'Chicala del Sur', 'rojasjeanpaul8@gmail.com', 2, 18),
(1000349255, 'Monica Liceth', 'Toloza Corredor', '$2y$10$.IJ2f0WMYfZjVckg3B0aduV1U5ct4G0vtnLO7.p38U1rgzJ2w4.hm', '3124185287', 'eroteko2@gmail.com', '', '', 2, 12),
(1000349256, 'sandra', 'camargo', '$2y$10$IQxWXx9Htj1jA1.0.uorx.78Wl/bOogrDcb68YuuGBbcYG3upXzaa', '3112467548', 'sandra.camargo56@gmail.com', 'Chicala del Sur', 'Cra. 87 D Bis #54 A - 22 Sur', 2, 13),
(1002569841, 'Sofía', 'Herrera', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3114589632', 'sofia@correo.com', 'San José', 'Cll 22 #14-10', 2, 2),
(1010166469, 'jean', 'medina', '$2y$10$zmWa8REHR2cWa5pZ1fKZW.j.85m3yTpjwTAchQLb.Dgl7qyN6QvB.', '3211115566', 'jeanpaulstevenrojasmedina@gmail.com', 'Chicala del Sur', 'sur', 2, 17),
(1012457896, 'Carlos', 'Gómez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3124589632', 'carlos@correo.com', 'El Prado', 'Cra 45 #22-60', 2, 3),
(1023654781, 'Ana', 'Rodríguez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3194502368', 'ana@correo.com', 'Los Almendros', 'Cll 42 #65-12', 4, 10),
(1023654789, 'Andrés', 'López', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3147852369', 'andres@correo.com', 'Chicó', 'Cra 82 #20-11', 2, 5),
(1024587963, 'Juan', 'Mejía', '$2y$10$SuIZuUfcqzzhnzfZa21sOOghdGt5MEAX7tx6IutCDvd1Zzi20KKEK', '3102567894', 'juan@correo.com', 'Centro', 'Cra 10 #15-22', 1, 1),
(1036587421, 'Laura', 'Torres', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3138745210', 'laura@correo.com', 'La Esperanza', 'Cll 50 #8-20', 2, 4),
(1047852361, 'Marta', 'Salinas', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3174502369', 'marta@correo.com', 'San José', 'Cll 25 #20-15', 3, 8),
(1058965213, 'Pedro', 'Suárez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3185201478', 'pedro@correo.com', 'La Playa', 'Cra 58 #32-14', 4, 9),
(1069582666, 'Raul Andres', 'Gonzalez', '$2y$10$bppJhrkrQRnWQoDMTQNB4uv.rGz9iyPzu5adP8anB5caAu0jpUI7W', '3244314271', 'raul.gonzalez@mercado.digital.com', 'Madrid', 'Cra 20B #4-82', 1, 11),
(1069582667, 'Raul Andres', 'González Cifuentes', '$2y$10$ADlKm2UQZElW/fIPRHTrae8fCEyZdnSKHiyxJF3jjwv2UXp24PhWS', '3244314271', 'raulandresgonzalezcifuentes@gmail.com', 'Chicala del Sur', 'Carrera 20b #4-82', 2, 14),
(1087456398, 'Ricardo', 'Díaz', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3164781259', 'ricardo@correo.com', 'Centro', 'Cra 6 #18-25', 3, 7),
(1096587421, 'Camila', 'Pérez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3158741256', 'camila@correo.com', 'Cedritos', 'Cll 150 #12-05', 2, 6),
(2147483647, 'Jean', 'Rojas', '$2y$10$TVawbQONItcIGxzV9E8cDuXEz2YHff9b6KeQGQZDqTFySWMdcv5Be', '32313312', 'rojasjeanpaul8@gmail.com', 'Chicala del Sur', 'Bogota', 3, 15);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
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
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`Cod_Producto`, `Nombre`, `Precio`, `Cantidad`, `Fecha_vencimiento`, `Descripcion`, `Imagen_url`, `Cod_Categoria`, `Cod_Proveedor`, `Imagen_zoom`, `Imagen_pos_x`, `Imagen_pos_y`) VALUES
(2, 'Pan Tajado Bimbo', 6200, 200, '2025-12-20', 'Pan tajado familiar', 'producto/Pan Tajado Bimbo.jpg', 3, 3, 1.00, 50.00, 50.00),
(3, 'Chetos 150g', 4800, 296, '2026-03-10', 'Galletas dulces', 'producto/chetos-150.webp', 6, 4, 1.00, 50.00, 50.00),
(4, 'Aceite Premier Girasol 900ml', 10500, 156, '2026-01-05', 'Aceite vegetal', 'producto/ACEITE PREMIER GIRASOL 900ML.webp', 8, 5, 1.00, 0.00, 0.00),
(5, 'Harina Pan 1Kg', 5200, 119, '2026-04-01', 'Harina de trigo', 'producto/Harina Pan 1 kg.webp', 5, 7, 1.00, 50.00, 50.00),
(6, 'Zucaritas 300g', 11500, 90, '2026-05-12', 'Cereal zucaritas', 'producto/Zucaritas 300g.webp', 7, 6, 1.00, 50.00, 50.00),
(7, 'Yogurt Alquería Fresa', 3200, 250, '2025-12-15', 'Yogurt sabor fresa', 'producto/Yogurt Fresa Alqueria 150g.jpg', 2, 1, 1.00, 50.00, 50.00),
(8, 'Gaseosa Manzana 1.5L', 4300, 210, '2026-02-10', 'Manzana Postobón', 'producto/Gaseosa Manzana 1.5L.png', 4, 2, 1.00, 50.00, 50.00),
(9, 'Chocolate Corona', 8900, 146, '2026-04-30', 'Chocolate en polvo', 'producto/chocolate-corona.jpg', 9, 8, 1.00, 50.00, 50.00),
(10, 'Margarina La Fina 500g', 5200, 140, '2025-12-28', 'Margarina de mesa', 'producto/la-fina-500.jpg', 8, 5, 1.00, 50.00, 50.00),
(12, 'Coca-Cola 1.5L', 5500, 108, '2026-12-30', 'Bebida gaseosa sabor cola', 'producto/coca-cola-1.5l.jpg', 4, 2, 1.00, 50.00, 50.00),
(14, 'Arroz Diana 1Kg', 3200, 182, '2026-08-15', 'Arroz blanco de grano largo', 'producto/Arroz-Diana-1000-gr-552155_a.webp', 5, 11, 1.00, 50.00, 50.00),
(15, 'Papas Margarita BBQ', 2500, 80, '2026-07-10', 'Papas fritas sabor BBQ', 'producto/Papas-SUPER-RICAS-FRITAS-CASCARA-ORIGINAL-115-gr.webp', 6, 4, 1.00, 50.00, 50.00),
(16, 'Detergente Ariel 500g', 7500, 59, '2027-01-01', 'Detergente en polvo para ropa', 'producto/anuncio-realista-productos-limpieza_52683-36990.avif', 1, 12, 1.00, 50.00, 50.00),
(17, 'Leche Alpina 1L', 3800, 147, '2026-05-20', 'Leche entera larga vida', 'producto/leche.webp', 2, 13, 1.00, 50.00, 50.00),
(18, 'Cafe Colcafe', 8500, 97, '2026-08-15', 'Cafe instantaneo clasico', 'producto/colcafe.jpg.png', 5, 5, 1.00, 50.00, 50.00),
(19, 'Leche Supercremosa 1L', 4200, 120, '2026-03-20', 'Leche entera supercremosa 1 litro', 'producto/MEGALITRO_LECHE_SUPERCREMOSA_opt2_f5ec2cc356.webp', 2, 1, 1.00, 50.00, 50.00),
(20, 'Perropico', 3000, 80, '2026-06-30', 'Dulce tradicional colombiano', 'producto/perropico.jpg', 9, 4, 1.00, 50.00, 50.00),
(21, 'Pinguinos Mini Bimbo', 9500, 59, '2026-05-15', 'Pinguinos mini Bimbo caja 240g', 'producto/pinguinos-minix-bimbox240-gramosx12-unidad.jpg', 9, 3, 1.00, 50.00, 50.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `Cod_Proveedor` int(11) NOT NULL,
  `Nombre_proveedor` varchar(80) NOT NULL,
  `Telefono_proveedor` varchar(11) NOT NULL,
  `Correo_proveedor` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor`
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
(10, 'Pan Pa Ya Colombia', '6014102589', 'info@panpaya.com'),
(11, 'Diana Corporación', '16231799', 'servicioalcliente.alimentos@grupodiana.co'),
(12, 'Procter & Gamble', '800.332.778', 'mediateam.im@pg.com'),
(13, 'Alpina', '316 244 201', 'alpina@alpina.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte`
--

CREATE TABLE `reporte` (
  `Cod_Reporte` int(11) NOT NULL,
  `Fecha_Reporte` datetime DEFAULT current_timestamp(),
  `Tipo_reporte` varchar(100) DEFAULT NULL,
  `Descripcion` text DEFAULT NULL,
  `Num_Documento` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reporte`
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
(30, '2025-11-23 14:41:27', 'Pedido', 'Reporte: pedido 35 generado', 1023654781),
(31, '2026-06-23 23:39:28', 'Pedido', 'Reporte: pedido 64 generado', 1069582667),
(33, '2026-06-24 15:14:31', 'Pedido', 'Reporte: pedido 66 generado', 1069582667),
(34, '2026-06-24 15:14:40', 'Pedido', 'Reporte: pedido 67 generado', 1069582667),
(35, '2026-06-24 15:30:17', 'Pedido', 'Reporte: pedido 68 generado', 1069582667),
(36, '2026-06-24 15:43:07', 'Pedido', 'Reporte: pedido 69 generado', 1069582667),
(37, '2026-06-24 15:45:06', 'Pedido', 'Reporte: pedido 70 generado', 1069582667),
(38, '2026-06-24 15:52:43', 'Pedido', 'Reporte: pedido 71 generado', 1069582667),
(39, '2026-06-24 16:20:02', 'Venta tienda', 'Reporte: venta presencial pedido 72 generada', 1024587963),
(40, '2026-06-24 16:20:12', 'Venta tienda', 'Reporte: venta presencial pedido 73 generada', 1024587963),
(41, '2026-06-24 16:29:42', 'Pedido', 'Reporte: pedido 74 generado', 1069582667),
(42, '2026-06-24 19:17:46', 'Pedido', 'Reporte: pedido 75 generado', 1069582667),
(43, '2026-06-24 19:18:28', 'Pedido', 'Reporte: pedido 76 generado', 1069582667);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_usuario`
--

CREATE TABLE `rol_usuario` (
  `Id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_usuario`
--

INSERT INTO `rol_usuario` (`Id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Cliente'),
(3, 'Empleado'),
(4, 'Proveedor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `Id_usuario` int(11) NOT NULL,
  `Id_Rol` int(11) DEFAULT NULL,
  `Estado` varchar(20) NOT NULL DEFAULT 'Activo',
  `SesionId` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`Id_usuario`, `Id_Rol`, `Estado`, `SesionId`) VALUES
(1, 1, 'Activo', '4333e508c79866de904af548127ed4c7dca61e9fb11c0664'),
(2, 2, 'Activo', NULL),
(3, 2, 'Activo', NULL),
(4, 2, 'Activo', NULL),
(5, 2, 'Activo', NULL),
(6, 2, 'Activo', NULL),
(7, 3, 'Activo', NULL),
(8, 3, 'Activo', NULL),
(9, 4, 'Activo', NULL),
(10, 4, 'Activo', NULL),
(11, 1, 'Activo', '7e47c66a73d1a0f8b9fffc667ef110fe0436498e1b4630f4'),
(12, 2, 'Activo', '7901caf6ed39b6f02c3cc3f648c9846f19bc1c6ac4d8937c'),
(13, 2, 'Activo', 'a676a8bd408dc0bba9fe5f23cfd7b481916790ee330aa394'),
(14, 2, 'Activo', '092c03252cff6628f408b921e542894a2b71b346c409c162'),
(15, 3, 'Activo', NULL),
(16, 2, 'Activo', 'cc59215e81c000dd3d1cbd153c34962c95e17791ca03e570'),
(17, 2, 'Activo', 'd711bf00473136414d5776e64d7157a147ec4444ab00ee32'),
(18, 2, 'Activo', NULL),
(19, 2, 'Activo', '1c9ba6c7be72ecba0cda6591e6ff5967df33e177262f7521');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_pedido`
--

CREATE TABLE `usuario_pedido` (
  `Cod_usuario_pedido` int(11) NOT NULL,
  `Num_Documento` int(11) DEFAULT NULL,
  `Cod_pedido` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_pedido`
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
(35, 1023654781, 35),
(40, 1000349255, 40),
(41, 1000349255, 41),
(42, 1000349255, 42),
(43, 1000349255, 43),
(44, 1069582667, 44),
(45, 1069582667, 45),
(46, 1069582667, 46),
(47, 1069582667, 47),
(48, 1069582667, 48),
(49, 1069582667, 49),
(50, 1069582667, 50),
(51, 1069582667, 51),
(52, 1069582667, 52),
(53, 1069582667, 53),
(54, 1069582667, 54),
(55, 332239273, 55),
(56, 1000349255, 56),
(57, 1000349255, 57),
(58, 1000349255, 58),
(59, 1000349255, 59),
(60, 1000349255, 60),
(61, 1000349255, 61),
(62, 1000349255, 62),
(63, 1000349255, 63),
(64, 1069582667, 64),
(66, 1069582667, 66),
(67, 1069582667, 67),
(68, 1069582667, 68),
(69, 1069582667, 69),
(70, 1069582667, 70),
(71, 1069582667, 71),
(72, 1024587963, 72),
(73, 1024587963, 73),
(74, 1069582667, 74),
(75, 1069582667, 75),
(76, 1069582667, 76);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_carritos_resumen`
-- (Véase abajo para la vista actual)
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
-- Estructura Stand-in para la vista `vista_pedidos_completos`
-- (Véase abajo para la vista actual)
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
-- Estructura Stand-in para la vista `vista_productos_mas_vendidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_productos_mas_vendidos` (
`Cod_Producto` int(11)
,`Nombre` varchar(30)
,`Total_Vendido` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_carritos_resumen`
--
DROP TABLE IF EXISTS `vista_carritos_resumen`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_carritos_resumen`  AS SELECT `c`.`Cod_Carrito` AS `Cod_Carrito`, `per`.`Num_Documento` AS `Num_Documento`, `per`.`Nombre` AS `Nombre`, `c`.`Cantidad_articulos` AS `Cantidad_articulos`, `c`.`Total` AS `Total`, `c`.`Fecha_modificacion` AS `Fecha_modificacion` FROM (`carrito` `c` join `persona` `per` on(`per`.`Num_Documento` = `c`.`Num_Documento`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_pedidos_completos`
--
DROP TABLE IF EXISTS `vista_pedidos_completos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_pedidos_completos`  AS SELECT `p`.`Cod_Pedido` AS `Cod_Pedido`, `p`.`Fecha_Pedido` AS `Fecha_Pedido`, `p`.`Estado_Pedido` AS `Estado_Pedido`, `per`.`Nombre` AS `Nombre_Usuario`, `per`.`Num_Documento` AS `Num_Documento`, `c`.`Cod_Carrito` AS `Cod_Carrito`, `c`.`Total` AS `Total_Carrito`, `pa`.`Monto_Pago` AS `Monto_Pago`, `pa`.`Metodo_Pago` AS `Metodo_Pago`, `pa`.`Estado_Pago` AS `Estado_Pago`, `d`.`Estado` AS `Estado_Domicilio`, `d`.`Fecha` AS `Fecha_Domicilio` FROM (((((`pedido` `p` left join `carrito` `c` on(`c`.`Cod_Carrito` = `p`.`Cod_Carrito`)) left join `usuario_pedido` `up` on(`up`.`Cod_pedido` = `p`.`Cod_Pedido`)) left join `persona` `per` on(`per`.`Num_Documento` = `per`.`Num_Documento`)) left join `pago` `pa` on(`pa`.`Cod_pedido` = `p`.`Cod_Pedido`)) left join `domicilio` `d` on(`d`.`Cod_Usuario_Pedido` = `up`.`Cod_usuario_pedido`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_productos_mas_vendidos`
--
DROP TABLE IF EXISTS `vista_productos_mas_vendidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_productos_mas_vendidos`  AS SELECT `pr`.`Cod_Producto` AS `Cod_Producto`, `pr`.`Nombre` AS `Nombre`, sum(`dp`.`Cantidad`) AS `Total_Vendido` FROM (`producto` `pr` left join `detalle_pedido` `dp` on(`dp`.`Cod_Producto` = `pr`.`Cod_Producto`)) GROUP BY `pr`.`Cod_Producto`, `pr`.`Nombre` ORDER BY sum(`dp`.`Cantidad`) DESC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `accion` (`accion`),
  ADD KEY `entidad` (`entidad`),
  ADD KEY `creado_en` (`creado_en`);

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`Cod_Carrito`),
  ADD KEY `Num_Documento` (`Num_Documento`);

--
-- Indices de la tabla `carrito_item`
--
ALTER TABLE `carrito_item`
  ADD PRIMARY KEY (`Cod_carrito_item`),
  ADD KEY `Cod_producto` (`Cod_producto`),
  ADD KEY `Cod_carrito` (`Cod_carrito`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`Cod_Categoria`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`Id_Detalle_Pedido`),
  ADD KEY `Cod_Pedido` (`Cod_Pedido`),
  ADD KEY `Cod_Producto` (`Cod_Producto`);

--
-- Indices de la tabla `detalle_reporte`
--
ALTER TABLE `detalle_reporte`
  ADD PRIMARY KEY (`Id_Detalle`),
  ADD KEY `Cod_Reporte` (`Cod_Reporte`);

--
-- Indices de la tabla `domicilio`
--
ALTER TABLE `domicilio`
  ADD PRIMARY KEY (`Cod_Domicilio`),
  ADD KEY `Cod_Usuario_Pedido` (`Cod_Usuario_Pedido`);

--
-- Indices de la tabla `historial_estado_pedido`
--
ALTER TABLE `historial_estado_pedido`
  ADD PRIMARY KEY (`Id_historial`),
  ADD KEY `Cod_pedido` (`Cod_pedido`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`Cod_Inventario`),
  ADD KEY `Cod_Producto` (`Cod_Producto`);

--
-- Indices de la tabla `oferta`
--
ALTER TABLE `oferta`
  ADD PRIMARY KEY (`Cod_Oferta`),
  ADD KEY `idx_oferta_producto` (`Cod_Producto`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`Cod_Pago`),
  ADD KEY `Cod_pedido` (`Cod_pedido`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`Cod_Pedido`),
  ADD KEY `Cod_Carrito` (`Cod_Carrito`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`Num_Documento`),
  ADD KEY `Id_Rol` (`Id_Rol`),
  ADD KEY `Id_Usuario` (`Id_Usuario`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`Cod_Producto`),
  ADD KEY `Cod_Categoria` (`Cod_Categoria`),
  ADD KEY `Cod_Proveedor` (`Cod_Proveedor`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`Cod_Proveedor`);

--
-- Indices de la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD PRIMARY KEY (`Cod_Reporte`),
  ADD KEY `Num_Documento` (`Num_Documento`);

--
-- Indices de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD PRIMARY KEY (`Id_rol`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`Id_usuario`),
  ADD KEY `Id_Rol` (`Id_Rol`);

--
-- Indices de la tabla `usuario_pedido`
--
ALTER TABLE `usuario_pedido`
  ADD PRIMARY KEY (`Cod_usuario_pedido`),
  ADD KEY `Num_Documento` (`Num_Documento`),
  ADD KEY `Cod_pedido` (`Cod_pedido`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `Cod_Carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `carrito_item`
--
ALTER TABLE `carrito_item`
  MODIFY `Cod_carrito_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `Cod_Categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `Id_Detalle_Pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT de la tabla `detalle_reporte`
--
ALTER TABLE `detalle_reporte`
  MODIFY `Id_Detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT de la tabla `domicilio`
--
ALTER TABLE `domicilio`
  MODIFY `Cod_Domicilio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `historial_estado_pedido`
--
ALTER TABLE `historial_estado_pedido`
  MODIFY `Id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `Cod_Inventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `oferta`
--
ALTER TABLE `oferta`
  MODIFY `Cod_Oferta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `Cod_Pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `Cod_Pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `Cod_Producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `Cod_Proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `reporte`
--
ALTER TABLE `reporte`
  MODIFY `Cod_Reporte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  MODIFY `Id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `Id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `usuario_pedido`
--
ALTER TABLE `usuario_pedido`
  MODIFY `Cod_usuario_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`Num_Documento`) REFERENCES `persona` (`Num_Documento`);

--
-- Filtros para la tabla `carrito_item`
--
ALTER TABLE `carrito_item`
  ADD CONSTRAINT `carrito_item_ibfk_1` FOREIGN KEY (`Cod_producto`) REFERENCES `producto` (`Cod_Producto`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `carrito_item_ibfk_2` FOREIGN KEY (`Cod_carrito`) REFERENCES `carrito` (`Cod_Carrito`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`Cod_Pedido`) REFERENCES `pedido` (`Cod_Pedido`) ON UPDATE CASCADE,
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`Cod_Producto`) REFERENCES `producto` (`Cod_Producto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_reporte`
--
ALTER TABLE `detalle_reporte`
  ADD CONSTRAINT `detalle_reporte_ibfk_1` FOREIGN KEY (`Cod_Reporte`) REFERENCES `reporte` (`Cod_Reporte`) ON DELETE CASCADE;

--
-- Filtros para la tabla `domicilio`
--
ALTER TABLE `domicilio`
  ADD CONSTRAINT `domicilio_ibfk_1` FOREIGN KEY (`Cod_Usuario_Pedido`) REFERENCES `usuario_pedido` (`Cod_usuario_pedido`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_estado_pedido`
--
ALTER TABLE `historial_estado_pedido`
  ADD CONSTRAINT `historial_estado_pedido_ibfk_1` FOREIGN KEY (`Cod_pedido`) REFERENCES `pedido` (`Cod_Pedido`);

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`Cod_Producto`) REFERENCES `producto` (`Cod_Producto`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `oferta`
--
ALTER TABLE `oferta`
  ADD CONSTRAINT `fk_oferta_producto` FOREIGN KEY (`Cod_Producto`) REFERENCES `producto` (`Cod_Producto`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`Cod_pedido`) REFERENCES `pedido` (`Cod_Pedido`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`Cod_Carrito`) REFERENCES `carrito` (`Cod_Carrito`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `persona`
--
ALTER TABLE `persona`
  ADD CONSTRAINT `persona_ibfk_1` FOREIGN KEY (`Id_Rol`) REFERENCES `rol_usuario` (`Id_rol`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `persona_ibfk_2` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuario` (`Id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`Cod_Categoria`) REFERENCES `categoria` (`Cod_Categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`Cod_Proveedor`) REFERENCES `proveedor` (`Cod_Proveedor`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD CONSTRAINT `reporte_ibfk_1` FOREIGN KEY (`Num_Documento`) REFERENCES `persona` (`Num_Documento`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`Id_Rol`) REFERENCES `rol_usuario` (`Id_rol`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_pedido`
--
ALTER TABLE `usuario_pedido`
  ADD CONSTRAINT `usuario_pedido_ibfk_1` FOREIGN KEY (`Num_Documento`) REFERENCES `persona` (`Num_Documento`),
  ADD CONSTRAINT `usuario_pedido_ibfk_2` FOREIGN KEY (`Cod_pedido`) REFERENCES `pedido` (`Cod_Pedido`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
