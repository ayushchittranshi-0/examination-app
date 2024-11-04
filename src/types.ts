
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
    required: boolean;
    hasOrFunctionality: boolean;
}

export interface Template {
    id: string;
    template_name: string;
    created_at: string;
    top_section: {
        fields: TopSectionFormField[];
        selectedFields: string[]; // Keys of selected fields
    };
    instruction_section: {
        has_general_instructions: boolean;
        has_specific_instructions: boolean;
    };
    question_sections: {
        sections: string[]; // Will always include 'A' as default
        questions: QuestionConfig[];
    };
}

export const PREDEFINED_OPTIONS = {
    "Branch Options": [
        'Computer Science',
        'Information Technology',
        'Electronics',
        'Mechanical',
        'Civil',
        'Electrical',
    ],
    'Semester Options': [
        'Semester 1',
        'Semester 2',
        'Semester 3',
        'Semester 4',
        'Semester 5',
        'Semester 6',
        'Semester 7',
        'Semester 8',
    ],
    'Subject Options': [
        { code: 'CS101', name: 'Introduction to Programming' },
        { code: 'CS102', name: 'Data Structures' },
        { code: 'CS103', name: 'Database Management' },
    ],
};

export const MANDATORY_FIELDS: TopSectionFormField[] = [
    {
        key: 'question_paper_code',
        label: 'Question Paper Code',
        type: 'string',
        required: true,
        mandatory: true,
    },
    {
        key: 'examination_name',
        label: 'Examination Name and Year',
        type: 'string',
        required: true,
        mandatory: true,
    },
    {
        key: 'semester',
        label: 'Semester',
        type: 'multiselect',
        required: true,
        mandatory: true,
        options_type: 'Semester Options',
    },
    {
        key: 'branch',
        label: 'Domain Branch Name',
        type: 'select',
        required: true,
        mandatory: true,
        options_type: 'Branch Options',
    },
    {
        key: 'subject_code',
        label: 'Subject Code',
        type: 'select',
        required: true,
        mandatory: true,
        options_type: 'Subject Options',
    },
    {
        key: 'subject_name',
        label: 'Subject Name',
        type: 'string',
        required: true,
        mandatory: true,
    },
];

export const OPTIONAL_FIELDS: TopSectionFormField[] = [
    {
        key: 'time',
        label: 'Time Duration',
        type: 'string',
        required: false,
        mandatory: false,
    },
    {
        key: 'max_marks',
        label: 'Maximum Marks',
        type: 'number',
        required: false,
        mandatory: false,
    },
    {
        key: 'date',
        label: 'Examination Date',
        type: 'string',
        required: false,
        mandatory: false,
    },
];
