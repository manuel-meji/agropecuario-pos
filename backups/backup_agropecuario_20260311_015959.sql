-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: agropecuario_pos
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `agropecuario_pos`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `agropecuario_pos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `agropecuario_pos`;

--
-- Table structure for table `accounts_payable`
--

DROP TABLE IF EXISTS `accounts_payable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_payable` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount_paid` decimal(12,2) NOT NULL,
  `due_date` datetime(6) DEFAULT NULL,
  `requiresfec` bit(1) DEFAULT NULL,
  `status` enum('PENDING','PARTIAL','PAID_IN_FULL') NOT NULL,
  `supplier_invoice_reference` varchar(255) DEFAULT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `total_debt` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_payable`
--

LOCK TABLES `accounts_payable` WRITE;
/*!40000 ALTER TABLE `accounts_payable` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts_payable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts_payable_aud`
--

DROP TABLE IF EXISTS `accounts_payable_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_payable_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `amount_paid` decimal(12,2) DEFAULT NULL,
  `due_date` datetime(6) DEFAULT NULL,
  `requiresfec` bit(1) DEFAULT NULL,
  `status` enum('PENDING','PARTIAL','PAID_IN_FULL') DEFAULT NULL,
  `supplier_invoice_reference` varchar(255) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `total_debt` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FKg7l9l1at9h3t1ltmmajmurfqu` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_payable_aud`
--

LOCK TABLES `accounts_payable_aud` WRITE;
/*!40000 ALTER TABLE `accounts_payable_aud` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts_payable_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts_receivable`
--

DROP TABLE IF EXISTS `accounts_receivable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_receivable` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount_paid` decimal(12,2) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_phone` varchar(255) DEFAULT NULL,
  `due_date` datetime(6) DEFAULT NULL,
  `status` enum('PENDING','PARTIAL','PAID_IN_FULL','DEFAULTED') NOT NULL,
  `total_debt` decimal(12,2) NOT NULL,
  `sale_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_425nda24f5p2gdj3n0oe66o3r` (`sale_id`),
  CONSTRAINT `FK9mj3iv3e4k1iyouc6mne5873k` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_receivable`
--

LOCK TABLES `accounts_receivable` WRITE;
/*!40000 ALTER TABLE `accounts_receivable` DISABLE KEYS */;
INSERT INTO `accounts_receivable` VALUES (1,49500.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 09:06:42.385958','PAID_IN_FULL',29380.00,6),(2,13560.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 10:01:51.146486','PAID_IN_FULL',13560.00,12),(3,0.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 10:15:00.094821','PENDING',40680.00,15),(4,0.00,'Yolanda Ortiz Meneses','71562868','2026-04-07 08:12:10.449788','PENDING',27120.00,19),(5,20000.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-07 08:26:16.161336','PARTIAL',27120.00,20),(6,0.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-08 03:19:17.712474','PENDING',19000.00,25),(7,0.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-08 03:50:46.031333','PENDING',14000.00,34),(8,20000.00,'Edgar Duarte','+506 88888888','2026-04-08 18:11:24.786317','PARTIAL',22400.00,37);
/*!40000 ALTER TABLE `accounts_receivable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts_receivable_aud`
--

DROP TABLE IF EXISTS `accounts_receivable_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_receivable_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `amount_paid` decimal(12,2) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `client_phone` varchar(255) DEFAULT NULL,
  `due_date` datetime(6) DEFAULT NULL,
  `status` enum('PENDING','PARTIAL','PAID_IN_FULL','DEFAULTED') DEFAULT NULL,
  `total_debt` decimal(12,2) DEFAULT NULL,
  `sale_id` bigint DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FKrcp35hao2lafiyql0hnc2t4kk` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_receivable_aud`
--

