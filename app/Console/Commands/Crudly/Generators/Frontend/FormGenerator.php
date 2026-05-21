<?php

namespace App\Console\Commands\Crudly\Generators\Frontend;

use Illuminate\Support\Str;

class FormGenerator
{
    protected $name;
    protected $fields;

    public function __construct($name, $fields)
    {
        $this->name = $name;
        $this->fields = $fields;
    }

    public function generateImports()
    {
        $imports = [];
        foreach ($this->fields as $field) {
            if ($field['mapping']['frontend_component'] === 'RadioGroup') {
                $imports[] = "import { RadioGroup, RadioGroupItem } from '{$field['mapping']['frontend_import']}';";
            } elseif ($field['mapping']['frontend_component'] === 'Select') {
                $imports[] = "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '{$field['mapping']['frontend_import']}';";
            } else {
                $imports[] = "import { {$field['mapping']['frontend_component']} } from '{$field['mapping']['frontend_import']}';";
            }
        }
        return implode("\n", array_unique($imports));
    }

    public function generateFields()
    {
        $fields = '';
        foreach ($this->fields as $field) {
            $fieldName = $field['name'];
            $component = $field['mapping']['frontend_component'];
            
            $fields .= "                        <div className=\"space-y-2\">\n";
            $fields .= "                            <Label htmlFor=\"{$fieldName}\">{t('" . $this->formatFieldName($fieldName) . "')}";
            
            if (strpos($field['mapping']['validation'], 'required') !== false) {
                $fields .= " *";
            }
            
            $fields .= "</Label>\n";
            
            if ($component === 'Switch') {
                $fields .= $this->generateSwitchField($fieldName, $field);
            } elseif ($component === 'Checkbox') {
                $fields .= $this->generateCheckboxField($fieldName);

            } elseif ($component === 'RadioGroup') {
                $fields .= $this->generateRadioField($fieldName, $field);
            } elseif ($component === 'Select') {
                if ($field['type'] === 'relationship') {
                    $fields .= $this->generateRelationshipSelectField($fieldName, $field);
                } else {
                    $fields .= $this->generateSelectField($fieldName, $field);
                }
            } elseif ($component === 'MultiLevelSelect') {
                $fields .= $this->generateRelationshipMultiSelectField($fieldName, $field);
            } elseif ($component === 'MultiSelect') {
                $fields .= $this->generateMultiSelectField($fieldName, $field);
            } elseif ($component === 'DatePicker') {
                $fields .= $this->generateDatePickerField($fieldName, $field);
            } elseif ($component === 'DateRangePicker') {
                $fields .= $this->generateDateRangePickerField($fieldName, $field);
            } elseif ($component === 'TimePicker') {
                $fields .= $this->generateTimePickerField($fieldName, $field);
            } elseif ($component === 'StarRating') {
                $fields .= $this->generateRatingField($fieldName, $field);
            } elseif ($component === 'ColorPicker') {
                $fields .= $this->generateColorPickerField($fieldName, $field);
            } elseif ($component === 'CurrencyInput') {
                $fields .= $this->generateCurrencyField($fieldName, $field);
            } elseif ($component === 'MediaSelector') {
                $fields .= $this->generateMediaSelectorField($fieldName, $field);
            } else {
                $fields .= $this->generateInputField($fieldName, $component, $field);
            }
            
            $fields .= "                        </div>\n\n";
        }
        
        return $fields;
    }

