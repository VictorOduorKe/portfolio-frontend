import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject, uploadImage, getImageUrl } from '../../services/api';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // null means list view, object means add/edit form
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploading(true);
    try {
      const res = await uploadImage(data);
      setEditingItem(prev => ({ ...prev, image_url: res.url }));
    } catch (e) {
      alert('Failed to upload image: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem.id) {
        await updateProject(editingItem.id, editingItem);
      } else {
        await createProject(editingItem);
      }
      setEditingItem(null);
      await loadProjects();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (project) => {
    try {
      const updated = { ...project, is_published: project.is_published ? 0 : 1 };
      await updateProject(project.id, updated);
      loadProjects();
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this project?')) {
      try {
        await deleteProject(id);
        loadProjects();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  if (editingItem) {
    const isEditMode = !!editingItem.id;
    return (
      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader className="border-b border-primary/5 pb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {isEditMode ? 'Edit Project' : 'Add New Project'}
          </CardTitle>
          <p className="text-sm text-text-light mt-1">
            {isEditMode ? 'Update the details for this showcase.' : 'Provide the details to showcase a new piece of work.'}
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <Input 
                label="Project Title" 
                type="text" 
                value={editingItem.title} 
                onChange={e => setEditingItem({...editingItem, title: e.target.value})} 
                required 
                placeholder="e.g. Cloud Infrastructure Automation"
              />
            </div>
            <div>
              <Input 
                label="GitHub Repo ID" 
                type="text" 
                value={editingItem.github_repo_id || ''} 
                onChange={e => setEditingItem({...editingItem, github_repo_id: e.target.value})} 
                placeholder="e.g. 7489201"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-light mb-1.5 font-sans">Description</label>
            <textarea 
              className="w-full px-4 py-2.5 border border-primary/15 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-text-light/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200"
              value={editingItem.description || ''} 
              onChange={e => setEditingItem({...editingItem, description: e.target.value})} 
              rows="4"
              placeholder="Describe the challenges, technical decisions, and outcomes of the project..."
            ></textarea>
          </div>

          <Input 
            label="Impact Line (Key Metric / Achievement)" 
            type="text" 
            value={editingItem.impact_line || ''} 
            onChange={e => setEditingItem({...editingItem, impact_line: e.target.value})} 
            placeholder="e.g. Automated M-PESA workflows reducing manual processing by 80%"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text-light mb-1.5">Project Cover Image</label>
              <div className="border-2 border-dashed border-primary/20 rounded-xl p-5 bg-surface-container-lowest hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center relative min-h-[160px] shadow-sm">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl animate-spin">sync</span>
                    <p className="text-sm text-text-light font-medium">Uploading & Resizing...</p>
                  </div>
                ) : editingItem.image_url ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="relative w-full max-w-[240px] h-28 rounded-lg overflow-hidden border border-surface-variant shadow-sm">
                      <img src={getImageUrl(editingItem.image_url)} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-primary font-semibold hover:underline bg-primary/5 px-3 py-1.5 rounded-full">Replace Image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="material-symbols-outlined text-primary/40 text-4xl">cloud_upload</span>
                    <p className="text-sm font-medium text-primary">Click to upload cover image</p>
                    <p className="text-xs text-text-light/70">JPG, PNG, WEBP or GIF (auto-resized)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Input 
                label="GitHub Repository URL" 
                type="url" 
                value={editingItem.github_repo_url || ''} 
                onChange={e => setEditingItem({...editingItem, github_repo_url: e.target.value})} 
                placeholder="https://github.com/username/project"
              />
              
              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  id="is_published"
                  checked={!!editingItem.is_published}
                  onChange={e => setEditingItem({...editingItem, is_published: e.target.checked ? 1 : 0})}
                  className="w-4 h-4 rounded text-primary border-primary/20 focus:ring-primary/20 cursor-pointer"
                />
                <label htmlFor="is_published" className="text-sm font-semibold text-text-light cursor-pointer select-none">
                  Publish instantly (visible to public portfolio visitors)
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4 border-t border-primary/5 pt-5 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditingItem(null)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : isEditMode ? (
                'Update Project'
              ) : (
                'Save Project'
              )}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Projects Manager</h1>
        <Button variant="primary" onClick={() => setEditingItem({ title: '', description: '', impact_line: '', image_url: '', github_repo_url: '', github_repo_id: '', is_published: 1 })}>
          + Add Project
        </Button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest border border-surface-variant/40 rounded-2xl w-full">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-16 h-16 rounded-full border-4 border-primary/10 animate-ping"></div>
              <div className="w-10 h-10 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 animate-spin"></div>
            </div>
            <p className="mt-6 text-sm text-text-light font-semibold tracking-wider animate-pulse">
              Loading database items...
            </p>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent>No projects found. Add one above!</CardContent>
          </Card>
        ) : projects.map(p => (
            <Card key={p.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-4 items-center">
              {p.image_url && (
                <div className="w-24 h-16 rounded-md overflow-hidden flex-shrink-0 border border-surface-variant shadow-sm">
                  <img src={getImageUrl(p.image_url)} alt={p.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{p.title}</CardTitle>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${p.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary/15 text-secondary'}`}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <CardContent className="mt-1 text-sm text-text-light">{p.description}</CardContent>
                {p.impact_line && (
                  <p className="text-xs font-semibold text-primary mt-1 pl-2 border-l border-primary/20">
                    Impact: {p.impact_line}
                  </p>
                )}
                {p.github_repo_url && (
                  <a href={p.github_repo_url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-primary font-medium hover:underline text-sm">
                    View Repository
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <Button 
                variant="outline" 
                className="px-3 py-1.5 text-xs h-9"
                onClick={() => handleTogglePublish(p)}
              >
                {p.is_published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button 
                variant="secondary" 
                className="px-3 py-1.5 text-xs h-9"
                onClick={() => setEditingItem(p)}
              >
                Edit
              </Button>
              <Button variant="danger" className="px-3 py-1.5 text-xs h-9" onClick={() => handleDelete(p.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
