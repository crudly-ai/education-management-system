<?php

namespace App\Console\Commands\Crudly\Generators\Frontend;

use Illuminate\Support\Str;

class TableGenerator
{
    protected $name;
    protected $fields;

    public function __construct($name, $fields)
    {
        $this->name = $name;
        $this->fields = $fields;
    }

    public function generateColumns()
    {
        $columns = "        {\n            data: 'id',\n            name: 'id',\n            title: t('ID'),\n            orderable: true,\n            searchable: false,\n        },\n";
        
        foreach ($this->fields as $field) {
            // Only include fields that should be displayed
            if (!isset($field['mapping']['display']) || $field['mapping']['display']) {
                $columns .= "        {\n";
                
                // Handle relationship fields differently
                if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                    $relationshipName = str_replace('_id', '', $field['name']);
                    $columns .= "            data: '{$relationshipName}_name',\n";
                    $columns .= "            name: '{$relationshipName}_name',\n";
                } else {
                    $columns .= "            data: '{$field['name']}',\n";
                    $columns .= "            name: '{$field['name']}',\n";
                }
                if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                    $relatedModel = $field['mapping']['related_model'];
                    $columns .= "            title: t('" . $relatedModel . "'),\n";
                } else {
                    $columns .= "            title: t('" . $this->formatFieldName($field['name']) . "'),\n";
                }
                $columns .= "            orderable: " . ($field['mapping']['sortable'] ? 'true' : 'false') . ",\n";
                $columns .= "            searchable: " . ($field['mapping']['searchable'] ? 'true' : 'false') . ",\n";
                
                if ($field['mapping']['column_type'] === 'badge') {
                    if ($field['type'] === 'checkbox') {
                        $columns .= "            render: (data: boolean) => (\n";
                        $columns .= "                <Badge variant={data ? 'default' : 'secondary'} className=\"text-xs\">\n";
                        $columns .= "                    {data ? 'Yes' : 'No'}\n";
                        $columns .= "                </Badge>\n";
                        $columns .= "            ),\n";

                    } elseif ($field['type'] === 'radio') {
                        $columns .= "            render: (data: string) => (\n";
                        $columns .= "                <Badge variant='outline' className=\"text-xs capitalize\">\n";
                        $columns .= "                    {data.replace('_', ' ')}\n";
                        $columns .= "                </Badge>\n";
                        $columns .= "            ),\n";
                    } else {
                        $columns .= "            render: (data: string) => (\n";
                        $columns .= "                <Badge variant={data === 'active' ? 'default' : 'destructive'} className=\"text-xs capitalize\">\n";
                        $columns .= "                    {data}\n";
                        $columns .= "                </Badge>\n";
                        $columns .= "            ),\n";
                    }
                } elseif ($field['mapping']['column_type'] === 'badge_array') {
                    $columns .= "            render: (data: string[]) => (\n";
                    $columns .= "                <div className=\"flex flex-wrap gap-1\">\n";
                    $columns .= "                    {data?.map((item, index) => (\n";
                    $columns .= "                        <Badge key={index} variant=\"secondary\" className=\"text-xs\">\n";
                    $columns .= "                            {item}\n";
                    $columns .= "                        </Badge>\n";
                    $columns .= "                    ))}\n";
                    $columns .= "                </div>\n";
                    $columns .= "            ),\n";
                } elseif ($field['mapping']['column_type'] === 'date') {
                    $columns .= "            render: (data: string) => data ? formatDate(data) : '-',\n";
                } elseif ($field['mapping']['column_type'] === 'time') {
                    $columns .= "            render: (data: string) => data ? new Date('1970-01-01T' + data).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-',\n";
                } elseif ($field['mapping']['column_type'] === 'date_range') {
                    $startField = $field['name'] . '_start';
                    $endField = $field['name'] . '_end';
                    $columns .= "            render: (data: any, type: string, row: any) => {\n";
                    $columns .= "                const start = row.{$startField};\n";
                    $columns .= "                const end = row.{$endField};\n";
                    $columns .= "                if (!start && !end) return '-';\n";
                    $columns .= "                if (start && end) return `" . '${formatDate(start)} - ${formatDate(end)}' . "`;\n";
                    $columns .= "                return start ? formatDate(start) : formatDate(end);\n";
                    $columns .= "            },\n";
                } elseif ($field['mapping']['column_type'] === 'rating') {
                    $columns .= "            render: (data: number) => (\n";
                    $columns .= "                <div className=\"flex items-center gap-1\">\n";
                    $columns .= "                    {Array.from({ length: 5 }, (_, i) => (\n";
                    $columns .= "                        <Star key={i} className={`h-4 w-4 \${i < data ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />\n";
                    $columns .= "                    ))}\n";
                    $columns .= "                    <span className=\"ml-1 text-sm text-gray-600\">{data}/5</span>\n";
                    $columns .= "                </div>\n";
                    $columns .= "            ),\n";
                } elseif ($field['mapping']['column_type'] === 'color') {
                    $columns .= "            render: (data: string) => (\n";
                    $columns .= "                <div className=\"flex items-center gap-2\">\n";
                    $columns .= "                    <div className=\"w-6 h-6 rounded border border-gray-300\" style={{ backgroundColor: data }}></div>\n";
                    $columns .= "                    <span className=\"text-sm font-mono\">{data}</span>\n";
                    $columns .= "                </div>\n";
                    $columns .= "            ),\n";
                } elseif ($field['mapping']['column_type'] === 'currency') {
                    $columns .= "            render: (data: any) => {\n";
                    $columns .= "                const formatCurrency = (amount: any) => {\n";
                    $columns .= "                    const num = parseFloat(amount) || 0;\n";
                    $columns .= "                    const settings = window.currencySettings || {};\n";
                    $columns .= "                    const symbol = settings.currency_symbol || '$';\n";
                    $columns .= "                    const position = settings.currency_position || 'before';\n";
                    $columns .= "                    const thousandSep = settings.thousand_separator || ',';\n";
                    $columns .= "                    const decimalSep = settings.decimal_separator || '.';\n";
                    $columns .= "                    const parts = num.toFixed(2).split('.');\n";
                    $columns .= "                    parts[0] = parts[0].replace(/\\\\B(?=(\\\\d{3})+(?!\\\\d))/g, thousandSep);\n";
                    $columns .= "                    const formatted = parts.join(decimalSep);\n";
                    $columns .= "                    return position === 'before' ? `\${symbol}\${formatted}` : `\${formatted}\${symbol}`;\n";
                    $columns .= "                };\n";
                    $columns .= "                return <span className=\"font-mono\">{formatCurrency(data)}</span>;\n";
                    $columns .= "            },\n";
                } elseif ($field['mapping']['column_type'] === 'relationship' || $field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                    $columns .= "            render: (data: any) => data || '-',\n";
                } elseif ($field['type'] === 'image-single') {
                    $columns .= "            render: (data: string) => {\n";
                    $columns .= "                if (!data) return '-';\n";
                    $columns .= "                const imageUrl = `/storage/\${data}`;\n";
                    $columns .= "                return (\n";
                    $columns .= "                    <img \n";
                    $columns .= "                        src={imageUrl} \n";
                    $columns .= "                        alt=\"Image\" \n";
                    $columns .= "                        className=\"w-12 h-12 object-cover rounded border\"\n";
                    $columns .= "                        onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}\n";
                    $columns .= "                    />\n";
                    $columns .= "                );\n";
                    $columns .= "            },\n";
                } elseif ($field['type'] === 'file-single') {
                    $columns .= "            render: (data: string) => {\n";
                    $columns .= "                if (!data) return '-';\n";
                    $columns .= "                const fileName = data.split('/').pop();\n";
                    $columns .= "                return (\n";
                    $columns .= "                    <a \n";
                    $columns .= "                        href={`/storage/\${data}`} \n";
                    $columns .= "                        target=\"_blank\" \n";
                    $columns .= "                        className=\"text-blue-600 hover:text-blue-800 underline text-sm\"\n";
                    $columns .= "                    >\n";
                    $columns .= "                        {fileName}\n";
                    $columns .= "                    </a>\n";
                    $columns .= "                );\n";
                    $columns .= "            },\n";
                } elseif ($field['type'] === 'file-multi') {
                    $columns .= "            render: (data: string[]) => {\n";
                    $columns .= "                if (!data || data.length === 0) return '-';\n";
                    $columns .= "                return (\n";
                    $columns .= "                    <div className=\"flex flex-wrap gap-1\">\n";
                    $columns .= "                        {data.map((file, index) => {\n";
                    $columns .= "                            const fileName = file.split('/').pop();\n";
                    $columns .= "                            return (\n";
                    $columns .= "                                <a \n";
                    $columns .= "                                    key={index}\n";
                    $columns .= "                                    href={`/storage/\${file}`} \n";
                    $columns .= "                                    target=\"_blank\" \n";
                    $columns .= "                                    className=\"text-blue-600 hover:text-blue-800 underline text-xs\"\n";
                    $columns .= "                                >\n";
                    $columns .= "                                    {fileName}\n";
                    $columns .= "                                </a>\n";
                    $columns .= "                            );\n";
                    $columns .= "                        })}\n";
                    $columns .= "                    </div>\n";
                    $columns .= "                );\n";
                    $columns .= "            },\n";
                }
                
                $columns .= "        },\n";
            }
        }
        
        $columns .= "        {\n            data: 'created_at_formatted',\n            name: 'created_at',\n            title: t('Created At'),\n            orderable: true,\n            searchable: false,\n            render: (data: string) => formatDate(data)\n        },";
        
        return $columns;
    }

    public function generateFilters()
    {
        $filters = '';
        
        foreach ($this->fields as $field) {
            if ($field['mapping']['filterable']) {
                if (isset($field['mapping']['filter_type']) && $field['mapping']['filter_type'] === 'date_range') {
                    $filterName = $field['name'] . '_from';
                    $filterNameTo = $field['name'] . '_to';
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterName}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . " From'),\n";
                    $filters .= "            type: 'date' as const,\n";
                    $filters .= "            placeholder: t('Select start date')\n";
                    $filters .= "        },\n";
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterNameTo}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . " To'),\n";
                    $filters .= "            type: 'date' as const,\n";
                    $filters .= "            placeholder: t('Select end date')\n";
                    $filters .= "        },\n";
                } elseif (isset($field['mapping']['filter_type']) && $field['mapping']['filter_type'] === 'time_range') {
                    $filterName = $field['name'] . '_from';
                    $filterNameTo = $field['name'] . '_to';
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterName}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . " From'),\n";
                    $filters .= "            type: 'time' as const,\n";
                    $filters .= "            placeholder: t('Select start time')\n";
                    $filters .= "        },\n";
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterNameTo}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . " To'),\n";
                    $filters .= "            type: 'time' as const,\n";
                    $filters .= "            placeholder: t('Select end time')\n";
                    $filters .= "        },\n";
                } elseif (isset($field['mapping']['filter_type']) && $field['mapping']['filter_type'] === 'rating_range') {
                    $filterName = $field['name'] . '_min';
                    $filterNameMax = $field['name'] . '_max';
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterName}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . " Min'),\n";
                    $filters .= "            type: 'select' as const,\n";
                    $filters .= "            options: [\n";
                    $filters .= "                { value: '1', label: '1 Star' },\n";
                    $filters .= "                { value: '2', label: '2 Stars' },\n";
                    $filters .= "                { value: '3', label: '3 Stars' },\n";
                    $filters .= "                { value: '4', label: '4 Stars' },\n";
                    $filters .= "                { value: '5', label: '5 Stars' }\n";
                    $filters .= "            ],\n";
                    $filters .= "            placeholder: t('Min rating')\n";
                    $filters .= "        },\n";
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterNameMax}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . " Max'),\n";
                    $filters .= "            type: 'select' as const,\n";
                    $filters .= "            options: [\n";
                    $filters .= "                { value: '1', label: '1 Star' },\n";
                    $filters .= "                { value: '2', label: '2 Stars' },\n";
                    $filters .= "                { value: '3', label: '3 Stars' },\n";
                    $filters .= "                { value: '4', label: '4 Stars' },\n";
                    $filters .= "                { value: '5', label: '5 Stars' }\n";
                    $filters .= "            ],\n";
                    $filters .= "            placeholder: t('Max rating')\n";
                    $filters .= "        },\n";
                } elseif (isset($field['mapping']['filter_type']) && $field['mapping']['filter_type'] === 'currency_range') {
                    $filterName = $field['name'] . '_min';
                    $filterNameMax = $field['name'] . '_max';
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterName}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . " Min'),\n";
                    $filters .= "            type: 'number' as const,\n";
                    $filters .= "            placeholder: t('Min amount')\n";
                    $filters .= "        },\n";
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterNameMax}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . " Max'),\n";
                    $filters .= "            type: 'number' as const,\n";
                    $filters .= "            placeholder: t('Max amount')\n";
                    $filters .= "        },\n";
                } elseif ($field['type'] === 'relationship') {
                    $filterName = $field['name'] . '_filter';
                    $relatedModel = $field['mapping']['related_model'];
                    $optionsVar = Str::camel(Str::plural($relatedModel)) . 'Options';
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterName}',\n";
                    $filters .= "            label: t('" . $relatedModel . "'),\n";
                    $filters .= "            type: 'select' as const,\n";
                    $filters .= "            options: {$optionsVar},\n";
                    $filters .= "            placeholder: t('Filter by " . strtolower($relatedModel) . "')";
                    // Check if this field is a parent for relationship-multi fields
                    $isParentField = false;
                    foreach ($this->fields as $checkField) {
                        if ($checkField['type'] === 'relationship-multi' && 
                            isset($checkField['mapping']['depends_on']) && 
                            $checkField['mapping']['depends_on'] === $field['name']) {
                            $isParentField = true;
                            break;
                        }
                    }
                    if ($isParentField) {
                        $parentField = str_replace('_id', '', $field['name']);
                        $filters .= ",\n            onChange: (value: string) => setSelected" . ucfirst(Str::camel($parentField)) . "Filter(value)";
                    }
                    $filters .= "\n        },\n";
                } elseif ($field['type'] === 'relationship-multi') {
                    $filterName = $field['name'] . '_filter';
                    $relatedModel = $field['mapping']['related_model'];
                    $optionsVar = Str::camel(Str::plural($relatedModel)) . 'Options';
                    $dependsOn = $field['mapping']['depends_on'] ?? null;
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterName}',\n";
                    $filters .= "            label: t('" . $relatedModel . "'),\n";
                    $filters .= "            type: 'select' as const,\n";
                    $filters .= "            options: {$optionsVar},\n";
                    if ($dependsOn) {
                        $parentField = str_replace('_id', '', $dependsOn);
                        $filters .= "            placeholder: selected" . ucfirst(Str::camel($parentField)) . "Filter ? t('Filter by " . strtolower($relatedModel) . "') : t('Select " . strtolower($parentField) . " first'),\n";
                        $filters .= "            disabled: !selected" . ucfirst(Str::camel($parentField)) . "Filter";
                    } else {
                        $filters .= "            placeholder: t('Filter by " . strtolower($relatedModel) . "')";
                    }
                    $filters .= "\n        },\n";
                } elseif (isset($field['mapping']['filter_options'])) {
                    $filterName = $field['name'] . '_filter';
                    $optionsVar = $field['name'] . 'Options';
                    $filterType = ($field['type'] === 'multiselect') ? 'multiselect' : 'select';
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterName}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . "'),\n";
                    $filters .= "            type: '{$filterType}' as const,\n";
                    $filters .= "            options: {$optionsVar},\n";
                    $filters .= "            placeholder: t('Filter by " . strtolower($field['name']) . "')\n";
                    $filters .= "        },\n";
                } elseif ($field['type'] === 'checkbox') {
                    $filterName = $field['name'] . '_filter';
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterName}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . "'),\n";
                    $filters .= "            type: 'select' as const,\n";
                    $filters .= "            options: [\n";
                    $filters .= "                { value: true, label: t('Yes') },\n";
                    $filters .= "                { value: false, label: t('No') }\n";
                    $filters .= "            ],\n";
                    $filters .= "            placeholder: t('Filter by " . strtolower($field['name']) . "')\n";
                    $filters .= "        },\n";
                } elseif ($field['type'] === 'text') {
                    $filterName = $field['name'] . '_filter';
                    $filters .= "        {\n";
                    $filters .= "            key: '{$filterName}',\n";
                    $filters .= "            label: t('" . $this->formatFieldName($field['name']) . "'),\n";
                    $filters .= "            type: 'text' as const,\n";
                    $filters .= "            placeholder: t('Filter by " . strtolower($field['name']) . "')\n";
                    $filters .= "        },\n";
                }
            }
        }
        
        $filters .= "        {\n            key: 'date_from',\n            label: 'Created From',\n            type: 'date' as const,\n            placeholder: 'Select start date'\n        },\n";
        $filters .= "        {\n            key: 'date_to',\n            label: 'Created To',\n            type: 'date' as const,\n            placeholder: 'Select end date'\n        }";
        
        return $filters;
    }

    public function generateFilterOptionsData()
    {
        $data = '';
        foreach ($this->fields as $field) {
            if (($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') && $field['mapping']['filterable']) {
                $relatedModel = $field['mapping']['related_model'];
                $optionsVar = Str::camel(Str::plural($relatedModel)) . 'Options';
                $relatedVariable = Str::camel(Str::plural($relatedModel));
                
                // For relationship-multi, we don't generate static options since they're dynamic
                if ($field['type'] === 'relationship-multi') {
                    // Skip - options will be managed by state
                    continue;
                }
                
                $data .= "        const {$optionsVar} = props.{$relatedVariable}?.map(({$this->getSingularName($relatedModel)}) => ({\n";
                $data .= "            value: {$this->getSingularName($relatedModel)}.id.toString(),\n";
                $data .= "            label: {$this->getSingularName($relatedModel)}.name || {$this->getSingularName($relatedModel)}.title || {$this->getSingularName($relatedModel)}.id.toString()\n";
                $data .= "        })) || [];\n\n";
            } elseif ($field['mapping']['filterable'] && isset($field['mapping']['filter_options'])) {
                $optionsVar = $field['name'] . 'Options';
                $data .= "        const {$optionsVar} = [\n";
                foreach ($field['mapping']['filter_options'] as $option) {
                    $data .= "            { value: '{$option['value']}', label: t('{$option['label']}') },\n";
                }
                $data .= "        ];\n\n";
            }
        }
        return $data;
    }
    
    protected function getSingularName($name = null)
    {
        return Str::camel($name ?? $this->name);
    }
    
    protected function formatFieldName($fieldName)
    {
        // Convert snake_case to Title Case
        return Str::title(str_replace('_', ' ', $fieldName));
    }

    public function generateImports()
    {
        $imports = [];
        foreach ($this->fields as $field) {
            if ($field['mapping']['column_type'] === 'badge' || $field['mapping']['column_type'] === 'badge_array') {
                $imports[] = "import { Badge } from '@/components/ui/feedback/badge';";
            }
            if ($field['mapping']['column_type'] === 'rating') {
                $imports[] = "import { Star } from 'lucide-react';";
            }
        }
        return implode("\n", array_unique($imports));
    }
}