    protected function generateSwitchField($fieldName, $fieldData = null)
    {
        // Get dynamic options from field mapping
        $options = ['active', 'inactive']; // fallback
        if ($fieldData && isset($fieldData['mapping']['filter_options'])) {
            $options = array_map(function($opt) { return $opt['value']; }, $fieldData['mapping']['filter_options']);
        }
        $activeValue = $options[0] ?? 'active';
        $inactiveValue = $options[1] ?? 'inactive';
        
        $field = "                            <div className=\"flex items-center space-x-2\">\n";
        $field .= "                                <Switch\n";
        $field .= "                                    id=\"{$fieldName}\"\n";
        $field .= "                                    checked={data.{$fieldName} === '{$activeValue}'}\n";
        $field .= "                                    onCheckedChange={(checked) => setData('{$fieldName}', checked ? '{$activeValue}' : '{$inactiveValue}')}\n";
        $field .= "                                />\n";
        $field .= "                                <Label htmlFor=\"{$fieldName}\">{t('" . ucfirst($activeValue) . " Status')}</Label>\n";
        $field .= "                            </div>\n";
        return $field;
    }
    
    protected function generateCheckboxField($fieldName)
    {
        $field = "                            <div className=\"flex items-center space-x-2\">\n";
        $field .= "                                <Checkbox\n";
        $field .= "                                    id=\"{$fieldName}\"\n";
        $field .= "                                    checked={data.{$fieldName}}\n";
        $field .= "                                    onCheckedChange={(checked) => setData('{$fieldName}', checked)}\n";
        $field .= "                                />\n";
        $field .= "                                <Label htmlFor=\"{$fieldName}\" className=\"cursor-pointer\">{t('" . ucfirst($fieldName) . "')}</Label>\n";
        $field .= "                            </div>\n";
        return $field;
    }
    
    protected function generateRadioField($fieldName, $fieldData)
    {
        $field = "                            <RadioGroup\n";
        $field .= "                                value={data.{$fieldName}}\n";
        $field .= "                                onValueChange={(value) => setData('{$fieldName}', value)}\n";
        $field .= "                            >\n";
        
        if (isset($fieldData['mapping']['filter_options'])) {
            foreach ($fieldData['mapping']['filter_options'] as $option) {
                $field .= "                                <div className=\"flex items-center space-x-2\">\n";
                $field .= "                                    <RadioGroupItem value=\"{$option['value']}\" id=\"{$fieldName}_{$option['value']}\" />\n";
                $field .= "                                    <Label htmlFor=\"{$fieldName}_{$option['value']}\" className=\"cursor-pointer\">{t('{$option['label']}')}</Label>\n";
                $field .= "                                </div>\n";
            }
        }
        
        $field .= "                            </RadioGroup>\n";
        return $field;
    }
    
    protected function generateCheckboxGroupField($fieldName, $fieldData)
    {
        $field = "                            <div className=\"space-y-3\">\n";
        
        if (isset($fieldData['mapping']['filter_options'])) {
            foreach ($fieldData['mapping']['filter_options'] as $option) {
                $field .= "                                <div className=\"flex items-center space-x-2\">\n";
                $field .= "                                    <Checkbox\n";
                $field .= "                                        id=\"{$fieldName}_{$option['value']}\"\n";
                $field .= "                                        checked={data.{$fieldName}.includes('{$option['value']}')}\n";
                $field .= "                                        onCheckedChange={(checked) => {\n";
                $field .= "                                            const current = data.{$fieldName} || [];\n";
                $field .= "                                            if (checked) {\n";
                $field .= "                                                setData('{$fieldName}', [...current, '{$option['value']}']);\n";
                $field .= "                                            } else {\n";
                $field .= "                                                setData('{$fieldName}', current.filter(item => item !== '{$option['value']}'));\n";
                $field .= "                                            }\n";
                $field .= "                                        }}\n";
                $field .= "                                    />\n";
                $field .= "                                    <Label htmlFor=\"{$fieldName}_{$option['value']}\" className=\"cursor-pointer\">{t('{$option['label']}')}</Label>\n";
                $field .= "                                </div>\n";
            }
        }
        
        $field .= "                            </div>\n";
        return $field;
    }

