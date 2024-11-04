'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MANDATORY_FIELDS, OPTIONAL_FIELDS, OptionsType, Template, TopSectionFormField } from '../../types';

interface TemplateFormProps {
    onSuccess: () => void;
    templateToEdit?: Template | null;
}

export type FieldType = 'string' | 'number' | 'select' | 'multiselect';
export type OptionsType = 'Branch Options' | 'Semester Options' | 'Subject Options';

export interface TopSectionFormField {
    key: string;
    label: string;
    type: FieldType;
    required: boolean;
    mandatory: boolean;
    options_type?: OptionsType;
}

export interface QuestionConfig {
    questionNumber: number;
    hasOrFunctionality: boolean;
    section: string; 
}

export interface Template {
    id: string;
    template_name: string;
    created_at: string;
    top_section: {
        fields: TopSectionFormField[];
        selectedFields: string[];
    };
    instruction_section: {
        has_general_instructions: boolean;
        has_specific_instructions: boolean;
    };
    question_sections: {
        sections: string[];
        questions: QuestionConfig[];
    };
}
const STORAGE_KEY = 'examination_app_templates';
const FIELD_TYPES = ['string', 'number', 'select'] as const;

export default function TemplateForm({ onSuccess, templateToEdit }: TemplateFormProps) {

    const [loading, setLoading] = useState(false);
    const [template, setTemplate] = useState<Partial<Template>>({
        template_name: '',
        top_section: {
            fields: [...MANDATORY_FIELDS, ...OPTIONAL_FIELDS],
            selectedFields: MANDATORY_FIELDS.map(field => field.key)
        },
        instruction_section: {
            has_general_instructions: true,
            has_specific_instructions: true
        },
        question_sections: {
            sections: ['A'],
            questions: [
                { questionNumber: 1, hasOrFunctionality: false, section: 'A' }
            ]
        }
    });

    const [newField, setNewField] = useState({
        key: '',
        label: '',
        type: 'string' as const,
        options_type: undefined as OptionsType | undefined,
        required: false,
        mandatory: false
    });
    const [isNewFieldDialogOpen, setIsNewFieldDialogOpen] = useState(false);

    useEffect(() => {
        if (templateToEdit) {
            setTemplate(templateToEdit);
        }
    }, [templateToEdit]);

    const handleAddNewField = () => {
        const field: TopSectionFormField = {
            key: newField.key.toLowerCase().replace(/\s+/g, '_'),
            label: newField.label,
            type: newField.type,
            required: newField.required,
            mandatory: false,
            ...(newField.type === 'select' && { options_type: newField.options_type })
        };

        setTemplate(prev => ({
            ...prev,
            top_section: {
                fields: [...prev.top_section!.fields, field],
                selectedFields: [...prev.top_section!.selectedFields]
            }
        }));

        setNewField({
            key: '',
            label: '',
            type: 'string',
            options_type: undefined,
            required: false,
            mandatory: false
        });
        setIsNewFieldDialogOpen(false);
    };

    const renderFormField = (field: TopSectionFormField) => {
        const isSelected = template.top_section?.selectedFields.includes(field.key);

        return (
            <div key={field.key} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={field.key}
                        checked={isSelected}
                        disabled={field.mandatory}
                        onCheckedChange={(checked) => {
                            if (!field.mandatory) {
                                setTemplate(prev => ({
                                    ...prev,
                                    top_section: {
                                        ...prev.top_section!,
                                        selectedFields: checked
                                            ? [...prev.top_section!.selectedFields, field.key]
                                            : prev.top_section!.selectedFields.filter(k => k !== field.key)
                                    }
                                }));
                            }
                        }}
                    />
                    <div>
                        <Label htmlFor={field.key} className="font-medium">{field.label}</Label>
                        <p className="text-sm text-gray-500">Type: {field.type}</p>
                    </div>
                </div>

                {!field.mandatory && (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`required-${field.key}`}
                            checked={field.required}
                            onCheckedChange={(checked) => {
                                setTemplate(prev => ({
                                    ...prev,
                                    top_section: {
                                        ...prev.top_section!,
                                        fields: prev.top_section!.fields.map(f =>
                                            f.key === field.key ? { ...f, required: checked as boolean } : f
                                        )
                                    }
                                }));
                            }}
                        />
                        <Label htmlFor={`required-${field.key}`}>Required</Label>
                    </div>
                )}
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const mandatoryFields = template.top_section?.fields.filter(field => field.mandatory);
            const allMandatoryFieldsSelected = mandatoryFields?.every(field =>
                template.top_section?.selectedFields.includes(field.key)
            );

            if (!allMandatoryFieldsSelected) {
                toast.error('All mandatory fields must be included in the template');
                setLoading(false);
                return;
            }

            const selectedFields = template.top_section?.fields.filter(field =>
                template.top_section?.selectedFields.includes(field.key)
            );

            const requiredFieldsPresent = selectedFields?.every(field =>
                !field.required || template.top_section?.selectedFields.includes(field.key)
            );

            if (!requiredFieldsPresent) {
                toast.error('Some required fields are not selected');
                setLoading(false);
                return;
            }

            const templates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

            const templateToSave = {
                ...template,
                top_section: {
                    fields: template.top_section?.fields.filter(field =>
                        field.mandatory || template.top_section?.selectedFields.includes(field.key)
                    ),
                    selectedFields: template.top_section?.selectedFields
                }
            };

            if (templateToEdit) {
                const templateIndex = templates.findIndex((t: Template) => t.id === templateToEdit.id);
                if (templateIndex !== -1) {
                    templates[templateIndex] = {
                        ...templateToSave,
                        id: templateToEdit.id,
                        created_at: templateToEdit.created_at,
                        updated_at: new Date().toISOString()
                    };
                    toast.success('Template updated successfully!');
                }
            } else {
                const newTemplate = {
                    ...templateToSave,
                    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    created_at: new Date().toISOString()
                };
                templates.push(newTemplate);
                toast.success('Template created successfully!');
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            onSuccess();

            if (!templateToEdit) {
                setTemplate({
                    template_name: '',
                    top_section: {
                        fields: [...MANDATORY_FIELDS, ...OPTIONAL_FIELDS],
                        selectedFields: MANDATORY_FIELDS.map(field => field.key)
                    },
                    instruction_section: {
                        has_general_instructions: true,
                        has_specific_instructions: true
                    },
                    question_sections: {
                        sections: ['A'],
                        questions: [
                            { questionNumber: 1, hasOrFunctionality: false, section: 'A' }
                        ]
                    }
                });
            }
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error(templateToEdit ? 'Failed to update template' : 'Failed to create template');
        } finally {
            setLoading(false);
        }
    };


    const getQuestionsForSection = (section: string) => {
        return template.question_sections?.questions.filter(q => q.section === section) || [];
    };

    const getNextQuestionNumber = () => {
        return (template.question_sections?.questions.length || 0) + 1;
    };

    const handleAddSection = () => {
        const newSection = String.fromCharCode(65 + (template.question_sections?.sections.length || 0));
        setTemplate(prev => ({
            ...prev,
            question_sections: {
                ...prev.question_sections!,
                sections: [...prev.question_sections!.sections, newSection],
                questions: [
                    ...prev.question_sections!.questions,
                    {
                        questionNumber: getNextQuestionNumber(),
                        hasOrFunctionality: false,
                        section: newSection
                    }
                ]
            }
        }));
    };

    const handleRemoveSection = (sectionToRemove: string) => {
        if (sectionToRemove === 'A') return; 
        setTemplate(prev => ({
            ...prev,
            question_sections: {
                ...prev.question_sections!,
                sections: prev.question_sections!.sections.filter(section => section !== sectionToRemove),
                questions: prev.question_sections!.questions.filter(question => question.section !== sectionToRemove)
            }
        }));
    };

    const handleAddQuestion = (section: string) => {
        const isLatestSection = template.question_sections?.sections.slice(-1)[0] === section;
        if (!isLatestSection) return;

        setTemplate(prev => ({
            ...prev,
            question_sections: {
                ...prev.question_sections!,
                questions: [
                    ...prev.question_sections!.questions,
                    {
                        questionNumber: getNextQuestionNumber(),
                        hasOrFunctionality: false,
                        section: section
                    }
                ]
            }
        }));
    };

    const handleRemoveQuestion = (section: string, questionNumber: number) => {
        const sectionQuestions = getQuestionsForSection(section);
        if (sectionQuestions.length <= 1) return;

        if (section === 'A' && questionNumber === 1) return;

        setTemplate(prev => ({
            ...prev,
            question_sections: {
                ...prev.question_sections!,
                questions: prev.question_sections!.questions.filter(q =>
                    !(q.section === section && q.questionNumber === questionNumber)
                )
            }
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Name */}
            <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                    value={template.template_name}
                    onChange={(e) => setTemplate(prev => ({ ...prev, template_name: e.target.value }))}
                    placeholder="Enter template name"
                    required
                />
            </div>

            {/* Top Section Fields */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Form Fields</CardTitle>
                            <CardDescription>Configure the fields that will appear in your form</CardDescription>
                        </div>
                        <Dialog open={isNewFieldDialogOpen} onOpenChange={setIsNewFieldDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Optional Field
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Field</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Field Label</Label>
                                        <Input
                                            value={newField.label}
                                            onChange={(e) => setNewField(prev => ({
                                                ...prev,
                                                label: e.target.value,
                                                key: e.target.value.toLowerCase().replace(/\s+/g, '_')
                                            }))}
                                            placeholder="Enter field label"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Field Type</Label>
                                        <Select
                                            value={newField.type}
                                            onValueChange={(value: typeof FIELD_TYPES[number]) =>
                                                setNewField(prev => ({ ...prev, type: value, options_type: undefined }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select field type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FIELD_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {newField.type === 'select' && (
                                        <div className="space-y-2">
                                            <Label>Options Type</Label>
                                            <Select
                                                value={newField.options_type}
                                                onValueChange={(value: OptionsType) =>
                                                    setNewField(prev => ({ ...prev, options_type: value }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select options type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['Branch Options', 'Semester Options', 'Subject Options'].map(type => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsNewFieldDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleAddNewField}
                                            disabled={!newField.label || (newField.type === 'select' && !newField.options_type)}
                                        >
                                            Add Field
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium mb-4">Mandatory Fields</h3>
                        <div className="space-y-2">
                            {template.top_section?.fields
                                .filter(field => field.mandatory)
                                .map(renderFormField)}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium mb-4">Optional Fields</h3>
                        <div className="space-y-2">
                            {template.top_section?.fields
                                .filter(field => !field.mandatory)
                                .map(renderFormField)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <>
                {/* Question Sections */}
                <Card>
                    <CardHeader>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Question Sections</h2>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddSection}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Section
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {template.question_sections?.sections.map((section) => {
                                const sectionQuestions = getQuestionsForSection(section);
                                const isLatestSection = template.question_sections.sections.slice(-1)[0] === section;

                                return (
                                    <Card key={section}>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle>Section {section}</CardTitle>
                                                    <CardDescription>
                                                        {sectionQuestions.length} question(s)
                                                    </CardDescription>
                                                </div>
                                                {section !== 'A' && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveSection(section)}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Questions */}
                                            <div className="space-y-2">
                                                {sectionQuestions.map((question) => (
                                                    <div key={question.questionNumber}
                                                        className="flex items-center justify-between border rounded p-4"
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-medium">
                                                                    Question {question.questionNumber}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox
                                                                        id={`or-${question.section}-${question.questionNumber}`}
                                                                        checked={question.hasOrFunctionality}
                                                                        onCheckedChange={(checked) => {
                                                                            setTemplate(prev => ({
                                                                                ...prev,
                                                                                question_sections: {
                                                                                    ...prev.question_sections!,
                                                                                    questions: prev.question_sections!.questions.map(q =>
                                                                                        q.questionNumber === question.questionNumber && q.section === section
                                                                                            ? { ...q, hasOrFunctionality: checked as boolean }
                                                                                            : q
                                                                                    )
                                                                                }
                                                                            }));
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`or-${question.section}-${question.questionNumber}`}>
                                                                        Has OR
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {!(section === 'A' && question.questionNumber === 1) &&
                                                            sectionQuestions.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveQuestion(section, question.questionNumber)}
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add Question Button - Only shown for latest section */}
                                            {isLatestSection && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAddQuestion(section)}
                                                    className="w-full flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Question
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {templateToEdit ? 'Update Template' : 'Create Template'}
                </Button>
            </div>
        </form >
    );
}
