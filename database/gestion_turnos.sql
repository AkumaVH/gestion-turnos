DROP DATABASE IF EXISTS gestion_turnos;
CREATE DATABASE gestion_turnos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_turnos;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gestion_turnos
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `disponibilidad`
--

DROP TABLE IF EXISTS `disponibilidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidad` (
  `id_disponibilidad` int NOT NULL AUTO_INCREMENT,
  `dia` varchar(15) NOT NULL,
  `hora_desde` time NOT NULL,
  `hora_hasta` time NOT NULL,
  PRIMARY KEY (`id_disponibilidad`),
  CONSTRAINT `chk_horario` CHECK ((`hora_desde` < `hora_hasta`))
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad`
--

LOCK TABLES `disponibilidad` WRITE;
/*!40000 ALTER TABLE `disponibilidad` DISABLE KEYS */;
INSERT INTO `disponibilidad` VALUES (1,'Lunes','08:00:00','12:00:00'),(2,'Lunes','14:00:00','18:00:00'),(3,'Martes','08:00:00','12:00:00'),(4,'Martes','14:00:00','18:00:00'),(5,'Miércoles','08:00:00','12:00:00'),(6,'Miércoles','14:00:00','18:00:00'),(7,'Jueves','08:00:00','12:00:00'),(8,'Jueves','14:00:00','18:00:00'),(9,'Viernes','08:00:00','12:00:00'),(10,'Viernes','14:00:00','18:00:00'),(11,'Lunes','08:00:00','16:00:00'),(12,'Martes','08:00:00','16:00:00'),(13,'Miércoles','08:00:00','16:00:00'),(14,'Jueves','08:00:00','16:00:00'),(15,'Viernes','08:00:00','16:00:00'),(16,'Lunes','09:00:00','13:00:00'),(17,'Martes','09:00:00','13:00:00'),(18,'Miércoles','09:00:00','13:00:00'),(19,'Jueves','09:00:00','13:00:00'),(20,'Viernes','09:00:00','13:00:00'),(21,'Lunes','15:00:00','19:00:00'),(22,'Martes','15:00:00','19:00:00'),(23,'Miércoles','15:00:00','19:00:00'),(24,'Jueves','15:00:00','19:00:00'),(25,'Viernes','15:00:00','19:00:00'),(26,'Lunes','18:00:00','21:00:00'),(27,'Martes','18:00:00','21:00:00'),(28,'Miércoles','18:00:00','21:00:00'),(29,'Jueves','18:00:00','21:00:00'),(30,'Viernes','18:00:00','21:00:00');
/*!40000 ALTER TABLE `disponibilidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipo`
--

DROP TABLE IF EXISTS `equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipo` (
  `id_equipo` int NOT NULL AUTO_INCREMENT,
  `nombre_equipo` varchar(100) NOT NULL,
  `id_servicio` int NOT NULL,
  PRIMARY KEY (`id_equipo`),
  KEY `fk_equipo_servicio` (`id_servicio`),
  CONSTRAINT `fk_equipo_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipo`
--

LOCK TABLES `equipo` WRITE;
/*!40000 ALTER TABLE `equipo` DISABLE KEYS */;
INSERT INTO `equipo` VALUES (1,'Electrocardiógrafo 01',2),(2,'Electrocardiógrafo 02',2),(3,'Ecógrafo General 01',8),(4,'Ecógrafo General 02',8),(5,'Ecógrafo Obstétrico',8),(6,'Equipo de Rayos X',4),(7,'Tomógrafo CT 01',8),(8,'Resonador Magnético 01',8),(9,'Dermatoscopio 01',6),(10,'Lámpara Dermatológica',6),(11,'Ecógrafo Portátil',8),(12,'Equipo Oftalmológico 01',7),(13,'Retinógrafo',7),(14,'Camilla Traumatológica',4),(15,'Monitor Multiparamétrico',1);
/*!40000 ALTER TABLE `equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medico`
--

DROP TABLE IF EXISTS `medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medico` (
  `matricula_medico` int NOT NULL,
  `apellido_medico` varchar(50) NOT NULL,
  `nombre_medico` varchar(50) NOT NULL,
  `tel_medico` varchar(30) DEFAULT NULL,
  `matricula_supervisor` int DEFAULT NULL,
  `id_servicio` int NOT NULL,
  PRIMARY KEY (`matricula_medico`),
  KEY `fk_medico_supervisor` (`matricula_supervisor`),
  KEY `fk_medico_servicio` (`id_servicio`),
  CONSTRAINT `fk_medico_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id_servicio`),
  CONSTRAINT `fk_medico_supervisor` FOREIGN KEY (`matricula_supervisor`) REFERENCES `medico` (`matricula_medico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medico`
--

LOCK TABLES `medico` WRITE;
/*!40000 ALTER TABLE `medico` DISABLE KEYS */;
INSERT INTO `medico` VALUES (1001,'Pérez','Marcelo','2964611001',NULL,1),(1002,'Gómez','Laura','2964611002',1001,1),(1003,'Rodríguez','Carlos','2964611003',NULL,2),(1004,'Fernández','Andrea','2964611004',1003,2),(1005,'López','Martín','2964611005',NULL,3),(1006,'Martínez','Sofía','2964611006',1005,3),(1007,'González','Pablo','2964611007',NULL,4),(1008,'Sánchez','Carolina','2964611008',1007,4),(1009,'Romero','Diego','2964611009',NULL,5),(1010,'Torres','Mariana','2964611010',1009,5),(1011,'Álvarez','Ricardo','2964611011',NULL,6),(1012,'Ruiz','Valeria','2964611012',1011,6),(1013,'Ramírez','Jorge','2964611013',NULL,7),(1014,'Flores','Natalia','2964611014',1013,7),(1015,'Benítez','Federico','2964611015',NULL,8),(1016,'Acosta','Paula','2964611016',1015,8),(1017,'Medina','Gustavo','2964611017',1001,1),(1018,'Suárez','Verónica','2964611018',1003,2),(1019,'Herrera','Daniel','2964611019',1007,4),(1020,'Castro','Lucía','2964611020',1009,5);
/*!40000 ALTER TABLE `medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medico_disponibilidad`
--

DROP TABLE IF EXISTS `medico_disponibilidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medico_disponibilidad` (
  `matricula_medico` int NOT NULL,
  `id_disponibilidad` int NOT NULL,
  PRIMARY KEY (`matricula_medico`,`id_disponibilidad`),
  KEY `fk_md_disponibilidad` (`id_disponibilidad`),
  CONSTRAINT `fk_md_disponibilidad` FOREIGN KEY (`id_disponibilidad`) REFERENCES `disponibilidad` (`id_disponibilidad`),
  CONSTRAINT `fk_md_medico` FOREIGN KEY (`matricula_medico`) REFERENCES `medico` (`matricula_medico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medico_disponibilidad`
--

LOCK TABLES `medico_disponibilidad` WRITE;
/*!40000 ALTER TABLE `medico_disponibilidad` DISABLE KEYS */;
INSERT INTO `medico_disponibilidad` VALUES (1001,1),(1003,1),(1005,1),(1007,1),(1009,1),(1011,1),(1013,1),(1015,1),(1017,1),(1002,2),(1004,2),(1006,2),(1008,2),(1010,2),(1012,2),(1014,2),(1016,2),(1018,2),(1020,2),(1001,3),(1005,3),(1009,3),(1013,3),(1017,3),(1002,4),(1006,4),(1010,4),(1014,4),(1018,4),(1001,5),(1003,5),(1007,5),(1011,5),(1013,5),(1015,5),(1019,5),(1002,6),(1004,6),(1008,6),(1012,6),(1014,6),(1016,6),(1020,6),(1003,7),(1005,7),(1009,7),(1011,7),(1015,7),(1019,7),(1004,8),(1006,8),(1010,8),(1012,8),(1016,8),(1001,9),(1003,9),(1005,9),(1007,9),(1009,9),(1011,9),(1013,9),(1015,9),(1017,9),(1019,9),(1002,10),(1004,10),(1006,10),(1008,10),(1010,10),(1012,10),(1014,10),(1016,10),(1018,10),(1020,10),(1007,11),(1008,21);
/*!40000 ALTER TABLE `medico_disponibilidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `obra_social`
--

DROP TABLE IF EXISTS `obra_social`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `obra_social` (
  `id_os` int NOT NULL AUTO_INCREMENT,
  `nombre_os` varchar(100) NOT NULL,
  PRIMARY KEY (`id_os`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `obra_social`
--

LOCK TABLES `obra_social` WRITE;
/*!40000 ALTER TABLE `obra_social` DISABLE KEYS */;
INSERT INTO `obra_social` VALUES (1,'OSDE'),(2,'Swiss Medical'),(3,'Medife'),(4,'Galeno'),(5,'PAMI'),(6,'IOMA'),(7,'OSECAC'),(8,'Particular');
/*!40000 ALTER TABLE `obra_social` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `os_practica`
--

DROP TABLE IF EXISTS `os_practica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `os_practica` (
  `id_os` int NOT NULL,
  `id_practica` int NOT NULL,
  PRIMARY KEY (`id_os`,`id_practica`),
  KEY `fk_op_practica` (`id_practica`),
  CONSTRAINT `fk_op_obra_social` FOREIGN KEY (`id_os`) REFERENCES `obra_social` (`id_os`),
  CONSTRAINT `fk_op_practica` FOREIGN KEY (`id_practica`) REFERENCES `practica` (`id_practica`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `os_practica`
--

LOCK TABLES `os_practica` WRITE;
/*!40000 ALTER TABLE `os_practica` DISABLE KEYS */;
INSERT INTO `os_practica` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(1,2),(2,2),(3,2),(5,2),(6,2),(7,2),(8,2),(1,3),(2,3),(4,3),(5,3),(7,3),(8,3),(1,4),(2,4),(4,4),(8,4),(1,5),(2,5),(3,5),(4,5),(6,5),(7,5),(8,5),(1,6),(3,6),(4,6),(5,6),(6,6),(7,6),(8,6),(1,7),(2,7),(4,7),(5,7),(8,7),(1,8),(2,8),(3,8),(4,8),(6,8),(7,8),(8,8),(1,9),(2,9),(3,9),(7,9),(8,9),(1,10),(3,10),(4,10),(5,10),(6,10),(7,10),(8,10),(2,11),(8,11),(1,12),(2,12),(3,12),(4,12),(5,12),(6,12),(7,12),(8,12),(2,13),(8,13),(1,14),(2,14),(3,14),(4,14),(5,14),(6,14),(8,14),(1,15),(2,15),(6,15),(8,15),(8,16),(8,17),(1,18),(2,18),(3,18),(8,18),(8,19),(8,20);
/*!40000 ALTER TABLE `os_practica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `dni_paciente` int NOT NULL,
  `nombre_paciente` varchar(50) NOT NULL,
  `apellido_paciente` varchar(50) NOT NULL,
  `fec_nac_paciente` date NOT NULL,
  `email_paciente` varchar(50) DEFAULT NULL,
  `nro_afiliado_paciente` int DEFAULT NULL,
  `id_os` int DEFAULT NULL,
  `tel_paciente` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`dni_paciente`),
  UNIQUE KEY `email_paciente` (`email_paciente`),
  UNIQUE KEY `nro_afiliado_paciente` (`nro_afiliado_paciente`),
  KEY `fk_paciente_obra_social` (`id_os`),
  CONSTRAINT `fk_paciente_obra_social` FOREIGN KEY (`id_os`) REFERENCES `obra_social` (`id_os`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
INSERT INTO `paciente` VALUES (30100101,'Juan','Pérez','1985-03-12','juan.perez@gmail.com',583,1,'2964610001'),(30100202,'Ana','Gómez','1990-07-22','ana.gomez@gmail.com',1247,2,'2964610002'),(30100303,'María','Rodríguez','1978-11-05','maria.rodriguez@gmail.com',836,3,'2964610003'),(30100404,'Lucas','Fernández','2001-02-18','lucas.fernandez@gmail.com',4215,4,'2964610004'),(30100505,'Carlos','López','1965-09-30','carlos.lopez@gmail.com',762,5,'2964610005'),(30100606,'Sofía','Martínez','1995-04-15','sofia.martinez@gmail.com',3189,1,'2964610006'),(30100707,'Pedro','González','1982-12-01','pedro.gonzalez@gmail.com',945,6,'2964610007'),(30100808,'Laura','Sánchez','1972-06-17','laura.sanchez@gmail.com',2754,7,'2964610008'),(30100909,'Diego','Romero','1988-08-21','diego.romero@gmail.com',614,2,'2964610009'),(30101010,'Camila','Torres','2003-01-09','camila.torres@gmail.com',3902,8,'2964610010'),(30101111,'Marcelo','Álvarez','1975-05-11','marcelo.alvarez@gmail.com',751,3,'2964610011'),(30101212,'Valentina','Ruiz','1992-10-24','valentina.ruiz@gmail.com',1846,4,'2964610012'),(30101313,'Martín','Ramírez','1980-02-28','martin.ramirez@gmail.com',529,5,'2964610013'),(30101414,'Julieta','Flores','1998-06-03','julieta.flores@gmail.com',2471,1,'2964610014'),(30101515,'Ricardo','Benítez','1969-12-14','ricardo.benitez@gmail.com',683,6,'2964610015'),(30101616,'Paula','Acosta','1987-03-27','paula.acosta@gmail.com',4158,7,'2964610016'),(30101717,'Nicolás','Medina','1991-09-19','nicolas.medina@gmail.com',927,2,'2964610017'),(30101818,'Gabriela','Suárez','1977-01-31','gabriela.suarez@gmail.com',3064,3,'2964610018'),(30101919,'Alejandro','Herrera','1984-07-07','alejandro.herrera@gmail.com',572,4,'2964610019'),(30102020,'Florencia','Castro','2000-11-23','florencia.castro@gmail.com',2183,8,'2964610020'),(30102121,'Roberto','Ortiz','1970-04-08','roberto.ortiz@gmail.com',849,5,'2964610021'),(30102222,'Carolina','Silva','1996-08-16','carolina.silva@gmail.com',3617,1,'2964610022'),(30102323,'Sebastián','Molina','1989-05-29','sebastian.molina@gmail.com',694,2,'2964610023'),(30102424,'Patricia','Vega','1974-10-12','patricia.vega@gmail.com',4728,6,'2964610024'),(30102525,'Facundo','Rojas','1993-02-06','facundo.rojas@gmail.com',815,7,'2964610025'),(30102626,'Verónica','Navarro','1981-06-25','veronica.navarro@gmail.com',2536,3,'2964610026'),(30102727,'Jorge','Domínguez','1967-09-03','jorge.dominguez@gmail.com',731,5,'2964610027'),(30102828,'Agustina','Cabrera','1999-12-20','agustina.cabrera@gmail.com',1694,4,'2964610028'),(30102929,'Daniel','Vargas','1986-01-15','daniel.vargas@gmail.com',458,1,'2964610029'),(30103030,'Silvia','Méndez','1979-07-31','silvia.mendez@gmail.com',3821,2,'2964610030'),(30103131,'Tomás','Ponce','1994-03-10','tomas.ponce@gmail.com',967,3,'2964610031'),(30103232,'Mónica','Quiroga','1973-11-18','monica.quiroga@gmail.com',2145,4,'2964610032'),(30103333,'Mateo','Peralta','2002-05-22','mateo.peralta@gmail.com',638,8,'2964610033'),(30103434,'Natalia','Correa','1983-08-04','natalia.correa@gmail.com',3472,6,'2964610034'),(30103535,'Agustín','Sosa','1997-10-27','agustin.sosa@gmail.com',726,7,'2964610035'),(30103636,'Norma','Mansilla','1964-02-13','norma.mansilla@gmail.com',1958,5,'2964610036'),(30103737,'Leandro','Godoy','1985-12-05','leandro.godoy@gmail.com',864,1,'2964610037'),(30103838,'Romina','Luna','1990-04-19','romina.luna@gmail.com',4231,2,'2964610038'),(30103939,'Eduardo','Cáceres','1976-06-30','eduardo.caceres@gmail.com',619,3,'2964610039'),(30104040,'Martina','Vera','2001-09-11','martina.vera@gmail.com',2758,8,'2964610040'),(30104141,'Esteban','Paz','1988-11-02','esteban.paz@gmail.com',943,4,'2964610041'),(30104242,'Claudia','Arias','1971-03-24','claudia.arias@gmail.com',3164,6,'2964610042'),(30104343,'Ignacio','Ferreyra','1995-07-13','ignacio.ferreyra@gmail.com',782,7,'2964610043'),(30104444,'Mariana','Maidana','1982-10-06','mariana.maidana@gmail.com',2497,1,'2964610044'),(30104545,'Oscar','Cardozo','1968-01-28','oscar.cardozo@gmail.com',531,5,'2964610045'),(30104646,'Luciana','Ojeda','1999-05-17','luciana.ojeda@gmail.com',4076,2,'2964610046'),(30104747,'Cristian','Almirón','1987-08-09','cristian.almiron@gmail.com',895,3,'2964610047'),(30104848,'Beatriz','Valdez','1975-12-21','beatriz.valdez@gmail.com',1628,4,'2964610048'),(30104949,'Maximiliano','Figueroa','1992-02-14','maximiliano.figueroa@gmail.com',743,8,'2964610049'),(30105050,'Lorena','Leiva','1980-06-08','lorena.leiva@gmail.com',3549,6,'2964610050');
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `practica`
--

DROP TABLE IF EXISTS `practica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `practica` (
  `id_practica` int NOT NULL AUTO_INCREMENT,
  `nombre_practica` varchar(100) NOT NULL,
  `id_servicio` int NOT NULL,
  `duracion` int NOT NULL,
  PRIMARY KEY (`id_practica`),
  KEY `fk_practica_servicio` (`id_servicio`),
  CONSTRAINT `fk_practica_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `practica`
--

LOCK TABLES `practica` WRITE;
/*!40000 ALTER TABLE `practica` DISABLE KEYS */;
INSERT INTO `practica` VALUES (1,'Consulta clínica',1,30),(2,'Control general',1,30),(3,'Electrocardiograma',2,20),(4,'Ecocardiograma',2,45),(5,'Control pediátrico',3,30),(6,'Consulta traumatológica',4,30),(7,'Radiografía',4,15),(8,'Control ginecológico',5,30),(9,'Papanicolau',5,20),(10,'Consulta dermatológica',6,30),(11,'Dermatoscopía',6,30),(12,'Control oftalmológico',7,30),(13,'Fondo de ojo',7,30),(14,'Ecografía abdominal',8,30),(15,'Ecografía obstétrica',8,30),(16,'Tomografía computada',8,45),(17,'Resonancia magnética',8,60),(18,'Consulta cardiológica',2,30),(19,'Control de niño sano',3,30),(20,'Ecografía musculoesquelética',4,30);
/*!40000 ALTER TABLE `practica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `practica_equipo`
--

DROP TABLE IF EXISTS `practica_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `practica_equipo` (
  `id_practica` int NOT NULL,
  `id_equipo` int NOT NULL,
  PRIMARY KEY (`id_practica`,`id_equipo`),
  KEY `fk_pe_equipo` (`id_equipo`),
  CONSTRAINT `fk_pe_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`),
  CONSTRAINT `fk_pe_practica` FOREIGN KEY (`id_practica`) REFERENCES `practica` (`id_practica`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `practica_equipo`
--

LOCK TABLES `practica_equipo` WRITE;
/*!40000 ALTER TABLE `practica_equipo` DISABLE KEYS */;
INSERT INTO `practica_equipo` VALUES (3,1),(18,1),(3,2),(18,2),(4,3),(8,3),(9,3),(14,3),(20,3),(4,4),(14,4),(15,5),(7,6),(16,7),(17,8),(10,9),(11,9),(10,10),(20,11),(12,12),(13,13),(6,14),(1,15),(2,15),(5,15),(19,15);
/*!40000 ALTER TABLE `practica_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `practica_medico`
--

DROP TABLE IF EXISTS `practica_medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `practica_medico` (
  `matricula_medico` int NOT NULL,
  `id_practica` int NOT NULL,
  PRIMARY KEY (`matricula_medico`,`id_practica`),
  KEY `fk_pm_practica` (`id_practica`),
  CONSTRAINT `fk_pm_medico` FOREIGN KEY (`matricula_medico`) REFERENCES `medico` (`matricula_medico`),
  CONSTRAINT `fk_pm_practica` FOREIGN KEY (`id_practica`) REFERENCES `practica` (`id_practica`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `practica_medico`
--

LOCK TABLES `practica_medico` WRITE;
/*!40000 ALTER TABLE `practica_medico` DISABLE KEYS */;
INSERT INTO `practica_medico` VALUES (1001,1),(1002,1),(1017,1),(1001,2),(1002,2),(1017,2),(1003,3),(1004,3),(1018,3),(1003,4),(1004,4),(1005,5),(1006,5),(1007,6),(1008,6),(1019,6),(1007,7),(1008,7),(1019,7),(1009,8),(1010,8),(1020,8),(1009,9),(1010,9),(1020,9),(1011,10),(1012,10),(1011,11),(1012,11),(1013,12),(1014,12),(1013,13),(1014,13),(1015,14),(1016,14),(1015,15),(1016,15),(1015,16),(1016,16),(1015,17),(1016,17),(1003,18),(1004,18),(1018,18),(1005,19),(1006,19),(1007,20),(1008,20);
/*!40000 ALTER TABLE `practica_medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registra`
--

DROP TABLE IF EXISTS `registra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registra` (
  `matricula_medico` int NOT NULL,
  `id_turno` int NOT NULL,
  `id_disponibilidad` int NOT NULL,
  PRIMARY KEY (`matricula_medico`,`id_turno`,`id_disponibilidad`),
  KEY `id_turno` (`id_turno`),
  KEY `id_disponibilidad` (`id_disponibilidad`),
  CONSTRAINT `registra_ibfk_1` FOREIGN KEY (`matricula_medico`) REFERENCES `medico` (`matricula_medico`),
  CONSTRAINT `registra_ibfk_2` FOREIGN KEY (`id_turno`) REFERENCES `turno` (`id_turno`),
  CONSTRAINT `registra_ibfk_3` FOREIGN KEY (`id_disponibilidad`) REFERENCES `disponibilidad` (`id_disponibilidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registra`
--

LOCK TABLES `registra` WRITE;
/*!40000 ALTER TABLE `registra` DISABLE KEYS */;
INSERT INTO `registra` VALUES (1001,1,1),(1001,2,1),(1003,4,4),(1005,6,3),(1005,7,3),(1007,9,9),(1009,11,1),(1009,12,1),(1011,14,4),(1013,16,5),(1013,17,5),(1015,18,8),(1015,19,8),(1015,21,9),(1001,22,1),(1003,23,1),(1009,25,4),(1013,27,5),(1015,28,8),(1015,30,9);
/*!40000 ALTER TABLE `registra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(30) NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uk_rol_nombre` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'ADMIN'),(2,'MEDICO'),(3,'PACIENTE');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicio`
--

DROP TABLE IF EXISTS `servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio` (
  `id_servicio` int NOT NULL AUTO_INCREMENT,
  `nombre_servicio` varchar(100) NOT NULL,
  PRIMARY KEY (`id_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio`
--

LOCK TABLES `servicio` WRITE;
/*!40000 ALTER TABLE `servicio` DISABLE KEYS */;
INSERT INTO `servicio` VALUES (1,'Clínica Médica'),(2,'Cardiología'),(3,'Pediatría'),(4,'Traumatología'),(5,'Ginecología'),(6,'Dermatología'),(7,'Oftalmología'),(8,'Diagnóstico por Imágenes');
/*!40000 ALTER TABLE `servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turno`
--

DROP TABLE IF EXISTS `turno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turno` (
  `id_turno` int NOT NULL AUTO_INCREMENT,
  `fecha_turno` date NOT NULL,
  `hora_turno` time NOT NULL,
  `medio_solicitado` varchar(50) DEFAULT NULL,
  `estado_turno` varchar(30) DEFAULT NULL,
  `fecha_confirmacion` datetime DEFAULT NULL,
  `medico_confirmacion` int DEFAULT NULL,
  `dni_paciente` int NOT NULL,
  `id_practica` int NOT NULL,
  `id_equipo` int DEFAULT NULL,
  `id_disponibilidad` int DEFAULT NULL,
  PRIMARY KEY (`id_turno`),
  KEY `fk_turno_paciente` (`dni_paciente`),
  KEY `fk_turno_practica` (`id_practica`),
  KEY `fk_turno_equipo` (`id_equipo`),
  KEY `fk_turno_disponibilidad` (`id_disponibilidad`),
  KEY `fk_turno_medico_confirmacion` (`medico_confirmacion`),
  CONSTRAINT `fk_turno_disponibilidad` FOREIGN KEY (`id_disponibilidad`) REFERENCES `disponibilidad` (`id_disponibilidad`),
  CONSTRAINT `fk_turno_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`),
  CONSTRAINT `fk_turno_medico_confirmacion` FOREIGN KEY (`medico_confirmacion`) REFERENCES `medico` (`matricula_medico`),
  CONSTRAINT `fk_turno_paciente` FOREIGN KEY (`dni_paciente`) REFERENCES `paciente` (`dni_paciente`),
  CONSTRAINT `fk_turno_practica` FOREIGN KEY (`id_practica`) REFERENCES `practica` (`id_practica`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turno`
--

LOCK TABLES `turno` WRITE;
/*!40000 ALTER TABLE `turno` DISABLE KEYS */;
INSERT INTO `turno` VALUES (1,'2026-09-01','08:00:00','Web','Confirmado','2026-08-28 10:15:00',1001,30100101,1,15,1),(2,'2026-09-01','09:00:00','Teléfono','Confirmado','2026-08-29 11:20:00',1001,30100202,2,15,1),(3,'2026-09-01','10:00:00','Web','Reservado',NULL,NULL,30100303,3,1,1),(4,'2026-09-02','14:00:00','WhatsApp','Confirmado','2026-08-30 09:00:00',1003,30100404,4,3,4),(5,'2026-09-02','15:00:00','Web','Cancelado',NULL,NULL,30100505,18,1,4),(6,'2026-09-03','08:30:00','Teléfono','Confirmado','2026-09-01 12:00:00',1005,30100606,5,15,3),(7,'2026-09-03','09:30:00','Web','Confirmado','2026-09-01 13:00:00',1005,30100707,19,15,3),(8,'2026-09-03','14:00:00','Web','Reservado',NULL,NULL,30100808,6,14,6),(9,'2026-09-04','10:00:00','Teléfono','Confirmado','2026-09-02 15:00:00',1007,30100909,7,6,9),(10,'2026-09-04','11:00:00','Web','Cancelado',NULL,NULL,30101010,20,3,9),(11,'2026-09-07','08:00:00','Web','Confirmado','2026-09-04 10:00:00',1009,30101111,8,3,1),(12,'2026-09-07','09:00:00','Teléfono','Confirmado','2026-09-04 11:00:00',1009,30101212,9,3,1),(13,'2026-09-07','10:00:00','Web','Cancelado',NULL,NULL,30101313,8,3,1),(14,'2026-09-08','14:00:00','Web','Confirmado','2026-09-05 09:30:00',1011,30101414,10,9,4),(15,'2026-09-08','15:00:00','Teléfono','Reservado',NULL,NULL,30101515,11,9,4),(16,'2026-09-09','08:00:00','Web','Confirmado','2026-09-06 10:00:00',1013,30101616,12,12,5),(17,'2026-09-09','09:00:00','Web','Confirmado','2026-09-06 11:00:00',1013,30101717,13,13,5),(18,'2026-09-10','14:00:00','Teléfono','Confirmado','2026-09-07 12:00:00',1015,30101818,14,3,8),(19,'2026-09-10','15:00:00','Web','Confirmado','2026-09-07 13:00:00',1015,30101919,15,5,8),(20,'2026-09-11','08:00:00','Web','Reservado',NULL,NULL,30102020,16,7,9),(21,'2026-09-11','09:00:00','Teléfono','Confirmado','2026-09-08 14:00:00',1015,30102121,17,8,9),(22,'2026-09-14','08:00:00','Web','Confirmado','2026-09-11 10:00:00',1001,30102222,1,15,1),(23,'2026-09-14','09:00:00','Web','Confirmado','2026-09-11 11:00:00',1003,30102323,3,1,1),(24,'2026-09-15','14:00:00','WhatsApp','Cancelado',NULL,NULL,30102424,6,14,4),(25,'2026-09-15','15:00:00','Web','Confirmado','2026-09-12 09:00:00',1009,30102525,8,3,4),(26,'2026-09-16','08:00:00','Teléfono','Reservado',NULL,NULL,30102626,10,9,5),(27,'2026-09-16','09:00:00','Web','Confirmado','2026-09-13 10:00:00',1013,30102727,12,12,5),(28,'2026-09-17','14:00:00','Web','Confirmado','2026-09-14 12:00:00',1015,30102828,14,3,8),(29,'2026-09-18','08:00:00','Teléfono','Cancelado',NULL,NULL,30102929,16,7,9),(30,'2026-09-18','09:00:00','Web','Confirmado','2026-09-15 13:00:00',1015,30103030,17,8,9),(32,'2026-10-06','11:00:00','Web','Reservado',NULL,NULL,30100101,1,15,1);
/*!40000 ALTER TABLE `turno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `id_rol` int NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `dni_paciente` int DEFAULT NULL,
  `matricula_medico` int DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_usuario_email` (`email`),
  UNIQUE KEY `uk_usuario_paciente` (`dni_paciente`),
  UNIQUE KEY `uk_usuario_medico` (`matricula_medico`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_medico` FOREIGN KEY (`matricula_medico`) REFERENCES `medico` (`matricula_medico`),
  CONSTRAINT `fk_usuario_paciente` FOREIGN KEY (`dni_paciente`) REFERENCES `paciente` (`dni_paciente`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'admin@turnos.com','$2b$10$YNwsylViLS/dxRKzH9YxBuw.ag.VZPT.wdDCjei.qUabe6ezzsfs6',1,1,NULL,NULL,'2026-10-09 21:46:41');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-09 22:57:21