    protected function generateSelectField($fieldName, $fieldData)
    {
        $field = "                            <Select value={data.{$fieldName}} onValueChange={(value) => setData('{$fieldName}', value)}>\n";
        $field .= "                                <SelectTrigger>\n";
        $field .= "                                    <SelectValue placeholder={t('Select " . $this->formatFieldName($fieldName) . "')} />\n";
        $field .= "                                </SelectTrigger>\n";
        $field .= "                                <SelectContent>\n";
        
        if (isset($fieldData['mapping']['filter_options'])) {
            foreach ($fieldData['mapping']['filter_options'] as $option) {
                $field .= "                                    <SelectItem value=\"{$option['value']}\">{$option['label']}</SelectItem>\n";
            }
        }
        
        $field .= "                                </SelectContent>\n";
        $field .= "                            </Select>\n";
        return $field;
    }
    
    protected function generateRelationshipMultiSelectField($fieldName, $fieldData)
    {
        $relatedModel = $fieldData['mapping']['related_model'];
        $relatedVariable = Str::camel(Str::plural($relatedModel));
        $dependsOn = $fieldData['mapping']['depends_on'] ?? null;
        
        $field = "                            <Select \n";
        $field .= "                                value={data.{$fieldName}?.toString()} \n";
        $field .= "                                onValueChange={(value) => setData('{$fieldName}', parseInt(value))}\n";
        
        if ($dependsOn) {
            $field .= "                                disabled={!data.{$dependsOn}}\n";
        }
        
        $field .= "                            >\n";
        $field .= "                                <SelectTrigger>\n";
        
        if ($dependsOn) {
            $parentFieldName = str_replace('_id', '', $dependsOn);
            $field .= "                                    <SelectValue placeholder={data.{$dependsOn} ? t('Select " . $this->formatFieldName(str_replace('_id', '', $fieldName)) . "') : t('Select " . $this->formatFieldName($parentFieldName) . " First')} />\n";
        } else {
            $field .= "                                    <SelectValue placeholder={t('Select " . $this->formatFieldName(str_replace('_id', '', $fieldName)) . "')} />\n";
        }
        
        $field .= "                                </SelectTrigger>\n";
        $field .= "                                <SelectContent>\n";
        $field .= "                                    {{$relatedVariable}.map(({$this->getSingularName($relatedModel)}: any) => (\n";
        $field .= "                                        <SelectItem key={{$this->getSingularName($relatedModel)}.id} value={{$this->getSingularName($relatedModel)}.id.toString()}>\n";
        $field .= "                                            {{$this->getSingularName($relatedModel)}.name}\n";
        $field .= "                                        </SelectItem>\n";
        $field .= "                                    ))}\n";
        $field .= "                                </SelectContent>\n";
        $field .= "                            </Select>\n";
        $field .= "                            {errors.{$fieldName} && <p className=\"text-red-500 text-sm mt-1\">{errors.{$fieldName}}</p>}\n";
        return $field;
    }
    
    protected function generateRelationshipSelectField($fieldName, $fieldData)
    {
        $relatedModel = $fieldData['mapping']['related_model'];
        $relatedVariable = Str::camel(Str::plural($relatedModel));
        
        $field = "                            <Select value={data.{$fieldName}?.toString()} onValueChange={(value) => setData('{$fieldName}', parseInt(value))}>\n";
        $field .= "                                <SelectTrigger>\n";
        $field .= "                                    <SelectValue placeholder={t('Select " . $this->formatFieldName(str_replace('_id', '', $fieldName)) . "')} />\n";
        $field .= "                                </SelectTrigger>\n";
        $field .= "                                <SelectContent>\n";
        $field .= "                                    {relationshipData.{$relatedVariable}?.map(({$this->getSingularName($relatedModel)}) => (\n";
        $field .= "                                        <SelectItem key={{$this->getSingularName($relatedModel)}.id} value={{$this->getSingularName($relatedModel)}.id.toString()}>\n";
        $field .= "                                            {{$this->getSingularName($relatedModel)}.name || {$this->getSingularName($relatedModel)}.title}\n";
        $field .= "                                        </SelectItem>\n";
        $field .= "                                    ))}\n";
        $field .= "                                </SelectContent>\n";
        $field .= "                            </Select>\n";
        return $field;
    }