LOCK TABLES `accounts_receivable_aud` WRITE;
/*!40000 ALTER TABLE `accounts_receivable_aud` DISABLE KEYS */;
INSERT INTO `accounts_receivable_aud` VALUES (1,12,0,0.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 09:06:42.385958','PENDING',29380.00,6),(1,13,1,5100.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 09:06:42.385958','PARTIAL',29380.00,6),(1,14,1,5500.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 09:06:42.385958','PARTIAL',29380.00,6),(1,16,1,9500.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 09:06:42.385958','PARTIAL',29380.00,6),(1,22,1,49500.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 09:06:42.385958','PAID_IN_FULL',29380.00,6),(2,25,0,0.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 10:01:51.146486','PENDING',13560.00,12),(3,28,0,0.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 10:15:00.094821','PENDING',40680.00,15),(4,45,0,0.00,'Yolanda Ortiz Meneses','71562868','2026-04-07 08:12:10.449788','PENDING',27120.00,19),(5,46,0,0.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-07 08:26:16.161336','PENDING',27120.00,20),(2,47,1,13560.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-05 10:01:51.146486','PAID_IN_FULL',13560.00,12),(5,55,1,20000.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-07 08:26:16.161336','PARTIAL',27120.00,20),(6,68,0,0.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-08 03:19:17.712474','PENDING',19000.00,25),(7,77,0,0.00,'Manuel Salvador Mejicano Ortiz','70280576','2026-04-08 03:50:46.031333','PENDING',14000.00,34),(8,82,0,0.00,'Edgar Duarte','+506 88888888','2026-04-08 18:11:24.786317','PENDING',22400.00,37),(8,83,1,20000.00,'Edgar Duarte','+506 88888888','2026-04-08 18:11:24.786317','PARTIAL',22400.00,37);
/*!40000 ALTER TABLE `accounts_receivable_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_closings`
--

DROP TABLE IF EXISTS `cash_closings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_closings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `closed_by` varchar(255) DEFAULT NULL,
  `closing_date` datetime(6) NOT NULL,
  `net_cash` decimal(14,2) DEFAULT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `number_of_payments` int DEFAULT NULL,
  `number_of_sales` int DEFAULT NULL,
  `total_card` decimal(14,2) DEFAULT NULL,
  `total_cash` decimal(14,2) DEFAULT NULL,
  `total_credit` decimal(14,2) DEFAULT NULL,
  `total_discount` decimal(14,2) DEFAULT NULL,
  `total_expenses` decimal(14,2) DEFAULT NULL,
  `total_gross_profit` decimal(14,2) DEFAULT NULL,
  `total_payments_received` decimal(14,2) DEFAULT NULL,
  `total_revenue` decimal(14,2) DEFAULT NULL,
  `total_sinpe` decimal(14,2) DEFAULT NULL,
  `total_tax` decimal(14,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_closings`
--

LOCK TABLES `cash_closings` WRITE;
/*!40000 ALTER TABLE `cash_closings` DISABLE KEYS */;
INSERT INTO `cash_closings` VALUES (1,'admin','2026-03-09 18:12:01.531842',0.00,NULL,0,1,0.00,0.00,22400.00,0.00,0.00,0.00,0.00,22400.00,0.00,0.00);
/*!40000 ALTER TABLE `cash_closings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Creada desde UI','Agroquímicos'),(2,'Creada desde UI','Agroquímico');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_aud`
--

DROP TABLE IF EXISTS `category_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FKc9m640crhsib2ws80um6xuk1w` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_aud`
--

LOCK TABLES `category_aud` WRITE;
/*!40000 ALTER TABLE `category_aud` DISABLE KEYS */;
/*!40000 ALTER TABLE `category_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `identification` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'San Antonio','manuelortizmejicano100@gmail.com','208600363','Manuel Salvador Mejicano Ortiz','70280576'),(2,'San Antonio, Yolillal','yortizmeneses1001@gmail.com','203640541','Yolanda Ortiz Meneses','71562868'),(3,'Santa Cecilia, La Cruz','mostrin@gmail.com','504600060','Edgar Duarte','+506 88888888');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients_aud`
--

DROP TABLE IF EXISTS `clients_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `identification` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FKpvrlfgqa8oewx79f3wiq9ok5g` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients_aud`
--

LOCK TABLES `clients_aud` WRITE;
/*!40000 ALTER TABLE `clients_aud` DISABLE KEYS */;
INSERT INTO `clients_aud` VALUES (1,8,0,'San Antonio','manuelortizmejicano100@gmail.com','208600363','Manuel Salvador Mejicano Ortiz','70280576'),(2,11,0,'San Antonio, Yolillal','yortizmeneses1001@gmail.com','203640541','Yolanda Ortiz Meneses','71562868'),(3,81,0,'Santa Cecilia, La Cruz','mostrin@gmail.com','504600060','Edgar Duarte','+506 88888888');
/*!40000 ALTER TABLE `clients_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_expenses`
--

DROP TABLE IF EXISTS `daily_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) NOT NULL,
  `category` enum('OPERATIONAL_UTILITIES','PAYROLL','LOGISTICS','MAINTENANCE','TAXES','MISCELLANEOUS') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_deductible_from_profit` bit(1) DEFAULT NULL,
  `registered_by` varchar(255) DEFAULT NULL,
  `registered_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_expenses`
--

LOCK TABLES `daily_expenses` WRITE;
/*!40000 ALTER TABLE `daily_expenses` DISABLE KEYS */;
INSERT INTO `daily_expenses` VALUES (1,15000.00,'OPERATIONAL_UTILITIES','Sistema de Facturación',_binary '','admin','2026-03-09 00:46:05.675823'),(2,50000.00,'PAYROLL','Salario',_binary '','admin','2026-03-09 18:14:30.244141');
/*!40000 ALTER TABLE `daily_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_expenses_aud`
--

DROP TABLE IF EXISTS `daily_expenses_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_expenses_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `category` enum('OPERATIONAL_UTILITIES','PAYROLL','LOGISTICS','MAINTENANCE','TAXES','MISCELLANEOUS') DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_deductible_from_profit` bit(1) DEFAULT NULL,
  `registered_by` varchar(255) DEFAULT NULL,
  `registered_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FKcttn51lii290duy858gd2twce` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_expenses_aud`
--

LOCK TABLES `daily_expenses_aud` WRITE;
/*!40000 ALTER TABLE `daily_expenses_aud` DISABLE KEYS */;
INSERT INTO `daily_expenses_aud` VALUES (1,60,0,15000.00,'OPERATIONAL_UTILITIES','Sistema de Facturación',_binary '','admin','2026-03-09 00:46:05.675823'),(2,85,0,50000.00,'PAYROLL','Salario',_binary '','admin','2026-03-09 18:14:30.244141');
/*!40000 ALTER TABLE `daily_expenses_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `electronic_invoices`
--

DROP TABLE IF EXISTS `electronic_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `electronic_invoices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `estado` enum('PENDIENTE','ENVIADO','ACEPTADO','RECHAZADO','ERROR_ENVIO') NOT NULL,
  `fecha_envio` datetime(6) DEFAULT NULL,
  `fecha_respuesta` datetime(6) DEFAULT NULL,
  `intentos_envio` int DEFAULT NULL,
  `mensaje_respuesta` text,
  `numero_consecutivo` varchar(20) DEFAULT NULL,
  `tipo_comprobante` enum('FACTURA_ELECTRONICA','TIQUETE_ELECTRONICO','NOTA_CREDITO','NOTA_DEBITO') DEFAULT NULL,
  `xml_firmado_base64` longtext,
  `xml_generado` longtext,
  `xml_respuesta_hacienda` longtext,
  `sale_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_dmqwqt4qhigrh9p5wqhnarf41` (`clave`),
  UNIQUE KEY `UK_2ciyvk8nxtt72nffisjxjl6gd` (`sale_id`),
  CONSTRAINT `FKblyebh1xvtb0qqes6c477pvd8` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `electronic_invoices`
--

LOCK TABLES `electronic_invoices` WRITE;
/*!40000 ALTER TABLE `electronic_invoices` DISABLE KEYS */;
INSERT INTO `electronic_invoices` VALUES (2,'50611032026000208600363001000010100000000011140011','2026-03-11 06:32:40.004596','ERROR_ENVIO',NULL,NULL,1,'Fallo de comunicación OIDC con el Ministerio','00100001010000000001','FACTURA_ELECTRONICA','<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\"?><FacturaElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica\" xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\r\n  <Clave>50611032026000208600363001000010100000000011140011</Clave>\r\n  <CodigoActividad>7410</CodigoActividad>\r\n  <NumeroConsecutivo>00100001010000000001</NumeroConsecutivo>\r\n  <FechaEmision>2026-03-11T00:32:38-06:00</FechaEmision>\r\n  <Emisor>\r\n    <Nombre>MANUEL SALVADOR MEJICANO ORTIZ</Nombre>\r\n    <Identificacion>\r\n      <Tipo>01</Tipo>\r\n      <Numero>208600363</Numero>\r\n    </Identificacion>\r\n    <Ubicacion>\r\n      <Provincia>2</Provincia>\r\n      <Canton>13</Canton>\r\n      <Distrito>07</Distrito>\r\n      <OtrasSenas>Costa Rica</OtrasSenas>\r\n    </Ubicacion>\r\n    <Telefono>\r\n      <CodigoPais>506</CodigoPais>\r\n      <NumTelefono>70280576</NumTelefono>\r\n    </Telefono>\r\n    <CorreoElectronico>manuelortizmejicano100@gmail.com</CorreoElectronico>\r\n  </Emisor>\r\n  <Receptor>\r\n    <Nombre>Manuel Salvador Mejicano Ortiz</Nombre>\r\n    <Identificacion>\r\n      <Tipo>01</Tipo>\r\n      <Numero>208600363</Numero>\r\n    </Identificacion>\r\n  </Receptor>\r\n  <CondicionVenta>01</CondicionVenta>\r\n  <MedioPago>02</MedioPago>\r\n  <DetalleServicio>\r\n    <LineaDetalle>\r\n      <NumeroLinea>1</NumeroLinea>\r\n      <CodigoCabys>1234567890987</CodigoCabys>\r\n      <Cantidad>1.000</Cantidad>\r\n      <UnidadMedida>Unid</UnidadMedida>\r\n      <Detalle>Prueba</Detalle>\r\n      <PrecioUnitario>7000.00000</PrecioUnitario>\r\n      <MontoTotal>7000.00000</MontoTotal>\r\n      <SubTotal>7000.00000</SubTotal>\r\n      <ImpuestoNeto>0.00000</ImpuestoNeto>\r\n      <MontoTotalLinea>7000.00000</MontoTotalLinea>\r\n    </LineaDetalle>\r\n  </DetalleServicio>\r\n  <ResumenFactura>\r\n    <CodigoTipoMoneda>\r\n      <CodigoMoneda>CRC</CodigoMoneda>\r\n      <TipoCambio>1.00000</TipoCambio>\r\n    </CodigoTipoMoneda>\r\n    <TotalServGravados>0.00000</TotalServGravados>\r\n    <TotalServExentos>0.00000</TotalServExentos>\r\n    <TotalMercanciasGravadas>0.00000</TotalMercanciasGravadas>\r\n    <TotalMercanciasExentas>7000.00000</TotalMercanciasExentas>\r\n    <TotalGravado>0.00000</TotalGravado>\r\n    <TotalExento>7000.00000</TotalExento>\r\n    <TotalVenta>7000.00000</TotalVenta>\r\n    <TotalDescuentos>0.00000</TotalDescuentos>\r\n    <TotalVentaNeta>7000.00000</TotalVentaNeta>\r\n    <TotalImpuesto>0.00000</TotalImpuesto>\r\n    <TotalComprobante>7000.00000</TotalComprobante>\r\n  </ResumenFactura>\r\n<ds:Signature>\r\n<ds:SignedInfo>\r\n<ds:CanonicalizationMethod Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n<ds:SignatureMethod Algorithm=\"http://www.w3.org/2001/04/xmldsig-more#rsa-sha256\"/>\r\n<ds:Reference URI=\"\">\r\n<ds:Transforms>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2000/09/xmldsig#enveloped-signature\"/>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n</ds:Transforms>\r\n<ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/>\r\n<ds:DigestValue>V3eph2phhiajZJjwNyLk+GR7QZR2g233B6hEFxxuxDQ=</ds:DigestValue>\r\n</ds:Reference>\r\n</ds:SignedInfo>\r\n<ds:SignatureValue>\r\nJ4UJdqgg0JarTDVFzHdp80opfxX3yBBUpb2f/zQGPw9Tfu6uiSRk4ZpcCPk7UVAM7biwd0RRBaBu&#13;\r\nl81fgyKRtAjcSoiBvc2ZHbBxccHp3dTnKsIeA0pVs0/vmvgh29LmkXkMLyE651UvtkC6op6TBhWG&#13;\r\nZ5/JN+JO0scME2IwSEz98i/HBb2tby2eegESx9IZnO5n+AQDJPwiNj9OPRiHuzvR3dfCLTRgXGHs&#13;\r\nIHZm4Mtt5X1eJM8CCVVpqzK2gjhL4n56oULzWiB8/LvTKRshFCorbyHWInuf3nFQIFVL/RJ2VLij&#13;\r\n+OxBWqcNWCTnTUqOwDnZUNYsiuKltgtRwfkU2Q==\r\n</ds:SignatureValue>\r\n<ds:KeyInfo>\r\n<ds:X509Data>\r\n<ds:X509Certificate>\r\nMIIFYzCCA0ugAwIBAgIGAZzZDxyxMA0GCSqGSIb3DQEBCwUAMGwxCzAJBgNVBAYTAkNSMSkwJwYD&#13;\r\nVQQKDCBNSU5JU1RFUklPIERFIEhBQ0lFTkRBIC0gU0FOREJPWDEMMAoGA1UECwwDREdUMSQwIgYD&#13;\r\nVQQDDBtDQSBQRVJTT05BIEZJU0lDQSAtIFNBTkRCT1gwHhcNMjYwMzEwMTg0MjUyWhcNMzAwMzA5&#13;\r\nMTg0MjUyWjCBqzEZMBcGA1UEBRMQQ1BGLTAyLTA4NjAtMDM2MzEXMBUGA1UEBAwOTUVKSUNBTk8g&#13;\r\nT1JUSVoxGDAWBgNVBCoMD01BTlVFTCBTQUxWQURPUjELMAkGA1UEBhMCQ1IxFzAVBgNVBAoMDlBF&#13;\r\nUlNPTkEgRklTSUNBMQwwCgYDVQQLDANDUEYxJzAlBgNVBAMMHk1BTlVFTCBTQUxWQURPUiBNRUpJ&#13;\r\nQ0FOTyBPUlRJWjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKhx/zpbki8Zw0HBQ5SW&#13;\r\nvzWiN+w/I0KlVhLd7Qh1PJLK1x28e42K4agJdfeTWV9YCpA1WSllSKU4xwiy8r7VlRylFoLb8wIv&#13;\r\nTjpPUC73GvqgbyYqeMav1oHxP01es+Mmi8AAjYRHdiO3TTlrCNtZ9uROlDEBKg9oRtg2vdDIlD9F&#13;\r\np7f675AgwbyL+Wxp62ET3LCPAvfAxX0u65zSTZhC+zl5/FcuhsbRVFvWjzh0oLk2CJ/BLch6UgMg&#13;\r\n8PqTM9zT+L/j5uohwVh6424pCmBQnmWPku1T2D0W2CxETWiH0CxE06pk0xtSrkTB8NLUvTYhP7Bg&#13;\r\nEiDsLCloIkj7jeDi5H0CAwEAAaOByjCBxzAfBgNVHSMEGDAWgBRGI9JET79XWSHkv5PVMJuVTOP3&#13;\r\nhzAdBgNVHQ4EFgQUIk9WUOhUNOxnbzwCqqfqTXGsyPgwCwYDVR0PBAQDAgbAMBMGA1UdJQQMMAoG&#13;\r\nCCsGAQUFBwMEMGMGCCsGAQUFBwEBBFcwVTBTBggrBgEFBQcwAoZHaHR0cHM6Ly9wa2kuY29tcHJv&#13;\r\nYmFudGVzZWxlY3Ryb25pY29zLmdvLmNyL3N0YWcvaW50ZXJtZWRpYXRlLXBmLXBlbS5jcnQwDQYJ&#13;\r\nKoZIhvcNAQELBQADggIBAEzMyQhLIC68xzvpCw51b6CnDI7MaLCmaBKCAlePkZFJ46n/sTzaZAKO&#13;\r\nsK7zbLu7kRRVQVy/99BZutcmBfbNDZFVe7JRTY80vrpEiDelUXPYX0u6/brSSttc1djX2x6lGpZF&#13;\r\nk9WGfxYDZieVAsPNPu+2XV1z1C6fY9sTBou5FF40SL4pO9jm86ozUoTwLXIEh6/0pQ6WMDIlAGSg&#13;\r\n28mKNHsvR0Bxg+yJjR7EpooABVU1JFXnEKAZ6aXJmmw+rfRa3mQWgjfGMZQMlRXDwbIBTRn/Sd13&#13;\r\nb+a70JILqrIrY2T1Fr7snap85lneuiTIHmZ/RoxjArGpf/4SB7Aqe4rUes0EdiF0GUw6Lf8MxaZj&#13;\r\n+mvKdH87idssiBIPOJ2gjssBU5D1A5vMfOEOaO+O4AyN2YwgPJz9ypdoPCvRNSKKDCyv4SxHV6I0&#13;\r\nkl0CELTXbLB8R5zrEyG/+SwXp6h+Eg3U7BRDAOgCrKoYSZ+5oT16wJMQKJRMX1iB+zgOfqiZgbJV&#13;\r\ngDdf+WKk5UFBfSUJkyNfUSk7cagm3/VPyVvGUCg4kTokNzVtUs4sfnGiI/uNyzlfqtJVJmfauDHp&#13;\r\n7gPkx1+V2GCwu7qpQmCoYTd497fmuj4TGRDyIWy8xzi1djXUCmcCd9HZyRtBAq5196Q1DqDYbvpr&#13;\r\n6ZDPJbadV25c7rGpyHug\r\n</ds:X509Certificate>\r\n</ds:X509Data>\r\n<ds:KeyValue>\r\n<ds:RSAKeyValue>\r\n<ds:Modulus>qHH/OluSLxnDQcFDlJa/NaI37D8jQqVWEt3tCHU8ksrXHbx7jYrhqAl195NZX1gKkDVZKWVIpTjH&#13;\r\nCLLyvtWVHKUWgtvzAi9OOk9QLvca+qBvJip4xq/WgfE/TV6z4yaLwACNhEd2I7dNOWsI21n25E6U&#13;\r\nMQEqD2hG2Da90MiUP0Wnt/rvkCDBvIv5bGnrYRPcsI8C98DFfS7rnNJNmEL7OXn8Vy6GxtFUW9aP&#13;\r\nOHSguTYIn8EtyHpSAyDw+pMz3NP4v+Pm6iHBWHrjbikKYFCeZY+S7VPYPRbYLERNaIfQLETTqmTT&#13;\r\nG1KuRMHw0tS9NiE/sGASIOwsKWgiSPuN4OLkfQ==</ds:Modulus>\r\n<ds:Exponent>AQAB</ds:Exponent>\r\n</ds:RSAKeyValue>\r\n</ds:KeyValue>\r\n</ds:KeyInfo>\r\n</ds:Signature></FacturaElectronica>','<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<FacturaElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica\" xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n  <Clave>50611032026000208600363001000010100000000011140011</Clave>\n  <CodigoActividad>7410</CodigoActividad>\n  <NumeroConsecutivo>00100001010000000001</NumeroConsecutivo>\n  <FechaEmision>2026-03-11T00:32:38-06:00</FechaEmision>\n  <Emisor>\n    <Nombre>MANUEL SALVADOR MEJICANO ORTIZ</Nombre>\n    <Identificacion>\n      <Tipo>01</Tipo>\n      <Numero>208600363</Numero>\n    </Identificacion>\n    <Ubicacion>\n      <Provincia>2</Provincia>\n      <Canton>13</Canton>\n      <Distrito>07</Distrito>\n      <OtrasSenas>Costa Rica</OtrasSenas>\n    </Ubicacion>\n    <Telefono>\n      <CodigoPais>506</CodigoPais>\n      <NumTelefono>70280576</NumTelefono>\n    </Telefono>\n    <CorreoElectronico>manuelortizmejicano100@gmail.com</CorreoElectronico>\n  </Emisor>\n  <Receptor>\n    <Nombre>Manuel Salvador Mejicano Ortiz</Nombre>\n    <Identificacion>\n      <Tipo>01</Tipo>\n      <Numero>208600363</Numero>\n    </Identificacion>\n  </Receptor>\n  <CondicionVenta>01</CondicionVenta>\n  <MedioPago>02</MedioPago>\n  <DetalleServicio>\n    <LineaDetalle>\n      <NumeroLinea>1</NumeroLinea>\n      <CodigoCabys>1234567890987</CodigoCabys>\n      <Cantidad>1.000</Cantidad>\n      <UnidadMedida>Unid</UnidadMedida>\n      <Detalle>Prueba</Detalle>\n      <PrecioUnitario>7000.00000</PrecioUnitario>\n      <MontoTotal>7000.00000</MontoTotal>\n      <SubTotal>7000.00000</SubTotal>\n      <ImpuestoNeto>0.00000</ImpuestoNeto>\n      <MontoTotalLinea>7000.00000</MontoTotalLinea>\n    </LineaDetalle>\n  </DetalleServicio>\n  <ResumenFactura>\n    <CodigoTipoMoneda>\n      <CodigoMoneda>CRC</CodigoMoneda>\n      <TipoCambio>1.00000</TipoCambio>\n    </CodigoTipoMoneda>\n    <TotalServGravados>0.00000</TotalServGravados>\n    <TotalServExentos>0.00000</TotalServExentos>\n    <TotalMercanciasGravadas>0.00000</TotalMercanciasGravadas>\n    <TotalMercanciasExentas>7000.00000</TotalMercanciasExentas>\n    <TotalGravado>0.00000</TotalGravado>\n    <TotalExento>7000.00000</TotalExento>\n    <TotalVenta>7000.00000</TotalVenta>\n    <TotalDescuentos>0.00000</TotalDescuentos>\n    <TotalVentaNeta>7000.00000</TotalVentaNeta>\n    <TotalImpuesto>0.00000</TotalImpuesto>\n    <TotalComprobante>7000.00000</TotalComprobante>\n  </ResumenFactura>\n</FacturaElectronica>',NULL,47),(6,'50611032026000208600363001000010100000000031513039','2026-03-11 06:51:39.669248','RECHAZADO','2026-03-11 06:51:41.780023','2026-03-11 06:53:17.430063',1,'RECHAZADO: Sin detalle','00100001010000000003','FACTURA_ELECTRONICA','<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\"?><FacturaElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica\" xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\r\n  <Clave>50611032026000208600363001000010100000000031513039</Clave>\r\n  <CodigoActividad>7410</CodigoActividad>\r\n  <NumeroConsecutivo>00100001010000000003</NumeroConsecutivo>\r\n  <FechaEmision>2026-03-11T00:51:38-06:00</FechaEmision>\r\n  <Emisor>\r\n    <Nombre>MANUEL SALVADOR MEJICANO ORTIZ</Nombre>\r\n    <Identificacion>\r\n      <Tipo>01</Tipo>\r\n      <Numero>208600363</Numero>\r\n    </Identificacion>\r\n    <Ubicacion>\r\n      <Provincia>2</Provincia>\r\n      <Canton>13</Canton>\r\n      <Distrito>07</Distrito>\r\n      <OtrasSenas>Costa Rica</OtrasSenas>\r\n    </Ubicacion>\r\n    <Telefono>\r\n      <CodigoPais>506</CodigoPais>\r\n      <NumTelefono>70280576</NumTelefono>\r\n    </Telefono>\r\n    <CorreoElectronico>manuelortizmejicano100@gmail.com</CorreoElectronico>\r\n  </Emisor>\r\n  <Receptor>\r\n    <Nombre>Manuel Salvador Mejicano Ortiz</Nombre>\r\n    <Identificacion>\r\n      <Tipo>01</Tipo>\r\n      <Numero>208600363</Numero>\r\n    </Identificacion>\r\n  </Receptor>\r\n  <CondicionVenta>01</CondicionVenta>\r\n  <MedioPago>02</MedioPago>\r\n  <DetalleServicio>\r\n    <LineaDetalle>\r\n      <NumeroLinea>1</NumeroLinea>\r\n      <CodigoCabys>1234567890123</CodigoCabys>\r\n      <Cantidad>1.000</Cantidad>\r\n      <UnidadMedida>Unid</UnidadMedida>\r\n      <Detalle>Fertilizante QPK 100 ml</Detalle>\r\n      <PrecioUnitario>5000.00000</PrecioUnitario>\r\n      <MontoTotal>5000.00000</MontoTotal>\r\n      <SubTotal>5000.00000</SubTotal>\r\n      <ImpuestoNeto>0.00000</ImpuestoNeto>\r\n      <MontoTotalLinea>5000.00000</MontoTotalLinea>\r\n    </LineaDetalle>\r\n  </DetalleServicio>\r\n  <ResumenFactura>\r\n    <CodigoTipoMoneda>\r\n      <CodigoMoneda>CRC</CodigoMoneda>\r\n      <TipoCambio>1.00000</TipoCambio>\r\n    </CodigoTipoMoneda>\r\n    <TotalServGravados>0.00000</TotalServGravados>\r\n    <TotalServExentos>0.00000</TotalServExentos>\r\n    <TotalMercanciasGravadas>0.00000</TotalMercanciasGravadas>\r\n    <TotalMercanciasExentas>5000.00000</TotalMercanciasExentas>\r\n    <TotalGravado>0.00000</TotalGravado>\r\n    <TotalExento>5000.00000</TotalExento>\r\n    <TotalVenta>5000.00000</TotalVenta>\r\n    <TotalDescuentos>0.00000</TotalDescuentos>\r\n    <TotalVentaNeta>5000.00000</TotalVentaNeta>\r\n    <TotalImpuesto>0.00000</TotalImpuesto>\r\n    <TotalComprobante>5000.00000</TotalComprobante>\r\n  </ResumenFactura>\r\n<ds:Signature>\r\n<ds:SignedInfo>\r\n<ds:CanonicalizationMethod Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n<ds:SignatureMethod Algorithm=\"http://www.w3.org/2001/04/xmldsig-more#rsa-sha256\"/>\r\n<ds:Reference URI=\"\">\r\n<ds:Transforms>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2000/09/xmldsig#enveloped-signature\"/>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n</ds:Transforms>\r\n<ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/>\r\n<ds:DigestValue>9fXkxBagoBhT440sau1+UdaOKwUbWhLL5pXkf0FsHgA=</ds:DigestValue>\r\n</ds:Reference>\r\n</ds:SignedInfo>\r\n<ds:SignatureValue>\r\nhl0cicUqmIQcFG5VLdqpEvnu2IVafJq4wU5v66WvOfngHKk4ZnAzZ4TAxjjIk/Q6XI8raosOhlrE&#13;\r\nh5RhSbSP+CKRxpG/5A5PRkW8Q7CVKBxPbcV0z7UydxAOj1jgyHEoCZocnQjPTRoehpcnH3xRhWdo&#13;\r\nFvShbV07+O5/00bfu7q4Qqn4nAXymasGn4hjUZYc2qzBRZBF1B3fwax3f6kUjRMHf7WjnvRMmcuf&#13;\r\n4YTxk+bIGGK3PFsQ3Yj8tcFjyhOIsNTqQlpZTVOOb8ebCaqeNt15O9bx/x8IV1WAbfUNrgjAasxo&#13;\r\nexwcmuDie8GVKIio969M5uu3FHkvUoabmD4yHw==\r\n</ds:SignatureValue>\r\n<ds:KeyInfo>\r\n<ds:X509Data>\r\n<ds:X509Certificate>\r\nMIIFYzCCA0ugAwIBAgIGAZzZDxyxMA0GCSqGSIb3DQEBCwUAMGwxCzAJBgNVBAYTAkNSMSkwJwYD&#13;\r\nVQQKDCBNSU5JU1RFUklPIERFIEhBQ0lFTkRBIC0gU0FOREJPWDEMMAoGA1UECwwDREdUMSQwIgYD&#13;\r\nVQQDDBtDQSBQRVJTT05BIEZJU0lDQSAtIFNBTkRCT1gwHhcNMjYwMzEwMTg0MjUyWhcNMzAwMzA5&#13;\r\nMTg0MjUyWjCBqzEZMBcGA1UEBRMQQ1BGLTAyLTA4NjAtMDM2MzEXMBUGA1UEBAwOTUVKSUNBTk8g&#13;\r\nT1JUSVoxGDAWBgNVBCoMD01BTlVFTCBTQUxWQURPUjELMAkGA1UEBhMCQ1IxFzAVBgNVBAoMDlBF&#13;\r\nUlNPTkEgRklTSUNBMQwwCgYDVQQLDANDUEYxJzAlBgNVBAMMHk1BTlVFTCBTQUxWQURPUiBNRUpJ&#13;\r\nQ0FOTyBPUlRJWjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKhx/zpbki8Zw0HBQ5SW&#13;\r\nvzWiN+w/I0KlVhLd7Qh1PJLK1x28e42K4agJdfeTWV9YCpA1WSllSKU4xwiy8r7VlRylFoLb8wIv&#13;\r\nTjpPUC73GvqgbyYqeMav1oHxP01es+Mmi8AAjYRHdiO3TTlrCNtZ9uROlDEBKg9oRtg2vdDIlD9F&#13;\r\np7f675AgwbyL+Wxp62ET3LCPAvfAxX0u65zSTZhC+zl5/FcuhsbRVFvWjzh0oLk2CJ/BLch6UgMg&#13;\r\n8PqTM9zT+L/j5uohwVh6424pCmBQnmWPku1T2D0W2CxETWiH0CxE06pk0xtSrkTB8NLUvTYhP7Bg&#13;\r\nEiDsLCloIkj7jeDi5H0CAwEAAaOByjCBxzAfBgNVHSMEGDAWgBRGI9JET79XWSHkv5PVMJuVTOP3&#13;\r\nhzAdBgNVHQ4EFgQUIk9WUOhUNOxnbzwCqqfqTXGsyPgwCwYDVR0PBAQDAgbAMBMGA1UdJQQMMAoG&#13;\r\nCCsGAQUFBwMEMGMGCCsGAQUFBwEBBFcwVTBTBggrBgEFBQcwAoZHaHR0cHM6Ly9wa2kuY29tcHJv&#13;\r\nYmFudGVzZWxlY3Ryb25pY29zLmdvLmNyL3N0YWcvaW50ZXJtZWRpYXRlLXBmLXBlbS5jcnQwDQYJ&#13;\r\nKoZIhvcNAQELBQADggIBAEzMyQhLIC68xzvpCw51b6CnDI7MaLCmaBKCAlePkZFJ46n/sTzaZAKO&#13;\r\nsK7zbLu7kRRVQVy/99BZutcmBfbNDZFVe7JRTY80vrpEiDelUXPYX0u6/brSSttc1djX2x6lGpZF&#13;\r\nk9WGfxYDZieVAsPNPu+2XV1z1C6fY9sTBou5FF40SL4pO9jm86ozUoTwLXIEh6/0pQ6WMDIlAGSg&#13;\r\n28mKNHsvR0Bxg+yJjR7EpooABVU1JFXnEKAZ6aXJmmw+rfRa3mQWgjfGMZQMlRXDwbIBTRn/Sd13&#13;\r\nb+a70JILqrIrY2T1Fr7snap85lneuiTIHmZ/RoxjArGpf/4SB7Aqe4rUes0EdiF0GUw6Lf8MxaZj&#13;\r\n+mvKdH87idssiBIPOJ2gjssBU5D1A5vMfOEOaO+O4AyN2YwgPJz9ypdoPCvRNSKKDCyv4SxHV6I0&#13;\r\nkl0CELTXbLB8R5zrEyG/+SwXp6h+Eg3U7BRDAOgCrKoYSZ+5oT16wJMQKJRMX1iB+zgOfqiZgbJV&#13;\r\ngDdf+WKk5UFBfSUJkyNfUSk7cagm3/VPyVvGUCg4kTokNzVtUs4sfnGiI/uNyzlfqtJVJmfauDHp&#13;\r\n7gPkx1+V2GCwu7qpQmCoYTd497fmuj4TGRDyIWy8xzi1djXUCmcCd9HZyRtBAq5196Q1DqDYbvpr&#13;\r\n6ZDPJbadV25c7rGpyHug\r\n</ds:X509Certificate>\r\n</ds:X509Data>\r\n<ds:KeyValue>\r\n<ds:RSAKeyValue>\r\n<ds:Modulus>qHH/OluSLxnDQcFDlJa/NaI37D8jQqVWEt3tCHU8ksrXHbx7jYrhqAl195NZX1gKkDVZKWVIpTjH&#13;\r\nCLLyvtWVHKUWgtvzAi9OOk9QLvca+qBvJip4xq/WgfE/TV6z4yaLwACNhEd2I7dNOWsI21n25E6U&#13;\r\nMQEqD2hG2Da90MiUP0Wnt/rvkCDBvIv5bGnrYRPcsI8C98DFfS7rnNJNmEL7OXn8Vy6GxtFUW9aP&#13;\r\nOHSguTYIn8EtyHpSAyDw+pMz3NP4v+Pm6iHBWHrjbikKYFCeZY+S7VPYPRbYLERNaIfQLETTqmTT&#13;\r\nG1KuRMHw0tS9NiE/sGASIOwsKWgiSPuN4OLkfQ==</ds:Modulus>\r\n<ds:Exponent>AQAB</ds:Exponent>\r\n</ds:RSAKeyValue>\r\n</ds:KeyValue>\r\n</ds:KeyInfo>\r\n</ds:Signature></FacturaElectronica>','<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<FacturaElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica\" xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n  <Clave>50611032026000208600363001000010100000000031513039</Clave>\n  <CodigoActividad>7410</CodigoActividad>\n  <NumeroConsecutivo>00100001010000000003</NumeroConsecutivo>\n  <FechaEmision>2026-03-11T00:51:38-06:00</FechaEmision>\n  <Emisor>\n    <Nombre>MANUEL SALVADOR MEJICANO ORTIZ</Nombre>\n    <Identificacion>\n      <Tipo>01</Tipo>\n      <Numero>208600363</Numero>\n    </Identificacion>\n    <Ubicacion>\n      <Provincia>2</Provincia>\n      <Canton>13</Canton>\n      <Distrito>07</Distrito>\n      <OtrasSenas>Costa Rica</OtrasSenas>\n    </Ubicacion>\n    <Telefono>\n      <CodigoPais>506</CodigoPais>\n      <NumTelefono>70280576</NumTelefono>\n    </Telefono>\n    <CorreoElectronico>manuelortizmejicano100@gmail.com</CorreoElectronico>\n  </Emisor>\n  <Receptor>\n    <Nombre>Manuel Salvador Mejicano Ortiz</Nombre>\n    <Identificacion>\n      <Tipo>01</Tipo>\n      <Numero>208600363</Numero>\n    </Identificacion>\n  </Receptor>\n  <CondicionVenta>01</CondicionVenta>\n  <MedioPago>02</MedioPago>\n  <DetalleServicio>\n    <LineaDetalle>\n      <NumeroLinea>1</NumeroLinea>\n      <CodigoCabys>1234567890123</CodigoCabys>\n      <Cantidad>1.000</Cantidad>\n      <UnidadMedida>Unid</UnidadMedida>\n      <Detalle>Fertilizante QPK 100 ml</Detalle>\n      <PrecioUnitario>5000.00000</PrecioUnitario>\n      <MontoTotal>5000.00000</MontoTotal>\n      <SubTotal>5000.00000</SubTotal>\n      <ImpuestoNeto>0.00000</ImpuestoNeto>\n      <MontoTotalLinea>5000.00000</MontoTotalLinea>\n    </LineaDetalle>\n  </DetalleServicio>\n  <ResumenFactura>\n    <CodigoTipoMoneda>\n      <CodigoMoneda>CRC</CodigoMoneda>\n      <TipoCambio>1.00000</TipoCambio>\n    </CodigoTipoMoneda>\n    <TotalServGravados>0.00000</TotalServGravados>\n    <TotalServExentos>0.00000</TotalServExentos>\n    <TotalMercanciasGravadas>0.00000</TotalMercanciasGravadas>\n    <TotalMercanciasExentas>5000.00000</TotalMercanciasExentas>\n    <TotalGravado>0.00000</TotalGravado>\n    <TotalExento>5000.00000</TotalExento>\n    <TotalVenta>5000.00000</TotalVenta>\n    <TotalDescuentos>0.00000</TotalDescuentos>\n    <TotalVentaNeta>5000.00000</TotalVentaNeta>\n    <TotalImpuesto>0.00000</TotalImpuesto>\n    <TotalComprobante>5000.00000</TotalComprobante>\n  </ResumenFactura>\n</FacturaElectronica>','PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48TWVuc2FqZUhhY2llbmRhIHhtbG5zPSJodHRwczovL2Nkbi5jb21wcm9iYW50ZXNlbGVjdHJvbmljb3MuZ28uY3IveG1sLXNjaGVtYXMvdjQuNC9tZW5zYWplSGFjaWVuZGEiPgogICAgPENsYXZlPjUwNjExMDMyMDI2MDAwMjA4NjAwMzYzMDAxMDAwMDEwMTAwMDAwMDAwMDMxNTEzMDM5PC9DbGF2ZT4KICAgIDxOb21icmVFbWlzb3I+REVTQ09OT0NJRE88L05vbWJyZUVtaXNvcj4KICAgIDxUaXBvSWRlbnRpZmljYWNpb25FbWlzb3I+MDE8L1RpcG9JZGVudGlmaWNhY2lvbkVtaXNvcj4KICAgIDxOdW1lcm9DZWR1bGFFbWlzb3I+MjA4NjAwMzYzPC9OdW1lcm9DZWR1bGFFbWlzb3I+CiAgICA8TWVuc2FqZT4zPC9NZW5zYWplPgogICAgPEVzdGFkb01lbnNhamU+UmVjaGF6YWRvPC9Fc3RhZG9NZW5zYWplPgogICAgPERldGFsbGVNZW5zYWplPkVzdGUgY29tcHJvYmFudGUgZnVlIHJlY2liaWRvIGVuIGVsIGFtYmllbnRlIGRlIHBydWViYXMsIHBvciBsbyBjdWFsIG5vIHRpZW5lIHZhbGlkZXogcGFyYSBmaW5lcyB0cmlidXRhcmlvcy4KCkVsIGNvbXByb2JhbnRlIGVsZWN0csOzbmljbyB0aWVuZSBsb3Mgc2lndWllbnRlcyBlcnJvcmVzOiAmIzEzOwpbJiMxMzsKTGEgZmlybWEgZGVsIGRvY3VtZW50byBubyBlcyBYQWRFUywgc2Ugb2J0dXZvIFtFUlJPUl0mIzEzOwpdPC9EZXRhbGxlTWVuc2FqZT4KICAgIDxUb3RhbEZhY3R1cmE+MDwvVG90YWxGYWN0dXJhPgo8ZHM6U2lnbmF0dXJlIHhtbG5zOmRzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjIiBJZD0iaWQtMTY3ZGFmYjU0MjU3ZjIzNTE5YjgyNmIzODNlZDhlMDAiPjxkczpTaWduZWRJbmZvPjxkczpDYW5vbmljYWxpemF0aW9uTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz48ZHM6UmVmZXJlbmNlIElkPSJyLWlkLTEiIFR5cGU9IiIgVVJJPSIiPjxkczpUcmFuc2Zvcm1zPjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy9UUi8xOTk5L1JFQy14cGF0aC0xOTk5MTExNiI+PGRzOlhQYXRoPm5vdChhbmNlc3Rvci1vci1zZWxmOjpkczpTaWduYXR1cmUpPC9kczpYUGF0aD48L2RzOlRyYW5zZm9ybT48ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PC9kczpUcmFuc2Zvcm1zPjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz48ZHM6RGlnZXN0VmFsdWU+dkMyeVNpTzRrbXd0WDV6YnhyOHEzRlZmNTNlWTNzK25TUnpXMW9KdFViMD08L2RzOkRpZ2VzdFZhbHVlPjwvZHM6UmVmZXJlbmNlPjxkczpSZWZlcmVuY2UgVHlwZT0iaHR0cDovL3VyaS5ldHNpLm9yZy8wMTkwMyNTaWduZWRQcm9wZXJ0aWVzIiBVUkk9IiN4YWRlcy1pZC0xNjdkYWZiNTQyNTdmMjM1MTliODI2YjM4M2VkOGUwMCI+PGRzOlRyYW5zZm9ybXM+PGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPjwvZHM6VHJhbnNmb3Jtcz48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzOkRpZ2VzdFZhbHVlPklCYVJ2MTd5WlVJZEdaVnRVakd6bzBjV3BvNDNtQVdUelQrdEcvTHNiU0k9PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48L2RzOlNpZ25lZEluZm8+PGRzOlNpZ25hdHVyZVZhbHVlIElkPSJ2YWx1ZS1pZC0xNjdkYWZiNTQyNTdmMjM1MTliODI2YjM4M2VkOGUwMCI+bGozMmZ5dk12NHFjVFVSR3l4eXFmelU5KzhuVEJlZjI5N3djUmhJVFNTMU5TaTZydDhtVFRqR0hkWWE1M0FRalIrNngzZTNwYnZGcEUrSFJOUS9XcmlwWlhXZmljQnZteURtdHIxNWN5S3diZXRpTmJtMXA0ajlyVUNZc051QnMvSitiSE1tZWYwcGhORDcxMnVubkNNYTNrMkRtQzJsenVjTlM5Tnhjckxpb3pJM3BhL2NKZTRqTm1LVCtQMzU0SWdwaWoweS9UTWhiclNJMzNOWU1UeXFQZGlEbmZqUU1BMS9JZXc5R0pPbXZjQjhVeHFySkhqNGZoWHFqSC9RbkdJSVhGQXdOZ2gxUUVIT2RyaDVZandDb1E1OHU4YlVKNTNteVBBdXV0aUJMVDBVWDZiQU5ML0UweVlhODljb2hkajVlRTJLbURqRnNNOWlGbENqeDJnPT08L2RzOlNpZ25hdHVyZVZhbHVlPjxkczpLZXlJbmZvPjxkczpYNTA5RGF0YT48ZHM6WDUwOUNlcnRpZmljYXRlPk1JSUZoekNDQkcrZ0F3SUJBZ0lUU0FBQUNGeS8vZjJIT2p0bzlBQUNBQUFJWERBTkJna3Foa2lHOXcwQkFRc0ZBRENCbXpFWk1CY0dBMVVFQlJNUVExQktMVFF0TURBd0xUQXdOREF4TnpFTE1Ba0dBMVVFQmhNQ1ExSXhKREFpQmdOVkJBb1RHMEpCVGtOUElFTkZUbFJTUVV3Z1JFVWdRMDlUVkVFZ1VrbERRVEVpTUNBR0ExVUVDeE1aUkVsV1NWTkpUMDRnVTBsVFZFVk5RVk1nUkVVZ1VFRkhUekVuTUNVR0ExVUVBeE1lUTBFZ1UwbE9VRVVnTFNCUVJWSlRUMDVCSUVwVlVrbEVTVU5CSUhZeU1CNFhEVEkxTURZeU5ERTJNVGcxTWxvWERUSTVNRFl5TXpFMk1UZzFNbG93ZnpFWk1CY0dBMVVFQlJNUVExQktMVEl0TVRBd0xUQTBNakF3TlRFTE1Ba0dBMVVFQmhNQ1ExSXhHVEFYQmdOVkJBb1RFRkJGVWxOUFRrRWdTbFZTU1VSSlEwRXhPakE0QmdOVkJBTVRNVVZUVkVGRVR5MU5TVTVKVTFSRlVrbFBJRVJGSUVoQlEwbEZUa1JCSUNoVFJVeE1UeUJGVEVWRFZGSlBUa2xEVHlrd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUN0K1J5Sk5nWXFPdXA2M1dlRlNXb3ZlYS94K0ZsVHBuRHJFcXJNd2tvczVXMWdCK28vT0EzcytBRVJCOEg3MVdzeFJwbmlQZTZEZ0FKOC9EN09tQ0ZtRk1pT0lxQyszd0dWbmdxa3NjRDZxbkJ5dzF1YUdLTmdiR1JWWmFUWXFHQ3pyNnB6MGZsSmpRS0EzbTlGMnVYZWRwdklaKzVPbndwY3cvRThCc1ExUE5kRXhpckdoczJNenI1Q1pEdEg2ODdWRUxTK3lCK2hWbTk3a1dJWjhid1Z1VWE1cVBvVXdJeElsNTN6MGk5SzdncnRmQS9XMVc1QXBqblBLdlFNQVRmS05kUEdDRVhKZFBrN1haK0FwdHZtdHdrUE1OaXRlWStheG5mbGM5WjhxSUNFaGZlZ2RDbTRTMy9kbVpSM01aT1RHOE9mUzVSVG9iWWVaMk1ORWJqbEFnTUJBQUdqZ2dIZE1JSUIyVEFPQmdOVkhROEJBZjhFQkFNQ0JzQXdIUVlEVlIwT0JCWUVGS0NlTW52VUhLcGxaeWtRRWZoVUU0cVllTExrTUI4R0ExVWRJd1FZTUJhQUZEYXM1TUJ5MnZOK0hleVQ3TXNqNGNxdWVVcTRNR01HQTFVZEh3UmNNRm93V0tCV29GU0dVbWgwZEhBNkx5OW1aR2t1YzJsdWNHVXVabWt1WTNJdmNtVndiM05wZEc5eWFXOHZRMEVsTWpCVFNVNVFSU1V5TUMwbE1qQlFSVkpUVDA1QkpUSXdTbFZTU1VSSlEwRWxNakIyTWlneUtTNWpjbXd3Z1pvR0NDc0dBUVVGQndFQkJJR05NSUdLTUNnR0NDc0dBUVVGQnpBQmhoeG9kSFJ3T2k4dmIyTnpjQzV6YVc1d1pTNW1hUzVqY2k5dlkzTndNRjRHQ0NzR0FRVUZCekFDaGxKb2RIUndPaTh2Wm1ScExuTnBibkJsTG1acExtTnlMM0psY0c5emFYUnZjbWx2TDBOQkpUSXdVMGxPVUVVbE1qQXRKVEl3VUVWU1UwOU9RU1V5TUVwVlVrbEVTVU5CSlRJd2RqSW9NaWt1WTNKME1Ed0dDU3NHQVFRQmdqY1ZCd1F2TUMwR0pTc0dBUVFCZ2pjVkNJWEU2bHVDMGVNMWxaRWJndm1YR0lhbHkydUJmNEdRaG5YZXNsd0NBV1FDQVFrd0V3WURWUjBsQkF3d0NnWUlLd1lCQlFVSEF3UXdHd1lKS3dZQkJBR0NOeFVLQkE0d0REQUtCZ2dyQmdFRkJRY0RCREFWQmdOVkhTQUVEakFNTUFvR0NHQ0JQQUVCQVFFR01BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQU1NdG9jYk1Ra0RzYmd2M2Vwb0F5RTk3RDlqcDd4OWZxNXFoY05HOWYybDZjV21OanFvMGJOOXJoSHdQcjM3VitxMHZrSUR0SkVpb3FmNVk0WVU5YjRnajg1TGVsdEdhMDdhRGhMVE1zZEpQZG8rSkhPaEF5YUI4K1JYV0VXZy9sa0NuSmZJQnlKRmo0MTZXMHYwVTM3VE5jODhUc09Za0ZqcURaVlpBSVQ1clB0VWNVNWp1a0dpUWErbHdNZDJaZGZlbk43eWZpek9ySHpUOXp5Z3pzSklZdjJCbytocWs4MGU0UnpDaUlkSVd1bzJOVnBKMkZIMXo5S1E4UVVLM0ZsY0lmNGJUdHFwVGh1QWtXSjhNeVptUHY5L2ZvN1MzcjJNTlE2TVErL3cwYy9IL0RPYjZueklobm1JVytqSnhtOFdwdVBialZ5Sk5qeGRLNzNQL25WPC9kczpYNTA5Q2VydGlmaWNhdGU+PC9kczpYNTA5RGF0YT48L2RzOktleUluZm8+PGRzOk9iamVjdD48eGFkZXM6UXVhbGlmeWluZ1Byb3BlcnRpZXMgeG1sbnM6eGFkZXM9Imh0dHA6Ly91cmkuZXRzaS5vcmcvMDE5MDMvdjEuMy4yIyIgVGFyZ2V0PSIjaWQtMTY3ZGFmYjU0MjU3ZjIzNTE5YjgyNmIzODNlZDhlMDAiPjx4YWRlczpTaWduZWRQcm9wZXJ0aWVzIElkPSJ4YWRlcy1pZC0xNjdkYWZiNTQyNTdmMjM1MTliODI2YjM4M2VkOGUwMCI+PHhhZGVzOlNpZ25lZFNpZ25hdHVyZVByb3BlcnRpZXM+PHhhZGVzOlNpZ25pbmdUaW1lPjIwMjYtMDMtMTFUMDY6NTE6NDJaPC94YWRlczpTaWduaW5nVGltZT48eGFkZXM6U2lnbmluZ0NlcnRpZmljYXRlPjx4YWRlczpDZXJ0Pjx4YWRlczpDZXJ0RGlnZXN0PjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjc2hhMSIvPjxkczpEaWdlc3RWYWx1ZT5NZ1dPZnl1blovbDJvMy9WZHNOV2dEYU5aTWs9PC9kczpEaWdlc3RWYWx1ZT48L3hhZGVzOkNlcnREaWdlc3Q+PHhhZGVzOklzc3VlclNlcmlhbD48ZHM6WDUwOUlzc3Vlck5hbWU+Q049Q0EgU0lOUEUgLSBQRVJTT05BIEpVUklESUNBIHYyLE9VPURJVklTSU9OIFNJU1RFTUFTIERFIFBBR08sTz1CQU5DTyBDRU5UUkFMIERFIENPU1RBIFJJQ0EsQz1DUiwyLjUuNC41PSMxMzEwNDM1MDRhMmQzNDJkMzAzMDMwMmQzMDMwMzQzMDMxMzc8L2RzOlg1MDlJc3N1ZXJOYW1lPjxkczpYNTA5U2VyaWFsTnVtYmVyPjE2MDU2NTM2NjU0MDk2MTQyMDY4Nzc3MDM4ODIyMzkxODMwNjE2NjkzODIyMzY8L2RzOlg1MDlTZXJpYWxOdW1iZXI+PC94YWRlczpJc3N1ZXJTZXJpYWw+PC94YWRlczpDZXJ0PjwveGFkZXM6U2lnbmluZ0NlcnRpZmljYXRlPjwveGFkZXM6U2lnbmVkU2lnbmF0dXJlUHJvcGVydGllcz48eGFkZXM6U2lnbmVkRGF0YU9iamVjdFByb3BlcnRpZXM+PHhhZGVzOkRhdGFPYmplY3RGb3JtYXQgT2JqZWN0UmVmZXJlbmNlPSIjci1pZC0xIj48eGFkZXM6TWltZVR5cGU+YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtPC94YWRlczpNaW1lVHlwZT48L3hhZGVzOkRhdGFPYmplY3RGb3JtYXQ+PC94YWRlczpTaWduZWREYXRhT2JqZWN0UHJvcGVydGllcz48L3hhZGVzOlNpZ25lZFByb3BlcnRpZXM+PC94YWRlczpRdWFsaWZ5aW5nUHJvcGVydGllcz48L2RzOk9iamVjdD48L2RzOlNpZ25hdHVyZT48L01lbnNhamVIYWNpZW5kYT4=',50),(7,'50611032026000208600363001000010100000000041129445','2026-03-11 07:00:09.557072','RECHAZADO','2026-03-11 07:00:11.834329','2026-03-11 07:01:57.009208',1,'RECHAZADO: Sin detalle','00100001010000000004','FACTURA_ELECTRONICA','<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\"?><FacturaElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica\" xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\r\n  <Clave>50611032026000208600363001000010100000000041129445</Clave>\r\n  <CodigoActividad>7410</CodigoActividad>\r\n  <NumeroConsecutivo>00100001010000000004</NumeroConsecutivo>\r\n  <FechaEmision>2026-03-11T01:00:08-06:00</FechaEmision>\r\n  <Emisor>\r\n    <Nombre>MANUEL SALVADOR MEJICANO ORTIZ</Nombre>\r\n    <Identificacion>\r\n      <Tipo>01</Tipo>\r\n      <Numero>208600363</Numero>\r\n    </Identificacion>\r\n    <Ubicacion>\r\n      <Provincia>2</Provincia>\r\n      <Canton>13</Canton>\r\n      <Distrito>07</Distrito>\r\n      <OtrasSenas>Costa Rica</OtrasSenas>\r\n    </Ubicacion>\r\n    <Telefono>\r\n      <CodigoPais>506</CodigoPais>\r\n      <NumTelefono>70280576</NumTelefono>\r\n    </Telefono>\r\n    <CorreoElectronico>manuelortizmejicano100@gmail.com</CorreoElectronico>\r\n  </Emisor>\r\n  <Receptor>\r\n    <Nombre>Edgar Duarte</Nombre>\r\n    <Identificacion>\r\n      <Tipo>01</Tipo>\r\n      <Numero>504600060</Numero>\r\n    </Identificacion>\r\n  </Receptor>\r\n  <CondicionVenta>01</CondicionVenta>\r\n  <MedioPago>02</MedioPago>\r\n  <DetalleServicio>\r\n    <LineaDetalle>\r\n      <NumeroLinea>1</NumeroLinea>\r\n      <CodigoCabys>1234567890987</CodigoCabys>\r\n      <Cantidad>1.000</Cantidad>\r\n      <UnidadMedida>Unid</UnidadMedida>\r\n      <Detalle>Prueba</Detalle>\r\n      <PrecioUnitario>7000.00000</PrecioUnitario>\r\n      <MontoTotal>7000.00000</MontoTotal>\r\n      <SubTotal>7000.00000</SubTotal>\r\n      <ImpuestoNeto>0.00000</ImpuestoNeto>\r\n      <MontoTotalLinea>7000.00000</MontoTotalLinea>\r\n    </LineaDetalle>\r\n  </DetalleServicio>\r\n  <ResumenFactura>\r\n    <CodigoTipoMoneda>\r\n      <CodigoMoneda>CRC</CodigoMoneda>\r\n      <TipoCambio>1.00000</TipoCambio>\r\n    </CodigoTipoMoneda>\r\n    <TotalServGravados>0.00000</TotalServGravados>\r\n    <TotalServExentos>0.00000</TotalServExentos>\r\n    <TotalMercanciasGravadas>0.00000</TotalMercanciasGravadas>\r\n    <TotalMercanciasExentas>7000.00000</TotalMercanciasExentas>\r\n    <TotalGravado>0.00000</TotalGravado>\r\n    <TotalExento>7000.00000</TotalExento>\r\n    <TotalVenta>7000.00000</TotalVenta>\r\n    <TotalDescuentos>0.00000</TotalDescuentos>\r\n    <TotalVentaNeta>7000.00000</TotalVentaNeta>\r\n    <TotalImpuesto>0.00000</TotalImpuesto>\r\n    <TotalComprobante>7000.00000</TotalComprobante>\r\n  </ResumenFactura>\r\n<ds:Signature Id=\"Signature-0172ad5f\">\r\n<ds:SignedInfo>\r\n<ds:CanonicalizationMethod Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n<ds:SignatureMethod Algorithm=\"http://www.w3.org/2001/04/xmldsig-more#rsa-sha256\"/>\r\n<ds:Reference URI=\"\">\r\n<ds:Transforms>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2000/09/xmldsig#enveloped-signature\"/>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n</ds:Transforms>\r\n<ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/>\r\n<ds:DigestValue>5NYM0DvDdUXYXZPifMYUBDjFX22dLjGAWqudGCOGQiE=</ds:DigestValue>\r\n</ds:Reference>\r\n<ds:Reference Type=\"http://uri.etsi.org/01903#SignedProperties\" URI=\"#SignedProperties-0172ad5f\">\r\n<ds:Transforms>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n</ds:Transforms>\r\n<ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/>\r\n<ds:DigestValue>BRWSnhPmB1RcV4aII92+z2nU7RMRHbp51l9pro89AXw=</ds:DigestValue>\r\n</ds:Reference>\r\n</ds:SignedInfo>\r\n<ds:SignatureValue>\r\na98Ti4iacxEqlg53xnE2L3D4SDezo4JmDsFUnQtF0yFIPdXLecAvMO/TpyTV2acf9c8g3A06GobK&#13;\r\nZuCH2kTttJmJ5hdzez3B0AL/2LILKDWJSk/QeYlhIbqQP4qF1fIU10NvU0ez8BEjdx/RVp7Auepf&#13;\r\nRrwf3c8s9/5ginuWaUsxfhjiLn0rn729l5zGLBKBVoDvZdYC90MM21QUq8nre0uuNKZlbvJvbSay&#13;\r\nmw0KDxX4208lQTuj54UQos7XxMeY/vuRq/XCcQ0SOSxll4a8IpJEruyfDqfn7cFNjke4lgvjN1VJ&#13;\r\noCooCYciw+BWKHUgd33BAPa3I9XaoZT5VcWKBg==\r\n</ds:SignatureValue>\r\n<ds:KeyInfo>\r\n<ds:X509Data>\r\n<ds:X509Certificate>\r\nMIIFYzCCA0ugAwIBAgIGAZzZDxyxMA0GCSqGSIb3DQEBCwUAMGwxCzAJBgNVBAYTAkNSMSkwJwYD&#13;\r\nVQQKDCBNSU5JU1RFUklPIERFIEhBQ0lFTkRBIC0gU0FOREJPWDEMMAoGA1UECwwDREdUMSQwIgYD&#13;\r\nVQQDDBtDQSBQRVJTT05BIEZJU0lDQSAtIFNBTkRCT1gwHhcNMjYwMzEwMTg0MjUyWhcNMzAwMzA5&#13;\r\nMTg0MjUyWjCBqzEZMBcGA1UEBRMQQ1BGLTAyLTA4NjAtMDM2MzEXMBUGA1UEBAwOTUVKSUNBTk8g&#13;\r\nT1JUSVoxGDAWBgNVBCoMD01BTlVFTCBTQUxWQURPUjELMAkGA1UEBhMCQ1IxFzAVBgNVBAoMDlBF&#13;\r\nUlNPTkEgRklTSUNBMQwwCgYDVQQLDANDUEYxJzAlBgNVBAMMHk1BTlVFTCBTQUxWQURPUiBNRUpJ&#13;\r\nQ0FOTyBPUlRJWjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKhx/zpbki8Zw0HBQ5SW&#13;\r\nvzWiN+w/I0KlVhLd7Qh1PJLK1x28e42K4agJdfeTWV9YCpA1WSllSKU4xwiy8r7VlRylFoLb8wIv&#13;\r\nTjpPUC73GvqgbyYqeMav1oHxP01es+Mmi8AAjYRHdiO3TTlrCNtZ9uROlDEBKg9oRtg2vdDIlD9F&#13;\r\np7f675AgwbyL+Wxp62ET3LCPAvfAxX0u65zSTZhC+zl5/FcuhsbRVFvWjzh0oLk2CJ/BLch6UgMg&#13;\r\n8PqTM9zT+L/j5uohwVh6424pCmBQnmWPku1T2D0W2CxETWiH0CxE06pk0xtSrkTB8NLUvTYhP7Bg&#13;\r\nEiDsLCloIkj7jeDi5H0CAwEAAaOByjCBxzAfBgNVHSMEGDAWgBRGI9JET79XWSHkv5PVMJuVTOP3&#13;\r\nhzAdBgNVHQ4EFgQUIk9WUOhUNOxnbzwCqqfqTXGsyPgwCwYDVR0PBAQDAgbAMBMGA1UdJQQMMAoG&#13;\r\nCCsGAQUFBwMEMGMGCCsGAQUFBwEBBFcwVTBTBggrBgEFBQcwAoZHaHR0cHM6Ly9wa2kuY29tcHJv&#13;\r\nYmFudGVzZWxlY3Ryb25pY29zLmdvLmNyL3N0YWcvaW50ZXJtZWRpYXRlLXBmLXBlbS5jcnQwDQYJ&#13;\r\nKoZIhvcNAQELBQADggIBAEzMyQhLIC68xzvpCw51b6CnDI7MaLCmaBKCAlePkZFJ46n/sTzaZAKO&#13;\r\nsK7zbLu7kRRVQVy/99BZutcmBfbNDZFVe7JRTY80vrpEiDelUXPYX0u6/brSSttc1djX2x6lGpZF&#13;\r\nk9WGfxYDZieVAsPNPu+2XV1z1C6fY9sTBou5FF40SL4pO9jm86ozUoTwLXIEh6/0pQ6WMDIlAGSg&#13;\r\n28mKNHsvR0Bxg+yJjR7EpooABVU1JFXnEKAZ6aXJmmw+rfRa3mQWgjfGMZQMlRXDwbIBTRn/Sd13&#13;\r\nb+a70JILqrIrY2T1Fr7snap85lneuiTIHmZ/RoxjArGpf/4SB7Aqe4rUes0EdiF0GUw6Lf8MxaZj&#13;\r\n+mvKdH87idssiBIPOJ2gjssBU5D1A5vMfOEOaO+O4AyN2YwgPJz9ypdoPCvRNSKKDCyv4SxHV6I0&#13;\r\nkl0CELTXbLB8R5zrEyG/+SwXp6h+Eg3U7BRDAOgCrKoYSZ+5oT16wJMQKJRMX1iB+zgOfqiZgbJV&#13;\r\ngDdf+WKk5UFBfSUJkyNfUSk7cagm3/VPyVvGUCg4kTokNzVtUs4sfnGiI/uNyzlfqtJVJmfauDHp&#13;\r\n7gPkx1+V2GCwu7qpQmCoYTd497fmuj4TGRDyIWy8xzi1djXUCmcCd9HZyRtBAq5196Q1DqDYbvpr&#13;\r\n6ZDPJbadV25c7rGpyHug\r\n</ds:X509Certificate>\r\n</ds:X509Data>\r\n<ds:KeyValue>\r\n<ds:RSAKeyValue>\r\n<ds:Modulus>qHH/OluSLxnDQcFDlJa/NaI37D8jQqVWEt3tCHU8ksrXHbx7jYrhqAl195NZX1gKkDVZKWVIpTjH&#13;\r\nCLLyvtWVHKUWgtvzAi9OOk9QLvca+qBvJip4xq/WgfE/TV6z4yaLwACNhEd2I7dNOWsI21n25E6U&#13;\r\nMQEqD2hG2Da90MiUP0Wnt/rvkCDBvIv5bGnrYRPcsI8C98DFfS7rnNJNmEL7OXn8Vy6GxtFUW9aP&#13;\r\nOHSguTYIn8EtyHpSAyDw+pMz3NP4v+Pm6iHBWHrjbikKYFCeZY+S7VPYPRbYLERNaIfQLETTqmTT&#13;\r\nG1KuRMHw0tS9NiE/sGASIOwsKWgiSPuN4OLkfQ==</ds:Modulus>\r\n<ds:Exponent>AQAB</ds:Exponent>\r\n</ds:RSAKeyValue>\r\n</ds:KeyValue>\r\n</ds:KeyInfo>\r\n<ds:Object><xades:QualifyingProperties xmlns:xades=\"http://uri.etsi.org/01903/v1.3.2#\" Target=\"#Signature-0172ad5f\"><xades:SignedProperties Id=\"SignedProperties-0172ad5f\"><xades:SignedSignatureProperties><xades:SigningTime>2026-03-11T01:00:09-06:00</xades:SigningTime><xades:SigningCertificate><xades:Cert><xades:CertDigest><ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/><ds:DigestValue>G+VgYhz90UHD1UqR8ZSmUyY8KLQyoFOXXCXL63e2bkE=</ds:DigestValue></xades:CertDigest><xades:IssuerSerial><ds:X509IssuerName>CN=CA PERSONA FISICA - SANDBOX,OU=DGT,O=MINISTERIO DE HACIENDA - SANDBOX,C=CR</ds:X509IssuerName><ds:X509SerialNumber>1773168172209</ds:X509SerialNumber></xades:IssuerSerial></xades:Cert></xades:SigningCertificate><xades:SignaturePolicyIdentifier><xades:SignaturePolicyId><xades:SigPolicyId><xades:Identifier>https://tribunet.hacienda.go.cr/docs/esquemas/2016/v4.2/ResolucionComprobantesElectronicosDGT-R-48-2016_4.2.pdf</xades:Identifier></xades:SigPolicyId><xades:SigPolicyHash><ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/><ds:DigestValue>V8lVVNGDCPen6VELRD1Ja8HARbyJShsLoRW4NNJSMsc=</ds:DigestValue></xades:SigPolicyHash></xades:SignaturePolicyId></xades:SignaturePolicyIdentifier></xades:SignedSignatureProperties></xades:SignedProperties></xades:QualifyingProperties></ds:Object></ds:Signature></FacturaElectronica>','<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<FacturaElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica\" xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n  <Clave>50611032026000208600363001000010100000000041129445</Clave>\n  <CodigoActividad>7410</CodigoActividad>\n  <NumeroConsecutivo>00100001010000000004</NumeroConsecutivo>\n  <FechaEmision>2026-03-11T01:00:08-06:00</FechaEmision>\n  <Emisor>\n    <Nombre>MANUEL SALVADOR MEJICANO ORTIZ</Nombre>\n    <Identificacion>\n      <Tipo>01</Tipo>\n      <Numero>208600363</Numero>\n    </Identificacion>\n    <Ubicacion>\n      <Provincia>2</Provincia>\n      <Canton>13</Canton>\n      <Distrito>07</Distrito>\n      <OtrasSenas>Costa Rica</OtrasSenas>\n    </Ubicacion>\n    <Telefono>\n      <CodigoPais>506</CodigoPais>\n      <NumTelefono>70280576</NumTelefono>\n    </Telefono>\n    <CorreoElectronico>manuelortizmejicano100@gmail.com</CorreoElectronico>\n  </Emisor>\n  <Receptor>\n    <Nombre>Edgar Duarte</Nombre>\n    <Identificacion>\n      <Tipo>01</Tipo>\n      <Numero>504600060</Numero>\n    </Identificacion>\n  </Receptor>\n  <CondicionVenta>01</CondicionVenta>\n  <MedioPago>02</MedioPago>\n  <DetalleServicio>\n    <LineaDetalle>\n      <NumeroLinea>1</NumeroLinea>\n      <CodigoCabys>1234567890987</CodigoCabys>\n      <Cantidad>1.000</Cantidad>\n      <UnidadMedida>Unid</UnidadMedida>\n      <Detalle>Prueba</Detalle>\n      <PrecioUnitario>7000.00000</PrecioUnitario>\n      <MontoTotal>7000.00000</MontoTotal>\n      <SubTotal>7000.00000</SubTotal>\n      <ImpuestoNeto>0.00000</ImpuestoNeto>\n      <MontoTotalLinea>7000.00000</MontoTotalLinea>\n    </LineaDetalle>\n  </DetalleServicio>\n  <ResumenFactura>\n    <CodigoTipoMoneda>\n      <CodigoMoneda>CRC</CodigoMoneda>\n      <TipoCambio>1.00000</TipoCambio>\n    </CodigoTipoMoneda>\n    <TotalServGravados>0.00000</TotalServGravados>\n    <TotalServExentos>0.00000</TotalServExentos>\n    <TotalMercanciasGravadas>0.00000</TotalMercanciasGravadas>\n    <TotalMercanciasExentas>7000.00000</TotalMercanciasExentas>\n    <TotalGravado>0.00000</TotalGravado>\n    <TotalExento>7000.00000</TotalExento>\n    <TotalVenta>7000.00000</TotalVenta>\n    <TotalDescuentos>0.00000</TotalDescuentos>\n    <TotalVentaNeta>7000.00000</TotalVentaNeta>\n    <TotalImpuesto>0.00000</TotalImpuesto>\n    <TotalComprobante>7000.00000</TotalComprobante>\n  </ResumenFactura>\n</FacturaElectronica>','PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48TWVuc2FqZUhhY2llbmRhIHhtbG5zPSJodHRwczovL2Nkbi5jb21wcm9iYW50ZXNlbGVjdHJvbmljb3MuZ28uY3IveG1sLXNjaGVtYXMvdjQuNC9tZW5zYWplSGFjaWVuZGEiPgogICAgPENsYXZlPjUwNjExMDMyMDI2MDAwMjA4NjAwMzYzMDAxMDAwMDEwMTAwMDAwMDAwMDQxMTI5NDQ1PC9DbGF2ZT4KICAgIDxOb21icmVFbWlzb3I+REVTQ09OT0NJRE88L05vbWJyZUVtaXNvcj4KICAgIDxUaXBvSWRlbnRpZmljYWNpb25FbWlzb3I+MDE8L1RpcG9JZGVudGlmaWNhY2lvbkVtaXNvcj4KICAgIDxOdW1lcm9DZWR1bGFFbWlzb3I+MDAwMDAwMDAwPC9OdW1lcm9DZWR1bGFFbWlzb3I+CiAgICA8TWVuc2FqZT4zPC9NZW5zYWplPgogICAgPEVzdGFkb01lbnNhamU+UmVjaGF6YWRvPC9Fc3RhZG9NZW5zYWplPgogICAgPERldGFsbGVNZW5zYWplPkVzdGUgY29tcHJvYmFudGUgZnVlIHJlY2liaWRvIGVuIGVsIGFtYmllbnRlIGRlIHBydWViYXMsIHBvciBsbyBjdWFsIG5vIHRpZW5lIHZhbGlkZXogcGFyYSBmaW5lcyB0cmlidXRhcmlvcy4KCkVsIGNvbXByb2JhbnRlIGVsZWN0csOzbmljbyB0aWVuZSBsb3Mgc2lndWllbnRlcyBlcnJvcmVzOiAmIzEzOwpbJiMxMzsKY29kaWdvLCBtZW5zYWplLCBmaWxhLCBjb2x1bW5hJiMxMzsKLTEsICIiY3ZjLWNvbXBsZXgtdHlwZS4yLjQuYTogSW52YWxpZCBjb250ZW50IHdhcyBmb3VuZCBzdGFydGluZyB3aXRoIGVsZW1lbnQgJ3tcImh0dHBzOi8vY2RuLmNvbXByb2JhbnRlc2VsZWN0cm9uaWNvcy5nby5jci94bWwtc2NoZW1hcy92NC40L2ZhY3R1cmFFbGVjdHJvbmljYVwiOkNvZGlnb0FjdGl2aWRhZH0nLiBPbmUgb2YgJ3tcImh0dHBzOi8vY2RuLmNvbXByb2JhbnRlc2VsZWN0cm9uaWNvcy5nby5jci94bWwtc2NoZW1hcy92NC40L2ZhY3R1cmFFbGVjdHJvbmljYVwiOlByb3ZlZWRvclNpc3RlbWFzfScgaXMgZXhwZWN0ZWQuIiIsIDMsIDIwJiMxMzsKJiMxMzsKXTwvRGV0YWxsZU1lbnNhamU+CiAgICA8TW9udG9Ub3RhbEltcHVlc3RvPjA8L01vbnRvVG90YWxJbXB1ZXN0bz4KICAgIDxUb3RhbEZhY3R1cmE+MDwvVG90YWxGYWN0dXJhPgo8ZHM6U2lnbmF0dXJlIHhtbG5zOmRzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjIiBJZD0iaWQtYjVlNWNmYjA5NmNmNjVkNGU1NDRiMDNhNzkzNTUwYTIiPjxkczpTaWduZWRJbmZvPjxkczpDYW5vbmljYWxpemF0aW9uTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz48ZHM6UmVmZXJlbmNlIElkPSJyLWlkLTEiIFR5cGU9IiIgVVJJPSIiPjxkczpUcmFuc2Zvcm1zPjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy9UUi8xOTk5L1JFQy14cGF0aC0xOTk5MTExNiI+PGRzOlhQYXRoPm5vdChhbmNlc3Rvci1vci1zZWxmOjpkczpTaWduYXR1cmUpPC9kczpYUGF0aD48L2RzOlRyYW5zZm9ybT48ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PC9kczpUcmFuc2Zvcm1zPjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz48ZHM6RGlnZXN0VmFsdWU+enJtRmtKS0dSTmpkWDAwdVQ5Y3JJS3FyZHJhOGtsMWNtekFBRUtSSVZRTT08L2RzOkRpZ2VzdFZhbHVlPjwvZHM6UmVmZXJlbmNlPjxkczpSZWZlcmVuY2UgVHlwZT0iaHR0cDovL3VyaS5ldHNpLm9yZy8wMTkwMyNTaWduZWRQcm9wZXJ0aWVzIiBVUkk9IiN4YWRlcy1pZC1iNWU1Y2ZiMDk2Y2Y2NWQ0ZTU0NGIwM2E3OTM1NTBhMiI+PGRzOlRyYW5zZm9ybXM+PGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPjwvZHM6VHJhbnNmb3Jtcz48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzOkRpZ2VzdFZhbHVlPmFDRWRnLytIVk9RYU8zOFg1WmxkZmtQdzNiMHR4dk9kYUhSaDAwWlVaem89PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48L2RzOlNpZ25lZEluZm8+PGRzOlNpZ25hdHVyZVZhbHVlIElkPSJ2YWx1ZS1pZC1iNWU1Y2ZiMDk2Y2Y2NWQ0ZTU0NGIwM2E3OTM1NTBhMiI+bUNya1lNeTRrOWE2S1o2UTF3eHFBNzViaEYyQkRLZGpPVWM4UDBlN3FwM0RqeXp5NkhIazlHd1NPNW9Nb2JzbDNQeXU4YWszbERabGh2cjZVNWVBdlRlNzZ5d1JqbTFMV1dCMEdka1NQMytkNkZIMFVNaWtpSldtRGxQQ0R2WHg1RGtKdnVPN21lOVp4RlZLdUY3UkM0ZFZ3Q0gxRWJ1ZEMrYTlvcDRqem9KUi9UWW4vQkVEREROaW5KSmZwTldWVzZENXV6VENYTzM4SGU5djdIRkxFN0FsOWI3cUFWT1B6dW9HL1N2Mk5TU05FUjc2b2s2dmZyVkVDRitVTXVsdkhtUDZJdmtCMmg0d2lRZ0hycVRLRzM3bU5IcExQYU5PZWlxTUkwMVl4Z1RScy9xOEdwbDJxa1IvaVVYcEloZ1RpK1lCay9wK015bXkzclJaVnVrWkdRPT08L2RzOlNpZ25hdHVyZVZhbHVlPjxkczpLZXlJbmZvPjxkczpYNTA5RGF0YT48ZHM6WDUwOUNlcnRpZmljYXRlPk1JSUZoekNDQkcrZ0F3SUJBZ0lUU0FBQUNGeS8vZjJIT2p0bzlBQUNBQUFJWERBTkJna3Foa2lHOXcwQkFRc0ZBRENCbXpFWk1CY0dBMVVFQlJNUVExQktMVFF0TURBd0xUQXdOREF4TnpFTE1Ba0dBMVVFQmhNQ1ExSXhKREFpQmdOVkJBb1RHMEpCVGtOUElFTkZUbFJTUVV3Z1JFVWdRMDlUVkVFZ1VrbERRVEVpTUNBR0ExVUVDeE1aUkVsV1NWTkpUMDRnVTBsVFZFVk5RVk1nUkVVZ1VFRkhUekVuTUNVR0ExVUVBeE1lUTBFZ1UwbE9VRVVnTFNCUVJWSlRUMDVCSUVwVlVrbEVTVU5CSUhZeU1CNFhEVEkxTURZeU5ERTJNVGcxTWxvWERUSTVNRFl5TXpFMk1UZzFNbG93ZnpFWk1CY0dBMVVFQlJNUVExQktMVEl0TVRBd0xUQTBNakF3TlRFTE1Ba0dBMVVFQmhNQ1ExSXhHVEFYQmdOVkJBb1RFRkJGVWxOUFRrRWdTbFZTU1VSSlEwRXhPakE0QmdOVkJBTVRNVVZUVkVGRVR5MU5TVTVKVTFSRlVrbFBJRVJGSUVoQlEwbEZUa1JCSUNoVFJVeE1UeUJGVEVWRFZGSlBUa2xEVHlrd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUN0K1J5Sk5nWXFPdXA2M1dlRlNXb3ZlYS94K0ZsVHBuRHJFcXJNd2tvczVXMWdCK28vT0EzcytBRVJCOEg3MVdzeFJwbmlQZTZEZ0FKOC9EN09tQ0ZtRk1pT0lxQyszd0dWbmdxa3NjRDZxbkJ5dzF1YUdLTmdiR1JWWmFUWXFHQ3pyNnB6MGZsSmpRS0EzbTlGMnVYZWRwdklaKzVPbndwY3cvRThCc1ExUE5kRXhpckdoczJNenI1Q1pEdEg2ODdWRUxTK3lCK2hWbTk3a1dJWjhid1Z1VWE1cVBvVXdJeElsNTN6MGk5SzdncnRmQS9XMVc1QXBqblBLdlFNQVRmS05kUEdDRVhKZFBrN1haK0FwdHZtdHdrUE1OaXRlWStheG5mbGM5WjhxSUNFaGZlZ2RDbTRTMy9kbVpSM01aT1RHOE9mUzVSVG9iWWVaMk1ORWJqbEFnTUJBQUdqZ2dIZE1JSUIyVEFPQmdOVkhROEJBZjhFQkFNQ0JzQXdIUVlEVlIwT0JCWUVGS0NlTW52VUhLcGxaeWtRRWZoVUU0cVllTExrTUI4R0ExVWRJd1FZTUJhQUZEYXM1TUJ5MnZOK0hleVQ3TXNqNGNxdWVVcTRNR01HQTFVZEh3UmNNRm93V0tCV29GU0dVbWgwZEhBNkx5OW1aR2t1YzJsdWNHVXVabWt1WTNJdmNtVndiM05wZEc5eWFXOHZRMEVsTWpCVFNVNVFSU1V5TUMwbE1qQlFSVkpUVDA1QkpUSXdTbFZTU1VSSlEwRWxNakIyTWlneUtTNWpjbXd3Z1pvR0NDc0dBUVVGQndFQkJJR05NSUdLTUNnR0NDc0dBUVVGQnpBQmhoeG9kSFJ3T2k4dmIyTnpjQzV6YVc1d1pTNW1hUzVqY2k5dlkzTndNRjRHQ0NzR0FRVUZCekFDaGxKb2RIUndPaTh2Wm1ScExuTnBibkJsTG1acExtTnlMM0psY0c5emFYUnZjbWx2TDBOQkpUSXdVMGxPVUVVbE1qQXRKVEl3VUVWU1UwOU9RU1V5TUVwVlVrbEVTVU5CSlRJd2RqSW9NaWt1WTNKME1Ed0dDU3NHQVFRQmdqY1ZCd1F2TUMwR0pTc0dBUVFCZ2pjVkNJWEU2bHVDMGVNMWxaRWJndm1YR0lhbHkydUJmNEdRaG5YZXNsd0NBV1FDQVFrd0V3WURWUjBsQkF3d0NnWUlLd1lCQlFVSEF3UXdHd1lKS3dZQkJBR0NOeFVLQkE0d0REQUtCZ2dyQmdFRkJRY0RCREFWQmdOVkhTQUVEakFNTUFvR0NHQ0JQQUVCQVFFR01BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQU1NdG9jYk1Ra0RzYmd2M2Vwb0F5RTk3RDlqcDd4OWZxNXFoY05HOWYybDZjV21OanFvMGJOOXJoSHdQcjM3VitxMHZrSUR0SkVpb3FmNVk0WVU5YjRnajg1TGVsdEdhMDdhRGhMVE1zZEpQZG8rSkhPaEF5YUI4K1JYV0VXZy9sa0NuSmZJQnlKRmo0MTZXMHYwVTM3VE5jODhUc09Za0ZqcURaVlpBSVQ1clB0VWNVNWp1a0dpUWErbHdNZDJaZGZlbk43eWZpek9ySHpUOXp5Z3pzSklZdjJCbytocWs4MGU0UnpDaUlkSVd1bzJOVnBKMkZIMXo5S1E4UVVLM0ZsY0lmNGJUdHFwVGh1QWtXSjhNeVptUHY5L2ZvN1MzcjJNTlE2TVErL3cwYy9IL0RPYjZueklobm1JVytqSnhtOFdwdVBialZ5Sk5qeGRLNzNQL25WPC9kczpYNTA5Q2VydGlmaWNhdGU+PC9kczpYNTA5RGF0YT48L2RzOktleUluZm8+PGRzOk9iamVjdD48eGFkZXM6UXVhbGlmeWluZ1Byb3BlcnRpZXMgeG1sbnM6eGFkZXM9Imh0dHA6Ly91cmkuZXRzaS5vcmcvMDE5MDMvdjEuMy4yIyIgVGFyZ2V0PSIjaWQtYjVlNWNmYjA5NmNmNjVkNGU1NDRiMDNhNzkzNTUwYTIiPjx4YWRlczpTaWduZWRQcm9wZXJ0aWVzIElkPSJ4YWRlcy1pZC1iNWU1Y2ZiMDk2Y2Y2NWQ0ZTU0NGIwM2E3OTM1NTBhMiI+PHhhZGVzOlNpZ25lZFNpZ25hdHVyZVByb3BlcnRpZXM+PHhhZGVzOlNpZ25pbmdUaW1lPjIwMjYtMDMtMTFUMDc6MDA6MTNaPC94YWRlczpTaWduaW5nVGltZT48eGFkZXM6U2lnbmluZ0NlcnRpZmljYXRlPjx4YWRlczpDZXJ0Pjx4YWRlczpDZXJ0RGlnZXN0PjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjc2hhMSIvPjxkczpEaWdlc3RWYWx1ZT5NZ1dPZnl1blovbDJvMy9WZHNOV2dEYU5aTWs9PC9kczpEaWdlc3RWYWx1ZT48L3hhZGVzOkNlcnREaWdlc3Q+PHhhZGVzOklzc3VlclNlcmlhbD48ZHM6WDUwOUlzc3Vlck5hbWU+Q049Q0EgU0lOUEUgLSBQRVJTT05BIEpVUklESUNBIHYyLE9VPURJVklTSU9OIFNJU1RFTUFTIERFIFBBR08sTz1CQU5DTyBDRU5UUkFMIERFIENPU1RBIFJJQ0EsQz1DUiwyLjUuNC41PSMxMzEwNDM1MDRhMmQzNDJkMzAzMDMwMmQzMDMwMzQzMDMxMzc8L2RzOlg1MDlJc3N1ZXJOYW1lPjxkczpYNTA5U2VyaWFsTnVtYmVyPjE2MDU2NTM2NjU0MDk2MTQyMDY4Nzc3MDM4ODIyMzkxODMwNjE2NjkzODIyMzY8L2RzOlg1MDlTZXJpYWxOdW1iZXI+PC94YWRlczpJc3N1ZXJTZXJpYWw+PC94YWRlczpDZXJ0PjwveGFkZXM6U2lnbmluZ0NlcnRpZmljYXRlPjwveGFkZXM6U2lnbmVkU2lnbmF0dXJlUHJvcGVydGllcz48eGFkZXM6U2lnbmVkRGF0YU9iamVjdFByb3BlcnRpZXM+PHhhZGVzOkRhdGFPYmplY3RGb3JtYXQgT2JqZWN0UmVmZXJlbmNlPSIjci1pZC0xIj48eGFkZXM6TWltZVR5cGU+YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtPC94YWRlczpNaW1lVHlwZT48L3hhZGVzOkRhdGFPYmplY3RGb3JtYXQ+PC94YWRlczpTaWduZWREYXRhT2JqZWN0UHJvcGVydGllcz48L3hhZGVzOlNpZ25lZFByb3BlcnRpZXM+PC94YWRlczpRdWFsaWZ5aW5nUHJvcGVydGllcz48L2RzOk9iamVjdD48L2RzOlNpZ25hdHVyZT48L01lbnNhamVIYWNpZW5kYT4=',51),(8,'50611032026000208600363001000010400000000021678161','2026-03-11 07:09:35.766651','RECHAZADO','2026-03-11 07:09:38.106931','2026-03-11 07:11:07.374042',1,'RECHAZADO: Sin detalle','00100001040000000002','TIQUETE_ELECTRONICO','<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\"?><TiqueteElectronico xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/tiqueteElectronico\" xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\r\n  <Clave>50611032026000208600363001000010400000000021678161</Clave>\r\n  <ProveedorSistemas>\r\n    <Nombre>AgropecuarioPOS</Nombre>\r\n    <Version>1.0</Version>\r\n  </ProveedorSistemas>\r\n  <CodigoActividad>7410</CodigoActividad>\r\n  <NumeroConsecutivo>00100001040000000002</NumeroConsecutivo>\r\n  <FechaEmision>2026-03-11T01:09:34-06:00</FechaEmision>\r\n  <Emisor>\r\n    <Nombre>MANUEL SALVADOR MEJICANO ORTIZ</Nombre>\r\n    <Identificacion>\r\n      <Tipo>01</Tipo>\r\n      <Numero>208600363</Numero>\r\n    </Identificacion>\r\n    <Ubicacion>\r\n      <Provincia>2</Provincia>\r\n      <Canton>13</Canton>\r\n      <Distrito>07</Distrito>\r\n      <OtrasSenas>Costa Rica</OtrasSenas>\r\n    </Ubicacion>\r\n    <Telefono>\r\n      <CodigoPais>506</CodigoPais>\r\n      <NumTelefono>70280576</NumTelefono>\r\n    </Telefono>\r\n    <CorreoElectronico>manuelortizmejicano100@gmail.com</CorreoElectronico>\r\n  </Emisor>\r\n  <CondicionVenta>01</CondicionVenta>\r\n  <MedioPago>02</MedioPago>\r\n  <DetalleServicio>\r\n    <LineaDetalle>\r\n      <NumeroLinea>1</NumeroLinea>\r\n      <CodigoCabys>1234567890123</CodigoCabys>\r\n      <Cantidad>1.000</Cantidad>\r\n      <UnidadMedida>Unid</UnidadMedida>\r\n      <Detalle>Fertilizante QPK 100 ml</Detalle>\r\n      <PrecioUnitario>5000.00000</PrecioUnitario>\r\n      <MontoTotal>5000.00000</MontoTotal>\r\n      <SubTotal>5000.00000</SubTotal>\r\n      <ImpuestoNeto>0.00000</ImpuestoNeto>\r\n      <MontoTotalLinea>5000.00000</MontoTotalLinea>\r\n    </LineaDetalle>\r\n  </DetalleServicio>\r\n  <ResumenFactura>\r\n    <CodigoTipoMoneda>\r\n      <CodigoMoneda>CRC</CodigoMoneda>\r\n      <TipoCambio>1.00000</TipoCambio>\r\n    </CodigoTipoMoneda>\r\n    <TotalServGravados>0.00000</TotalServGravados>\r\n    <TotalServExentos>0.00000</TotalServExentos>\r\n    <TotalMercanciasGravadas>0.00000</TotalMercanciasGravadas>\r\n    <TotalMercanciasExentas>5000.00000</TotalMercanciasExentas>\r\n    <TotalGravado>0.00000</TotalGravado>\r\n    <TotalExento>5000.00000</TotalExento>\r\n    <TotalVenta>5000.00000</TotalVenta>\r\n    <TotalDescuentos>0.00000</TotalDescuentos>\r\n    <TotalVentaNeta>5000.00000</TotalVentaNeta>\r\n    <TotalImpuesto>0.00000</TotalImpuesto>\r\n    <TotalComprobante>5000.00000</TotalComprobante>\r\n  </ResumenFactura>\r\n<ds:Signature Id=\"Signature-994df5bf\">\r\n<ds:SignedInfo>\r\n<ds:CanonicalizationMethod Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n<ds:SignatureMethod Algorithm=\"http://www.w3.org/2001/04/xmldsig-more#rsa-sha256\"/>\r\n<ds:Reference URI=\"\">\r\n<ds:Transforms>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2000/09/xmldsig#enveloped-signature\"/>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n</ds:Transforms>\r\n<ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/>\r\n<ds:DigestValue>5JooNl1dpbYij+IeAlz+4Nz/rMJRc1tR8UTPvb4oGyM=</ds:DigestValue>\r\n</ds:Reference>\r\n<ds:Reference Type=\"http://uri.etsi.org/01903#SignedProperties\" URI=\"#SignedProperties-994df5bf\">\r\n<ds:Transforms>\r\n<ds:Transform Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\r\n</ds:Transforms>\r\n<ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/>\r\n<ds:DigestValue>oYQD+QghOsJV9cJxxiEMqwUEBNo9i/EE9H37Xc30fn0=</ds:DigestValue>\r\n</ds:Reference>\r\n</ds:SignedInfo>\r\n<ds:SignatureValue>\r\nES4i7zNyr68c6FnZ805dG+VAEiGeYYcZXLuznnOhVKFMiMzXVMmKQ3zXEIWRTSaIa/99X5xvso6X&#13;\r\niwlJUCjLMVyrS22FM3JNzBYYLI8hb4Tc85stTcCpj/fINWtksa+MClbBiT5Fg0GeFi0R7XxJ2bUM&#13;\r\no06+5o7olr9T9mAk61sgNJg85jIY0pzJXfgkyIEtbw2mj+B1JGLYaxC+m8bJDlNMR27mWqCom4aa&#13;\r\n2SEYa2gnLg7AfeCcJmlmrO5aN8Wh3oR/8bPy5eg0wUXlVbOUPo/z4K/NHho1XdodilySo8zPCeZm&#13;\r\nQEWALmY3/8cNzmZ66k42/mOXuRvOLqSmU48OtQ==\r\n</ds:SignatureValue>\r\n<ds:KeyInfo>\r\n<ds:X509Data>\r\n<ds:X509Certificate>\r\nMIIFYzCCA0ugAwIBAgIGAZzZDxyxMA0GCSqGSIb3DQEBCwUAMGwxCzAJBgNVBAYTAkNSMSkwJwYD&#13;\r\nVQQKDCBNSU5JU1RFUklPIERFIEhBQ0lFTkRBIC0gU0FOREJPWDEMMAoGA1UECwwDREdUMSQwIgYD&#13;\r\nVQQDDBtDQSBQRVJTT05BIEZJU0lDQSAtIFNBTkRCT1gwHhcNMjYwMzEwMTg0MjUyWhcNMzAwMzA5&#13;\r\nMTg0MjUyWjCBqzEZMBcGA1UEBRMQQ1BGLTAyLTA4NjAtMDM2MzEXMBUGA1UEBAwOTUVKSUNBTk8g&#13;\r\nT1JUSVoxGDAWBgNVBCoMD01BTlVFTCBTQUxWQURPUjELMAkGA1UEBhMCQ1IxFzAVBgNVBAoMDlBF&#13;\r\nUlNPTkEgRklTSUNBMQwwCgYDVQQLDANDUEYxJzAlBgNVBAMMHk1BTlVFTCBTQUxWQURPUiBNRUpJ&#13;\r\nQ0FOTyBPUlRJWjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKhx/zpbki8Zw0HBQ5SW&#13;\r\nvzWiN+w/I0KlVhLd7Qh1PJLK1x28e42K4agJdfeTWV9YCpA1WSllSKU4xwiy8r7VlRylFoLb8wIv&#13;\r\nTjpPUC73GvqgbyYqeMav1oHxP01es+Mmi8AAjYRHdiO3TTlrCNtZ9uROlDEBKg9oRtg2vdDIlD9F&#13;\r\np7f675AgwbyL+Wxp62ET3LCPAvfAxX0u65zSTZhC+zl5/FcuhsbRVFvWjzh0oLk2CJ/BLch6UgMg&#13;\r\n8PqTM9zT+L/j5uohwVh6424pCmBQnmWPku1T2D0W2CxETWiH0CxE06pk0xtSrkTB8NLUvTYhP7Bg&#13;\r\nEiDsLCloIkj7jeDi5H0CAwEAAaOByjCBxzAfBgNVHSMEGDAWgBRGI9JET79XWSHkv5PVMJuVTOP3&#13;\r\nhzAdBgNVHQ4EFgQUIk9WUOhUNOxnbzwCqqfqTXGsyPgwCwYDVR0PBAQDAgbAMBMGA1UdJQQMMAoG&#13;\r\nCCsGAQUFBwMEMGMGCCsGAQUFBwEBBFcwVTBTBggrBgEFBQcwAoZHaHR0cHM6Ly9wa2kuY29tcHJv&#13;\r\nYmFudGVzZWxlY3Ryb25pY29zLmdvLmNyL3N0YWcvaW50ZXJtZWRpYXRlLXBmLXBlbS5jcnQwDQYJ&#13;\r\nKoZIhvcNAQELBQADggIBAEzMyQhLIC68xzvpCw51b6CnDI7MaLCmaBKCAlePkZFJ46n/sTzaZAKO&#13;\r\nsK7zbLu7kRRVQVy/99BZutcmBfbNDZFVe7JRTY80vrpEiDelUXPYX0u6/brSSttc1djX2x6lGpZF&#13;\r\nk9WGfxYDZieVAsPNPu+2XV1z1C6fY9sTBou5FF40SL4pO9jm86ozUoTwLXIEh6/0pQ6WMDIlAGSg&#13;\r\n28mKNHsvR0Bxg+yJjR7EpooABVU1JFXnEKAZ6aXJmmw+rfRa3mQWgjfGMZQMlRXDwbIBTRn/Sd13&#13;\r\nb+a70JILqrIrY2T1Fr7snap85lneuiTIHmZ/RoxjArGpf/4SB7Aqe4rUes0EdiF0GUw6Lf8MxaZj&#13;\r\n+mvKdH87idssiBIPOJ2gjssBU5D1A5vMfOEOaO+O4AyN2YwgPJz9ypdoPCvRNSKKDCyv4SxHV6I0&#13;\r\nkl0CELTXbLB8R5zrEyG/+SwXp6h+Eg3U7BRDAOgCrKoYSZ+5oT16wJMQKJRMX1iB+zgOfqiZgbJV&#13;\r\ngDdf+WKk5UFBfSUJkyNfUSk7cagm3/VPyVvGUCg4kTokNzVtUs4sfnGiI/uNyzlfqtJVJmfauDHp&#13;\r\n7gPkx1+V2GCwu7qpQmCoYTd497fmuj4TGRDyIWy8xzi1djXUCmcCd9HZyRtBAq5196Q1DqDYbvpr&#13;\r\n6ZDPJbadV25c7rGpyHug\r\n</ds:X509Certificate>\r\n</ds:X509Data>\r\n<ds:KeyValue>\r\n<ds:RSAKeyValue>\r\n<ds:Modulus>qHH/OluSLxnDQcFDlJa/NaI37D8jQqVWEt3tCHU8ksrXHbx7jYrhqAl195NZX1gKkDVZKWVIpTjH&#13;\r\nCLLyvtWVHKUWgtvzAi9OOk9QLvca+qBvJip4xq/WgfE/TV6z4yaLwACNhEd2I7dNOWsI21n25E6U&#13;\r\nMQEqD2hG2Da90MiUP0Wnt/rvkCDBvIv5bGnrYRPcsI8C98DFfS7rnNJNmEL7OXn8Vy6GxtFUW9aP&#13;\r\nOHSguTYIn8EtyHpSAyDw+pMz3NP4v+Pm6iHBWHrjbikKYFCeZY+S7VPYPRbYLERNaIfQLETTqmTT&#13;\r\nG1KuRMHw0tS9NiE/sGASIOwsKWgiSPuN4OLkfQ==</ds:Modulus>\r\n<ds:Exponent>AQAB</ds:Exponent>\r\n</ds:RSAKeyValue>\r\n</ds:KeyValue>\r\n</ds:KeyInfo>\r\n<ds:Object><xades:QualifyingProperties xmlns:xades=\"http://uri.etsi.org/01903/v1.3.2#\" Target=\"#Signature-994df5bf\"><xades:SignedProperties Id=\"SignedProperties-994df5bf\"><xades:SignedSignatureProperties><xades:SigningTime>2026-03-11T01:09:35-06:00</xades:SigningTime><xades:SigningCertificate><xades:Cert><xades:CertDigest><ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/><ds:DigestValue>G+VgYhz90UHD1UqR8ZSmUyY8KLQyoFOXXCXL63e2bkE=</ds:DigestValue></xades:CertDigest><xades:IssuerSerial><ds:X509IssuerName>CN=CA PERSONA FISICA - SANDBOX,OU=DGT,O=MINISTERIO DE HACIENDA - SANDBOX,C=CR</ds:X509IssuerName><ds:X509SerialNumber>1773168172209</ds:X509SerialNumber></xades:IssuerSerial></xades:Cert></xades:SigningCertificate><xades:SignaturePolicyIdentifier><xades:SignaturePolicyId><xades:SigPolicyId><xades:Identifier>https://tribunet.hacienda.go.cr/docs/esquemas/2016/v4.2/ResolucionComprobantesElectronicosDGT-R-48-2016_4.2.pdf</xades:Identifier></xades:SigPolicyId><xades:SigPolicyHash><ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/><ds:DigestValue>V8lVVNGDCPen6VELRD1Ja8HARbyJShsLoRW4NNJSMsc=</ds:DigestValue></xades:SigPolicyHash></xades:SignaturePolicyId></xades:SignaturePolicyIdentifier></xades:SignedSignatureProperties></xades:SignedProperties></xades:QualifyingProperties></ds:Object></ds:Signature></TiqueteElectronico>','<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<TiqueteElectronico xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/tiqueteElectronico\" xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n  <Clave>50611032026000208600363001000010400000000021678161</Clave>\n  <ProveedorSistemas>\n    <Nombre>AgropecuarioPOS</Nombre>\n    <Version>1.0</Version>\n  </ProveedorSistemas>\n  <CodigoActividad>7410</CodigoActividad>\n  <NumeroConsecutivo>00100001040000000002</NumeroConsecutivo>\n  <FechaEmision>2026-03-11T01:09:34-06:00</FechaEmision>\n  <Emisor>\n    <Nombre>MANUEL SALVADOR MEJICANO ORTIZ</Nombre>\n    <Identificacion>\n      <Tipo>01</Tipo>\n      <Numero>208600363</Numero>\n    </Identificacion>\n    <Ubicacion>\n      <Provincia>2</Provincia>\n      <Canton>13</Canton>\n      <Distrito>07</Distrito>\n      <OtrasSenas>Costa Rica</OtrasSenas>\n    </Ubicacion>\n    <Telefono>\n      <CodigoPais>506</CodigoPais>\n      <NumTelefono>70280576</NumTelefono>\n    </Telefono>\n    <CorreoElectronico>manuelortizmejicano100@gmail.com</CorreoElectronico>\n  </Emisor>\n  <CondicionVenta>01</CondicionVenta>\n  <MedioPago>02</MedioPago>\n  <DetalleServicio>\n    <LineaDetalle>\n      <NumeroLinea>1</NumeroLinea>\n      <CodigoCabys>1234567890123</CodigoCabys>\n      <Cantidad>1.000</Cantidad>\n      <UnidadMedida>Unid</UnidadMedida>\n      <Detalle>Fertilizante QPK 100 ml</Detalle>\n      <PrecioUnitario>5000.00000</PrecioUnitario>\n      <MontoTotal>5000.00000</MontoTotal>\n      <SubTotal>5000.00000</SubTotal>\n      <ImpuestoNeto>0.00000</ImpuestoNeto>\n      <MontoTotalLinea>5000.00000</MontoTotalLinea>\n    </LineaDetalle>\n  </DetalleServicio>\n  <ResumenFactura>\n    <CodigoTipoMoneda>\n      <CodigoMoneda>CRC</CodigoMoneda>\n      <TipoCambio>1.00000</TipoCambio>\n    </CodigoTipoMoneda>\n    <TotalServGravados>0.00000</TotalServGravados>\n    <TotalServExentos>0.00000</TotalServExentos>\n    <TotalMercanciasGravadas>0.00000</TotalMercanciasGravadas>\n    <TotalMercanciasExentas>5000.00000</TotalMercanciasExentas>\n    <TotalGravado>0.00000</TotalGravado>\n    <TotalExento>5000.00000</TotalExento>\n    <TotalVenta>5000.00000</TotalVenta>\n    <TotalDescuentos>0.00000</TotalDescuentos>\n    <TotalVentaNeta>5000.00000</TotalVentaNeta>\n    <TotalImpuesto>0.00000</TotalImpuesto>\n    <TotalComprobante>5000.00000</TotalComprobante>\n  </ResumenFactura>\n</TiqueteElectronico>','PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48TWVuc2FqZUhhY2llbmRhIHhtbG5zPSJodHRwczovL2Nkbi5jb21wcm9iYW50ZXNlbGVjdHJvbmljb3MuZ28uY3IveG1sLXNjaGVtYXMvdjQuNC9tZW5zYWplSGFjaWVuZGEiPgogICAgPENsYXZlPjUwNjExMDMyMDI2MDAwMjA4NjAwMzYzMDAxMDAwMDEwNDAwMDAwMDAwMDIxNjc4MTYxPC9DbGF2ZT4KICAgIDxOb21icmVFbWlzb3I+REVTQ09OT0NJRE88L05vbWJyZUVtaXNvcj4KICAgIDxUaXBvSWRlbnRpZmljYWNpb25FbWlzb3I+MDE8L1RpcG9JZGVudGlmaWNhY2lvbkVtaXNvcj4KICAgIDxOdW1lcm9DZWR1bGFFbWlzb3I+MDAwMDAwMDAwPC9OdW1lcm9DZWR1bGFFbWlzb3I+CiAgICA8TWVuc2FqZT4zPC9NZW5zYWplPgogICAgPEVzdGFkb01lbnNhamU+UmVjaGF6YWRvPC9Fc3RhZG9NZW5zYWplPgogICAgPERldGFsbGVNZW5zYWplPkVzdGUgY29tcHJvYmFudGUgZnVlIHJlY2liaWRvIGVuIGVsIGFtYmllbnRlIGRlIHBydWViYXMsIHBvciBsbyBjdWFsIG5vIHRpZW5lIHZhbGlkZXogcGFyYSBmaW5lcyB0cmlidXRhcmlvcy4KCkVsIGNvbXByb2JhbnRlIGVsZWN0csOzbmljbyB0aWVuZSBsb3Mgc2lndWllbnRlcyBlcnJvcmVzOiAmIzEzOwpbJiMxMzsKY29kaWdvLCBtZW5zYWplLCBmaWxhLCBjb2x1bW5hJiMxMzsKLTEsICIiY3ZjLXR5cGUuMy4xLjI6IEVsZW1lbnQgJ1Byb3ZlZWRvclNpc3RlbWFzJyBpcyBhIHNpbXBsZSB0eXBlLCBzbyBpdCBtdXN0IGhhdmUgbm8gZWxlbWVudCBpbmZvcm1hdGlvbiBpdGVtIFtjaGlsZHJlbl0uIiIsIDYsIDIzJiMxMzsKJiMxMzsKXTwvRGV0YWxsZU1lbnNhamU+CiAgICA8TW9udG9Ub3RhbEltcHVlc3RvPjA8L01vbnRvVG90YWxJbXB1ZXN0bz4KICAgIDxUb3RhbEZhY3R1cmE+MDwvVG90YWxGYWN0dXJhPgo8ZHM6U2lnbmF0dXJlIHhtbG5zOmRzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjIiBJZD0iaWQtM2Y4MDg4MzYwNWRkZDc5YjhlNDE2NTAwYTk5YjQzMmMiPjxkczpTaWduZWRJbmZvPjxkczpDYW5vbmljYWxpemF0aW9uTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz48ZHM6UmVmZXJlbmNlIElkPSJyLWlkLTEiIFR5cGU9IiIgVVJJPSIiPjxkczpUcmFuc2Zvcm1zPjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy9UUi8xOTk5L1JFQy14cGF0aC0xOTk5MTExNiI+PGRzOlhQYXRoPm5vdChhbmNlc3Rvci1vci1zZWxmOjpkczpTaWduYXR1cmUpPC9kczpYUGF0aD48L2RzOlRyYW5zZm9ybT48ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PC9kczpUcmFuc2Zvcm1zPjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz48ZHM6RGlnZXN0VmFsdWU+VkdHL25qaEhTcDIxUWlwKzVHaWZ2QnJSNC9PNjJMTEpqZkZrY3VwOGNDaz08L2RzOkRpZ2VzdFZhbHVlPjwvZHM6UmVmZXJlbmNlPjxkczpSZWZlcmVuY2UgVHlwZT0iaHR0cDovL3VyaS5ldHNpLm9yZy8wMTkwMyNTaWduZWRQcm9wZXJ0aWVzIiBVUkk9IiN4YWRlcy1pZC0zZjgwODgzNjA1ZGRkNzliOGU0MTY1MDBhOTliNDMyYyI+PGRzOlRyYW5zZm9ybXM+PGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPjwvZHM6VHJhbnNmb3Jtcz48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzOkRpZ2VzdFZhbHVlPkVIWkNvcy9rV2NlVStFMzNGOWVHSEcvMWJJbXdLYzRPMmtaZHVoc2hqWUk9PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48L2RzOlNpZ25lZEluZm8+PGRzOlNpZ25hdHVyZVZhbHVlIElkPSJ2YWx1ZS1pZC0zZjgwODgzNjA1ZGRkNzliOGU0MTY1MDBhOTliNDMyYyI+aGxsMHhTeTh0R2RhOWQ2RVVhUnFhU0djWEpyeHNIQVlraHRUZk14TVladyt0Qk1KVzhKVWNnL2J6dkcvd09ydklDWmNBZVlERFBnK1k3SEZiUmx4Uk5FVlg3Z1NsVkYxWDJrZmJaYkNtWUFZMG83cnZOSy9GYVAzZTNjdWZsRGpjbW0rc1o4WTZ4SnZrOUZmbGVyU0JLaVgyeTFkQVorSjRDVWhQbkowUFdTOTVvVHlzdmg3TUJHbGoxTHRWLzdDYTQxUm9kRlI0V0lTU05YTGhTbmYyNDFDZW5WRXFDWXo0b1dyaHdMNFo2Uk15dUlqYWhLeW55UGx0dVYvVHdodkN4dzdtTXVQb0gwdit0TFM1Q1VwemNNL0VpNjJ5WTVTM2t3ZTdPcjZHc01vUE5lYUp4RjNaVUZQWFAyQWNiSEFXY1ZXcldweUVTZWhMR0JNenQ0THZnPT08L2RzOlNpZ25hdHVyZVZhbHVlPjxkczpLZXlJbmZvPjxkczpYNTA5RGF0YT48ZHM6WDUwOUNlcnRpZmljYXRlPk1JSUZoekNDQkcrZ0F3SUJBZ0lUU0FBQUNGeS8vZjJIT2p0bzlBQUNBQUFJWERBTkJna3Foa2lHOXcwQkFRc0ZBRENCbXpFWk1CY0dBMVVFQlJNUVExQktMVFF0TURBd0xUQXdOREF4TnpFTE1Ba0dBMVVFQmhNQ1ExSXhKREFpQmdOVkJBb1RHMEpCVGtOUElFTkZUbFJTUVV3Z1JFVWdRMDlUVkVFZ1VrbERRVEVpTUNBR0ExVUVDeE1aUkVsV1NWTkpUMDRnVTBsVFZFVk5RVk1nUkVVZ1VFRkhUekVuTUNVR0ExVUVBeE1lUTBFZ1UwbE9VRVVnTFNCUVJWSlRUMDVCSUVwVlVrbEVTVU5CSUhZeU1CNFhEVEkxTURZeU5ERTJNVGcxTWxvWERUSTVNRFl5TXpFMk1UZzFNbG93ZnpFWk1CY0dBMVVFQlJNUVExQktMVEl0TVRBd0xUQTBNakF3TlRFTE1Ba0dBMVVFQmhNQ1ExSXhHVEFYQmdOVkJBb1RFRkJGVWxOUFRrRWdTbFZTU1VSSlEwRXhPakE0QmdOVkJBTVRNVVZUVkVGRVR5MU5TVTVKVTFSRlVrbFBJRVJGSUVoQlEwbEZUa1JCSUNoVFJVeE1UeUJGVEVWRFZGSlBUa2xEVHlrd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUN0K1J5Sk5nWXFPdXA2M1dlRlNXb3ZlYS94K0ZsVHBuRHJFcXJNd2tvczVXMWdCK28vT0EzcytBRVJCOEg3MVdzeFJwbmlQZTZEZ0FKOC9EN09tQ0ZtRk1pT0lxQyszd0dWbmdxa3NjRDZxbkJ5dzF1YUdLTmdiR1JWWmFUWXFHQ3pyNnB6MGZsSmpRS0EzbTlGMnVYZWRwdklaKzVPbndwY3cvRThCc1ExUE5kRXhpckdoczJNenI1Q1pEdEg2ODdWRUxTK3lCK2hWbTk3a1dJWjhid1Z1VWE1cVBvVXdJeElsNTN6MGk5SzdncnRmQS9XMVc1QXBqblBLdlFNQVRmS05kUEdDRVhKZFBrN1haK0FwdHZtdHdrUE1OaXRlWStheG5mbGM5WjhxSUNFaGZlZ2RDbTRTMy9kbVpSM01aT1RHOE9mUzVSVG9iWWVaMk1ORWJqbEFnTUJBQUdqZ2dIZE1JSUIyVEFPQmdOVkhROEJBZjhFQkFNQ0JzQXdIUVlEVlIwT0JCWUVGS0NlTW52VUhLcGxaeWtRRWZoVUU0cVllTExrTUI4R0ExVWRJd1FZTUJhQUZEYXM1TUJ5MnZOK0hleVQ3TXNqNGNxdWVVcTRNR01HQTFVZEh3UmNNRm93V0tCV29GU0dVbWgwZEhBNkx5OW1aR2t1YzJsdWNHVXVabWt1WTNJdmNtVndiM05wZEc5eWFXOHZRMEVsTWpCVFNVNVFSU1V5TUMwbE1qQlFSVkpUVDA1QkpUSXdTbFZTU1VSSlEwRWxNakIyTWlneUtTNWpjbXd3Z1pvR0NDc0dBUVVGQndFQkJJR05NSUdLTUNnR0NDc0dBUVVGQnpBQmhoeG9kSFJ3T2k4dmIyTnpjQzV6YVc1d1pTNW1hUzVqY2k5dlkzTndNRjRHQ0NzR0FRVUZCekFDaGxKb2RIUndPaTh2Wm1ScExuTnBibkJsTG1acExtTnlMM0psY0c5emFYUnZjbWx2TDBOQkpUSXdVMGxPVUVVbE1qQXRKVEl3VUVWU1UwOU9RU1V5TUVwVlVrbEVTVU5CSlRJd2RqSW9NaWt1WTNKME1Ed0dDU3NHQVFRQmdqY1ZCd1F2TUMwR0pTc0dBUVFCZ2pjVkNJWEU2bHVDMGVNMWxaRWJndm1YR0lhbHkydUJmNEdRaG5YZXNsd0NBV1FDQVFrd0V3WURWUjBsQkF3d0NnWUlLd1lCQlFVSEF3UXdHd1lKS3dZQkJBR0NOeFVLQkE0d0REQUtCZ2dyQmdFRkJRY0RCREFWQmdOVkhTQUVEakFNTUFvR0NHQ0JQQUVCQVFFR01BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQU1NdG9jYk1Ra0RzYmd2M2Vwb0F5RTk3RDlqcDd4OWZxNXFoY05HOWYybDZjV21OanFvMGJOOXJoSHdQcjM3VitxMHZrSUR0SkVpb3FmNVk0WVU5YjRnajg1TGVsdEdhMDdhRGhMVE1zZEpQZG8rSkhPaEF5YUI4K1JYV0VXZy9sa0NuSmZJQnlKRmo0MTZXMHYwVTM3VE5jODhUc09Za0ZqcURaVlpBSVQ1clB0VWNVNWp1a0dpUWErbHdNZDJaZGZlbk43eWZpek9ySHpUOXp5Z3pzSklZdjJCbytocWs4MGU0UnpDaUlkSVd1bzJOVnBKMkZIMXo5S1E4UVVLM0ZsY0lmNGJUdHFwVGh1QWtXSjhNeVptUHY5L2ZvN1MzcjJNTlE2TVErL3cwYy9IL0RPYjZueklobm1JVytqSnhtOFdwdVBialZ5Sk5qeGRLNzNQL25WPC9kczpYNTA5Q2VydGlmaWNhdGU+PC9kczpYNTA5RGF0YT48L2RzOktleUluZm8+PGRzOk9iamVjdD48eGFkZXM6UXVhbGlmeWluZ1Byb3BlcnRpZXMgeG1sbnM6eGFkZXM9Imh0dHA6Ly91cmkuZXRzaS5vcmcvMDE5MDMvdjEuMy4yIyIgVGFyZ2V0PSIjaWQtM2Y4MDg4MzYwNWRkZDc5YjhlNDE2NTAwYTk5YjQzMmMiPjx4YWRlczpTaWduZWRQcm9wZXJ0aWVzIElkPSJ4YWRlcy1pZC0zZjgwODgzNjA1ZGRkNzliOGU0MTY1MDBhOTliNDMyYyI+PHhhZGVzOlNpZ25lZFNpZ25hdHVyZVByb3BlcnRpZXM+PHhhZGVzOlNpZ25pbmdUaW1lPjIwMjYtMDMtMTFUMDc6MDk6MzhaPC94YWRlczpTaWduaW5nVGltZT48eGFkZXM6U2lnbmluZ0NlcnRpZmljYXRlPjx4YWRlczpDZXJ0Pjx4YWRlczpDZXJ0RGlnZXN0PjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjc2hhMSIvPjxkczpEaWdlc3RWYWx1ZT5NZ1dPZnl1blovbDJvMy9WZHNOV2dEYU5aTWs9PC9kczpEaWdlc3RWYWx1ZT48L3hhZGVzOkNlcnREaWdlc3Q+PHhhZGVzOklzc3VlclNlcmlhbD48ZHM6WDUwOUlzc3Vlck5hbWU+Q049Q0EgU0lOUEUgLSBQRVJTT05BIEpVUklESUNBIHYyLE9VPURJVklTSU9OIFNJU1RFTUFTIERFIFBBR08sTz1CQU5DTyBDRU5UUkFMIERFIENPU1RBIFJJQ0EsQz1DUiwyLjUuNC41PSMxMzEwNDM1MDRhMmQzNDJkMzAzMDMwMmQzMDMwMzQzMDMxMzc8L2RzOlg1MDlJc3N1ZXJOYW1lPjxkczpYNTA5U2VyaWFsTnVtYmVyPjE2MDU2NTM2NjU0MDk2MTQyMDY4Nzc3MDM4ODIyMzkxODMwNjE2NjkzODIyMzY8L2RzOlg1MDlTZXJpYWxOdW1iZXI+PC94YWRlczpJc3N1ZXJTZXJpYWw+PC94YWRlczpDZXJ0PjwveGFkZXM6U2lnbmluZ0NlcnRpZmljYXRlPjwveGFkZXM6U2lnbmVkU2lnbmF0dXJlUHJvcGVydGllcz48eGFkZXM6U2lnbmVkRGF0YU9iamVjdFByb3BlcnRpZXM+PHhhZGVzOkRhdGFPYmplY3RGb3JtYXQgT2JqZWN0UmVmZXJlbmNlPSIjci1pZC0xIj48eGFkZXM6TWltZVR5cGU+YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtPC94YWRlczpNaW1lVHlwZT48L3hhZGVzOkRhdGFPYmplY3RGb3JtYXQ+PC94YWRlczpTaWduZWREYXRhT2JqZWN0UHJvcGVydGllcz48L3hhZGVzOlNpZ25lZFByb3BlcnRpZXM+PC94YWRlczpRdWFsaWZ5aW5nUHJvcGVydGllcz48L2RzOk9iamVjdD48L2RzOlNpZ25hdHVyZT48L01lbnNhamVIYWNpZW5kYT4=',52);
/*!40000 ALTER TABLE `electronic_invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_consecutives`
--

DROP TABLE IF EXISTS `invoice_consecutives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_consecutives` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `punto_venta` varchar(5) NOT NULL DEFAULT '00001',
  `sucursal` varchar(3) NOT NULL,
  `tipo_documento` varchar(2) NOT NULL,
  `ultimo_consecutivo` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_2vl33r3mofxr8plvgalpa5efu` (`tipo_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_consecutives`
--

LOCK TABLES `invoice_consecutives` WRITE;
/*!40000 ALTER TABLE `invoice_consecutives` DISABLE KEYS */;
INSERT INTO `invoice_consecutives` VALUES (1,'00001','001','04',2),(2,'00001','001','01',4);
/*!40000 ALTER TABLE `invoice_consecutives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_records`
--

DROP TABLE IF EXISTS `payment_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) NOT NULL,
  `new_balance` decimal(12,2) DEFAULT NULL,
  `payment_date` datetime(6) NOT NULL,
  `previous_balance` decimal(12,2) DEFAULT NULL,
  `account_receivable_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKabfn4lfi72yi1jc3nkhol8ju4` (`account_receivable_id`),
  CONSTRAINT `FKabfn4lfi72yi1jc3nkhol8ju4` FOREIGN KEY (`account_receivable_id`) REFERENCES `accounts_receivable` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_records`
--

LOCK TABLES `payment_records` WRITE;
/*!40000 ALTER TABLE `payment_records` DISABLE KEYS */;
INSERT INTO `payment_records` VALUES (1,400.00,23880.00,'2026-03-06 09:24:17.764912',24280.00,1),(2,4000.00,19880.00,'2026-03-06 09:24:34.437692',23880.00,1),(3,40000.00,-20120.00,'2026-03-06 09:39:33.682452',19880.00,1),(4,13560.00,0.00,'2026-03-08 08:29:25.782810',13560.00,2),(5,20000.00,7120.00,'2026-03-09 00:02:44.429989',27120.00,5),(6,20000.00,2400.00,'2026-03-09 18:13:01.556457',22400.00,8);
/*!40000 ALTER TABLE `payment_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_records_aud`
--

DROP TABLE IF EXISTS `payment_records_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_records_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `new_balance` decimal(12,2) DEFAULT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `previous_balance` decimal(12,2) DEFAULT NULL,
  `account_receivable_id` bigint DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FK4rkdt3mgk0p9trwyre5oef1kn` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_records_aud`
--

LOCK TABLES `payment_records_aud` WRITE;
/*!40000 ALTER TABLE `payment_records_aud` DISABLE KEYS */;
INSERT INTO `payment_records_aud` VALUES (1,15,0,400.00,23880.00,'2026-03-06 09:24:17.764912',24280.00,1),(2,17,0,4000.00,19880.00,'2026-03-06 09:24:34.437692',23880.00,1),(3,23,0,40000.00,-20120.00,'2026-03-06 09:39:33.682452',19880.00,1),(4,48,0,13560.00,0.00,'2026-03-08 08:29:25.782810',13560.00,2),(5,56,0,20000.00,7120.00,'2026-03-09 00:02:44.429989',27120.00,5),(6,84,0,20000.00,2400.00,'2026-03-09 18:13:01.556457',22400.00,8);
/*!40000 ALTER TABLE `payment_records_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cabys_code` varchar(13) DEFAULT NULL,
  `internal_code` varchar(255) DEFAULT NULL,
  `is_agrochemical_insufficiency` bit(1) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `purchase_cost` decimal(12,2) DEFAULT NULL,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `stock_quantity` int DEFAULT NULL,
  `version` bigint DEFAULT NULL,
  `id_categoria` bigint DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT '13.00',
  PRIMARY KEY (`id`),
  KEY `FK9mqdhlru260qtj4qgnr6qso90` (`id_categoria`),
  CONSTRAINT `FK9mqdhlru260qtj4qgnr6qso90` FOREIGN KEY (`id_categoria`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,9,34,2,0.00),(2,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,10,52,2,0.00);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products_aud`
--

DROP TABLE IF EXISTS `products_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `cabys_code` varchar(255) DEFAULT NULL,
  `internal_code` varchar(255) DEFAULT NULL,
  `is_agrochemical_insufficiency` bit(1) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `purchase_cost` decimal(12,2) DEFAULT NULL,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `stock_quantity` int DEFAULT NULL,
  `id_categoria` bigint DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT '13.00',
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FKis5p0x6t8gvib9m5ra1fiybi3` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products_aud`
--

LOCK TABLES `products_aud` WRITE;
/*!40000 ALTER TABLE `products_aud` DISABLE KEYS */;
INSERT INTO `products_aud` VALUES (1,1,0,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,50,1,13.00),(1,2,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,46,1,13.00),(1,3,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,39,1,13.00),(1,4,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,39,2,13.00),(1,5,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,37,2,13.00),(2,6,0,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,100,2,13.00),(1,7,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,35,2,13.00),(2,7,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,98,2,13.00),(1,9,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,34,2,13.00),(2,9,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,97,2,13.00),(1,12,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,33,2,13.00),(2,12,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,94,2,13.00),(1,18,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,32,2,13.00),(2,18,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,92,2,13.00),(1,19,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,31,2,13.00),(2,19,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,91,2,13.00),(1,20,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,30,2,13.00),(2,20,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,90,2,13.00),(1,21,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,28,2,13.00),(2,21,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,89,2,13.00),(1,24,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,27,2,13.00),(2,24,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,88,2,13.00),(1,25,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,26,2,13.00),(2,25,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,87,2,13.00),(1,26,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,25,2,13.00),(2,26,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,86,2,13.00),(1,27,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,23,2,13.00),(2,27,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,83,2,13.00),(1,28,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,20,2,13.00),(2,28,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,80,2,13.00),(2,36,1,'1234567890987','3232',_binary '\0','23',5000.00,7000.00,74,2,13.00),(2,38,1,'1234567890987','3232',_binary '\0','23',1.00,7000.00,74,2,13.00),(2,39,1,'1234567890987','3232',_binary '\0','23',1.50,7000.00,74,2,13.00),(1,40,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,17,2,13.00),(2,40,1,'1234567890987','3232',_binary '\0','23',1.50,7000.00,72,2,13.00),(2,43,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,72,2,13.00),(1,44,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,15,2,13.00),(2,44,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,71,2,13.00),(1,45,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,13,2,13.00),(2,45,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,69,2,13.00),(1,46,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,11,2,13.00),(2,46,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,67,2,13.00),(1,49,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,10,2,13.00),(2,49,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,65,2,13.00),(1,52,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,9,2,13.00),(2,52,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,64,2,13.00),(1,54,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,8,2,13.00),(2,54,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,63,2,13.00),(2,58,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,59,2,13.00),(1,63,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,8,2,0.00),(2,67,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,59,2,0.00),(1,68,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,7,2,0.00),(2,68,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,57,2,0.00),(1,69,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,6,2,0.00),(2,69,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,56,2,0.00),(1,70,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,5,2,0.00),(2,70,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,55,2,0.00),(1,71,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,4,2,0.00),(2,71,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,54,2,0.00),(1,72,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,3,2,0.00),(2,72,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,53,2,0.00),(2,73,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,50,2,0.00),(2,74,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,48,2,0.00),(2,75,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,45,2,0.00),(2,76,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,43,2,0.00),(2,77,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,41,2,0.00),(2,78,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,39,2,0.00),(2,79,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,36,2,0.00),(2,82,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,32,2,0.00),(2,86,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,29,2,0.00),(1,88,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,2,2,0.00),(2,88,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,27,2,0.00),(2,90,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,24,2,0.00),(2,92,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,20,2,0.00),(2,94,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,16,2,0.00),(2,96,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,12,2,0.00),(2,98,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,9,2,0.00),(2,100,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,6,2,0.00),(2,102,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,5,2,0.00),(2,104,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,4,2,0.00),(1,106,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,1,2,0.00),(2,106,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,3,2,0.00),(2,108,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,1,2,0.00),(1,110,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,0,2,0.00),(2,112,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,0,2,0.00),(1,113,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,10,2,0.00),(2,114,1,'1234567890987','3232',_binary '\0','Prueba',1.50,7000.00,10,2,0.00),(1,116,1,'1234567890123','2353',_binary '\0','Fertilizante QPK 100 ml',3000.00,5000.00,9,2,0.00);
/*!40000 ALTER TABLE `products_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revinfo`
--

DROP TABLE IF EXISTS `revinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revinfo` (
  `rev` int NOT NULL AUTO_INCREMENT,
  `revtstmp` bigint DEFAULT NULL,
  PRIMARY KEY (`rev`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revinfo`
--

LOCK TABLES `revinfo` WRITE;
/*!40000 ALTER TABLE `revinfo` DISABLE KEYS */;
INSERT INTO `revinfo` VALUES (1,1772599944580),(2,1772600974187),(3,1772600982067),(4,1772601051879),(5,1772601062590),(6,1772601439304),(7,1772601474307),(8,1772603458492),(9,1772603482552),(10,1772604276816),(11,1772787900273),(12,1772788002445),(13,1772788261413),(14,1772789057714),(15,1772789057781),(16,1772789074420),(17,1772789074442),(18,1772789118876),(19,1772789162402),(20,1772789185081),(21,1772789557142),(22,1772789973645),(23,1772789973702),(24,1772791087745),(25,1772791311165),(26,1772791536419),(27,1772791714376),(28,1772792100120),(29,1772771938428),(30,1772772473058),(31,1772817651371),(32,1772817942585),(33,1772818283121),(34,1772820800820),(35,1772821030190),(36,1772821112243),(37,1772822601011),(38,1772822953525),(39,1772822966393),(40,1772826410664),(41,1772955190712),(42,1772955652319),(43,1772956633560),(44,1772956708342),(45,1772957530589),(46,1772958376195),(47,1772958565764),(48,1772958565804),(49,1772959536961),(50,1773010146039),(51,1773012884311),(52,1773013753809),(53,1773014366012),(54,1773014442227),(55,1773014564402),(56,1773014564443),(57,1773015877089),(58,1773016459169),(59,1773017091268),(60,1773017165710),(61,1773023048037),(62,1773023976092),(63,1773024185178),(64,1773024614409),(65,1773024702794),(66,1773024885669),(67,1773025844136),(68,1773026357823),(69,1773026565356),(70,1773026856639),(71,1773026975400),(72,1773027425819),(73,1773027798031),(74,1773027917739),(75,1773027927821),(76,1773027988123),(77,1773028246069),(78,1773028263434),(79,1773028274196),(80,1773079722684),(81,1773079866112),(82,1773079884825),(83,1773079981539),(84,1773079981562),(85,1773080070263),(86,1773080629463),(87,1773207526108),(88,1773207779465),(89,1773208260200),(90,1773208437933),(91,1773208505176),(92,1773208518043),(93,1773208649423),(94,1773208673584),(95,1773208919414),(96,1773208973778),(97,1773210117792),(98,1773210129594),(99,1773210270126),(100,1773210277977),(101,1773210413714),(102,1773210435652),(103,1773210708256),(104,1773210758816),(105,1773211278470),(106,1773211296336),(107,1773211641676),(108,1773211692162),(109,1773211876965),(110,1773211898489),(111,1773212396630),(112,1773212408517),(113,1773212580582),(114,1773212594110),(115,1773212946924),(116,1773212974933);
/*!40000 ALTER TABLE `revinfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` enum('ROLE_USER','ROLE_MODERATOR','ROLE_ADMIN') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ofx66keruapi6vyqpv6f2or37` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ROLE_USER'),(2,'ROLE_MODERATOR'),(3,'ROLE_ADMIN');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `item_discount` decimal(12,2) DEFAULT NULL,
  `item_tax` decimal(12,2) DEFAULT NULL,
  `line_total` decimal(12,2) DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_cost_at_sale` decimal(12,2) DEFAULT NULL,
  `unit_price_at_sale` decimal(12,2) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `sale_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8g0sjiqs7tg055o06p6wawu39` (`product_id`),
  KEY `FK7tcpbc5c5mpnm8fl2phl8ep7l` (`sale_id`),
  CONSTRAINT `FK7tcpbc5c5mpnm8fl2phl8ep7l` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`),
  CONSTRAINT `FK8g0sjiqs7tg055o06p6wawu39` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES (1,NULL,NULL,NULL,4,3000.00,5000.00,1,1),(2,NULL,NULL,NULL,7,3000.00,5000.00,1,2),(3,NULL,NULL,NULL,2,3000.00,5000.00,1,3),(4,NULL,NULL,NULL,2,5000.00,7000.00,2,4),(5,NULL,NULL,NULL,2,3000.00,5000.00,1,4),(6,NULL,NULL,NULL,1,5000.00,7000.00,2,5),(7,NULL,NULL,NULL,1,3000.00,5000.00,1,5),(8,NULL,NULL,NULL,3,5000.00,7000.00,2,6),(9,NULL,NULL,NULL,1,3000.00,5000.00,1,6),(10,NULL,NULL,NULL,2,5000.00,7000.00,2,7),(11,NULL,NULL,NULL,1,3000.00,5000.00,1,7),(12,NULL,NULL,NULL,1,5000.00,7000.00,2,8),(13,NULL,NULL,NULL,1,3000.00,5000.00,1,8),(14,NULL,NULL,NULL,1,5000.00,7000.00,2,9),(15,NULL,NULL,NULL,1,3000.00,5000.00,1,9),(16,NULL,NULL,NULL,2,3000.00,5000.00,1,10),(17,NULL,NULL,NULL,1,5000.00,7000.00,2,10),(18,NULL,NULL,NULL,1,5000.00,7000.00,2,11),(19,NULL,NULL,NULL,1,3000.00,5000.00,1,11),(20,NULL,NULL,NULL,1,5000.00,7000.00,2,12),(21,NULL,NULL,NULL,1,3000.00,5000.00,1,12),(22,NULL,NULL,NULL,1,5000.00,7000.00,2,13),(23,NULL,NULL,NULL,1,3000.00,5000.00,1,13),(24,NULL,NULL,NULL,3,5000.00,7000.00,2,14),(25,NULL,NULL,NULL,2,3000.00,5000.00,1,14),(26,NULL,NULL,NULL,3,5000.00,7000.00,2,15),(27,NULL,NULL,NULL,3,3000.00,5000.00,1,15),(28,NULL,NULL,NULL,6,5000.00,7000.00,2,16),(29,NULL,NULL,NULL,3,3000.00,5000.00,1,17),(30,NULL,NULL,NULL,2,1.50,7000.00,2,17),(31,NULL,NULL,NULL,1,1.50,7000.00,2,18),(32,NULL,NULL,NULL,2,3000.00,5000.00,1,18),(33,NULL,NULL,NULL,2,1.50,7000.00,2,19),(34,NULL,NULL,NULL,2,3000.00,5000.00,1,19),(35,NULL,NULL,NULL,2,1.50,7000.00,2,20),(36,NULL,NULL,NULL,2,3000.00,5000.00,1,20),(37,NULL,NULL,NULL,2,1.50,7000.00,2,21),(38,NULL,NULL,NULL,1,3000.00,5000.00,1,21),(39,NULL,NULL,NULL,1,1.50,7000.00,2,22),(40,NULL,NULL,NULL,1,3000.00,5000.00,1,22),(41,NULL,NULL,7000.00,1,1.50,7000.00,2,23),(42,NULL,NULL,5000.00,1,3000.00,5000.00,1,23),(43,NULL,NULL,28000.00,4,1.50,7000.00,2,24),(44,NULL,NULL,14000.00,2,1.50,7000.00,2,25),(45,NULL,NULL,5000.00,1,3000.00,5000.00,1,25),(46,NULL,NULL,5000.00,1,3000.00,5000.00,1,26),(47,NULL,NULL,7000.00,1,1.50,7000.00,2,26),(48,NULL,NULL,5000.00,1,3000.00,5000.00,1,27),(49,NULL,NULL,7000.00,1,1.50,7000.00,2,27),(50,NULL,NULL,5000.00,1,3000.00,5000.00,1,28),(51,NULL,NULL,7000.00,1,1.50,7000.00,2,28),(52,NULL,NULL,7000.00,1,1.50,7000.00,2,29),(53,NULL,NULL,5000.00,1,3000.00,5000.00,1,29),(54,NULL,NULL,21000.00,3,1.50,7000.00,2,30),(55,NULL,NULL,14000.00,2,1.50,7000.00,2,31),(56,NULL,NULL,21000.00,3,1.50,7000.00,2,32),(57,NULL,NULL,14000.00,2,1.50,7000.00,2,33),(58,NULL,NULL,14000.00,2,1.50,7000.00,2,34),(59,NULL,NULL,14000.00,2,1.50,7000.00,2,35),(60,NULL,NULL,21000.00,3,1.50,7000.00,2,36),(61,NULL,NULL,28000.00,4,1.50,7000.00,2,37),(62,NULL,NULL,21000.00,3,1.50,7000.00,2,38),(63,NULL,NULL,14000.00,2,1.50,7000.00,2,39),(64,NULL,NULL,5000.00,1,3000.00,5000.00,1,39),(65,NULL,NULL,21000.00,3,1.50,7000.00,2,40),(66,NULL,NULL,28000.00,4,1.50,7000.00,2,41),(67,NULL,NULL,28000.00,4,1.50,7000.00,2,42),(68,NULL,NULL,28000.00,4,1.50,7000.00,2,43),(69,NULL,NULL,21000.00,3,1.50,7000.00,2,44),(70,NULL,NULL,21000.00,3,1.50,7000.00,2,45),(71,NULL,NULL,7000.00,1,1.50,7000.00,2,46),(72,NULL,NULL,7000.00,1,1.50,7000.00,2,47),(73,NULL,NULL,7000.00,1,1.50,7000.00,2,48),(74,NULL,NULL,5000.00,1,3000.00,5000.00,1,48),(75,NULL,NULL,14000.00,2,1.50,7000.00,2,49),(76,NULL,NULL,5000.00,1,3000.00,5000.00,1,50),(77,NULL,NULL,7000.00,1,1.50,7000.00,2,51),(78,NULL,NULL,5000.00,1,3000.00,5000.00,1,52);
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items_aud`
--

DROP TABLE IF EXISTS `sale_items_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `item_discount` decimal(12,2) DEFAULT NULL,
  `item_tax` decimal(12,2) DEFAULT NULL,
  `line_total` decimal(12,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_cost_at_sale` decimal(12,2) DEFAULT NULL,
  `unit_price_at_sale` decimal(12,2) DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  `sale_id` bigint DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FKaw5iwsekyabdpdqca2isu6xr0` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items_aud`
--

LOCK TABLES `sale_items_aud` WRITE;
/*!40000 ALTER TABLE `sale_items_aud` DISABLE KEYS */;
INSERT INTO `sale_items_aud` VALUES (1,2,0,NULL,NULL,NULL,4,3000.00,5000.00,1,1),(2,3,0,NULL,NULL,NULL,7,3000.00,5000.00,1,2),(3,5,0,NULL,NULL,NULL,2,3000.00,5000.00,1,3),(4,7,0,NULL,NULL,NULL,2,5000.00,7000.00,2,4),(5,7,0,NULL,NULL,NULL,2,3000.00,5000.00,1,4),(6,9,0,NULL,NULL,NULL,1,5000.00,7000.00,2,5),(7,9,0,NULL,NULL,NULL,1,3000.00,5000.00,1,5),(8,12,0,NULL,NULL,NULL,3,5000.00,7000.00,2,6),(9,12,0,NULL,NULL,NULL,1,3000.00,5000.00,1,6),(10,18,0,NULL,NULL,NULL,2,5000.00,7000.00,2,7),(11,18,0,NULL,NULL,NULL,1,3000.00,5000.00,1,7),(12,19,0,NULL,NULL,NULL,1,5000.00,7000.00,2,8),(13,19,0,NULL,NULL,NULL,1,3000.00,5000.00,1,8),(14,20,0,NULL,NULL,NULL,1,5000.00,7000.00,2,9),(15,20,0,NULL,NULL,NULL,1,3000.00,5000.00,1,9),(16,21,0,NULL,NULL,NULL,2,3000.00,5000.00,1,10),(17,21,0,NULL,NULL,NULL,1,5000.00,7000.00,2,10),(18,24,0,NULL,NULL,NULL,1,5000.00,7000.00,2,11),(19,24,0,NULL,NULL,NULL,1,3000.00,5000.00,1,11),(20,25,0,NULL,NULL,NULL,1,5000.00,7000.00,2,12),(21,25,0,NULL,NULL,NULL,1,3000.00,5000.00,1,12),(22,26,0,NULL,NULL,NULL,1,5000.00,7000.00,2,13),(23,26,0,NULL,NULL,NULL,1,3000.00,5000.00,1,13),(24,27,0,NULL,NULL,NULL,3,5000.00,7000.00,2,14),(25,27,0,NULL,NULL,NULL,2,3000.00,5000.00,1,14),(26,28,0,NULL,NULL,NULL,3,5000.00,7000.00,2,15),(27,28,0,NULL,NULL,NULL,3,3000.00,5000.00,1,15),(28,36,0,NULL,NULL,NULL,6,5000.00,7000.00,2,16),(29,40,0,NULL,NULL,NULL,3,3000.00,5000.00,1,17),(30,40,0,NULL,NULL,NULL,2,1.50,7000.00,2,17),(31,44,0,NULL,NULL,NULL,1,1.50,7000.00,2,18),(32,44,0,NULL,NULL,NULL,2,3000.00,5000.00,1,18),(33,45,0,NULL,NULL,NULL,2,1.50,7000.00,2,19),(34,45,0,NULL,NULL,NULL,2,3000.00,5000.00,1,19),(35,46,0,NULL,NULL,NULL,2,1.50,7000.00,2,20),(36,46,0,NULL,NULL,NULL,2,3000.00,5000.00,1,20),(37,49,0,NULL,NULL,NULL,2,1.50,7000.00,2,21),(38,49,0,NULL,NULL,NULL,1,3000.00,5000.00,1,21),(39,52,0,NULL,NULL,NULL,1,1.50,7000.00,2,22),(40,52,0,NULL,NULL,NULL,1,3000.00,5000.00,1,22),(41,54,0,NULL,NULL,7000.00,1,1.50,7000.00,2,23),(42,54,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,23),(43,58,0,NULL,NULL,28000.00,4,1.50,7000.00,2,24),(44,68,0,NULL,NULL,14000.00,2,1.50,7000.00,2,25),(45,68,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,25),(46,69,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,26),(47,69,0,NULL,NULL,7000.00,1,1.50,7000.00,2,26),(48,70,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,27),(49,70,0,NULL,NULL,7000.00,1,1.50,7000.00,2,27),(50,71,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,28),(51,71,0,NULL,NULL,7000.00,1,1.50,7000.00,2,28),(52,72,0,NULL,NULL,7000.00,1,1.50,7000.00,2,29),(53,72,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,29),(54,73,0,NULL,NULL,21000.00,3,1.50,7000.00,2,30),(55,74,0,NULL,NULL,14000.00,2,1.50,7000.00,2,31),(56,75,0,NULL,NULL,21000.00,3,1.50,7000.00,2,32),(57,76,0,NULL,NULL,14000.00,2,1.50,7000.00,2,33),(58,77,0,NULL,NULL,14000.00,2,1.50,7000.00,2,34),(59,78,0,NULL,NULL,14000.00,2,1.50,7000.00,2,35),(60,79,0,NULL,NULL,21000.00,3,1.50,7000.00,2,36),(61,82,0,NULL,NULL,28000.00,4,1.50,7000.00,2,37),(62,86,0,NULL,NULL,21000.00,3,1.50,7000.00,2,38),(63,88,0,NULL,NULL,14000.00,2,1.50,7000.00,2,39),(64,88,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,39),(65,90,0,NULL,NULL,21000.00,3,1.50,7000.00,2,40),(66,92,0,NULL,NULL,28000.00,4,1.50,7000.00,2,41),(67,94,0,NULL,NULL,28000.00,4,1.50,7000.00,2,42),(68,96,0,NULL,NULL,28000.00,4,1.50,7000.00,2,43),(69,98,0,NULL,NULL,21000.00,3,1.50,7000.00,2,44),(70,100,0,NULL,NULL,21000.00,3,1.50,7000.00,2,45),(71,102,0,NULL,NULL,7000.00,1,1.50,7000.00,2,46),(72,104,0,NULL,NULL,7000.00,1,1.50,7000.00,2,47),(73,106,0,NULL,NULL,7000.00,1,1.50,7000.00,2,48),(74,106,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,48),(75,108,0,NULL,NULL,14000.00,2,1.50,7000.00,2,49),(76,110,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,50),(77,112,0,NULL,NULL,7000.00,1,1.50,7000.00,2,51),(78,116,0,NULL,NULL,5000.00,1,3000.00,5000.00,1,52);
/*!40000 ALTER TABLE `sale_items_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `client_identification` varchar(255) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `final_total` decimal(12,2) DEFAULT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `payment_method` enum('CASH','CARD','TRANSFER','CREDIT') NOT NULL,
  `status` enum('COMPLETED','CANCELLED','CONTINGENCY_PENDING') NOT NULL,
  `subtotal` decimal(12,2) DEFAULT NULL,
  `total_discount` decimal(12,2) DEFAULT NULL,
  `total_gross_profit` decimal(12,2) DEFAULT NULL,
  `total_tax` decimal(12,2) DEFAULT NULL,
  `id_client` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_l49hpufyld5nu2vqun7811hgh` (`invoice_number`),
  KEY `FKn2nfjarypc9tm3ram2vmgy58g` (`id_client`),
  CONSTRAINT `FKn2nfjarypc9tm3ram2vmgy58g` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,NULL,NULL,'SYSTEM','2026-03-04 05:09:34.099018',22600.00,'FAC-POS-1772600973997','CASH','COMPLETED',20000.00,NULL,NULL,2600.00,NULL),(2,NULL,NULL,'SYSTEM','2026-03-04 05:09:42.055577',39550.00,'FAC-POS-1772600982051','CARD','COMPLETED',35000.00,NULL,NULL,4550.00,NULL),(3,NULL,NULL,'SYSTEM','2026-03-04 05:11:02.573975',11300.00,'FAC-POS-1772601062567','CASH','COMPLETED',10000.00,NULL,NULL,1300.00,NULL),(4,NULL,NULL,'SYSTEM','2026-03-04 05:17:54.275191',27120.00,'FAC-POS-1772601474256','CASH','COMPLETED',24000.00,NULL,NULL,3120.00,NULL),(5,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-04 05:51:22.483860',13560.00,'FAC-POS-1772603482400','CASH','COMPLETED',12000.00,NULL,NULL,1560.00,1),(6,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 09:06:42.301707',29380.00,'FAC-POS-1772788002158','CREDIT','COMPLETED',26000.00,NULL,NULL,3380.00,1),(7,NULL,NULL,'SYSTEM','2026-03-06 09:25:18.803042',21470.00,'FAC-POS-1772789118708','CARD','COMPLETED',19000.00,NULL,NULL,2470.00,NULL),(8,NULL,NULL,'SYSTEM','2026-03-06 09:26:02.328463',13560.00,'FAC-POS-1772789162311','CASH','COMPLETED',12000.00,NULL,NULL,1560.00,NULL),(9,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 09:26:25.021860',13560.00,'FAC-POS-1772789184998','CASH','COMPLETED',12000.00,NULL,NULL,1560.00,1),(10,NULL,NULL,'SYSTEM','2026-03-06 09:32:37.061856',19210.00,'FAC-POS-1772789557032','CASH','COMPLETED',17000.00,NULL,NULL,2210.00,NULL),(11,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 09:58:07.630892',13560.00,'FAC-POS-1772791087553','CASH','COMPLETED',12000.00,NULL,NULL,1560.00,1),(12,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 10:01:51.130473',13560.00,'FAC-POS-1772791311115','CREDIT','COMPLETED',12000.00,NULL,NULL,1560.00,1),(13,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 10:05:36.383719',13560.00,'FAC-POS-1772791536362','CARD','COMPLETED',12000.00,NULL,NULL,1560.00,1),(14,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 10:08:34.311461',35030.00,'FAC-POS-1772791714278','CASH','COMPLETED',31000.00,NULL,NULL,4030.00,1),(15,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 10:15:00.073896',40680.00,'FAC-POS-1772792100060','CREDIT','COMPLETED',36000.00,NULL,NULL,4680.00,1),(16,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 18:18:32.042644',47460.00,'FAC-POS-1772821110939','CASH','COMPLETED',42000.00,NULL,NULL,5460.00,1),(17,'203640541','Yolanda Ortiz Meneses','SYSTEM','2026-03-06 19:46:50.432097',32770.00,'FAC-POS-1772826410228','CASH','COMPLETED',29000.00,NULL,NULL,3770.00,2),(18,NULL,NULL,'SYSTEM','2026-03-08 07:58:27.883608',19210.00,'FAC-POS-1772956707585','CARD','COMPLETED',17000.00,NULL,NULL,2210.00,NULL),(19,'203640541','Yolanda Ortiz Meneses','SYSTEM','2026-03-08 08:12:10.227787',27120.00,'FAC-POS-1772957530041','CREDIT','COMPLETED',24000.00,NULL,NULL,3120.00,2),(20,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-08 08:26:16.096061',27120.00,'FAC-POS-1772958376059','CREDIT','COMPLETED',24000.00,NULL,NULL,3120.00,1),(21,NULL,NULL,'admin','2026-03-08 08:45:36.895917',21470.00,'FAC-POS-1772959536869','CARD','COMPLETED',19000.00,NULL,NULL,2470.00,NULL),(22,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-08 23:49:13.576200',11760.00,'FAC-POS-1773013753366','CARD','COMPLETED',12000.00,0.00,NULL,1560.00,1),(23,NULL,NULL,'admin','2026-03-09 00:00:42.101198',11160.00,'FAC-POS-1773014442022','CARD','COMPLETED',12000.00,0.00,NULL,1560.00,NULL),(24,NULL,NULL,'admin','2026-03-09 00:34:18.953808',27440.00,'FAC-POS-1773016458776','CASH','COMPLETED',28000.00,0.00,NULL,3640.00,NULL),(25,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-09 03:19:17.526840',19000.00,'FAC-POS-1773026357305','CREDIT','COMPLETED',19000.00,0.00,NULL,0.00,1),(26,NULL,NULL,'admin','2026-03-09 03:22:45.256998',12000.00,'FAC-POS-1773026565245','CARD','COMPLETED',12000.00,0.00,NULL,0.00,NULL),(27,NULL,NULL,'admin','2026-03-09 03:27:36.534763',12000.00,'FAC-POS-1773026856463','CARD','COMPLETED',12000.00,0.00,NULL,0.00,NULL),(28,NULL,NULL,'admin','2026-03-09 03:29:35.329130',12000.00,'FAC-POS-1773026975314','CASH','COMPLETED',12000.00,0.00,NULL,0.00,NULL),(29,NULL,NULL,'admin','2026-03-09 03:37:05.680132',12000.00,'FAC-POS-1773027425611','CARD','COMPLETED',12000.00,0.00,NULL,0.00,NULL),(30,NULL,NULL,'admin','2026-03-09 03:43:17.901630',23730.00,'FAC-POS-1773027797869','CARD','COMPLETED',21000.00,0.00,NULL,2730.00,NULL),(31,NULL,NULL,'admin','2026-03-09 03:45:17.629740',15820.00,'FAC-POS-1773027917603','CARD','COMPLETED',14000.00,0.00,NULL,1820.00,NULL),(32,NULL,NULL,'admin','2026-03-09 03:45:27.781088',23730.00,'FAC-POS-1773027927772','CASH','COMPLETED',21000.00,0.00,NULL,2730.00,NULL),(33,NULL,NULL,'admin','2026-03-09 03:46:28.087978',15820.00,'FAC-POS-1773027988077','CARD','COMPLETED',14000.00,0.00,NULL,1820.00,NULL),(34,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-09 03:50:45.949078',14000.00,'FAC-POS-1773028245932','CREDIT','COMPLETED',14000.00,0.00,NULL,0.00,1),(35,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-09 03:51:03.391980',14000.00,'FAC-POS-1773028263381','CARD','COMPLETED',14000.00,0.00,NULL,0.00,1),(36,NULL,NULL,'admin','2026-03-09 03:51:14.138312',21000.00,'FAC-POS-1773028274131','CASH','COMPLETED',21000.00,0.00,NULL,0.00,NULL),(37,'504600060','Edgar Duarte','admin','2026-03-09 18:11:24.758920',22400.00,'FAC-POS-1773079884676','CREDIT','COMPLETED',28000.00,0.00,NULL,0.00,3),(38,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-09 18:23:49.400891',21000.00,'FAC-POS-1773080629391','CARD','COMPLETED',21000.00,0.00,NULL,0.00,1),(39,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 05:42:59.217341',19000.00,'FAC-POS-1773207779094','CASH','COMPLETED',19000.00,0.00,NULL,0.00,1),(40,'203640541','Yolanda Ortiz Meneses','SYSTEM','2026-03-11 05:53:57.828785',21000.00,'FAC-POS-1773208437734','CASH','COMPLETED',21000.00,0.00,NULL,0.00,2),(41,'203640541','Yolanda Ortiz Meneses','SYSTEM','2026-03-11 05:55:17.964004',28000.00,'FAC-POS-1773208517903','CARD','COMPLETED',28000.00,0.00,NULL,0.00,2),(42,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 05:57:53.506023',28000.00,'FAC-POS-1773208673428','CARD','COMPLETED',28000.00,0.00,NULL,0.00,1),(43,NULL,NULL,'SYSTEM','2026-03-11 06:02:53.588105',28000.00,'FAC-POS-1773208973535','CARD','COMPLETED',28000.00,0.00,NULL,0.00,NULL),(44,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 06:22:09.531144',21000.00,'FAC-POS-1773210129471','CARD','COMPLETED',21000.00,0.00,NULL,0.00,1),(45,NULL,NULL,'SYSTEM','2026-03-11 06:24:37.865090',21000.00,'FAC-POS-1773210277805','CARD','COMPLETED',21000.00,0.00,NULL,0.00,NULL),(46,NULL,NULL,'SYSTEM','2026-03-11 06:27:15.556761',7000.00,'FAC-POS-1773210435454','CASH','COMPLETED',7000.00,0.00,NULL,0.00,NULL),(47,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 06:32:38.754044',7000.00,'FAC-POS-1773210758684','CARD','COMPLETED',7000.00,0.00,NULL,0.00,1),(48,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 06:41:36.172045',12000.00,'FAC-POS-1773211295947','CASH','COMPLETED',12000.00,0.00,NULL,0.00,1),(49,'504600060','Edgar Duarte','SYSTEM','2026-03-11 06:48:12.088848',14000.00,'FAC-POS-1773211692026','CARD','COMPLETED',14000.00,0.00,NULL,0.00,3),(50,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 06:51:38.398057',5000.00,'FAC-POS-1773211898340','CARD','COMPLETED',5000.00,0.00,NULL,0.00,1),(51,'504600060','Edgar Duarte','SYSTEM','2026-03-11 07:00:08.315141',7000.00,'FAC-POS-1773212408222','CARD','COMPLETED',7000.00,0.00,NULL,0.00,3),(52,NULL,NULL,'SYSTEM','2026-03-11 07:09:34.880119',5000.00,'FAC-POS-1773212974834','CARD','COMPLETED',5000.00,0.00,NULL,0.00,NULL);
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_aud`
--

DROP TABLE IF EXISTS `sales_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `client_identification` varchar(255) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `final_total` decimal(12,2) DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `payment_method` enum('CASH','CARD','TRANSFER','CREDIT') DEFAULT NULL,
  `status` enum('COMPLETED','CANCELLED','CONTINGENCY_PENDING') DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT NULL,
  `total_discount` decimal(12,2) DEFAULT NULL,
  `total_gross_profit` decimal(12,2) DEFAULT NULL,
  `total_tax` decimal(12,2) DEFAULT NULL,
  `id_client` bigint DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FKhmuff9a34p7hfmyuq6sf2hpcd` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_aud`
--

LOCK TABLES `sales_aud` WRITE;
/*!40000 ALTER TABLE `sales_aud` DISABLE KEYS */;
INSERT INTO `sales_aud` VALUES (1,2,0,NULL,NULL,'SYSTEM','2026-03-04 05:09:34.099018',22600.00,'FAC-POS-1772600973997','CASH','COMPLETED',20000.00,NULL,NULL,2600.00,NULL),(2,3,0,NULL,NULL,'SYSTEM','2026-03-04 05:09:42.055577',39550.00,'FAC-POS-1772600982051','CARD','COMPLETED',35000.00,NULL,NULL,4550.00,NULL),(3,5,0,NULL,NULL,'SYSTEM','2026-03-04 05:11:02.573975',11300.00,'FAC-POS-1772601062567','CASH','COMPLETED',10000.00,NULL,NULL,1300.00,NULL),(4,7,0,NULL,NULL,'SYSTEM','2026-03-04 05:17:54.275191',27120.00,'FAC-POS-1772601474256','CASH','COMPLETED',24000.00,NULL,NULL,3120.00,NULL),(5,9,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-04 05:51:22.483860',13560.00,'FAC-POS-1772603482400','CASH','COMPLETED',12000.00,NULL,NULL,1560.00,1),(6,12,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 09:06:42.301707',29380.00,'FAC-POS-1772788002158','CREDIT','COMPLETED',26000.00,NULL,NULL,3380.00,1),(7,18,0,NULL,NULL,'SYSTEM','2026-03-06 09:25:18.803042',21470.00,'FAC-POS-1772789118708','CARD','COMPLETED',19000.00,NULL,NULL,2470.00,NULL),(8,19,0,NULL,NULL,'SYSTEM','2026-03-06 09:26:02.328463',13560.00,'FAC-POS-1772789162311','CASH','COMPLETED',12000.00,NULL,NULL,1560.00,NULL),(9,20,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 09:26:25.021860',13560.00,'FAC-POS-1772789184998','CASH','COMPLETED',12000.00,NULL,NULL,1560.00,1),(10,21,0,NULL,NULL,'SYSTEM','2026-03-06 09:32:37.061856',19210.00,'FAC-POS-1772789557032','CASH','COMPLETED',17000.00,NULL,NULL,2210.00,NULL),(11,24,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 09:58:07.630892',13560.00,'FAC-POS-1772791087553','CASH','COMPLETED',12000.00,NULL,NULL,1560.00,1),(12,25,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 10:01:51.130473',13560.00,'FAC-POS-1772791311115','CREDIT','COMPLETED',12000.00,NULL,NULL,1560.00,1),(13,26,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 10:05:36.383719',13560.00,'FAC-POS-1772791536362','CARD','COMPLETED',12000.00,NULL,NULL,1560.00,1),(14,27,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 10:08:34.311461',35030.00,'FAC-POS-1772791714278','CASH','COMPLETED',31000.00,NULL,NULL,4030.00,1),(15,28,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 10:15:00.073896',40680.00,'FAC-POS-1772792100060','CREDIT','COMPLETED',36000.00,NULL,NULL,4680.00,1),(16,36,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-06 18:18:32.042644',47460.00,'FAC-POS-1772821110939','CASH','COMPLETED',42000.00,NULL,NULL,5460.00,1),(17,40,0,'203640541','Yolanda Ortiz Meneses','SYSTEM','2026-03-06 19:46:50.432097',32770.00,'FAC-POS-1772826410228','CASH','COMPLETED',29000.00,NULL,NULL,3770.00,2),(18,44,0,NULL,NULL,'SYSTEM','2026-03-08 07:58:27.883608',19210.00,'FAC-POS-1772956707585','CARD','COMPLETED',17000.00,NULL,NULL,2210.00,NULL),(19,45,0,'203640541','Yolanda Ortiz Meneses','SYSTEM','2026-03-08 08:12:10.227787',27120.00,'FAC-POS-1772957530041','CREDIT','COMPLETED',24000.00,NULL,NULL,3120.00,2),(20,46,0,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-08 08:26:16.096061',27120.00,'FAC-POS-1772958376059','CREDIT','COMPLETED',24000.00,NULL,NULL,3120.00,1),(21,49,0,NULL,NULL,'admin','2026-03-08 08:45:36.895917',21470.00,'FAC-POS-1772959536869','CARD','COMPLETED',19000.00,NULL,NULL,2470.00,NULL),(22,52,0,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-08 23:49:13.576200',11760.00,'FAC-POS-1773013753366','CARD','COMPLETED',12000.00,0.00,NULL,1560.00,1),(23,54,0,NULL,NULL,'admin','2026-03-09 00:00:42.101198',11160.00,'FAC-POS-1773014442022','CARD','COMPLETED',12000.00,0.00,NULL,1560.00,NULL),(24,58,0,NULL,NULL,'admin','2026-03-09 00:34:18.953808',27440.00,'FAC-POS-1773016458776','CASH','COMPLETED',28000.00,0.00,NULL,3640.00,NULL),(25,68,0,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-09 03:19:17.526840',19000.00,'FAC-POS-1773026357305','CREDIT','COMPLETED',19000.00,0.00,NULL,0.00,1),(26,69,0,NULL,NULL,'admin','2026-03-09 03:22:45.256998',12000.00,'FAC-POS-1773026565245','CARD','COMPLETED',12000.00,0.00,NULL,0.00,NULL),(27,70,0,NULL,NULL,'admin','2026-03-09 03:27:36.534763',12000.00,'FAC-POS-1773026856463','CARD','COMPLETED',12000.00,0.00,NULL,0.00,NULL),(28,71,0,NULL,NULL,'admin','2026-03-09 03:29:35.329130',12000.00,'FAC-POS-1773026975314','CASH','COMPLETED',12000.00,0.00,NULL,0.00,NULL),(29,72,0,NULL,NULL,'admin','2026-03-09 03:37:05.680132',12000.00,'FAC-POS-1773027425611','CARD','COMPLETED',12000.00,0.00,NULL,0.00,NULL),(30,73,0,NULL,NULL,'admin','2026-03-09 03:43:17.901630',23730.00,'FAC-POS-1773027797869','CARD','COMPLETED',21000.00,0.00,NULL,2730.00,NULL),(31,74,0,NULL,NULL,'admin','2026-03-09 03:45:17.629740',15820.00,'FAC-POS-1773027917603','CARD','COMPLETED',14000.00,0.00,NULL,1820.00,NULL),(32,75,0,NULL,NULL,'admin','2026-03-09 03:45:27.781088',23730.00,'FAC-POS-1773027927772','CASH','COMPLETED',21000.00,0.00,NULL,2730.00,NULL),(33,76,0,NULL,NULL,'admin','2026-03-09 03:46:28.087978',15820.00,'FAC-POS-1773027988077','CARD','COMPLETED',14000.00,0.00,NULL,1820.00,NULL),(34,77,0,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-09 03:50:45.949078',14000.00,'FAC-POS-1773028245932','CREDIT','COMPLETED',14000.00,0.00,NULL,0.00,1),(35,78,0,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-09 03:51:03.391980',14000.00,'FAC-POS-1773028263381','CARD','COMPLETED',14000.00,0.00,NULL,0.00,1),(36,79,0,NULL,NULL,'admin','2026-03-09 03:51:14.138312',21000.00,'FAC-POS-1773028274131','CASH','COMPLETED',21000.00,0.00,NULL,0.00,NULL),(37,82,0,'504600060','Edgar Duarte','admin','2026-03-09 18:11:24.758920',22400.00,'FAC-POS-1773079884676','CREDIT','COMPLETED',28000.00,0.00,NULL,0.00,3),(38,86,0,'208600363','Manuel Salvador Mejicano Ortiz','admin','2026-03-09 18:23:49.400891',21000.00,'FAC-POS-1773080629391','CARD','COMPLETED',21000.00,0.00,NULL,0.00,1),(39,88,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 05:42:59.217341',19000.00,'FAC-POS-1773207779094','CASH','COMPLETED',19000.00,0.00,NULL,0.00,1),(40,90,0,'203640541','Yolanda Ortiz Meneses','SYSTEM','2026-03-11 05:53:57.828785',21000.00,'FAC-POS-1773208437734','CASH','COMPLETED',21000.00,0.00,NULL,0.00,2),(41,92,0,'203640541','Yolanda Ortiz Meneses','SYSTEM','2026-03-11 05:55:17.964004',28000.00,'FAC-POS-1773208517903','CARD','COMPLETED',28000.00,0.00,NULL,0.00,2),(42,94,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 05:57:53.506023',28000.00,'FAC-POS-1773208673428','CARD','COMPLETED',28000.00,0.00,NULL,0.00,1),(43,96,0,NULL,NULL,'SYSTEM','2026-03-11 06:02:53.588105',28000.00,'FAC-POS-1773208973535','CARD','COMPLETED',28000.00,0.00,NULL,0.00,NULL),(44,98,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 06:22:09.531144',21000.00,'FAC-POS-1773210129471','CARD','COMPLETED',21000.00,0.00,NULL,0.00,1),(45,100,0,NULL,NULL,'SYSTEM','2026-03-11 06:24:37.865090',21000.00,'FAC-POS-1773210277805','CARD','COMPLETED',21000.00,0.00,NULL,0.00,NULL),(46,102,0,NULL,NULL,'SYSTEM','2026-03-11 06:27:15.556761',7000.00,'FAC-POS-1773210435454','CASH','COMPLETED',7000.00,0.00,NULL,0.00,NULL),(47,104,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 06:32:38.754044',7000.00,'FAC-POS-1773210758684','CARD','COMPLETED',7000.00,0.00,NULL,0.00,1),(48,106,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 06:41:36.172045',12000.00,'FAC-POS-1773211295947','CASH','COMPLETED',12000.00,0.00,NULL,0.00,1),(49,108,0,'504600060','Edgar Duarte','SYSTEM','2026-03-11 06:48:12.088848',14000.00,'FAC-POS-1773211692026','CARD','COMPLETED',14000.00,0.00,NULL,0.00,3),(50,110,0,'208600363','Manuel Salvador Mejicano Ortiz','SYSTEM','2026-03-11 06:51:38.398057',5000.00,'FAC-POS-1773211898340','CARD','COMPLETED',5000.00,0.00,NULL,0.00,1),(51,112,0,'504600060','Edgar Duarte','SYSTEM','2026-03-11 07:00:08.315141',7000.00,'FAC-POS-1773212408222','CARD','COMPLETED',7000.00,0.00,NULL,0.00,3),(52,116,0,NULL,NULL,'SYSTEM','2026-03-11 07:09:34.880119',5000.00,'FAC-POS-1773212974834','CARD','COMPLETED',5000.00,0.00,NULL,0.00,NULL);
/*!40000 ALTER TABLE `sales_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `identification` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'San Antonio, Upala','MANUEL MEJICANO','manuelortizmejicano100@gmail.com','208600363','BODEGA JSM','70280576');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers_aud`
--

DROP TABLE IF EXISTS `suppliers_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `identification` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FK72bois07oflhic0klfap83rlh` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers_aud`
--

LOCK TABLES `suppliers_aud` WRITE;
/*!40000 ALTER TABLE `suppliers_aud` DISABLE KEYS */;
INSERT INTO `suppliers_aud` VALUES (1,10,0,'San Antonio, Upala','MANUEL MEJICANO','manuelortizmejicano100@gmail.com','208600363','BODEGA JSM','70280576');
/*!40000 ALTER TABLE `suppliers_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
  CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,3);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles_aud`
--

DROP TABLE IF EXISTS `user_roles_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles_aud` (
  `rev` int NOT NULL,
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  PRIMARY KEY (`rev`,`user_id`,`role_id`),
  CONSTRAINT `FKox6xyy64fyq0y3dvv5ve53a0h` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles_aud`
--

LOCK TABLES `user_roles_aud` WRITE;
/*!40000 ALTER TABLE `user_roles_aud` DISABLE KEYS */;
INSERT INTO `user_roles_aud` VALUES (29,1,3,0);
/*!40000 ALTER TABLE `user_roles_aud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(120) DEFAULT NULL,
  `username` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@agropecuario.com','$2a$10$THTO8R9fRPdLeO967dH4sOqSwF1bzbneTOyr0bYQm6pgZ0.EiJBV6','admin','Administrador');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_aud`
--

DROP TABLE IF EXISTS `users_aud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_aud` (
  `id` bigint NOT NULL,
  `rev` int NOT NULL,
  `revtype` tinyint DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rev`,`id`),
  CONSTRAINT `FKc4vk4tui2la36415jpgm9leoq` FOREIGN KEY (`rev`) REFERENCES `revinfo` (`rev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_aud`
--

LOCK TABLES `users_aud` WRITE;
/*!40000 ALTER TABLE `users_aud` DISABLE KEYS */;
INSERT INTO `users_aud` VALUES (1,29,0,'admin@agropecuario.com','$2a$10$nWgzGzpeTJVnGpyuhyvR2OOwFunf5On/gfpgFKkCtCLCpkBSJppIq','admin',NULL),(1,30,1,'admin@agropecuario.com','$2a$10$We2RrNt6PpX6XQSM9Yl0vuWssvdcuGibN8WitSgs4ZKLIBL0dle8a','admin',NULL),(1,31,1,'admin@agropecuario.com','$2a$10$l.FIZLR4LgQkRrpUYaxWA.o6z9VR5xKzr2UPlk/iKjZVREa0WkIym','admin',NULL),(1,32,1,'admin@agropecuario.com','$2a$10$mfW2Oq8kkj2I/2tPJXv3M.II7WoiUIo7Pk98WmhOK3AbvgvdCCpQ6','admin',NULL),(1,33,1,'admin@agropecuario.com','$2a$10$/h86hsRDUaoK3FrYnacOx.iPPg8rNf8zpseb49CmJnW.214rbWvcW','admin',NULL),(1,34,1,'admin@agropecuario.com','$2a$10$QDvBTkd7OnbtfcuQeht5ou5x73v34iBh2aBW/PuRrBPdFLzQa9iBu','admin',NULL),(1,35,1,'admin@agropecuario.com','$2a$10$pk1Xaz0lP1Pul03tWY4nWOS/2WKVQO8M3GGkQapxyRbG0MEciAeFK','admin',NULL),(1,37,1,'admin@agropecuario.com','$2a$10$SB7I8Fjy5FdtQBPNNSeH4OvxwchVrA4ghI5s5TPb1XJFtqQOoWUV.','admin','Administrador'),(1,41,1,'admin@agropecuario.com','$2a$10$tQpyrhGdD1p8uKLkhhPlae/YV4F8xiDWIGKgJqpkQg8T/ojcdZgYK','admin','Administrador'),(1,42,1,'admin@agropecuario.com','$2a$10$bEAJmjOnRXBu5.AgZPtcrO9RDZJ2k.Srwtz/0ZrShF7VPNclV9ZCm','admin','Administrador'),(1,50,1,'admin@agropecuario.com','$2a$10$Wu2QEkE1ZzWcNve9pF4KregyvNvmHsnndl7z5cIDfHaTmNNGmwybW','admin','Administrador'),(1,51,1,'admin@agropecuario.com','$2a$10$uQA9Q0/xQ6NJw/fRPwncFuDqFtafP28ZeBLMXpJDMAlDfS8K6BOha','admin','Administrador'),(1,53,1,'admin@agropecuario.com','$2a$10$yOaBibItcU7Q4ujKEnhFJ.IL8QP/gWKVBc/VeXI0askpKm2iVoXam','admin','Administrador'),(1,57,1,'admin@agropecuario.com','$2a$10$vuM.Bter39.FZ.ByH3zPEew3w4/TLWiGcEaXL9m/N4uMH70HNu7O6','admin','Administrador'),(1,59,1,'admin@agropecuario.com','$2a$10$8E/lti9Iiw/pn9skk2Oh3ep3b5cMdllWzflfwX9ceDPqva6emlV76','admin','Administrador'),(1,61,1,'admin@agropecuario.com','$2a$10$vi/ZXGKLxXZFXpmKlhM43u9tIfy4RQw8UjwxhCALgjFgtoak7kIHK','admin','Administrador'),(1,62,1,'admin@agropecuario.com','$2a$10$JthRJvJ4g7Xz7Qc2U21.p.3XSp5RdygkQD1SiMeE6r5ngykhQpTlu','admin','Administrador'),(1,64,1,'admin@agropecuario.com','$2a$10$LF.ZJey7abflLW9a1m47h.Hw6SWkI/RE7Ju/8SCNxLkaGbtgJyM26','admin','Administrador'),(1,65,1,'admin@agropecuario.com','$2a$10$JL9ThahPIyEACR06XrjguOSpawx.MgmiPMgndcObsb3Nu2rNWEa66','admin','Administrador'),(1,66,1,'admin@agropecuario.com','$2a$10$fMHbPOIxUh33regCXOAwi.ZiR87v6Qb5QdmXHIoY6GN1dDoM8mH/m','admin','Administrador'),(1,80,1,'admin@agropecuario.com','$2a$10$dJCYWWXJpE7aPB6W6UB24uoDu3Zt3dmGRRLMdJtBJfLL8GMZwZ7lS','admin','Administrador'),(1,87,1,'admin@agropecuario.com','$2a$10$d4T/fb.BEctW2.2uzywvSO60bR0TjY5KKNTEw2QXROfFcqLSiNfpi','admin','Administrador'),(1,89,1,'admin@agropecuario.com','$2a$10$TUw8A44UcGKHOOi10Vr47uPSLF1H8rN5zapSR3htkNTVk41IUQnMO','admin','Administrador'),(1,91,1,'admin@agropecuario.com','$2a$10$8YgYz7xQcuOzLpe/eBUHpemkDbeCBFjzaAbn.RAZK5BOeMq6nDt06','admin','Administrador'),(1,93,1,'admin@agropecuario.com','$2a$10$rUUfFuBnQHyLLX0Q0b8RRu9GLYx2WKBYU1ca/cyaqgLq/IM33kCu.','admin','Administrador'),(1,95,1,'admin@agropecuario.com','$2a$10$iwxyTAJPFlPnIJwLiyS18e3vc/HYCCwakNiRU7q/x0lR14rHRO49C','admin','Administrador'),(1,97,1,'admin@agropecuario.com','$2a$10$55cN677tFngtewT4HBbGFOSEJPrAN8g8eYz/aw8Yvmiez9TLIxxIq','admin','Administrador'),(1,99,1,'admin@agropecuario.com','$2a$10$HAfB2VlbPmOGoOjifEDgtu5USH2R5hhZU7w6Bg0vQGHPgCn4swHge','admin','Administrador'),(1,101,1,'admin@agropecuario.com','$2a$10$aLpGt0x9l1vUU1THx3eY5euKTWfBCWo3oatq3hQTGoWE58nU3VqWW','admin','Administrador'),(1,103,1,'admin@agropecuario.com','$2a$10$iHZqld0TMs0tbwbEm3qZR.POS6ogQNLpyzdY/Uk0AP59KRLF5lf9W','admin','Administrador'),(1,105,1,'admin@agropecuario.com','$2a$10$Fa/mJLCby1rAshC1x.Sk8unljKnQXRjz/.W5awyV8T03I0bPC4K1O','admin','Administrador'),(1,107,1,'admin@agropecuario.com','$2a$10$32Wm8Zg7GkvRubZ32rjDDulwwZtVkI7eee12EwlmT1GITSBQziL8O','admin','Administrador'),(1,109,1,'admin@agropecuario.com','$2a$10$/Msfw0OLbowm8ENUWNb51.GE9X8pOf8eGV4bQbCbdQDmSyr0JFKIa','admin','Administrador'),(1,111,1,'admin@agropecuario.com','$2a$10$oL6Z7M3jkrQsEfJIsBiVmejLBt2Tmocr6OWgTDSRL/vC1vPzIr8cW','admin','Administrador'),(1,115,1,'admin@agropecuario.com','$2a$10$THTO8R9fRPdLeO967dH4sOqSwF1bzbneTOyr0bYQm6pgZ0.EiJBV6','admin','Administrador');
/*!40000 ALTER TABLE `users_aud` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-11  2:00:02
