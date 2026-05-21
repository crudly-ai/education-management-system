<?php

namespace App\Crudly;

class FieldRegistry
{
    public static function getAllFields(): array
    {
        return [
            'text' => [
                'label' => 'Text Input',
                'description' => 'Single line text input',
                'migration' => "string('{{name}}')",
                'validation' => 'required|string|max:255',
                'validation_options' => [
                    'required|string|max:255',
                    'nullable|string|max:255',
                    'required|string|min:3|max:255',
                    'required|string|unique:table,column',
                    'required|email|unique:users,email',
                    'required|url',
                    'required|alpha',
                    'required|alpha_num',
                    'required|numeric',
                    'required|integer',
                    'required|regex:/^[a-zA-Z0-9-_]+$/'
                ],
                'frontend_component' => 'Input',
                'frontend_import' => '@/components/ui/form/input',
                'column_type' => 'text',
                'cast_type' => null,
                'searchable' => true,
                'sortable' => true,
                'filterable' => false,
                'display' => true,
                'filter_type' => 'text',
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'textarea' => [
                'label' => 'Textarea',
                'description' => 'Multi-line text input',
                'migration' => "text('{{name}}')->nullable()",
                'validation' => 'nullable|string',
                'validation_options' => [
                    'nullable|string',
                    'required|string',
                    'nullable|string|max:1000',
                    'required|string|min:10',
                    'nullable|string|max:5000'
                ],
                'frontend_component' => 'Textarea',
                'frontend_import' => '@/components/ui/form/textarea',
                'column_type' => 'text',
                'cast_type' => null,
                'searchable' => true,
                'sortable' => true,
                'filterable' => false,
                'display' => true,
                'filter_type' => 'text',
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'switch' => [
                'label' => 'Switch',
                'description' => 'Active/Inactive toggle',
                'migration' => "enum('{{name}}', ['active', 'inactive'])->default('active')",
                'validation' => 'required|in:active,inactive',
                'validation_options' => [
                    'required|in:active,inactive',
                    'required|boolean',
                    'nullable|in:active,inactive',
                    'required|in:enabled,disabled',
                    'required|in:yes,no'
                ],
                'frontend_component' => 'Switch',
                'frontend_import' => '@/components/ui/form/switch',
                'column_type' => 'badge',
                'cast_type' => 'string',
                'searchable' => true,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'select',
                'filter_options' => [
                    ['value' => 'active', 'label' => 'Active'],
                    ['value' => 'inactive', 'label' => 'Inactive']
                ],
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'checkbox' => [
                'label' => 'Checkbox',
                'description' => 'True/False checkbox',
                'migration' => "boolean('{{name}}')->default(false)",
                'validation' => 'nullable|boolean',
                'validation_options' => [
                    'nullable|boolean',
                    'required|boolean',
                    'nullable|accepted'
                ],
                'frontend_component' => 'Checkbox',
                'frontend_import' => '@/components/ui/form/checkbox',
                'column_type' => 'badge',
                'cast_type' => 'boolean',
                'searchable' => false,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'select',
                'filter_options' => [
                    ['value' => 'true', 'label' => 'Yes'],
                    ['value' => 'false', 'label' => 'No']
                ],
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'radio' => [
                'label' => 'Radio Group',
                'description' => 'Single choice from options',
                'migration' => "enum('{{name}}', ['option1', 'option2', 'option3'])->default('option1')",
                'validation' => 'required|in:option1,option2,option3',
                'validation_options' => [
                    'required|in:low,medium,high',
                    'required|in:small,medium,large',
                    'required|in:option1,option2,option3',
                    'nullable|in:low,medium,high'
                ],
                'frontend_component' => 'RadioGroup',
                'frontend_import' => '@/components/ui/form/radio-group',
                'column_type' => 'badge',
                'cast_type' => 'string',
                'searchable' => true,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'select',
                'filter_options' => [
                    ['value' => 'option1', 'label' => 'Option 1'],
                    ['value' => 'option2', 'label' => 'Option 2'],
                    ['value' => 'option3', 'label' => 'Option 3']
                ],
                'requires_options' => true,
                'requires_relationship' => false
            ],
            'select' => [
                'label' => 'Select Dropdown',
                'description' => 'Single selection dropdown',
                'migration' => "string('{{name}}')->nullable()",
                'validation' => 'nullable|string',
                'validation_options' => [
                    'nullable|string',
                    'required|string',
                    'required|in:option1,option2,option3',
                    'nullable|in:category1,category2,category3'
                ],
                'frontend_component' => 'Select',
                'frontend_import' => '@/components/ui/form/select',
                'column_type' => 'text',
                'cast_type' => 'string',
                'searchable' => true,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'select',
                'filter_options' => [
                    ['value' => 'option1', 'label' => 'Option 1'],
                    ['value' => 'option2', 'label' => 'Option 2'],
                    ['value' => 'option3', 'label' => 'Option 3']
                ],
                'requires_options' => true,
                'requires_relationship' => false
            ],
            'multiselect' => [
                'label' => 'Multi Select',
                'description' => 'Multiple selection with search',
                'migration' => "json('{{name}}')->nullable()",
                'validation' => 'nullable|array',
                'validation_options' => [
                    'nullable|array',
                    'required|array',
                    'nullable|array|min:1',
                    'required|array|max:5'
                ],
                'frontend_component' => 'MultiSelect',
                'frontend_import' => '@/components/ui/form/multi-select',
                'column_type' => 'badge_array',
                'cast_type' => 'array',
                'searchable' => false,
                'sortable' => false,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'multiselect',
                'filter_options' => [
                    ['value' => 'tag1', 'label' => 'Tag 1'],
                    ['value' => 'tag2', 'label' => 'Tag 2'],
                    ['value' => 'tag3', 'label' => 'Tag 3']
                ],
                'requires_options' => true,
                'requires_relationship' => false
            ],
            'date-picker' => [
                'label' => 'Date Picker',
                'description' => 'Single date selection',
                'migration' => "date('{{name}}')->nullable()",
                'validation' => 'nullable|date',
                'validation_options' => [
                    'nullable|date',
                    'required|date',
                    'nullable|date|after:today',
                    'required|date|before:2025-12-31',
                    'nullable|date|after_or_equal:today'
                ],
                'frontend_component' => 'DatePicker',
                'frontend_import' => '@/components/ui/form/date-picker',
                'column_type' => 'date',
                'cast_type' => 'date',
                'searchable' => false,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'date_range',
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'date-range-picker' => [
                'label' => 'Date Range Picker',
                'description' => 'Date range selection',
                'migration' => "date('{{name}}_start')->nullable();\n            \$table->date('{{name}}_end')->nullable()",
                'validation' => 'nullable|date',
                'validation_end' => 'nullable|date|after_or_equal:{{name}}_start',
                'validation_options' => [
                    'nullable|date',
                    'required|date',
                    'nullable|date|after:start_date',
                    'required|date|before:end_date'
                ],
                'frontend_component' => 'DateRangePicker',
                'frontend_import' => '@/components/ui/form/date-range-picker',
                'column_type' => 'date_range',
                'cast_type' => 'date',
                'searchable' => false,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'date_range',
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'time-picker' => [
                'label' => 'Time Picker',
                'description' => 'Time selection',
                'migration' => "time('{{name}}')->nullable()",
                'validation' => 'nullable|date_format:H:i',
                'validation_options' => [
                    'nullable|date_format:H:i',
                    'required|date_format:H:i',
                    'nullable|date_format:H:i:s'
                ],
                'frontend_component' => 'TimePicker',
                'frontend_import' => '@/components/ui/form/time-picker',
                'column_type' => 'time',
                'cast_type' => 'datetime:H:i',
                'searchable' => false,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'time_range',
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'rating' => [
                'label' => 'Star Rating',
                'description' => 'Star rating (1-5)',
                'migration' => "tinyInteger('{{name}}')->nullable()->default(0)",
                'validation' => 'nullable|integer|min:0|max:5',
                'validation_options' => [
                    'nullable|integer|min:0|max:5',
                    'required|integer|min:1|max:5',
                    'nullable|integer|min:0|max:10'
                ],
                'frontend_component' => 'StarRating',
                'frontend_import' => '@/components/ui/form/star-rating',
                'column_type' => 'rating',
                'cast_type' => 'integer',
                'searchable' => false,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'rating_range',
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'color-picker' => [
                'label' => 'Color Picker',
                'description' => 'Color selection',
                'migration' => "string('{{name}}', 7)->nullable()",
                'validation' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
                'validation_options' => [
                    'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
                    'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
                    'nullable|string'
                ],
                'frontend_component' => 'ColorPicker',
                'frontend_import' => '@/components/ui/form/color-picker',
                'column_type' => 'color',
                'cast_type' => null,
                'searchable' => false,
                'sortable' => true,
                'filterable' => false,
                'display' => true,
                'filter_type' => 'none',
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'currency' => [
                'label' => 'Currency Input',
                'description' => 'Currency input',
                'migration' => "decimal('{{name}}', 10, 2)->nullable()->default(0.00)",
                'validation' => 'nullable|numeric|min:0',
                'validation_options' => [
                    'nullable|numeric|min:0',
                    'required|numeric|min:0',
                    'nullable|numeric|min:0|max:999999',
                    'required|numeric|between:0,999999.99'
                ],
                'frontend_component' => 'CurrencyInput',
                'frontend_import' => '@/components/ui/form/currency-input',
                'column_type' => 'currency',
                'cast_type' => 'decimal:2',
                'searchable' => false,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'currency_range',
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'image-single' => [
                'label' => 'Single Image Upload',
                'description' => 'Single image upload',
                'migration' => "string('{{name}}')->nullable()",
                'validation' => 'nullable|string',
                'validation_options' => [
                    'nullable|string',
                    'required|string',
                    'nullable|image|max:2048'
                ],
                'frontend_component' => 'MediaSelector',
                'frontend_import' => '@/components/ui/form/media-selector',
                'column_type' => 'image',
                'cast_type' => null,
                'searchable' => false,
                'sortable' => false,
                'filterable' => false,
                'display' => true,
                'filter_type' => 'none',
                'media_type' => 'image',
                'multiple' => false,
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'file-single' => [
                'label' => 'Single File Upload',
                'description' => 'Single file upload',
                'migration' => "string('{{name}}')->nullable()",
                'validation' => 'nullable|string',
                'validation_options' => [
                    'nullable|string',
                    'required|string',
                    'nullable|file|max:10240'
                ],
                'frontend_component' => 'MediaSelector',
                'frontend_import' => '@/components/ui/form/media-selector',
                'column_type' => 'file',
                'cast_type' => null,
                'searchable' => false,
                'sortable' => false,
                'filterable' => false,
                'display' => true,
                'filter_type' => 'none',
                'media_type' => 'file',
                'multiple' => false,
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'file-multi' => [
                'label' => 'Multiple File Upload',
                'description' => 'Multiple file upload',
                'migration' => "json('{{name}}')->nullable()",
                'validation' => 'nullable|array',
                'validation_options' => [
                    'nullable|array',
                    'required|array',
                    'nullable|array|max:5'
                ],
                'frontend_component' => 'MediaSelector',
                'frontend_import' => '@/components/ui/form/media-selector',
                'column_type' => 'file_multi',
                'cast_type' => 'array',
                'searchable' => false,
                'sortable' => false,
                'filterable' => false,
                'display' => true,
                'filter_type' => 'none',
                'media_type' => 'file',
                'multiple' => true,
                'requires_options' => false,
                'requires_relationship' => false
            ],
            'relationship' => [
                'label' => 'Relationship',
                'description' => 'Foreign key relationship',
                'migration' => "foreignId('{{name}}')->nullable()->constrained('{{related_table}}')",
                'validation' => 'nullable|integer',
                'validation_options' => [
                    'required|integer',
                    'nullable|integer'
                ],
                'frontend_component' => 'Select',
                'frontend_import' => '@/components/ui/form/select',
                'column_type' => 'relationship',
                'cast_type' => 'integer',
                'searchable' => false,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'select',
                'relationship_type' => 'belongsTo',
                'requires_options' => false,
                'requires_relationship' => true
            ],
            'relationship-multi' => [
                'label' => 'Multi-Level Relationship',
                'description' => 'Hierarchical relationship (e.g., category → subcategory)',
                'migration' => "foreignId('{{name}}')->nullable()->constrained('{{related_table}}')",
                'validation' => 'nullable|integer',
                'validation_options' => [
                    'required|integer',
                    'nullable|integer'
                ],
                'frontend_component' => 'MultiLevelSelect',
                'frontend_import' => '@/components/ui/form/multi-level-select',
                'column_type' => 'relationship',
                'cast_type' => 'integer',
                'searchable' => false,
                'sortable' => true,
                'filterable' => true,
                'display' => true,
                'filter_type' => 'select',
                'relationship_type' => 'belongsTo',
                'requires_options' => false,
                'requires_relationship' => true,
                'depends_on' => null
            ]
        ];
    }

    public static function getField(string $type): ?array
    {
        return self::getAllFields()[$type] ?? null;
    }

    public static function getFieldTypes(): array
    {
        return array_keys(self::getAllFields());
    }

    public static function getValidationOptions(string $type): array
    {
        $field = self::getField($type);
        return $field['validation_options'] ?? [];
    }


}