import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { 
  FileText, 
  Download, 
  Eye, 
  Settings, 
  Palette, 
  Layout,
  Code,
  Sparkles,
  Globe,
  BookOpen,
  GraduationCap,
  Zap,
  Star,
  CheckCircle,
  Upload,
  Plus,
  Trash2,
  FileUp,
  HelpCircle,
  Edit3
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

interface ExamConfig {
  title: string;
  subject: string;
  duration: string;
  instructions: string;
  questionsUrl?: string;
  answersUrl?: string;
  template: string;
  useCustomUrls: boolean;
  showTimer: boolean;
  allowNavigation: boolean;
  randomizeQuestions: boolean;
  theme: string;
  questions: Question[];
}

const templates = [
  {
    id: 'demo',
    name: 'Demo Template',
    description: 'Clean and modern design with sidebar navigation',
    preview: '/templates/Demo (1).html',
    features: ['Sidebar Navigation', 'Progress Tracking', 'Clean Design']
  },
  {
    id: 'minor-test',
    name: 'Minor Test Template',
    description: 'Compact layout perfect for quick assessments',
    preview: '/templates/Minor_Test_@_12.html',
    features: ['Compact Layout', 'Quick Navigation', 'Mobile Friendly']
  },
  {
    id: 'english-test',
    name: 'English Test Template',
    description: 'Specialized for language and text-heavy exams',
    preview: '/templates/Test_15_(English).html',
    features: ['Text Focused', 'Reading Friendly', 'Language Support']
  }
];

const themes = [
  { id: 'light', name: 'Light', description: 'Clean white background' },
  { id: 'dark', name: 'Dark', description: 'Dark mode for reduced eye strain' },
  { id: 'blue', name: 'Professional Blue', description: 'Corporate blue theme' },
  { id: 'green', name: 'Nature Green', description: 'Calming green theme' }
];

const Index = () => {
  const [config, setConfig] = useState<ExamConfig>({
    title: '',
    subject: '',
    duration: '',
    instructions: '',
    questionsUrl: '',
    answersUrl: '',
    template: 'demo',
    useCustomUrls: false,
    showTimer: true,
    allowNavigation: true,
    randomizeQuestions: false,
    theme: 'light',
    questions: []
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [bulkQuestions, setBulkQuestions] = useState('');
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    type: 'multiple-choice'
  });

  const handleInputChange = (field: keyof ExamConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    if (!newQuestion.question || !newQuestion.options?.every(opt => opt.trim())) {
      toast.error('Please fill in all question fields');
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      question: newQuestion.question!,
      options: newQuestion.options!,
      correctAnswer: newQuestion.correctAnswer!,
      explanation: newQuestion.explanation || '',
      type: newQuestion.type as 'multiple-choice' | 'true-false' | 'short-answer'
    };

    setConfig(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));

    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      type: 'multiple-choice'
    });

    toast.success('Question added successfully!');
  };

  const removeQuestion = (id: string) => {
    setConfig(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
    toast.success('Question removed');
  };

  const parseBulkQuestions = () => {
    if (!bulkQuestions.trim()) {
      toast.error('Please enter questions in the text area');
      return;
    }

    try {
      const lines = bulkQuestions.split('\n').filter(line => line.trim());
      const questions: Question[] = [];
      let currentQuestion: Partial<Question> = {};
      let optionIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('Q:') || line.startsWith('Question:')) {
          // Save previous question if exists
          if (currentQuestion.question) {
            questions.push({
              id: Date.now().toString() + Math.random(),
              question: currentQuestion.question,
              options: currentQuestion.options || [],
              correctAnswer: currentQuestion.correctAnswer || 0,
              explanation: currentQuestion.explanation || '',
              type: 'multiple-choice'
            });
          }
          
          // Start new question
          currentQuestion = {
            question: line.replace(/^(Q:|Question:)\s*/, ''),
            options: [],
            correctAnswer: 0
          };
          optionIndex = 0;
        } else if (line.match(/^[A-D]\)/)) {
          // Option line
          const optionText = line.replace(/^[A-D]\)\s*/, '');
          if (!currentQuestion.options) currentQuestion.options = [];
          currentQuestion.options[optionIndex] = optionText;
          optionIndex++;
        } else if (line.startsWith('Answer:') || line.startsWith('Correct:')) {
          // Answer line
          const answerText = line.replace(/^(Answer:|Correct:)\s*/, '').toUpperCase();
          const answerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
          currentQuestion.correctAnswer = answerMap[answerText] || 0;
        } else if (line.startsWith('Explanation:')) {
          // Explanation line
          currentQuestion.explanation = line.replace(/^Explanation:\s*/, '');
        }
      }

      // Add the last question
      if (currentQuestion.question) {
        questions.push({
          id: Date.now().toString() + Math.random(),
          question: currentQuestion.question,
          options: currentQuestion.options || [],
          correctAnswer: currentQuestion.correctAnswer || 0,
          explanation: currentQuestion.explanation || '',
          type: 'multiple-choice'
        });
      }

      if (questions.length === 0) {
        toast.error('No valid questions found. Please check the format.');
        return;
      }

      setConfig(prev => ({
        ...prev,
        questions: [...prev.questions, ...questions]
      }));

      setBulkQuestions('');
      toast.success(`${questions.length} questions imported successfully!`);
    } catch (error) {
      toast.error('Error parsing questions. Please check the format.');
      console.error('Parse error:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBulkQuestions(content);
      toast.success('File loaded successfully! Click "Import Questions" to process.');
    };
    reader.readAsText(file);
  };

  const generateQuestionsHtml = (questions: Question[]) => {
    return questions.map((q, index) => `
      <div class="question-container" data-question="${index + 1}">
        <h3 class="question-title">Question ${index + 1}</h3>
        <p class="question-text">${q.question}</p>
        <div class="options-container">
          ${q.options.map((option, optIndex) => `
            <label class="option-label">
              <input type="radio" name="question_${index + 1}" value="${optIndex}" ${optIndex === q.correctAnswer ? 'data-correct="true"' : ''}>
              <span class="option-text">${String.fromCharCode(65 + optIndex)}. ${option}</span>
            </label>
          `).join('')}
        </div>
        ${q.explanation ? `<div class="explanation" style="display: none;">${q.explanation}</div>` : ''}
      </div>
    `).join('');
  };

  const generateHtml = async () => {
    if (!config.title || !config.subject) {
      toast.error('Please fill in the required fields (Title and Subject)');
      return;
    }

    try {
      // Load the selected template
      const templateResponse = await fetch(`/templates/${getTemplateFileName(config.template)}`);
      let templateHtml = await templateResponse.text();

      // Generate questions HTML
      const questionsHtml = config.questions.length > 0 ? generateQuestionsHtml(config.questions) : '<p>No questions added yet. Add questions using the Questions tab.</p>';

      // Replace placeholders in the template
      templateHtml = templateHtml
        .replace(/{{EXAM_TITLE}}/g, config.title)
        .replace(/{{SUBJECT}}/g, config.subject)
        .replace(/{{DURATION}}/g, config.duration)
        .replace(/{{INSTRUCTIONS}}/g, config.instructions)
        .replace(/{{QUESTIONS_URL}}/g, config.questionsUrl || '')
        .replace(/{{ANSWERS_URL}}/g, config.answersUrl || '')
        .replace(/{{QUESTIONS_HTML}}/g, questionsHtml)
        .replace(/{{QUESTIONS_COUNT}}/g, config.questions.length.toString())
        .replace(/{{SHOW_TIMER}}/g, config.showTimer.toString())
        .replace(/{{ALLOW_NAVIGATION}}/g, config.allowNavigation.toString())
        .replace(/{{RANDOMIZE_QUESTIONS}}/g, config.randomizeQuestions.toString())
        .replace(/{{THEME}}/g, config.theme);

      // Add custom styling based on theme
      const themeStyles = getThemeStyles(config.theme);
      templateHtml = templateHtml.replace('</head>', `<style>${themeStyles}</style></head>`);

      setGeneratedHtml(templateHtml);
      toast.success('HTML generated successfully!');
    } catch (error) {
      toast.error('Error generating HTML. Please try again.');
      console.error('Generation error:', error);
    }
  };

  const getTemplateFileName = (templateId: string) => {
    switch (templateId) {
      case 'demo': return 'Demo (1).html';
      case 'minor-test': return 'Minor_Test_@_12.html';
      case 'english-test': return 'Test_15_(English).html';
      default: return 'Demo (1).html';
    }
  };

  const getThemeStyles = (theme: string) => {
    const themes = {
      light: `
        :root {
          --primary-color: #3b82f6;
          --background-color: #ffffff;
          --text-color: #1f2937;
          --border-color: #e5e7eb;
        }
        .question-container {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .question-title {
          color: var(--primary-color);
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .question-text {
          font-size: 1.1em;
          margin-bottom: 15px;
          line-height: 1.5;
        }
        .option-label {
          display: block;
          padding: 10px;
          margin: 5px 0;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .option-label:hover {
          background-color: #f0f9ff;
        }
        .option-text {
          margin-left: 10px;
        }
      `,
      dark: `
        :root {
          --primary-color: #60a5fa;
          --background-color: #1f2937;
          --text-color: #f9fafb;
          --border-color: #374151;
        }
        body { background-color: var(--background-color); color: var(--text-color); }
        .question-container {
          background: #374151;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .question-title {
          color: var(--primary-color);
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .question-text {
          font-size: 1.1em;
          margin-bottom: 15px;
          line-height: 1.5;
          color: var(--text-color);
        }
        .option-label {
          display: block;
          padding: 10px;
          margin: 5px 0;
          border: 1px solid #4b5563;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
          color: var(--text-color);
        }
        .option-label:hover {
          background-color: #4b5563;
        }
        .option-text {
          margin-left: 10px;
        }
      `,
      blue: `
        :root {
          --primary-color: #1e40af;
          --background-color: #eff6ff;
          --text-color: #1e3a8a;
          --border-color: #bfdbfe;
        }
        .question-container {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .question-title {
          color: var(--primary-color);
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .question-text {
          font-size: 1.1em;
          margin-bottom: 15px;
          line-height: 1.5;
        }
        .option-label {
          display: block;
          padding: 10px;
          margin: 5px 0;
          border: 1px solid var(--border-color);
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .option-label:hover {
          background-color: #dbeafe;
        }
        .option-text {
          margin-left: 10px;
        }
      `,
      green: `
        :root {
          --primary-color: #059669;
          --background-color: #ecfdf5;
          --text-color: #064e3b;
          --border-color: #a7f3d0;
        }
        .question-container {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .question-title {
          color: var(--primary-color);
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .question-text {
          font-size: 1.1em;
          margin-bottom: 15px;
          line-height: 1.5;
        }
        .option-label {
          display: block;
          padding: 10px;
          margin: 5px 0;
          border: 1px solid var(--border-color);
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .option-label:hover {
          background-color: #d1fae5;
        }
        .option-text {
          margin-left: 10px;
        }
      `
    };
    return themes[theme] || themes.light;
  };

  const downloadHtml = () => {
    if (!generatedHtml) {
      toast.error('Please generate HTML first');
      return;
    }

    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, '_')}_exam.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML file downloaded successfully!');
  };

  const previewHtml = () => {
    if (!generatedHtml) {
      toast.error('Please generate HTML first');
      return;
    }
    setPreviewMode(true);
  };

  const selectedTemplate = templates.find(t => t.id === config.template);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Exam HTML Craft
                </h1>
                <p className="text-sm text-gray-600">Create beautiful exam interfaces instantly</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Pro Features
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!previewMode ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <CardTitle>Exam Configuration</CardTitle>
                  </div>
                  <CardDescription>
                    Configure your exam settings and customize the appearance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="template">Template</TabsTrigger>
                      <TabsTrigger value="questions">Questions</TabsTrigger>
                      <TabsTrigger value="urls">URLs</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="flex items-center space-x-1">
                            <span>Exam Title</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            placeholder="e.g., Final Mathematics Exam"
                            value={config.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="border-gray-300 focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="flex items-center space-x-1">
                            <span>Subject</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="subject"
                            placeholder="e.g., Mathematics"
                            value={config.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className="border-gray-300 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          placeholder="e.g., 2 hours"
                          value={config.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea
                          id="instructions"
                          placeholder="Enter exam instructions here..."
                          value={config.instructions}
                          onChange={(e) => handleInputChange('instructions', e.target.value)}
                          className="min-h-[100px] border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="template" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        <Label>Choose Template</Label>
                        <div className="grid gap-4">
                          {templates.map((template) => (
                            <Card 
                              key={template.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                config.template === template.id 
                                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => handleInputChange('template', template.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{template.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{template.description}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {template.features.map((feature, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    {config.template === template.id && (
                                      <CheckCircle className="h-6 w-6 text-blue-600" />
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="questions" className="space-y-6 mt-6">
                      <div className="space-y-6">
                        {/* Bulk Import Section */}
                        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
                          <CardHeader>
                            <div className="flex items-center space-x-2">
                              <Upload className="h-5 w-5 text-blue-600" />
                              <CardTitle className="text-lg">Bulk Import Questions</CardTitle>
                            </div>
                            <CardDescription>
                              Upload a text file or paste questions in the specified format
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <Label htmlFor="file-upload" className="cursor-pointer">
                                  <div className="flex items-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                                    <FileUp className="h-5 w-5 text-gray-500" />
                                    <span className="text-sm text-gray-600">Choose file or drag and drop</span>
                                  </div>
                                  <Input
                                    id="file-upload"
                                    type="file"
                                    accept=".txt,.csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                  />
                                </Label>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Or paste questions here:</Label>
                              <Textarea
                                placeholder={`Format example:
Q: What is 2 + 2?
A) 3
B) 4
C) 5
D) 6
Answer: B
Explanation: 2 + 2 equals 4

Q: The capital of France is?
A) London
B) Berlin
C) Paris
D) Madrid
Answer: C`}
                                value={bulkQuestions}
                                onChange={(e) => setBulkQuestions(e.target.value)}
                                className="min-h-[200px] font-mono text-sm"
                              />
                            </div>
                            
                            <Button 
                              onClick={parseBulkQuestions}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              disabled={!bulkQuestions.trim()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Import Questions
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Manual Question Entry */}
                        <Card>
                          <CardHeader>
                            <div className="flex items-center space-x-2">
                              <Plus className="h-5 w-5 text-green-600" />
                              <CardTitle className="text-lg">Add Individual Question</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Question Type</Label>
                              <Select 
                                value={newQuestion.type} 
                                onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value as any }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                  <SelectItem value="true-false">True/False</SelectItem>
                                  <SelectItem value="short-answer">Short Answer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Question</Label>
                              <Textarea
                                placeholder="Enter your question here..."
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                                className="min-h-[80px]"
                              />
                            </div>

                            {newQuestion.type === 'multiple-choice' && (
                              <div className="space-y-3">
                                <Label>Options</Label>
                                {newQuestion.options?.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <span className="w-8 text-center font-medium">{String.fromCharCode(65 + index)}.</span>
                                    <Input
                                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(newQuestion.options || [])];
                                        newOptions[index] = e.target.value;
                                        setNewQuestion(prev => ({ ...prev, options: newOptions }));
                                      }}
                                    />
                                    <input
                                      type="radio"
                                      name="correct-answer"
                                      checked={newQuestion.correctAnswer === index}
                                      onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                      className="w-4 h-4"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Explanation (Optional)</Label>
                              <Textarea
                                placeholder="Provide an explanation for the correct answer..."
                                value={newQuestion.explanation}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                                className="min-h-[60px]"
                              />
                            </div>

                            <Button onClick={addQuestion} className="w-full bg-green-600 hover:bg-green-700">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Question
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Questions List */}
                        {config.questions.length > 0 && (
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <HelpCircle className="h-5 w-5 text-purple-600" />
                                  <CardTitle className="text-lg">Questions ({config.questions.length})</CardTitle>
                                </div>
                                <Badge variant="outline">{config.questions.length} questions</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {config.questions.map((question, index) => (
                                  <div key={question.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-sm text-gray-600">Question {index + 1}</h4>
                                        <p className="mt-1 text-sm">{question.question}</p>
                                        <div className="mt-2 text-xs text-gray-500">
                                          Correct Answer: {String.fromCharCode(65 + question.correctAnswer)}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeQuestion(question.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="urls" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="use-custom-urls"
                            checked={config.useCustomUrls}
                            onCheckedChange={(checked) => handleInputChange('useCustomUrls', checked)}
                          />
                          <Label htmlFor="use-custom-urls">Use custom URLs for questions and answers</Label>
                        </div>
                        
                        {config.useCustomUrls && (
                          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="space-y-2">
                              <Label htmlFor="questions-url">Questions URL (Optional)</Label>
                              <Input
                                id="questions-url"
                                placeholder="https://example.com/questions.json"
                                value={config.questionsUrl}
                                onChange={(e) => handleInputChange('questionsUrl', e.target.value)}
                                className="border-gray-300 focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="answers-url">Answers URL (Optional)</Label>
                              <Input
                                id="answers-url"
                                placeholder="https://example.com/answers.json"
                                value={config.answersUrl}
                                onChange={(e) => handleInputChange('answersUrl', e.target.value)}
                                className="border-gray-300 focus:border-blue-500"
                              />
                            </div>
                            <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded">
                              <strong>Note:</strong> URLs are completely optional. Leave empty if you plan to add questions manually to the generated HTML.
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <Select value={config.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {themes.map((theme) => (
                                <SelectItem key={theme.id} value={theme.id}>
                                  <div className="flex items-center space-x-2">
                                    <Palette className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">{theme.name}</div>
                                      <div className="text-xs text-gray-500">{theme.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="font-medium">Exam Features</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="show-timer"
                                checked={config.showTimer}
                                onCheckedChange={(checked) => handleInputChange('showTimer', checked)}
                              />
                              <Label htmlFor="show-timer">Show timer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="allow-navigation"
                                checked={config.allowNavigation}
                                onCheckedChange={(checked) => handleInputChange('allowNavigation', checked)}
                              />
                              <Label htmlFor="allow-navigation">Allow question navigation</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="randomize-questions"
                                checked={config.randomizeQuestions}
                                onCheckedChange={(checked) => handleInputChange('randomizeQuestions', checked)}
                              />
                              <Label htmlFor="randomize-questions">Randomize question order</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={generateHtml}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      size="lg"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate HTML
                    </Button>
                    <Button 
                      onClick={previewHtml}
                      variant="outline"
                      size="lg"
                      disabled={!generatedHtml}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={downloadHtml}
                      variant="outline"
                      size="lg"
                      disabled={!generatedHtml}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Layout className="h-5 w-5 text-purple-600" />
                    <CardTitle>Template Preview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedTemplate && (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 font-medium">{selectedTemplate.name}</p>
                          <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedTemplate.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-green-600" />
                    <CardTitle>Generated Code</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-h-64 overflow-y-auto">
                    {generatedHtml ? (
                      <pre className="whitespace-pre-wrap break-words">
                        {generatedHtml.substring(0, 500)}...
                      </pre>
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        <Code className="h-8 w-8 mx-auto mb-2" />
                        <p>Generated HTML will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Questions Summary */}
              {config.questions.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <HelpCircle className="h-5 w-5 text-orange-600" />
                      <CardTitle>Questions Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Questions:</span>
                        <Badge variant="secondary">{config.questions.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Multiple Choice:</span>
                        <span className="text-sm">{config.questions.filter(q => q.type === 'multiple-choice').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">True/False:</span>
                        <span className="text-sm">{config.questions.filter(q => q.type === 'true-false').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Short Answer:</span>
                        <span className="text-sm">{config.questions.filter(q => q.type === 'short-answer').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Preview Mode</h2>
              <Button onClick={() => setPreviewMode(false)} variant="outline">
                Back to Editor
              </Button>
            </div>
            <Card className="shadow-lg">
              <CardContent className="p-0">
                <iframe
                  srcDoc={generatedHtml}
                  className="w-full h-[80vh] border-0 rounded-lg"
                  title="Exam Preview"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GraduationCap className="h-6 w-6" />
              <span className="text-xl font-bold">Exam HTML Craft</span>
            </div>
            <p className="text-gray-400">
              Create beautiful, professional exam interfaces with ease
            </p>
            <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-400">
              <span className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                Web-based
              </span>
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                Multiple Templates
              </span>
              <span className="flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                Feature Rich
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;