import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { MultiSelect } from '@/components/ui/form/multi-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/display/table';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/feedback/badge';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit, Eye, Loader2, Plus, Search, Trash2, Grid3X3, List, Filter, X, Calendar, Users } from 'lucide-react';
import { DatePicker } from '@/components/ui/form/date-picker';
import { Checkbox } from '@/components/ui/form/checkbox';
import { useTranslations } from '@/hooks/use-translations';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

interface Column {
    data: string;
    name: string;
    title: string;
    orderable?: boolean;
    searchable?: boolean;
    render?: (data: any, type: string, row: any) => React.ReactNode;
}

interface FilterOption {
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'text';
    options?: { value: string; label: string }[];
    placeholder?: string;
    onChange?: (value: string | string[]) => void;
    disabled?: boolean;
}

interface YajraDataTableProps {
    url: string;
    columns: Column[];
    title: string;
    customActions?: React.ReactNode;
    customRowActions?: (item: any) => React.ReactNode;
    filters?: FilterOption[];
    gridViewEnabled?: boolean;
    renderGridItem?: (item: any) => React.ReactNode;
    emptyStateIcon?: React.ReactNode;
    data?: any[];
    serverSide?: boolean;
    onSearchChange?: (value: string) => void;
}

export const YajraDataTable = forwardRef<{ refresh: () => void }, YajraDataTableProps>(function YajraDataTable({
    url,
    columns,
    title,
    customActions,
    customRowActions,
    filters = [],
    gridViewEnabled = false,
    renderGridItem,
    emptyStateIcon,
    data: staticData,
    serverSide = true,
    onSearchChange,
}, ref) {
    const { t } = useTranslations();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [pageLength, setPageLength] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filteredRecords, setFilteredRecords] = useState(0);
    const [orderColumn, setOrderColumn] = useState(0);
    const [orderDir, setOrderDir] = useState('asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showFilters, setShowFilters] = useState(false);
    const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({});

    const fetchData = async () => {
        if (!serverSide) {
            // Use static data for preview
            if (staticData) {
                setData(staticData);
                setTotalRecords(staticData.length);
                setFilteredRecords(staticData.length);
            }
            return;
        }
        
        setLoading(true);
        try {
            const params = new URLSearchParams({
                draw: '1',
                start: ((currentPage - 1) * pageLength).toString(),
                length: pageLength.toString(),
                'search[value]': search,
                'order[0][column]': orderColumn.toString(),
                'order[0][dir]': orderDir,
            });

            // Add filter parameters
            Object.entries(filterValues).forEach(([key, value]) => {
                if (value) {
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(`${key}[]`, v));
                    } else {
                        params.append(key, value);
                    }
                }
            });

            columns.forEach((col, index) => {
                params.append(`columns[${index}][data]`, col.data);
                params.append(`columns[${index}][name]`, col.name);
                params.append(`columns[${index}][searchable]`, (col.searchable !== false).toString());
                params.append(`columns[${index}][orderable]`, (col.orderable !== false).toString());
            });

            const response = await fetch(`${url}?${params}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            const result = await response.json();
            setData(result.data);
            setTotalRecords(result.recordsTotal);
            setFilteredRecords(result.recordsFiltered);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (serverSide) {
            fetchData();
        } else if (staticData) {
            // For client-side mode, just update the data
            setData(staticData);
            setTotalRecords(staticData.length);
            setFilteredRecords(staticData.length);
        }
    }, [currentPage, pageLength, search, orderColumn, orderDir, filterValues, staticData, serverSide]);

    useImperativeHandle(ref, () => ({
        refresh: fetchData,
    }));

    const handleSearch = () => {
        setCurrentPage(1);
        if (serverSide) {
            fetchData();
        } else if (onSearchChange) {
            onSearchChange(search);
        }
    };

    const handlePageLengthChange = (value: string) => {
        setPageLength(parseInt(value));
        setCurrentPage(1);
    };

    const handleFilterChange = (key: string, value: string | string[], filter?: FilterOption) => {
        const processedValue = Array.isArray(value) 
            ? (value.length > 0 ? value : []) 
            : (value === 'all' ? '' : value);
            
        setFilterValues(prev => ({ ...prev, [key]: processedValue }));
        setCurrentPage(1);
        
        if (filter?.onChange) {
            filter.onChange(processedValue);
        }
        
        if (!serverSide) {
            // For client-side filtering, we don't need to fetch data
            return;
        }
    };

    const clearFilters = () => {
        setFilterValues({});
        setCurrentPage(1);
    };

    const activeFiltersCount = Object.values(filterValues).filter(value => 
        Array.isArray(value) ? value.length > 0 : Boolean(value)
    ).length;

    const totalPages = Math.ceil(filteredRecords / pageLength);

    const renderPaginationNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={i === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                    className="w-10"
                    disabled={loading}
                >
                    {i}
                </Button>
            );
        }

        return pages;
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-xl font-semibold">{title}</h1>
                {customActions}
            </div>

            {/* Controls Bar */}
            <div className="p-4 border-b">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                    {/* Left side - Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder={t('Search') + ` ${title.toLowerCase()}...`}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    if (!serverSide && onSearchChange) {
                                        onSearchChange(e.target.value);
                                    }
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10 h-10"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {filters.length > 0 && (
                                <Button 
                                    variant={showFilters ? "default" : "outline"}
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="h-10"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    {t('Filters')}
                                    {activeFiltersCount > 0 && (
                                        <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
                                            {activeFiltersCount}
                                        </Badge>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    {/* Right side - View controls and pagination */}
                    <div className="flex items-center gap-4">
                        {gridViewEnabled && (
                            <div className="flex items-center bg-muted rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="h-8 w-8 p-0"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 w-8 p-0"
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{t('Show:')}</span>
                            <Select value={pageLength.toString()} onValueChange={handlePageLengthChange} disabled={loading}>
                                <SelectTrigger className="w-20 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && filters.length > 0 && (
                <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">{t('Filters')}</h3>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={clearFilters}
                            className={activeFiltersCount > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                        >
                            <X className="h-4 w-4 mr-1" />
                            {t('Clear')} ({activeFiltersCount})
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {filters.map((filter) => (
                            <div key={filter.key} className={filter.type === 'date' ? 'min-w-[200px]' : 'min-w-[150px]'}>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">{filter.label}</label>
                                {filter.type === 'select' && filter.options ? (
                                    <Select 
                                        value={filterValues[filter.key] as string || 'all'} 
                                        onValueChange={(value) => handleFilterChange(filter.key, value, filter)}
                                        disabled={filter.disabled}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={filter.placeholder || t('Select') + ` ${filter.label}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('All')} {filter.label}s</SelectItem>
                                            {filter.options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : filter.type === 'multiselect' && filter.options ? (
                                    <MultiSelect
                                        options={filter.options}
                                        value={filterValues[filter.key] as string[] || []}
                                        onChange={(value) => handleFilterChange(filter.key, value, filter)}
                                        placeholder={filter.placeholder || t('Select') + ` ${filter.label}`}
                                        disabled={filter.disabled}
                                    />
                                ) : filter.type === 'date' ? (
                                    <DatePicker
                                        value={filterValues[filter.key] || ''}
                                        onChange={(value) => handleFilterChange(filter.key, value, filter)}
                                        disabled={filter.disabled}
                                        placeholder={filter.placeholder || t('Select') + ` ${filter.label}`}
                                    />
                                ) : (
                                    <Input
                                        placeholder={filter.placeholder || t('Enter') + ` ${filter.label}`}
                                        value={filterValues[filter.key] || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value, filter)}
                                        disabled={filter.disabled}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-sm text-muted-foreground">{t('Loading...')}</p>
                        </div>
                    </div>
                )}
                
                {viewMode === 'grid' && gridViewEnabled && renderGridItem ? (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {data.length === 0 ? (
                            <div className="col-span-full text-center py-16">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    {emptyStateIcon || <Users className="h-8 w-8 text-gray-400" />}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('No results found')}</h3>
                                <p className="text-gray-500 mb-4">{t('Get started by creating your first item')}.</p>
                                {customActions}
                            </div>
                        ) : (
                            data.map((item, index) => (
                                <div key={item.id || index}>
                                    {renderGridItem(item)}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                {columns.map((column, index) => (
                                    <TableHead 
                                        key={column.data}
                                        className={`font-semibold ${column.orderable !== false ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                                        onClick={() => {
                                            if (column.orderable !== false) {
                                                if (orderColumn === index) {
                                                    setOrderDir(orderDir === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setOrderColumn(index);
                                                    setOrderDir('asc');
                                                }
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.title}
                                            {column.orderable !== false && orderColumn === index && (
                                                <span className="text-gray-600">
                                                    {orderDir === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                                {customRowActions && (
                                    <TableHead className="text-right font-semibold">{t('Actions')}</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className="text-center py-16">
                                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            {emptyStateIcon || <Users className="h-8 w-8 text-gray-400" />}
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('No results found')}</h3>
                                        <p className="text-gray-500">{t('Try adjusting your search or filters')}.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item, index) => (
                                    <TableRow key={item.id || index} className="hover:bg-gray-50/50 transition-colors">
                                        {columns.map((column) => (
                                            <TableCell key={column.data}>
                                                {column.render
                                                    ? column.render(item[column.data], 'display', item)
                                                    : item[column.data]}
                                            </TableCell>
                                        ))}
                                        {customRowActions && (
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {customRowActions(item)}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Pagination */}
            {data.length > 0 && (
                <div className="p-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            {filteredRecords === 0 ? (
                                <span>{t('No results found')}</span>
                            ) : (
                                <>
                                    {t('Showing')} {(currentPage - 1) * pageLength + 1}-{Math.min(currentPage * pageLength, filteredRecords)} {t('of')} {filteredRecords} {t('results')}
                                    {filteredRecords !== totalRecords && (
                                        <span className="ml-1">({t('filtered from')} {totalRecords} {t('total')})</span>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="h-9"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    {t('Previous')}
                                </Button>
                                
                                <div className="flex items-center gap-1">
                                    {renderPaginationNumbers()}
                                </div>
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="h-9"
                                >
                                    {t('Next')}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});