    protected function generateMultiSelectField($fieldName, $fieldData)
    {
        $field = "                            <MultiSelect\n";
        $field .= "                                options={[";
        
        if (isset($fieldData['mapping']['filter_options'])) {
            $options = [];
            foreach ($fieldData['mapping']['filter_options'] as $option) {
                $options[] = "{value: '{$option['value']}', label: '{$option['label']}'}";
            }
            $field .= implode(', ', $options);
        }
        
        $field .= "]}\n";
        $field .= "                                value={data.{$fieldName}}\n";
        $field .= "                                onChange={(value) => setData('{$fieldName}', value)}\n";
        $field .= "                                placeholder={t('Select " . $this->formatFieldName($fieldName) . "')}\n";
        $field .= "                            />\n";
        return $field;
    }

    protected function generateDatePickerField($fieldName, $field)
    {
        $fieldHtml = "                            <DatePicker\n";
        $fieldHtml .= "                                value={data.{$fieldName}}\n";
        $fieldHtml .= "                                onChange={(value) => setData('{$fieldName}', value)}\n";
        $fieldHtml .= "                                placeholder={t('Select " . $this->formatFieldName($fieldName) . "')}\n";
        $fieldHtml .= "                            />\n";
        
        if (strpos($field['mapping']['validation'], 'required') !== false) {
            $fieldHtml .= "                            {errors.{$fieldName} && <p className=\"text-red-500 text-sm mt-1\">{errors.{$fieldName}}</p>}\n";
        }
        
        return $fieldHtml;
    }

    protected function generateDateRangePickerField($fieldName, $field)
    {
        $startField = $fieldName . '_start';
        $endField = $fieldName . '_end';
        
        $fieldHtml = "                            <DateRangePicker\n";
        $fieldHtml .= "                                value={{\n";
        $fieldHtml .= "                                    startDate: data.{$startField},\n";
        $fieldHtml .= "                                    endDate: data.{$endField}\n";
        $fieldHtml .= "                                }}\n";
        $fieldHtml .= "                                onChange={(range) => {\n";
        $fieldHtml .= "                                    setData('{$startField}', range.startDate);\n";
        $fieldHtml .= "                                    setData('{$endField}', range.endDate);\n";
        $fieldHtml .= "                                }}\n";
        $fieldHtml .= "                                placeholder={t('Select " . $this->formatFieldName($fieldName) . " Range')}\n";
        $fieldHtml .= "                            />\n";
        
        if (strpos($field['mapping']['validation'], 'required') !== false) {
            $fieldHtml .= "                            {(errors.{$startField} || errors.{$endField}) && <p className=\"text-red-500 text-sm mt-1\">{errors.{$startField} || errors.{$endField}}</p>}\n";
        }
        
        return $fieldHtml;
    }

    protected function generateTimePickerField($fieldName, $field)
    {
        $fieldHtml = "                            <TimePicker\n";
        $fieldHtml .= "                                value={data.{$fieldName}}\n";
        $fieldHtml .= "                                onChange={(value) => setData('{$fieldName}', value)}\n";
        $fieldHtml .= "                                placeholder={t('Select " . $this->formatFieldName($fieldName) . "')}\n";
        $fieldHtml .= "                            />\n";
        
        if (strpos($field['mapping']['validation'], 'required') !== false) {
            $fieldHtml .= "                            {errors.{$fieldName} && <p className=\"text-red-500 text-sm mt-1\">{errors.{$fieldName}}</p>}\n";
        }
        
        return $fieldHtml;
    }

