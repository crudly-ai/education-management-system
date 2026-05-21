import { Button } from '@/components/ui/form/button';
import { Badge } from '@/components/ui/feedback/badge';
import { Inbox, Send, FileText, Trash2, AlertTriangle, Star, Edit } from 'lucide-react';

interface EmailSidebarProps {
    selectedFolder: string;
    onFolderSelect: (folder: string) => void;
    onCompose: () => void;
    isPreview?: boolean;
}

const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 12, color: 'text-blue-600' },
    { id: 'sent', name: 'Sent', icon: Send, count: 8, color: 'text-green-600' },
    { id: 'draft', name: 'Drafts', icon: FileText, count: 3, color: 'text-yellow-600' },
    { id: 'starred', name: 'Starred', icon: Star, count: 5, color: 'text-orange-600' },
    { id: 'junk', name: 'Junk', icon: AlertTriangle, count: 2, color: 'text-red-600' },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 1, color: 'text-gray-600' },
];

export function EmailSidebar({ selectedFolder, onFolderSelect, onCompose, isPreview }: EmailSidebarProps) {
    return (
        <div className="h-full flex flex-col">
            {/* Compose Button */}
            <div className="p-4 border-b">
                <Button 
                    onClick={onCompose} 
                    className="w-full"
                    disabled={isPreview}
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Compose
                </Button>
            </div>

            {/* Folders */}
            <div className="flex-1 p-2">
                <div className="space-y-1">
                    {folders.map((folder) => {
                        const IconComponent = folder.icon;
                        const isSelected = selectedFolder === folder.id;
                        
                        return (
                            <div
                                key={folder.id}
                                onClick={() => onFolderSelect(folder.id)}
                                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-primary-foreground' : folder.color}`} />
                                    <span className="text-sm font-medium">{folder.name}</span>
                                </div>
                                {folder.count > 0 && (
                                    <Badge 
                                        variant={isSelected ? 'secondary' : 'outline'} 
                                        className="text-xs"
                                    >
                                        {folder.count}
                                    </Badge>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Storage Info */}
            <div className="p-4 border-t">
                <div className="text-xs text-muted-foreground">
                    <div className="flex justify-between mb-1">
                        <span>Storage</span>
                        <span>2.1 GB of 15 GB</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                        <div className="bg-primary h-1 rounded-full" style={{ width: '14%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}