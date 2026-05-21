import { TourStep } from '@/hooks/use-tour';

export const workspaceTourSteps: TourStep[] = [
  {
    target: 'body',
    content: 'Welcome to Crudly! Let me show you how to create amazing Laravel applications with AI assistance.',
    title: 'Welcome to Crudly! 🚀',
    placement: 'center',
    disableBeacon: true,
    hideCloseButton: true,
  },
  {
    target: '.tour-prompt-input',
    content: 'Start by describing your app idea here. For example: "Create a blog system with posts, categories, and user comments"',
    title: 'Describe Your App Idea 💡',
    placement: 'top',
  },
  {
    target: '.tour-send-button',
    content: 'Click this button or press Enter to generate your project with AI assistance.',
    title: 'Generate Your Project ✨',
    placement: 'left',
  },
];

export const workspaceTourStepsWithProjects: TourStep[] = [
  ...workspaceTourSteps,
  {
    target: '.tour-projects-section',
    content: 'Your created projects appear here. You can manage, share, and continue building them.',
    title: 'Your Projects 📁',
    placement: 'top',
  },
  {
    target: '.tour-project-card',
    content: 'Each project card shows your app details. Click "Continue Building" to open the visual builder.',
    title: 'Project Cards 🎯',
    placement: 'top',
  },
  {
    target: '.tour-project-actions',
    content: 'Use the 3-dots menu to make projects public, share them, or delete them.',
    title: 'Project Actions ⚙️',
    placement: 'left',
  },
];

export const builderTourSteps: TourStep[] = [
  {
    target: 'body',
    content: 'Welcome to the Crudly Builder! This is where you design and refine your Laravel application with AI assistance and manual configuration.',
    title: 'Welcome to Crudly Builder! 🏗️',
    placement: 'center',
    disableBeacon: true,
    hideCloseButton: true,
  },
  {
    target: '.tour-left-panel',
    content: 'The left panel contains two powerful tools: AI Chat for intelligent assistance and Field Config for manual model creation.',
    title: 'Control Panel 🎛️',
    placement: 'right',
  },
  {
    target: '.tour-ai-tab',
    content: 'Use AI Chat to refine your project, ask questions, and get intelligent suggestions for your Laravel application.',
    title: 'AI Assistant 🤖',
    placement: 'right',
  },
  {
    target: '.tour-config-tab',
    content: 'Switch to Field Config to manually create models, configure fields, and fine-tune your database structure.',
    title: 'Manual Configuration ⚙️',
    placement: 'right',
  },
  {
    target: '.tour-config-tab',
    content: 'Click on "Field Config" tab to manually create models. Here you can add fields, set validation rules, and configure relationships.',
    title: 'Create Models 📝',
    placement: 'right',
  },
  {
    target: '.tour-preview-area',
    content: 'The preview area shows your generated Laravel application in real-time. Navigate through different pages to see your models in action.',
    title: 'Live Preview 👀',
    placement: 'center',
  },
  {
    target: '.tour-model-sidebar',
    content: 'Your created models appear in this sidebar. Click on any model to preview its CRUD interface.',
    title: 'Model Navigation 📋',
    placement: 'right',
  },
  {
    target: '.tour-save-button',
    content: 'Save your project to continue working on it later and keep your progress.',
    title: 'Save Project 💾',
    placement: 'bottom',
  },
  {
    target: '.tour-share-button',
    content: 'Share your project with others by making it public. Others can view and remix your creation.',
    title: 'Share Project 📤',
    placement: 'bottom',
  },
  {
    target: '.tour-download-button',
    content: 'When you\'re ready, click here to generate and download your complete Laravel application with all CRUD functionality.',
    title: 'Download Your App 📦',
    placement: 'bottom',
  },
];

export const tourSteps = {
  workspace: workspaceTourSteps,
  workspaceWithProjects: workspaceTourStepsWithProjects,
  builder: builderTourSteps,
  // Future tours will be added here
  // dashboard: dashboardTourSteps,
};

export const getTourSteps = (tourKey: string, hasProjects: boolean = false) => {
  if (tourKey === 'workspace') {
    return hasProjects ? tourSteps.workspaceWithProjects : tourSteps.workspace;
  }
  return tourSteps[tourKey as keyof typeof tourSteps] || [];
};

// Helper to get builder tour steps based on state
export const getBuilderTourSteps = (hasModels: boolean = false, hasProject: boolean = false) => {
  let steps = [...builderTourSteps];
  
  if (!hasModels) {
    // Filter out model-specific steps if no models exist
    steps = steps.filter(step => !step.target.includes('tour-model-sidebar'));
  }
  
  if (!hasProject) {
    // Filter out share button if no project exists
    steps = steps.filter(step => !step.target.includes('tour-share-button'));
  }
  
  return steps;
};