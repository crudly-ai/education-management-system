<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('manage_all_invoice') && !auth()->user()->can('manage_own_invoice')) {
            abort(403, 'You do not have permission to manage invoices.');
        }

        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            // Create a query builder with static data
            $invoices = DB::table(DB::raw('(SELECT
                1 as id, "INV-2024-001" as number, "Acme Corporation" as client, "2024-01-15" as date, "2024-02-14" as due_date, 8395.00 as amount, "paid" as status, 3 as items, "2024-01-15 10:30:00" as created_at
                UNION ALL SELECT 2, "INV-2024-002", "Tech Solutions Ltd", "2024-01-20", "2024-02-19", 5250.00, "pending", 2, "2024-01-20 14:15:00"
                UNION ALL SELECT 3, "INV-2024-003", "Digital Agency Inc", "2024-01-10", "2024-02-09", 12750.00, "overdue", 5, "2024-01-10 09:45:00"
                UNION ALL SELECT 4, "INV-2024-004", "StartUp Co", "2024-01-25", "2024-02-24", 3200.00, "draft", 1, "2024-01-25 16:20:00"
                UNION ALL SELECT 5, "INV-2024-005", "Global Enterprises", "2024-01-28", "2024-02-27", 15600.00, "pending", 4, "2024-01-28 11:10:00"
                UNION ALL SELECT 6, "INV-2024-006", "Creative Studio", "2024-01-12", "2024-02-11", 7800.00, "paid", 3, "2024-01-12 13:30:00"
            ) as invoices'));

            return DataTables::of($invoices)
                ->filterColumn('number', function($query, $keyword) {
                    $query->where('number', 'like', "%{$keyword}%");
                })
                ->filterColumn('client', function($query, $keyword) {
                    $query->where('client', 'like', "%{$keyword}%");
                })
                ->make(true);
        }

        return Inertia::render('invoices/index');
    }

    public function show($id)
    {
        return Inertia::render('invoices/view', [
            'invoice' => [
                'id' => 1,
                'number' => $id,
                'date' => '2024-01-15',
                'due_date' => '2024-02-14',
                'status' => 'paid',
                'client' => [
                    'name' => 'Acme Corporation',
                    'email' => 'john@acmecorp.com',
                    'address' => '456 Client Avenue, New York, NY 10001',
                    'phone' => '+1 (555) 987-6543'
                ],
                'items' => [
                    [
                        'description' => 'Web Development Services',
                        'quantity' => 40,
                        'rate' => 125.00,
                        'amount' => 5000.00
                    ],
                    [
                        'description' => 'UI/UX Design',
                        'quantity' => 20,
                        'rate' => 100.00,
                        'amount' => 2000.00
                    ],
                    [
                        'description' => 'Project Management',
                        'quantity' => 10,
                        'rate' => 150.00,
                        'amount' => 1500.00
                    ]
                ],
                'subtotal' => 8500.00,
                'tax' => 745.00,
                'discount' => 850.00,
                'total' => 8395.00,
                'notes' => 'Thank you for your business! Payment was received on time.',
                'payment_terms' => 'Net 30 days. Late payments may be subject to fees.'
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('invoices/create');
    }

    public function export(Request $request)
    {
        $format = $request->get('format', 'csv');

        $invoices = [
            ['Invoice #', 'Client', 'Date', 'Due Date', 'Amount', 'Status'],
            ['INV-2024-001', 'Acme Corporation', '2024-01-15', '2024-02-14', '$8,395.00', 'Paid'],
            ['INV-2024-002', 'Tech Solutions Ltd', '2024-01-20', '2024-02-19', '$5,250.00', 'Pending'],
            ['INV-2024-003', 'Digital Agency Inc', '2024-01-10', '2024-02-09', '$12,750.00', 'Overdue'],
            ['INV-2024-004', 'StartUp Co', '2024-01-25', '2024-02-24', '$3,200.00', 'Draft'],
            ['INV-2024-005', 'Global Enterprises', '2024-01-28', '2024-02-27', '$15,600.00', 'Pending'],
            ['INV-2024-006', 'Creative Studio', '2024-01-12', '2024-02-11', '$7,800.00', 'Paid']
        ];

        if ($format === 'csv') {
            $filename = 'invoices_' . date('Y-m-d') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($invoices) {
                $file = fopen('php://output', 'w');
                foreach ($invoices as $row) {
                    fputcsv($file, $row);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->json(['message' => 'Export format not supported'], 400);
    }
}
