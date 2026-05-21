export interface CrudlyProject {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  is_public: boolean;
  project_data: ProjectData;
  updated_at: string;
  created_at: string;
}

export interface ProjectData {
  tabs: CrudTab[];
  metadata: {
    created_at: string;
    updated_at: string;
    version: string;
  };
}

export interface CrudTab {
  id: string;
  modelName: string;
  icon: string;
  fields: Field[];
  generatedCommand: string;
}

export interface Field {
  id: string;
  name: string;
  type: string;
  validation: string;
  filterable: boolean;
  hidden: boolean;
  options?: string;
  relatedModel?: string;
}