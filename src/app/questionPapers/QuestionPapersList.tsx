'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, FileText, Eye } from 'lucide-react';
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

import CreateQuestionPaper from './CreateQuestionPaper';
import QuestionPaperPreview from './QuestionPaperPreviewComponent';

interface QuestionPaper {
    id: string;
    paper_name: string;
    template_name: string;
    created_at: string;
    top_section: {
        question_paper_code?: string;
        university_name?: string;
        semester_number?: string;
        exam_name?: string;
        subject_code?: string;
        subject_name?: string;
        date?: string;
        time?: string;
        max_marks?: string;
        [key: string]: string | undefined;
    };
    question_sections: {
        part_name: string;
        questions: {
            number: string;
            text: string;
            marks: number;
            subparts?: {
                label: string;
                text: string;
                marks: number;
            }[];
        }[];
    }[];
}

const STORAGE_KEY = 'examination_app_question_papers';

const getStoredQuestionPapers = (): QuestionPaper[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const removeQuestionPaperFromStorage = (paperId: string) => {
    const papers = getStoredQuestionPapers();
    const filtered = papers.filter(p => p.id !== paperId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
};

export default function QuestionPapersList() {
    const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);
    const [paperToDelete, setPaperToDelete] = useState<QuestionPaper | null>(null);

    useEffect(() => {
        setQuestionPapers(getStoredQuestionPapers());
    }, []);

    const filteredPapers = questionPapers  && questionPapers.length ? questionPapers.filter(paper =>
        (  paper && paper?.paper_name && paper.paper_name.toLowerCase().includes(searchTerm.toLowerCase()) ) 
    ):[];

    const handleDeleteClick = (paper: QuestionPaper) => {
        setPaperToDelete(paper);
    };

    const [paperToEdit, setPaperToEdit] = useState<QuestionPaper | null>(null);

    const handleEdit = (paper: QuestionPaper) => {
        setPaperToEdit(paper);
        setIsCreateModalOpen(true);
    };
    const handleDeleteConfirm = () => {
        if (!paperToDelete) return;

        toast.promise(
            new Promise((resolve) => {
                const updatedPapers = removeQuestionPaperFromStorage(paperToDelete.id);
                setQuestionPapers(updatedPapers);
                setPaperToDelete(null);
                resolve(true);
            }),
            {
                loading: 'Deleting question paper...',
                success: 'Question paper deleted successfully!',
                error: 'Failed to delete question paper',
            }
        );
    };

    const handlePreview = (paper: QuestionPaper) => {
        setSelectedPaper(paper);
        setIsPreviewModalOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header section */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-slate-600 mt-1">
                        Create and manage your question papers
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Question Paper
                </Button>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search papers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Question Papers Table */}
            <div className="bg-white rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Paper Details</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Exam Info</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead className="text-start">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPapers.map((paper) => (
                            <TableRow key={paper.id}>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{paper.paper_name}</div>
                                        <div className="text-sm text-slate-500">
                                            From: {paper.template_name}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{paper.top_section.subject_name}</div>
                                        <div className="text-sm text-slate-500">{paper.top_section.subject_code}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div>{paper.top_section.exam_name}</div>
                                        <div className="text-sm text-slate-500">
                                            {paper.top_section.date} | {paper.top_section.time}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            {paper.question_sections?.sections.reduce(
                                                (acc, section) => acc + section.questions.length, 0
                                            )} Questions
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Max Marks: {paper.top_section.max_marks}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="">
                                    <div className="flex items-center justify-start gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePreview(paper)}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View/Download
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(paper)}
                                            className="flex items-center gap-1"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() => handleDeleteClick(paper)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>

                            </TableRow>
                        ))}
                        {filteredPapers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                        <FileText className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-sm font-medium">No question papers found</p>
                                        <p className="text-xs">
                                            {searchTerm
                                                ? 'Try adjusting your search terms'
                                                : 'Get started by creating your first question paper'}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Modal */}
            <CreateQuestionPaper
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setPaperToEdit(null);
                }}
                onSuccess={() => {
                    setQuestionPapers(getStoredQuestionPapers());
                    setIsCreateModalOpen(false);
                    setPaperToEdit(null);
                }}
                editPaper={paperToEdit}
            />

            {/* Preview Modal */}
            <QuestionPaperPreview
                isOpen={isPreviewModalOpen}
                onClose={() => {
                    setIsPreviewModalOpen(false);
                    setSelectedPaper(null);
                }}
                paper={selectedPaper}
            />

            {/* Delete Confirmation */}
            <AlertDialog
                open={paperToDelete !== null}
                onOpenChange={(open) => !open && setPaperToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question Paper</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{paperToDelete?.paper_name}&quot;?
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