    protected function generateRatingField($fieldName, $field)
    {
        $fieldHtml = "                            <StarRating\n";
        $fieldHtml .= "                                value={data.{$fieldName}}\n";
        $fieldHtml .= "                                onChange={(value) => setData('{$fieldName}', value)}\n";
        $fieldHtml .= "                                maxRating={5}\n";
        $fieldHtml .= "                            />\n";
        
        if (strpos($field['mapping']['validation'], 'required') !== false) {
            $fieldHtml .= "                            {errors.{$fieldName} && <p className=\"text-red-500 text-sm mt-1\">{errors.{$fieldName}}</p>}\n";
        }
        
        return $fieldHtml;
    }

    protected function generateColorPickerField($fieldName, $field)
    {
        $fieldHtml = "                            <ColorPicker\n";
        $fieldHtml .= "                                value={data.{$fieldName}}\n";
        $fieldHtml .= "                                onChange={(value) => setData('{$fieldName}', value)}\n";
        $fieldHtml .= "                            />\n";
        
        if (strpos($field['mapping']['validation'], 'required') !== false) {
            $fieldHtml .= "                            {errors.{$fieldName} && <p className=\"text-red-500 text-sm mt-1\">{errors.{$fieldName}}</p>}\n";
        }
        
        return $fieldHtml;
    }

    protected function generateCurrencyField($fieldName, $field)
    {
        $fieldHtml = "                            <CurrencyInput\n";
        $fieldHtml .= "                                value={data.{$fieldName}}\n";
        $fieldHtml .= "                                onChange={(value) => setData('{$fieldName}', value)}\n";
        $fieldHtml .= "                                placeholder={t('Enter " . $this->formatFieldName($fieldName) . "')}\n";
        $fieldHtml .= "                                currencySymbol={window.currencySettings?.currency_symbol || '$'}\n";
        $fieldHtml .= "                                currencyPosition={window.currencySettings?.currency_position || 'before'}\n";
        $fieldHtml .= "                                decimalSeparator={window.currencySettings?.decimal_separator || '.'}\n";
        $fieldHtml .= "                                thousandSeparator={window.currencySettings?.thousand_separator || ','}\n";
        $fieldHtml .= "                            />\n";
        
        if (strpos($field['mapping']['validation'], 'required') !== false) {
            $fieldHtml .= "                            {errors.{$fieldName} && <p className=\"text-red-500 text-sm mt-1\">{errors.{$fieldName}}</p>}\n";
        }
        
        return $fieldHtml;
    }

    protected function generateMediaSelectorField($fieldName, $field)
    {
        $isMultiple = isset($field['mapping']['multiple']) && $field['mapping']['multiple'];
        $mediaType = $field['mapping']['media_type'] ?? 'file';
        $label = ucfirst(str_replace('_', ' ', $fieldName));
        
        $fieldHtml = "                            <MediaSelector\n";
        
        if ($isMultiple) {
            $fieldHtml .= "                                selectedPaths={data.{$fieldName} || []}\n";
            $fieldHtml .= "                                onChange={(paths) => setData('{$fieldName}', paths)}\n";
        } else {
            $fieldHtml .= "                                selectedPaths={data.{$fieldName} ? [data.{$fieldName}] : []}\n";
            $fieldHtml .= "                                onChange={(paths) => setData('{$fieldName}', paths[0] || '')}\n";
        }
        
        $fieldHtml .= "                                multiple={" . ($isMultiple ? 'true' : 'false') . "}\n";
        $fieldHtml .= "                                label=\"{$label}\"\n";
        $fieldHtml .= "                                title={t('Choose {$label}')}\n";
        $fieldHtml .= "                            />\n";
        
        if (strpos($field['mapping']['validation'], 'required') !== false) {
            $fieldHtml .= "                            {errors.{$fieldName} && <p className=\"text-red-500 text-sm mt-1\">{errors.{$fieldName}}</p>}\n";
        }
        
        return $fieldHtml;
    }

