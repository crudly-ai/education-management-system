<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $orders = collect([
                ['id' => 1, 'customer_name' => 'John Doe', 'customer_email' => 'john@example.com', 'type' => 'sale', 'status' => 'completed', 'amount' => 299.99, 'created_at' => '2024-01-15 10:30:00'],
                ['id' => 2, 'customer_name' => 'Jane Smith', 'customer_email' => 'jane@example.com', 'type' => 'subscription', 'status' => 'processing', 'amount' => 49.99, 'created_at' => '2024-01-14 14:20:00'],
                ['id' => 3, 'customer_name' => 'Bob Johnson', 'customer_email' => 'bob@example.com', 'type' => 'refund', 'status' => 'refunded', 'amount' => -150.00, 'created_at' => '2024-01-13 09:15:00'],
                ['id' => 4, 'customer_name' => 'Alice Brown', 'customer_email' => 'alice@example.com', 'type' => 'sale', 'status' => 'pending', 'amount' => 199.99, 'created_at' => '2024-01-12 16:45:00'],
                ['id' => 5, 'customer_name' => 'Charlie Wilson', 'customer_email' => 'charlie@example.com', 'type' => 'subscription', 'status' => 'completed', 'amount' => 99.99, 'created_at' => '2024-01-11 11:30:00'],
                ['id' => 6, 'customer_name' => 'Diana Prince', 'customer_email' => 'diana@example.com', 'type' => 'sale', 'status' => 'completed', 'amount' => 449.99, 'created_at' => '2024-01-10 15:20:00'],
                ['id' => 7, 'customer_name' => 'Edward Norton', 'customer_email' => 'edward@example.com', 'type' => 'subscription', 'status' => 'cancelled', 'amount' => 29.99, 'created_at' => '2024-01-09 12:10:00'],
            ]);

            return DataTables::of($orders)->make(true);
        }

        return Inertia::render('orders/index');
    }

    public function show($id)
    {
        $orders = [
            1 => ['id' => 1, 'customer_name' => 'John Doe', 'customer_email' => 'john@example.com', 'type' => 'sale', 'status' => 'completed', 'amount' => 299.99, 'created_at' => '2024-01-15 10:30:00'],
            2 => ['id' => 2, 'customer_name' => 'Jane Smith', 'customer_email' => 'jane@example.com', 'type' => 'subscription', 'status' => 'processing', 'amount' => 49.99, 'created_at' => '2024-01-14 14:20:00'],
            3 => ['id' => 3, 'customer_name' => 'Bob Johnson', 'customer_email' => 'bob@example.com', 'type' => 'refund', 'status' => 'refunded', 'amount' => -150.00, 'created_at' => '2024-01-13 09:15:00'],
        ];
        
        $order = $orders[$id] ?? $orders[1];
        $order['items'] = [
            ['name' => 'Product A', 'quantity' => 2, 'price' => 149.99],
            ['name' => 'Product B', 'quantity' => 1, 'price' => 0.01],
        ];

        return Inertia::render('orders/view', compact('order'));
    }

    public function export(Request $request)
    {
        $format = $request->get('format', 'csv');
        
        // Sample export logic - implement actual export functionality
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders.' . $format . '"',
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Order ID', 'Customer Name', 'Email', 'Type', 'Status', 'Amount', 'Date']);
            
            // Sample data - replace with actual data
            $orders = [
                ['#ORD-0001', 'John Doe', 'john@example.com', 'Sale', 'Completed', '$299.99', '2024-01-15'],
                ['#ORD-0002', 'Jane Smith', 'jane@example.com', 'Subscription', 'Processing', '$49.99', '2024-01-14'],
            ];
            
            foreach ($orders as $order) {
                fputcsv($file, $order);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}