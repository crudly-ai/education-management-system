import { useState } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { MultiSelect } from '@/components/ui/form/multi-select';
import { MediaSelector } from '@/components/ui/form/media-selector';
import { Settings, Mail, HardDrive, Palette } from 'lucide-react';
import { SystemSettings, defaultSettings } from './types';

interface SystemSettingsFormProps {
    isPreview?: boolean;
    settings?: SystemSettings;
    fileTypes?: Array<{value: string; label: string}>;
    onSave?: (settings: SystemSettings) => void;
}

export function SystemSettingsForm({ 
    isPreview = false, 
    settings = defaultSettings,
    fileTypes = [],
    onSave
}: SystemSettingsFormProps) {
    const { t } = useTranslations();
    const [activeTab, setActiveTab] = useState('system');
    
    // Only use useForm if not in preview mode
    const formHook = !isPreview ? useForm(settings) : null;
    const { data, setData, patch, processing } = formHook || { 
        data: settings, 
        setData: () => {}, 
        patch: () => {}, 
        processing: false 
    };

    const tabs = [
        { id: 'system', label: t('System Settings'), icon: Settings },
        { id: 'email', label: t('Email Settings'), icon: Mail },
        { id: 'storage', label: t('Storage Settings'), icon: HardDrive },
        { id: 'appearance', label: t('Appearance Settings'), icon: Palette },
    ];

    const formatCurrency = (amount: number) => {
        const formatted = amount.toFixed(2)
            .replace('.', data.decimal_separator)
            .replace(/\B(?=(\d{3})+(?!\d))/g, data.thousand_separator);
        return data.currency_position === 'before' ? `${data.currency_symbol}${formatted}` : `${formatted}${data.currency_symbol}`;
    };

    const formatDateTime = () => {
        const now = new Date();
        let dateStr = '';

        if (data.date_format === 'Y-m-d') {
            dateStr = now.toISOString().split('T')[0];
        } else if (data.date_format === 'm/d/Y') {
            dateStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
        } else if (data.date_format === 'd/m/Y') {
            dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        } else if (data.date_format === 'd-m-Y') {
            dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
        }

        const timeStr = data.time_format === '12' ? now.toLocaleTimeString('en-US') : now.toLocaleTimeString('en-GB');
        return `${dateStr} ${timeStr}`;
    };

    const handleSave = () => {
        if (isPreview) return;
        
        if (onSave) {
            onSave(data);
        } else if (patch) {
            patch('/system-settings');
        }
    };

    const updateField = (field: string, value: any) => {
        if (isPreview) return;
        if (setData) {
            setData(field as keyof SystemSettings, value);
        }
    };

    return (
        <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">{t('System Settings')}</h2>
                <p className="text-muted-foreground text-sm mt-1">{t('Manage application-wide configuration')}</p>
            </div>

            <div className="p-6">
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-6">
                    {/* System Settings Tab */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Application Name')}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    disabled={isPreview}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date_format">{t('Date Format')}</Label>
                                    <Select 
                                        value={data.date_format} 
                                        onValueChange={(value) => updateField('date_format', value)}
                                        disabled={isPreview}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Y-m-d">YYYY-MM-DD</SelectItem>
                                            <SelectItem value="m/d/Y">MM/DD/YYYY</SelectItem>
                                            <SelectItem value="d/m/Y">DD/MM/YYYY</SelectItem>
                                            <SelectItem value="d-m-Y">DD-MM-YYYY</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="time_format">{t('Time Format')}</Label>
                                    <Select 
                                        value={data.time_format} 
                                        onValueChange={(value) => updateField('time_format', value)}
                                        disabled={isPreview}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12">{t('12 Hour (AM/PM)')}</SelectItem>
                                            <SelectItem value="24">{t('24 Hour')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label>{t('Date & Time Preview')}</Label>
                                    <div className="p-3 bg-muted rounded-md text-sm">
                                        {formatDateTime()}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="currency_symbol">{t('Currency Symbol')}</Label>
                                    <Select 
                                        value={data.currency_symbol} 
                                        onValueChange={(value) => updateField('currency_symbol', value)}
                                        disabled={isPreview}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="$">$ (Dollar)</SelectItem>
                                            <SelectItem value="€">€ (Euro)</SelectItem>
                                            <SelectItem value="£">£ (Pound)</SelectItem>
                                            <SelectItem value="¥">¥ (Yen)</SelectItem>
                                            <SelectItem value="₹">₹ (Rupee)</SelectItem>
                                            <SelectItem value="₩">₩ (Won)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="currency_position">{t('Currency Position')}</Label>
                                    <Select 
                                        value={data.currency_position} 
                                        onValueChange={(value) => updateField('currency_position', value)}
                                        disabled={isPreview}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="before">{t('Before Amount')}</SelectItem>
                                            <SelectItem value="after">{t('After Amount')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="decimal_separator">{t('Decimal Separator')}</Label>
                                    <Select 
                                        value={data.decimal_separator} 
                                        onValueChange={(value) => updateField('decimal_separator', value)}
                                        disabled={isPreview}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=".">. (Dot)</SelectItem>
                                            <SelectItem value=",">, (Comma)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="thousand_separator">{t('Thousand Separator')}</Label>
                                    <Select 
                                        value={data.thousand_separator} 
                                        onValueChange={(value) => updateField('thousand_separator', value)}
                                        disabled={isPreview}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=",">, (Comma)</SelectItem>
                                            <SelectItem value=".">. (Dot)</SelectItem>
                                            <SelectItem value=" ">  (Space)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>{t('Currency Preview')}</Label>
                                <div className="p-3 bg-muted rounded-md text-sm">
                                    {formatCurrency(1234.56)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Settings Tab */}
                    {activeTab === 'email' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="mail_driver">{t('Mail Driver')}</Label>
                                    <Input
                                        id="mail_driver"
                                        value={data.mail_driver}
                                        onChange={(e) => updateField('mail_driver', e.target.value)}
                                        placeholder="smtp"
                                        disabled={isPreview}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mail_host">{t('Mail Host')}</Label>
                                    <Input
                                        id="mail_host"
                                        value={data.mail_host}
                                        onChange={(e) => updateField('mail_host', e.target.value)}
                                        placeholder="smtp.gmail.com"
                                        disabled={isPreview}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mail_port">{t('Mail Port')}</Label>
                                    <Input
                                        id="mail_port"
                                        type="number"
                                        value={data.mail_port}
                                        onChange={(e) => updateField('mail_port', e.target.value)}
                                        placeholder="587"
                                        disabled={isPreview}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mail_username">{t('Mail Username')}</Label>
                                    <Input
                                        id="mail_username"
                                        value={data.mail_username}
                                        onChange={(e) => updateField('mail_username', e.target.value)}
                                        placeholder="your-email@gmail.com"
                                        disabled={isPreview}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="mail_password">{t('Mail Password')}</Label>
                                    <Input
                                        id="mail_password"
                                        type="password"
                                        value={data.mail_password}
                                        onChange={(e) => updateField('mail_password', e.target.value)}
                                        placeholder="••••••••"
                                        disabled={isPreview}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mail_encryption">{t('Encryption')}</Label>
                                    <Select 
                                        value={data.mail_encryption} 
                                        onValueChange={(value) => updateField('mail_encryption', value)}
                                        disabled={isPreview}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tls">TLS</SelectItem>
                                            <SelectItem value="ssl">SSL</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mail_from_address">{t('From Email')}</Label>
                                    <Input
                                        id="mail_from_address"
                                        type="email"
                                        value={data.mail_from_address}
                                        onChange={(e) => updateField('mail_from_address', e.target.value)}
                                        placeholder="noreply@yoursite.com"
                                        disabled={isPreview}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mail_from_name">{t('From Name')}</Label>
                                    <Input
                                        id="mail_from_name"
                                        value={data.mail_from_name}
                                        onChange={(e) => updateField('mail_from_name', e.target.value)}
                                        placeholder="Your Application Name"
                                        disabled={isPreview}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Storage Settings Tab */}
                    {activeTab === 'storage' && (
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="storage_driver">{t('Storage Driver')}</Label>
                                <Select 
                                    value={data.storage_driver} 
                                    onValueChange={(value) => updateField('storage_driver', value)}
                                    disabled={isPreview}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="local">Local Storage</SelectItem>
                                        <SelectItem value="s3">AWS S3</SelectItem>
                                        <SelectItem value="wasabi">Wasabi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="storage_allowed_extensions">{t('Allowed File Extensions')}</Label>
                                <MultiSelect
                                    options={fileTypes}
                                    value={data.storage_allowed_extensions}
                                    onChange={(value) => updateField('storage_allowed_extensions', value)}
                                    placeholder="Select file types..."
                                    disabled={isPreview}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="max_upload_size">{t('Max Upload Size (MB)')}</Label>
                                <Input
                                    id="max_upload_size"
                                    type="number"
                                    value={data.max_upload_size}
                                    onChange={(e) => updateField('max_upload_size', e.target.value)}
                                    placeholder="10"
                                    min="1"
                                    max="1024"
                                    disabled={isPreview}
                                />
                            </div>

                            {data.storage_driver === 's3' && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="aws_access_key">{t('AWS Access Key')}</Label>
                                        <Input
                                            id="aws_access_key"
                                            value={data.aws_access_key}
                                            onChange={(e) => updateField('aws_access_key', e.target.value)}
                                            placeholder="AKIA..."
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="aws_secret_key">{t('AWS Secret Key')}</Label>
                                        <Input
                                            id="aws_secret_key"
                                            type="password"
                                            value={data.aws_secret_key}
                                            onChange={(e) => updateField('aws_secret_key', e.target.value)}
                                            placeholder="••••••••"
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="aws_region">{t('AWS Region')}</Label>
                                        <Input
                                            id="aws_region"
                                            value={data.aws_region}
                                            onChange={(e) => updateField('aws_region', e.target.value)}
                                            placeholder="us-east-1"
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="aws_bucket">{t('AWS Bucket')}</Label>
                                        <Input
                                            id="aws_bucket"
                                            value={data.aws_bucket}
                                            onChange={(e) => updateField('aws_bucket', e.target.value)}
                                            placeholder="my-bucket"
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="aws_url">{t('AWS URL')}</Label>
                                        <Input
                                            id="aws_url"
                                            value={data.aws_url}
                                            onChange={(e) => updateField('aws_url', e.target.value)}
                                            placeholder="https://s3.amazonaws.com"
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="aws_endpoint">{t('AWS Endpoint')}</Label>
                                        <Input
                                            id="aws_endpoint"
                                            value={data.aws_endpoint}
                                            onChange={(e) => updateField('aws_endpoint', e.target.value)}
                                            placeholder="https://s3.us-east-1.amazonaws.com"
                                            disabled={isPreview}
                                        />
                                    </div>
                                </div>
                            )}

                            {data.storage_driver === 'wasabi' && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="wasabi_access_key">{t('Wasabi Access Key')}</Label>
                                        <Input
                                            id="wasabi_access_key"
                                            value={data.wasabi_access_key}
                                            onChange={(e) => updateField('wasabi_access_key', e.target.value)}
                                            placeholder="Access Key"
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="wasabi_secret_key">{t('Wasabi Secret Key')}</Label>
                                        <Input
                                            id="wasabi_secret_key"
                                            type="password"
                                            value={data.wasabi_secret_key}
                                            onChange={(e) => updateField('wasabi_secret_key', e.target.value)}
                                            placeholder="••••••••"
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="wasabi_region">{t('Wasabi Region')}</Label>
                                        <Input
                                            id="wasabi_region"
                                            value={data.wasabi_region}
                                            onChange={(e) => updateField('wasabi_region', e.target.value)}
                                            placeholder="us-east-1"
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="wasabi_bucket">{t('Wasabi Bucket')}</Label>
                                        <Input
                                            id="wasabi_bucket"
                                            value={data.wasabi_bucket}
                                            onChange={(e) => updateField('wasabi_bucket', e.target.value)}
                                            placeholder="my-bucket"
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="wasabi_url">{t('Wasabi URL')}</Label>
                                        <Input
                                            id="wasabi_url"
                                            value={data.wasabi_url}
                                            onChange={(e) => updateField('wasabi_url', e.target.value)}
                                            placeholder="https://s3.wasabisys.com"
                                            disabled={isPreview}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="wasabi_root">{t('Wasabi Root')}</Label>
                                        <Input
                                            id="wasabi_root"
                                            value={data.wasabi_root}
                                            onChange={(e) => updateField('wasabi_root', e.target.value)}
                                            placeholder="/uploads"
                                            disabled={isPreview}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Appearance Settings Tab */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <Label>{t('Dark Logo')}</Label>
                                    {isPreview ? (
                                        <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                                            Media selector disabled in preview
                                        </div>
                                    ) : (
                                        <MediaSelector
                                            selectedPaths={data.dark_logo ? [data.dark_logo] : []}
                                            multiple={false}
                                            label={t('Dark Logo')}
                                            title={t('Select Dark Logo')}
                                            onChange={(paths) => updateField('dark_logo', paths[0] || '')}
                                        />
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label>{t('Light Logo')}</Label>
                                    {isPreview ? (
                                        <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                                            Media selector disabled in preview
                                        </div>
                                    ) : (
                                        <MediaSelector
                                            selectedPaths={data.light_logo ? [data.light_logo] : []}
                                            multiple={false}
                                            label={t('Light Logo')}
                                            title={t('Select Light Logo')}
                                            onChange={(paths) => updateField('light_logo', paths[0] || '')}
                                        />
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label>{t('Favicon')}</Label>
                                    {isPreview ? (
                                        <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                                            Media selector disabled in preview
                                        </div>
                                    ) : (
                                        <MediaSelector
                                            selectedPaths={data.favicon ? [data.favicon] : []}
                                            multiple={false}
                                            label={t('Favicon')}
                                            title={t('Select Favicon')}
                                            onChange={(paths) => updateField('favicon', paths[0] || '')}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="footerText">{t('Footer Text')}</Label>
                                <Input
                                    id="footerText"
                                    value={data.footer_text}
                                    onChange={(e) => updateField('footer_text', e.target.value)}
                                    placeholder={t('© 2024 Crudly. All rights reserved.')}
                                    disabled={isPreview}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('Text displayed in the footer')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-base font-medium">{t('Theme Color')}</h3>
                                <div className="grid grid-cols-6 gap-2">
                                    {Object.entries({ blue: '#3b82f6', green: '#10b981', purple: '#8b5cf6', orange: '#f97316', red: '#ef4444', black: '#000000' }).map(([color, hex]) => (
                                        <Button
                                            key={color}
                                            type="button"
                                            variant={data.theme_color === color ? "default" : "outline"}
                                            className="h-8 w-full p-0 relative"
                                            style={{ backgroundColor: data.theme_color === color ? hex : 'transparent' }}
                                            onClick={() => updateField('theme_color', color)}
                                            disabled={isPreview}
                                        >
                                            <span
                                                className="absolute inset-1 rounded-sm"
                                                style={{ backgroundColor: hex }}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-base font-medium">{t('Theme Mode')}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        type="button"
                                        variant={data.theme_mode === 'light' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('theme_mode', 'light')}
                                        disabled={isPreview}
                                    >
                                        {t('Light')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.theme_mode === 'dark' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('theme_mode', 'dark')}
                                        disabled={isPreview}
                                    >
                                        {t('Dark')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.theme_mode === 'system' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('theme_mode', 'system')}
                                        disabled={isPreview}
                                    >
                                        {t('System')}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-base font-medium">{t('Layout Direction')}</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant={data.layout_direction === 'ltr' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('layout_direction', 'ltr')}
                                        disabled={isPreview}
                                    >
                                        {t('Left-to-Right')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.layout_direction === 'rtl' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('layout_direction', 'rtl')}
                                        disabled={isPreview}
                                    >
                                        {t('Right-to-Left')}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-base font-medium">{t('Sidebar Style')}</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        type="button"
                                        variant={data.sidebar_style === 'plain' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('sidebar_style', 'plain')}
                                        disabled={isPreview}
                                    >
                                        {t('Plain')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.sidebar_style === 'colored' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('sidebar_style', 'colored')}
                                        disabled={isPreview}
                                    >
                                        {t('Colored')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.sidebar_style === 'gradient' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('sidebar_style', 'gradient')}
                                        disabled={isPreview}
                                    >
                                        {t('Gradient')}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-base font-medium">{t('Sidebar Variant')}</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        type="button"
                                        variant={data.sidebar_variant === 'inset' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('sidebar_variant', 'inset')}
                                        disabled={isPreview}
                                    >
                                        {t('Inset')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.sidebar_variant === 'floating' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('sidebar_variant', 'floating')}
                                        disabled={isPreview}
                                    >
                                        {t('Floating')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.sidebar_variant === 'minimal' ? "default" : "outline"}
                                        className="h-10 justify-start"
                                        onClick={() => updateField('sidebar_variant', 'minimal')}
                                        disabled={isPreview}
                                    >
                                        {t('Minimal')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button - Only show if not preview */}
                    {!isPreview && (
                        <div className="flex items-center gap-4 pt-6 border-t">
                            <Button onClick={handleSave} disabled={processing}>
                                {processing ? t('Saving...') : t('Save Changes')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}