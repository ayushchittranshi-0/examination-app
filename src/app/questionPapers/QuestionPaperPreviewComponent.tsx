'use client'
import React from 'react';
import { X, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import toast from 'react-hot-toast';
import html2pdf from "html2pdf.js"

interface QuestionPaperData {
  id: string;
  created_at: string;
  paper_name: string;
  top_section: {
    question_paper_code: string;
    examination_name: string;
    semester: string;
    branch: string;
    subject_code: string;
    subject_name: string;
  };
  sections: string[];
  questions: {
    questionNumber: number;
    hasOrFunctionality: boolean;
    section: string;
    questionText: string;
    questionTextA: string;
    questionTextB: string;
  }[];
}

interface PreviewProps {
  isOpen: boolean;
  onClose: () => void;
  paper: QuestionPaperData;
}

export default function QuestionPaperPreview({ isOpen, onClose, paper }: PreviewProps) {
  const handlePrint = async () => {
    if (!paper) return;

    const loadingToast = toast.loading('Generating PDF...');

    try {
      // Dynamically import html2pdf to avoid SSR issues

      const element = document.getElementById('print-content');
      if (!element) throw new Error('Content element not found');

      const opt = {
        margin: 1,
        filename: `${paper.paper_name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('PDF generated successfully!', { id: loadingToast });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF', { id: loadingToast });
    }
  };

  if (!paper) return null;


  const groupQuestionsBySection = (questions: QuestionPaperData['questions']) => {
    return questions.reduce((acc, question) => {
      if (!acc[question.section]) {
        acc[question.section] = [];
      }
      acc[question.section].push(question);
      return acc;
    }, {} as Record<string, typeof questions>);
  };

  const questionsBySection = groupQuestionsBySection(paper.questions);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header Section */}
        <div className="sticky top-0 bg-white z-10 p-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-800">
              Question Paper Preview
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <Separator className="mt-4" />
        </div>

        {/* Content Section */}
        <div className="p-6 pt-2">
          <div id="print-content" className="space-y-6">
            {/* Institution Details */}
            <div className="text-center space-y-4 pb-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">{paper.top_section.examination_name}</h2>
                <div className="font-medium text-slate-800">
                  {paper.top_section.subject_name}
                  {paper.top_section.subject_code && ` (${paper.top_section.subject_code})`}
                </div>
              </div>

              {/* Paper Details Grid */}
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-sm">
                <div className="text-slate-600">
                  Branch: {paper.top_section.branch}
                </div>
                <div className="text-slate-600">
                  Semester: {paper.top_section.semester}
                </div>
                <div className="text-slate-600">
                  Paper Code: {paper.top_section.question_paper_code}
                </div>
                <div className="text-slate-600">
                  Date: {new Date(paper.created_at).toLocaleDateString()}
                </div>

              </div>
            </div>

            <Separator />

            {/* Questions Sections */}
            <div className="space-y-8">
              {paper.sections.map((sectionName) => (
                <div key={sectionName} className="space-y-6">
                  <h3 className="text-center font-semibold text-lg">
                    Section {sectionName}
                  </h3>
                  <div className="space-y-8">
                    {questionsBySection[sectionName]?.map((question) => (
                      <div key={question.questionNumber} className="space-y-3">
                        <div className="flex justify-between">
                          <div className="font-medium">
                            Question {question.questionNumber}.
                          </div>
                        </div>
                        {question.hasOrFunctionality ? (
                          <div className="pl-8 space-y-4">
                            <div className="text-slate-800">
                              <div className="pl-4 mt-2">{question.questionTextA}</div>
                            </div>
                            <div className="text-slate-800">
                              OR
                              <div className="pl-4 mt-2">{question.questionTextB}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="pl-8 text-slate-800">{question.questionText}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
