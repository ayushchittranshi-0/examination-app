'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Template } from '@/types';
import TemplateForm from './TemplateForm';

const STORAGE_KEY = 'examination_app_templates';

const TemplateList = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

    useEffect(() => {
        setTemplates(getStoredTemplates());
    }, []);

    useEffect(() => {
        const filtered = templates.filter(template =>
            template.template_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTemplates(filtered);
    }, [searchTerm, templates]);

    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

    const handleDeleteClick = (template: Template) => {
        setTemplateToDelete(template);
    };


    const handleDeleteConfirm = () => {
        if (!templateToDelete) return;

        toast.promise(
            new Promise((resolve) => {
                const updatedTemplates = removeTemplateFromStorage(templateToDelete.id);
                setTemplates(updatedTemplates);
                setTemplateToDelete(null);
                resolve(true);
            }),
            {
                loading: 'Deleting template...',
                success: 'Template deleted successfully!',
                error: 'Failed to delete template',
            }
        );
    };
    const onTemplateCreated = () => {
        setTemplates(getStoredTemplates());
        setIsCreateModalOpen(false);
        setTemplateToEdit(null);
    };

    const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);

    const handleEdit = (template: Template) => {
        setTemplateToEdit(template);
        setIsCreateModalOpen(true);

    };
    return (
        <div className="p-6 space-y-6">
            {/* Header section */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600 mt-1">
                    Create and manage your templates
                </p>
                <Button
                    onClick={() => {
                        console.log("we clicked");
                        setIsCreateModalOpen(true)
                    }}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Template
                </Button>
            </div>

            {/* Search and filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Templates Table */}
            <div className="bg-white rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Template Name</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead>Fields</TableHead>
                            <TableHead>Parts</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTemplates.map((template) => (
                            <TableRow key={template.id}>
                                <TableCell className="font-medium">
                                    {template.template_name}
                                </TableCell>
                                <TableCell>
                                    {new Date(template.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{template.top_section.length} fields</TableCell>
                                <TableCell>{}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-slate-600 hover:text-slate-900"
                                            onClick={() => handleEdit(template)}
                                        >
                                            <FileText className="w-4 h-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() => handleDeleteClick(template)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredTemplates.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    {searchTerm ? 'No templates found matching your search.' : 'No templates created yet.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Template Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={() => {
                setIsCreateModalOpen(isCreateModalOpen ? false : true);
                if (isCreateModalOpen)
                    setTemplateToEdit(null);
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Template</DialogTitle>
                        <DialogDescription>
                            Create a new question paper template by filling out the form below.
                        </DialogDescription>
                    </DialogHeader>
                    <TemplateForm onSuccess={onTemplateCreated}
                        templateToEdit={templateToEdit}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={templateToDelete !== null}
                onOpenChange={(open) => !open && setTemplateToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the template &quot;{templateToDelete?.template_name}&quot;.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default TemplateList;

const getStoredTemplates = (): Template[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const removeTemplateFromStorage = (templateId: string) => {
    const templates = getStoredTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
};
