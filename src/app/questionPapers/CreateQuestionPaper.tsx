'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import toast from 'react-hot-toast';
import { PREDEFINED_OPTIONS, TopSectionFormField } from '@/types';

interface TemplateOutputType {

    template_name: string;
    id: string,
    top_section: {
        fields: TopSectionFormField[];
    };
    question_sections: {

        sections: string[];
        questions: QuestionConfig[];
    }
}

export interface QuestionConfig {
    questionNumber: number;
    hasOrFunctionality: boolean;
    section: string;
}

interface QuestionPaperFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editPaper?: any;
}

export default function QuestionPaperForm({ isOpen, onClose, onSuccess, editPaper }: QuestionPaperFormProps) {
    const [loading, setLoading] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateOutputType | null>(null);
    const [templates, setTemplates] = useState<TemplateOutputType[]>([]);
    const [formData, setFormData] = useState<{
        paper_name: string,
        top_section: TopSectionFormField[],
        sections: string[],
        questions: {
            questionNumber: number;
            hasOrFunctionality: boolean;
            section: string;
            questionText?: string;
            questionTextA?: string;
            questionTextB?: string;
        }[]
    }>({
        paper_name: '',
        top_section: [],
        sections: [] as string[],
        questions: [] as Array<{
            questionNumber: number;
            hasOrFunctionality: boolean;
            section: string;
            questionText?: string;
            questionTextA?: string;
            questionTextB?: string;
        }>
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const storedTemplates = localStorage.getItem('examination_app_templates');
        if (storedTemplates) {
            setTemplates(JSON.parse(storedTemplates));
        }
    }, [isOpen]);

    const handleTemplateSelect = async (templateId: string) => {
        setLoadingTemplate(true);
        const template = templates.find(t => t.id === templateId);

        if (template) {
            setSelectedTemplate(template);
            setFormData({
                paper_name: '',
                top_section: [],
                sections: template.question_sections.sections,
                questions: template.question_sections.questions.map(q => ({
                    ...q,
                    questionText: '',
                    questionTextA: '',
                    questionTextB: ''
                }))
            });
        }

        setLoadingTemplate(false);
    };

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        selectedTemplate?.top_section.fields.forEach(field => {
            const value = (formData.top_section as Record<string, any>)?.[field.key] || '';
            if ((field.required || field.mandatory) && !value.trim()) {
                errors[field.key] = `${field.label} is required`;
            }
        });

        formData.questions.forEach((question, index) => {
            if (question.hasOrFunctionality) {
                if (!question.questionTextA?.trim()) {
                    errors[`question_${index}_a`] = 'Question A is required';
                }
                if (!question.questionTextB?.trim()) {
                    errors[`question_${index}_b`] = 'Question B is required';
                }
            } else {
                if (!question.questionText?.trim()) {
                    errors[`question_${index}`] = 'Question text is required';
                }
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetModal = (): void => {
        setSelectedTemplate(null)

        setFormData(
            {
                paper_name: '',
                top_section: [],
                sections: [] as string[],
                questions: [] as Array<{
                    questionNumber: number;
                    hasOrFunctionality: boolean;
                    section: string;
                    questionText?: string;
                    questionTextA?: string;
                    questionTextB?: string;
                }>
            }
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const questionPaper = {
                id: editPaper?.id || `paper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                created_at: editPaper?.created_at || new Date().toISOString(),
                ...formData
            };

            const existingPapers = JSON.parse(localStorage.getItem('examination_app_question_papers') || '[]');

            if (editPaper) {
                const paperIndex = existingPapers.findIndex((p: any) => p.id === editPaper.id);
                if (paperIndex !== -1) {
                    existingPapers[paperIndex] = questionPaper;
                }
            } else {
                existingPapers.push(questionPaper);
            }

            localStorage.setItem('examination_app_question_papers', JSON.stringify(existingPapers));
            toast.success(editPaper ? 'Question paper updated successfully!' : 'Question paper created successfully!');
            onSuccess();
            onClose();
            resetModal()
        } catch (error) {
            toast.error(editPaper ? 'Failed to update question paper' : 'Failed to create question paper');
            console.error('Error saving question paper:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={() => {
            onClose()
            resetModal()
        }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editPaper ? 'Edit Question Paper' : 'Create New Question Paper'}</DialogTitle>
                    <DialogDescription>
                        {editPaper ? 'Modify the question paper details below.' : 'Select a template and fill in the question paper details.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Template Selection (only show in create mode) */}
                    {!editPaper && !selectedTemplate && (
                        <div className="space-y-2">
                            <Label>Select Template</Label>
                            <Select
                                onValueChange={handleTemplateSelect}
                                disabled={loadingTemplate}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.template_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Loading State */}
                    {loadingTemplate && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center space-y-2">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                                <p className="text-sm text-slate-600">Loading template...</p>
                            </div>
                        </div>
                    )}

                    {/* Dynamic Form based on Template */}
                    {selectedTemplate && !loadingTemplate && (
                        <div className="space-y-6">
                            {/* Paper Name */}
                            <div className="space-y-2">
                                <Label className="flex gap-2">
                                    Paper Name<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={formData.paper_name}
                                    onChange={(e) => setFormData({ ...formData, paper_name: e.target.value })}
                                    placeholder="Enter paper name"
                                    required
                                    className={formErrors['paper_name'] ? 'border-red-500' : ''}
                                />
                                {formErrors['paper_name'] && (
                                    <p className="text-sm text-red-500">{formErrors['paper_name']}</p>
                                )}
                            </div>

                            {/* Top Section Fields */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Paper Details</CardTitle>
                                    <CardDescription>Fill in the required information based on the template</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Mandatory Fields */}
                                    {selectedTemplate.top_section.fields
                                        .filter(field => field.mandatory)
                                        .map(field => (
                                            <div key={field.key} className="space-y-2">
                                                <Label className="flex gap-2">
                                                    {field.label}<span className="text-red-500">*</span>
                                                </Label>
                                                {field.type === 'select' ? (
                                                    <Select
                                                        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                                        value={(formData.top_section?.[field.key] || '') as string}

                                                        onValueChange={(value) => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                top_section: {
                                                                    ...prev.top_section,
                                                                    [field.key]: value
                                                                }
                                                            }));
                                                        }}
                                                    >
                                                        <SelectTrigger className={formErrors[field.key] ? 'border-red-500' : ''}>
                                                            <SelectValue placeholder={`Select ${field.label}`} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {field.options_type && PREDEFINED_OPTIONS[field.options_type].map((option: any) => (
                                                                <SelectItem
                                                                    key={typeof option === 'string' ? option : option.code}
                                                                    value={typeof option === 'string' ? option : option.code}
                                                                >
                                                                    {typeof option === 'string' ? option : `${option.code} - ${option.name}`}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        type={field.type === 'number' ? 'number' : 'text'}
                                                        value={formData.top_section?.[field.key] || ''}
                                                        onChange={(e) => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                top_section: {
                                                                    ...prev.top_section,
                                                                    [field.key]: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder={`Enter ${field.label}`}
                                                        className={formErrors[field.key] ? 'border-red-500' : ''}
                                                        required
                                                    />
                                                )}
                                                {formErrors[field.key] && (
                                                    <p className="text-sm text-red-500">{formErrors[field.key]}</p>
                                                )}
                                            </div>
                                        ))}

                                    {/* Optional Fields */}
                                    {selectedTemplate.top_section.fields
                                        .filter(field => !field.mandatory && formData.top_section?.hasOwnProperty(field.key))
                                        .map(field => (
                                            <div key={field.key} className="space-y-2">
                                                <Label className="flex gap-2">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500">*</span>}
                                                </Label>
                                                {field.type === 'select' ? (
                                                    <Select
                                                        value={formData.top_section?.[field.key] || ''}
                                                        onValueChange={(value) => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                top_section: {
                                                                    ...prev.top_section,
                                                                    [field.key]: value
                                                                }
                                                            }));
                                                        }}
                                                    >
                                                        <SelectTrigger className={formErrors[field.key] ? 'border-red-500' : ''}>
                                                            <SelectValue placeholder={`Select ${field.label}`} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {field.options_type && PREDEFINED_OPTIONS[field.options_type].map((option: any) => (
                                                                <SelectItem
                                                                    key={typeof option === 'string' ? option : option.code}
                                                                    value={typeof option === 'string' ? option : option.code}
                                                                >
                                                                    {typeof option === 'string' ? option : `${option.code} - ${option.name}`}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        type={field.type === 'number' ? 'number' : 'text'}
                                                        value={formData.top_section?.[field.key] || ''}
                                                        onChange={(e) => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                top_section: {
                                                                    ...prev.top_section,
                                                                    [field.key]: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder={`Enter ${field.label}`}
                                                        className={formErrors[field.key] ? 'border-red-500' : ''}
                                                        required={field.required}
                                                    />
                                                )}
                                                {formErrors[field.key] && (
                                                    <p className="text-sm text-red-500">{formErrors[field.key]}</p>
                                                )}
                                            </div>
                                        ))}
                                </CardContent>
                            </Card>

                            {/* Question Sections */}
                            {formData.sections.map((section) => (
                                <Card key={section}>
                                    <CardHeader>
                                        <CardTitle>Section {section}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {formData.questions
                                            .filter(q => q.section === section)
                                            .sort((a, b) => a.questionNumber - b.questionNumber)
                                            .map((question, index) => (
                                                <div key={index} className="space-y-4 p-4 border rounded-lg">
                                                    <Label>Question {question.questionNumber}</Label>

                                                    {question.hasOrFunctionality ? (
                                                        <div className="space-y-4">
                                                            <div>
                                                                <Label>Question {question.questionNumber}A</Label>
                                                                <Textarea
                                                                    value={question.questionTextA}
                                                                    onChange={(e) => {
                                                                        const newQuestions = [...formData.questions];
                                                                        const qIndex = newQuestions.findIndex(
                                                                            q => q.section === section && q.questionNumber === question.questionNumber
                                                                        );
                                                                        newQuestions[qIndex].questionTextA = e.target.value;
                                                                        setFormData({ ...formData, questions: newQuestions });
                                                                    }}
                                                                    placeholder={`Enter question ${question.questionNumber}A`}
                                                                    className={formErrors[`question_${index}_a`] ? 'border-red-500' : ''}
                                                                    required
                                                                />
                                                                {formErrors[`question_${index}_a`] && (
                                                                    <p className="text-sm text-red-500">{formErrors[`question_${index}_a`]}</p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <Label>Question {question.questionNumber}B</Label>
                                                                <Textarea
                                                                    value={question.questionTextB}
                                                                    onChange={(e) => {
                                                                        const newQuestions = [...formData.questions];
                                                                        const qIndex = newQuestions.findIndex(
                                                                            q => q.section === section && q.questionNumber === question.questionNumber
                                                                        );
                                                                        newQuestions[qIndex].questionTextB = e.target.value;
                                                                        setFormData({ ...formData, questions: newQuestions });
                                                                    }}
                                                                    placeholder={`Enter question ${question.questionNumber}B`}
                                                                    className={formErrors[`question_${index}_b`] ? 'border-red-500' : ''}
                                                                    required
                                                                />
                                                                {formErrors[`question_${index}_b`] && (
                                                                    <p className="text-sm text-red-500">{formErrors[`question_${index}_b`]}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <Textarea
                                                                value={question.questionText}
                                                                onChange={(e) => {
                                                                    const newQuestions = [...formData.questions];
                                                                    const qIndex = newQuestions.findIndex(
                                                                        q => q.section === section && q.questionNumber === question.questionNumber
                                                                    );
                                                                    newQuestions[qIndex].questionText = e.target.value;
                                                                    setFormData({ ...formData, questions: newQuestions });
                                                                }}
                                                                placeholder={`Enter question ${question.questionNumber}`}
                                                                className={formErrors[`question_${index}`] ? 'border-red-500' : ''}
                                                                required
                                                            />
                                                            {formErrors[`question_${index}`] && (
                                                                <p className="text-sm text-red-500">{formErrors[`question_${index}`]}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => {
                                    resetModal()
                                    onClose()
                                }}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                    {editPaper ? 'Update Question Paper' : 'Create Question Paper'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
