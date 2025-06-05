import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Upload, X, FileText, Clock, Users, BookOpen, Video, CheckSquare } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: number;
  content: string;
  questions?: Question[];
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
}

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Introduction',
      description: 'Getting started with the course',
      lessons: [
        {
          id: '1-1',
          title: 'Welcome to the Course',
          type: 'video',
          duration: 5,
          content: 'https://example.com/video1.mp4'
        },
        {
          id: '1-2',
          title: 'Course Overview',
          type: 'text',
          duration: 10,
          content: 'This course will cover the fundamentals of quality management...'
        }
      ]
    }
  ]);
  const [activeModule, setActiveModule] = useState<string | null>('1');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({
    title: '',
    type: 'video',
    duration: 0,
    content: ''
  });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCourseThumbnail(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: 'New Module',
      description: 'Module description',
      lessons: []
    };
    setModules([...modules, newModule]);
    setActiveModule(newModule.id);
  };

  const updateModule = (id: string, data: Partial<Module>) => {
    setModules(modules.map(module => 
      module.id === id ? { ...module, ...data } : module
    ));
  };

  const deleteModule = (id: string) => {
    setModules(modules.filter(module => module.id !== id));
    if (activeModule === id) {
      setActiveModule(modules.length > 1 ? modules[0].id : null);
    }
  };

  const addLesson = () => {
    if (!activeModule) return;
    
    const lesson: Lesson = {
      id: `${activeModule}-${Date.now()}`,
      title: newLesson.title || 'New Lesson',
      type: newLesson.type || 'video',
      duration: newLesson.duration || 0,
      content: newLesson.content || '',
      questions: newLesson.type === 'quiz' ? [] : undefined
    };

    setModules(modules.map(module => 
      module.id === activeModule 
        ? { ...module, lessons: [...module.lessons, lesson] } 
        : module
    ));

    setNewLesson({
      title: '',
      type: 'video',
      duration: 0,
      content: ''
    });
    setShowLessonForm(false);
  };

  const updateLesson = () => {
    if (!activeModule || !editingLessonId) return;
    
    setModules(modules.map(module => 
      module.id === activeModule 
        ? { 
            ...module, 
            lessons: module.lessons.map(lesson => 
              lesson.id === editingLessonId 
                ? { ...lesson, ...newLesson } as Lesson
                : lesson
            ) 
          } 
        : module
    ));

    setNewLesson({
      title: '',
      type: 'video',
      duration: 0,
      content: ''
    });
    setEditingLessonId(null);
    setShowLessonForm(false);
  };

  const editLesson = (lesson: Lesson) => {
    setNewLesson({
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      content: lesson.content,
      questions: lesson.questions
    });
    setEditingLessonId(lesson.id);
    setShowLessonForm(true);
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, lessons: module.lessons.filter(lesson => lesson.id !== lessonId) } 
        : module
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the course data to your API
    console.log({
      title: courseTitle,
      description: courseDescription,
      category: courseCategory,
      thumbnail: courseThumbnail,
      modules
    });
    
    // Navigate back to courses page
    navigate('/academy/courses');
  };

  const activeModuleData = modules.find(module => module.id === activeModule);

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} />;
      case 'text':
        return <FileText size={16} />;
      case 'quiz':
        return <CheckSquare size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Create New Course</h1>
          <p className="text-[var(--text-secondary)]">
            Design and publish a new educational course
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/academy/courses')}
          >
            Cancel
          </Button>
          <Button 
            icon={<Save size={20} />}
            onClick={handleSubmit}
          >
            Save Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Details */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-semibold mb-6">Course Details</h2>
            <form className="space-y-6">
              <Input
                label="Course Title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                required
              />
              
              <Input
                label="Course Description"
                multiline
                rows={4}
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Category
                  </label>
                  <select
                    className="w-full border border-[var(--divider)] rounded-md p-2"
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="quality-management">Quality Management</option>
                    <option value="compliance">Compliance</option>
                    <option value="food-safety">Food Safety</option>
                    <option value="haccp">HACCP</option>
                    <option value="iso-standards">ISO Standards</option>
                    <option value="gmp">Good Manufacturing Practices</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Difficulty Level
                  </label>
                  <select
                    className="w-full border border-[var(--divider)] rounded-md p-2"
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Estimated Duration (hours)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g., 8"
                    startIcon={<Clock size={20} />}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Maximum Participants
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 50 (leave empty for unlimited)"
                    startIcon={<Users size={20} />}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Course Thumbnail
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-[var(--divider)] rounded-md">
                  {thumbnailPreview ? (
                    <div className="space-y-2 text-center">
                      <img 
                        src={thumbnailPreview} 
                        alt="Course thumbnail preview" 
                        className="mx-auto h-32 object-cover rounded-md"
                      />
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<X size={16} />}
                          onClick={() => {
                            setCourseThumbnail(null);
                            setThumbnailPreview(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-[var(--text-secondary)]"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-[var(--text-secondary)]">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-[var(--primary-main)] hover:text-[var(--primary-dark)] focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Course Settings */}
        <div>
          <Card>
            <h2 className="text-lg font-semibold mb-6">Course Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Visibility
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="draft">Draft</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Enrollment Type
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="open">Open Enrollment</option>
                  <option value="approval">Requires Approval</option>
                  <option value="invite">Invite Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Certificate
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="none">No Certificate</option>
                  <option value="completion">Certificate of Completion</option>
                  <option value="achievement">Certificate of Achievement</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-[var(--divider)]">
                <h3 className="font-medium mb-4">Course Requirements</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="req-quiz"
                      className="w-4 h-4 text-[var(--primary-main)] border-[var(--divider)] rounded focus:ring-[var(--primary-main)]"
                    />
                    <label htmlFor="req-quiz" className="ml-2 text-sm">
                      Require quiz completion
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="req-all-lessons"
                      className="w-4 h-4 text-[var(--primary-main)] border-[var(--divider)] rounded focus:ring-[var(--primary-main)]"
                    />
                    <label htmlFor="req-all-lessons" className="ml-2 text-sm">
                      Require all lessons to be viewed
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="req-min-score"
                      className="w-4 h-4 text-[var(--primary-main)] border-[var(--divider)] rounded focus:ring-[var(--primary-main)]"
                    />
                    <label htmlFor="req-min-score" className="ml-2 text-sm">
                      Require minimum score (80%)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Course Content */}
      <Card>
        <h2 className="text-lg font-semibold mb-6">Course Content</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module List */}
          <div className="lg:col-span-1 border-r border-[var(--divider)] pr-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Modules</h3>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus size={16} />}
                onClick={addModule}
              >
                Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {modules.map(module => (
                <div 
                  key={module.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeModule === module.id 
                      ? 'bg-[var(--primary-main)] text-white' 
                      : 'hover:bg-[var(--primary-light)] hover:bg-opacity-10'
                  }`}
                  onClick={() => setActiveModule(module.id)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{module.title}</h4>
                    <span className="text-xs">{module.lessons.length} lessons</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Module Content */}
          <div className="lg:col-span-3">
            {activeModuleData ? (
              <div>
                <div className="mb-6">
                  <Input
                    label="Module Title"
                    value={activeModuleData.title}
                    onChange={(e) => updateModule(activeModuleData.id, { title: e.target.value })}
                  />
                  <Input
                    label="Module Description"
                    multiline
                    rows={2}
                    value={activeModuleData.description}
                    onChange={(e) => updateModule(activeModuleData.id, { description: e.target.value })}
                    className="mt-4"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => deleteModule(activeModuleData.id)}
                    >
                      Delete Module
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-[var(--divider)] pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Lessons</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Plus size={16} />}
                      onClick={() => {
                        setNewLesson({
                          title: '',
                          type: 'video',
                          duration: 0,
                          content: ''
                        });
                        setEditingLessonId(null);
                        setShowLessonForm(true);
                      }}
                    >
                      Add Lesson
                    </Button>
                  </div>
                  
                  {activeModuleData.lessons.length > 0 ? (
                    <div className="space-y-3">
                      {activeModuleData.lessons.map(lesson => (
                        <div 
                          key={lesson.id}
                          className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                lesson.type === 'video' ? 'bg-[var(--primary-light)] text-[var(--primary-dark)]' :
                                lesson.type === 'text' ? 'bg-[var(--info-light)] text-[var(--info-dark)]' :
                                'bg-[var(--warning-light)] text-[var(--warning-dark)]'
                              }`}>
                                {getLessonTypeIcon(lesson.type)}
                              </div>
                              <div>
                                <h4 className="font-medium">{lesson.title}</h4>
                                <div className="flex items-center text-sm text-[var(--text-secondary)] mt-1">
                                  <Clock size={14} className="mr-1" />
                                  {lesson.duration} minutes
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<FileText size={16} />}
                                onClick={() => editLesson(lesson)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<Trash2 size={16} />}
                                onClick={() => deleteLesson(activeModuleData.id, lesson.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--text-secondary)]">
                      <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No lessons added yet</p>
                      <p className="text-sm mt-2">Click "Add Lesson" to create your first lesson</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
                <p>No module selected</p>
                <p className="text-sm mt-2">Select a module from the list or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
            </h2>
            <form className="space-y-4">
              <Input
                label="Lesson Title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Lesson Type
                  </label>
                  <select
                    className="w-full border border-[var(--divider)] rounded-md p-2"
                    value={newLesson.type}
                    onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value as 'video' | 'text' | 'quiz' })}
                    required
                  >
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                
                <Input
                  label="Duration (minutes)"
                  type="number"
                  min="1"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              
              {newLesson.type === 'video' && (
                <Input
                  label="Video URL"
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  value={newLesson.content}
                  onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                  required
                />
              )}
              
              {newLesson.type === 'text' && (
                <Input
                  label="Lesson Content"
                  multiline
                  rows={6}
                  value={newLesson.content}
                  onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                  required
                />
              )}
              
              {newLesson.type === 'quiz' && (
                <div className="space-y-4">
                  <Input
                    label="Quiz Instructions"
                    multiline
                    rows={3}
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                    required
                  />
                  
                  <div className="border border-[var(--divider)] rounded-lg p-4">
                    <h3 className="font-medium mb-4">Quiz Questions</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      You'll be able to add questions after creating the lesson.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLessonForm(false);
                    setEditingLessonId(null);
                    setNewLesson({
                      title: '',
                      type: 'video',
                      duration: 0,
                      content: ''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingLessonId ? updateLesson : addLesson}
                >
                  {editingLessonId ? 'Update Lesson' : 'Add Lesson'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCoursePage;