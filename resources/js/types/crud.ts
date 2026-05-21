export interface BaseModel {
    id: number;
    created_at: string;
    updated_at: string;
}

export interface Permission extends BaseModel {
    name: string;
}

export interface DataTableColumn {
    data: string;
    name: string;
    title: string;
    orderable?: boolean;
    searchable?: boolean;
    render?: (data: any, type: string, row: any) => React.ReactNode;
}

