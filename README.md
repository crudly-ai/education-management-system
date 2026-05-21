# Education Management System

This repository contains an Education Management System generated using Crudly AI. It demonstrates how education-related operations can be structured into a complete system using automated CRUD generation.

## Overview

The system is designed to manage academic workflows such as student records, teacher management, attendance tracking, exams, results, and fee management through multiple interconnected modules. Each module follows standard CRUD operations, ensuring a structured and scalable system.

## Tech Stack

- Laravel (Backend)
- React (Frontend)
- MySQL (Database)

## Modules

- Students – Manage student records  
- Teachers – Manage teacher information  
- Classes – Manage class details  
- Subjects – Manage subject information  
- Attendance – Manage attendance records  
- Exams – Manage examination details  
- Results – Manage student results and performance  
- Fees – Manage fee records and payments  

## How This Was Generated

This project was fully generated using Crudly AI-based CRUD generator.

**Prompt Used:**
Create an Education Management System with complete CRUD functionality.

Modules:
- Students
- Teachers
- Classes
- Subjects
- Attendance
- Exams
- Results
- Fees

Requirements:
- Define proper relationships between modules
- Generate full CRUD operations
- Ensure the system is structured, scalable, and easy to extend

## About Crudly

Crudly is an AI-powered system that generates structured applications automatically. It helps developers eliminate repetitive coding by generating:

- Data models  
- Relationships  
- CRUD operations  
- Base project structure  

## Why Use Crudly

- Faster development  
- Structured code generation  
- Reduced manual effort  
- Easy scalability  

## Setup Guide

Below are the steps to run this project locally.

# Crudly Generated Code Setup

This README provides setup instructions for the generated Laravel application with CRUD functionality.

## Requirements

- **PHP**: ^8.2
- **Node.js**: ^18.0 (recommended for React 19 compatibility)
- **NPM**: ^9.0
- **MySQL**: 5.7+ or 8.0+
- **Composer**: ^2.0

## Setup Instructions

### 1. Database Configuration

Update your `.env` file with your existing MySQL database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 2. Install Dependencies & Setup

Run the following commands in order:

```bash

# Install Node.js dependencies
npm install

# Run database migrations and seeders
php artisan migrate --seed

# Build frontend assets
npm run build

# Create storage symbolic link
php artisan storage:link

# Generate application key (if not already set)
php artisan key:generate
```

### 3. Run the Application

#### Option A: Using Artisan Server (Development)
```bash
php artisan serve
```
The application will be available at `http://localhost:8000`

#### Option B: Using Domain/Web Server (Production)
Point your domain to the `public` folder of the application.

## Additional Commands

### Development Mode
```bash
# Run with hot reload for frontend development
npm run dev

# Run in separate terminal
php artisan serve
```

### Clear Cache (if needed)
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

## Default Login Credentials

After running the seeders, you can login with:
- **Email**: admin@example.com
- **Password**: password

## Project Structure

- `app/` - Laravel application code
- `resources/js/` - React frontend components
- `resources/css/` - Stylesheets
- `database/migrations/` - Database schema
- `database/seeders/` - Database seeders
- `routes/` - Application routes
- `public/` - Web server document root

## Troubleshooting

### Permission Issues
```bash
chmod -R 775 storage bootstrap/cache
```

### Storage Link Issues
```bash
php artisan storage:link --force
```

### Node.js Version Issues
Ensure you're using Node.js 18+ for React 19 compatibility.

## Support

For issues related to the generated CRUD functionality, please refer to the Crudly documentation or contact support.
Email: info@crudly.ai
