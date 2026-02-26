-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 25, 2026 at 08:06 PM
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
-- Database: `personal_finance_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(3) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `user_id`, `name`, `type`, `balance`, `currency`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 1, 'bb', 'checking', 3330.00, 'USD', '', 1, '2026-02-25 12:38:34.000000', '2026-02-25 20:52:07.000000'),
(3, 1, 'telebirr', 'cash', 16000.00, 'USD', '', 1, '2026-02-25 20:51:58.000000', '2026-02-25 20:51:58.000000'),
(4, 1, 'dashn', 'cash', 597200.00, 'USD', '', 1, '2026-02-25 20:58:22.000000', '2026-02-25 20:58:22.000000');

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `period` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `alert_threshold` decimal(5,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `user_id`, `category_id`, `amount`, `period`, `start_date`, `end_date`, `alert_threshold`, `created_at`, `updated_at`) VALUES
(1, 1, 9, 70000.00, 'weekly', '2026-03-07', NULL, 80.00, '2026-02-25 14:13:34.000000', '2026-02-25 14:19:30.000000'),
(2, 1, 11, 3000.00, 'monthly', '2026-02-25', NULL, 80.00, '2026-02-25 20:59:02.000000', '2026-02-25 20:59:02.000000');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `color` char(7) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `user_id`, `name`, `type`, `color`, `icon`, `is_default`, `created_at`) VALUES
(1, NULL, 'Salary', 'income', '#10B981', 'briefcase', 1, '2026-02-25 12:38:34.000000'),
(2, NULL, 'Freelance', 'income', '#3B82F6', 'laptop', 1, '2026-02-25 12:38:34.000000'),
(3, NULL, 'Investments', 'income', '#8B5CF6', 'trending-up', 1, '2026-02-25 12:38:34.000000'),
(4, NULL, 'Gifts', 'income', '#EC4899', 'gift', 1, '2026-02-25 12:38:34.000000'),
(5, NULL, 'Housing', 'expense', '#EF4444', 'home', 1, '2026-02-25 12:38:34.000000'),
(6, NULL, 'Food & Dining', 'expense', '#F59E0B', 'utensils', 1, '2026-02-25 12:38:34.000000'),
(7, NULL, 'Transportation', 'expense', '#3B82F6', 'car', 1, '2026-02-25 12:38:34.000000'),
(8, NULL, 'Utilities', 'expense', '#6366F1', 'zap', 1, '2026-02-25 12:38:34.000000'),
(9, NULL, 'Entertainment', 'expense', '#EC4899', 'film', 1, '2026-02-25 12:38:34.000000'),
(10, NULL, 'Shopping', 'expense', '#8B5CF6', 'shopping-bag', 1, '2026-02-25 12:38:34.000000'),
(11, NULL, 'Health', 'expense', '#14B8A6', 'heart-pulse', 1, '2026-02-25 12:38:34.000000'),
(12, NULL, 'Education', 'expense', '#F97316', 'graduation-cap', 1, '2026-02-25 12:38:34.000000');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `type` enum('income','expense','transfer') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `account_id`, `category_id`, `type`, `amount`, `description`, `transaction_date`, `notes`, `created_at`, `updated_at`) VALUES
(7, 1, 4, 9, 'expense', 2800.00, 'nmm', '2026-02-24', NULL, '2026-02-25 20:59:29.000000', '2026-02-25 21:17:29.000000'),
(8, 1, 3, 4, 'income', 4000.00, 'vvbvcv', '2026-02-25', NULL, '2026-02-25 21:18:22.000000', '2026-02-25 21:18:22.000000');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `currency`, `created_at`, `updated_at`) VALUES
(1, 'dani@gmail.com', '$2b$10$lPA32hx/u.vYRWfX70f9A.lUV1nk1t6K9bVpibzFvPjEF6LjaGNLS', 'Danielbbvv', 'Elias', 'USD', '2026-02-25 12:38:34.000000', '2026-02-25 12:38:34.000000');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budgets_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