    protected function generateInputField($fieldName, $component, $field)
    {
        $fieldHtml = "                            <{$component}\n";
        $fieldHtml .= "                                id=\"{$fieldName}\"\n";
        $fieldHtml .= "                                value={data.{$fieldName}}\n";
        $fieldHtml .= "                                onChange={(e) => setData('{$fieldName}', e.target.value)}\n";
        
        if ($component === 'Textarea') {
            $fieldHtml .= "                                rows={4}\n";
        }
        
        if (strpos($field['mapping']['validation'], 'required') !== false) {
            $fieldHtml .= "                                error={errors.{$fieldName}}\n";
        }
        
        $fieldHtml .= "                            />\n";
        
        if (strpos($field['mapping']['validation'], 'required') !== false) {
            $fieldHtml .= "                            {errors.{$fieldName} && <p className=\"text-red-500 text-sm mt-1\">{errors.{$fieldName}}</p>}\n";
        }
        
        return $fieldHtml;
    }

    public function generateFormData()
    {
        $data = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'switch') {
                // Get dynamic options from field mapping
                $options = ['active', 'inactive']; // fallback
                if (isset($field['mapping']['filter_options'])) {
                    $options = array_map(function($opt) { return $opt['value']; }, $field['mapping']['filter_options']);
                }
                $activeValue = $options[0] ?? 'active';
                $inactiveValue = $options[1] ?? 'inactive';
                $data .= "        {$field['name']}: '{$activeValue}' as '{$activeValue}' | '{$inactiveValue}',\n";
            } elseif ($field['type'] === 'radio') {
                $defaultValue = 'option1';
                if (isset($field['mapping']['filter_options']) && !empty($field['mapping']['filter_options'])) {
                    $defaultValue = $field['mapping']['filter_options'][0]['value'];
                }
                $data .= "        {$field['name']}: '{$defaultValue}',\n";
            } elseif ($field['type'] === 'checkbox') {
                $data .= "        {$field['name']}: false,\n";

            } elseif ($field['type'] === 'select') {
                $data .= "        {$field['name']}: '',\n";
            } elseif ($field['type'] === 'multiselect') {
                $data .= "        {$field['name']}: [] as string[],\n";
            } elseif ($field['type'] === 'date-picker') {
                $data .= "        {$field['name']}: '',\n";
            } elseif ($field['type'] === 'date-range-picker') {
                $data .= "        {$field['name']}_start: '',\n";
                $data .= "        {$field['name']}_end: '',\n";
            } elseif ($field['type'] === 'time-picker') {
                $data .= "        {$field['name']}: '',\n";
            } elseif ($field['type'] === 'rating') {
                $data .= "        {$field['name']}: 0,\n";
            } elseif ($field['type'] === 'color-picker') {
                $data .= "        {$field['name']}: '#000000',\n";
            } elseif ($field['type'] === 'currency') {
                $data .= "        {$field['name']}: '0.00',\n";
            } elseif ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $data .= "        {$field['name']}: null as number | null,\n";
            } elseif ($field['type'] === 'image-single' || $field['type'] === 'file-single') {
                $data .= "        {$field['name']}: '',\n";
            } elseif ($field['type'] === 'file-multi') {
                $data .= "        {$field['name']}: [] as string[],\n";
            } else {
                $data .= "        {$field['name']}: '',\n";
            }
        }
        return $data;
    }

    public function generateSetFormData()
    {
        $data = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'textarea') {
                $data .= "                {$field['name']}: {$this->getSingularName()}.{$field['name']} || '',\n";
            } elseif ($field['type'] === 'date-range-picker') {
                $data .= "                {$field['name']}_start: {$this->getSingularName()}.{$field['name']}_start || '',\n";
                $data .= "                {$field['name']}_end: {$this->getSingularName()}.{$field['name']}_end || '',\n";
            } else {
                $data .= "                {$field['name']}: {$this->getSingularName()}.{$field['name']},\n";
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
}