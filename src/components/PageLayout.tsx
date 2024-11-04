'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, LayoutDashboard, BookOpen, Award, Users, LucideIcon } from 'lucide-react';
import { ToasterProviders } from './ToasterProvider';
import dynamic from 'next/dynamic';

type NavigationItem = {
    name: string;
    icon: LucideIcon;
    path: string;
};

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = dynamic(({ children }: LayoutProps) => {


    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const navigationItems: NavigationItem[] = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Templates', icon: BookOpen, path: '/templates' },
        { name: 'Question Papers', icon: Award, path: '/questionPapers' },
    ];

    const isActivePath = (path: string): boolean => {
        if (!pathname) return false;
        return pathname === path;
    };
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    useEffect(() => {
        const initializeExamPapers = () => {
            const storedPapers = localStorage.getItem('examination_app_question_papers');

            if (!storedPapers || JSON.parse(storedPapers).length === 0) {

                const initialPapers = {"id":"paper_1730755164362_899qoqwyn","created_at":"2024-11-04T21:19:24.362Z","paper_name":"Compute sample new paper","top_section":{"question_paper_code":"007","examination_name":"Mid Semester 2024","semester":"First","branch":"Information Technology","subject_code":"CS101","subject_name":"Automata"},"sections":["A","B"],"questions":[{"questionNumber":1,"hasOrFunctionality":false,"section":"A","questionText":"What is the basics of programming?","questionTextA":"","questionTextB":""},{"questionNumber":2,"hasOrFunctionality":false,"section":"A","questionText":"What is Cpu","questionTextA":"","questionTextB":""},{"questionNumber":3,"hasOrFunctionality":true,"section":"B","questionText":"","questionTextA":"What is mice","questionTextB":"What is keyboard"}]}
                localStorage.setItem(
                    'examination_app_question_papers',
                    JSON.stringify([initialPapers])
                );

                console.log('Examination papers initialized in localStorage');
            }
        };

        const initializeTemplates = () => {
            const storedTemplates = localStorage.getItem('examination_app_templates');

            if (!storedTemplates || JSON.parse(storedTemplates).length === 0) {
                const initialTemplate = {
                    "template_name": "new question paper",
                    "top_section": {
                        "fields": [
                            {
                                "key": "question_paper_code",
                                "label": "Question Paper Code",
                                "type": "string",
                                "required": true,
                                "mandatory": true
                            },
                            {
                                "key": "examination_name",
                                "label": "Examination Name and Year",
                                "type": "string",
                                "required": true,
                                "mandatory": true
                            },
                            {
                                "key": "semester",
                                "label": "Semester",
                                "type": "multiselect",
                                "required": true,
                                "mandatory": true,
                                "options_type": "Semester Options"
                            },
                            {
                                "key": "branch",
                                "label": "Domain Branch Name",
                                "type": "select",
                                "required": true,
                                "mandatory": true,
                                "options_type": "Branch Options"
                            },
                            {
                                "key": "subject_code",
                                "label": "Subject Code",
                                "type": "select",
                                "required": true,
                                "mandatory": true,
                                "options_type": "Subject Options"
                            },
                            {
                                "key": "subject_name",
                                "label": "Subject Name",
                                "type": "string",
                                "required": true,
                                "mandatory": true
                            }
                        ],
                        "selectedFields": [
                            "question_paper_code",
                            "examination_name",
                            "semester",
                            "branch",
                            "subject_code",
                            "subject_name"
                        ]
                    },
                    "instruction_section": {
                        "has_general_instructions": true,
                        "has_specific_instructions": true
                    },
                    "question_sections": {
                        "sections": [
                            "A",
                            "B"
                        ],
                        "questions": [
                            {
                                "questionNumber": 1,
                                "hasOrFunctionality": false,
                                "section": "A"
                            },
                            {
                                "questionNumber": 2,
                                "hasOrFunctionality": false,
                                "section": "A"
                            },
                            {
                                "questionNumber": 3,
                                "hasOrFunctionality": true,
                                "section": "B"
                            }
                        ]
                    },
                    "id": "template_1730750111828_39kl6tid0",
                    "created_at": "2024-11-04T19:55:11.828Z",
                    "updated_at": "2024-11-04T21:10:43.450Z"
                };

                localStorage.setItem(
                    'examination_app_templates',
                    JSON.stringify([initialTemplate])
                );

                console.log('Examination templates initialized in localStorage');
            }
        };

        initializeExamPapers();
        initializeTemplates();
    }, []);

    return (
        <ToasterProviders>
            <div className="flex h-screen bg-slate-50">
                {/* Sidebar */}
                <div
                    className={`${isCollapsed ? 'w-16' : 'w-64'
} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col relative`}
                >
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-start p-4 border-b border-slate-200">
                        {!isCollapsed ? (
                            <>
                                <div className='flex gap-2 text-lg'>
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold mx-auto">
                                        E
                                    </div>
                                    <h1 className="text-lg font-semibold text-slate-800">
                                        Examination App
                                    </h1>
                                </div>
                            </>
                        ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold mx-auto">
                                    E
                                </div>
                            )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
                        >
                            {isCollapsed ? (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            ) : (
                                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                                )}
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 py-6 px-4">
                        <nav className="space-y-2">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isActivePath(item.path);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.path}
                                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'
} p-2 rounded-xl group transition-all duration-150
${isActive
? 'bg-indigo-50 text-indigo-600'
: 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
}`}
                                    >
                                        <div className={`
flex items-center justify-center 
${isCollapsed ? 'w-10 h-10' : 'w-9 h-9'} 
rounded-xl
${isActive ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-slate-200'}
transition-colors duration-150
`}>
                                            <Icon className={`
${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} 
${isActive ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-700'}
`} />
                                        </div>
                                        {!isCollapsed && (
                                            <span className={`ml-3 text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-slate-700 group-hover:text-slate-900'
}`}>
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User Profile Section */}
                    <div className="border-t border-slate-200 p-4">
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                                <Users className="w-4 h-4 text-slate-600" />
                            </div>
                            {!isCollapsed && (
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Admin User</p>
                                    <p className="text-xs text-slate-500">admin@example.com</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
                        <h2 className="text-xl font-semibold text-slate-800">
                            {navigationItems.find(item => isActivePath(item.path))?.name || 'Dashboard'}
                        </h2>

                    </header>

                    <main className="flex-1 overflow-auto p-6 bg-slate-50">
                        {children}
                    </main>
                </div>
            </div>
        </ToasterProviders>
    );
},{ssr:false});

export default Layout;
