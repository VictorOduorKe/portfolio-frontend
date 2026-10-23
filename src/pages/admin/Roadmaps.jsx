import { useState, useEffect } from 'react';
import { getRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap } from '../../services/api';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // null means list, object means add/edit form
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRoadmaps = async () => {
    setLoading(true);
    try {
      const data = await getRoadmaps();
      setRoadmaps(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem.id) {
        await updateRoadmap(editingItem.id, editingItem);
      } else {
        await createRoadmap(editingItem);
      }
      setEditingItem(null);
      await loadRoadmaps();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (roadmap) => {
    try {
      const updated = { ...roadmap, is_published: roadmap.is_published ? 0 : 1 };
      await updateRoadmap(roadmap.id, updated);
      loadRoadmaps();
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this roadmap item?')) {
      try {
        await deleteRoadmap(id);
        loadRoadmaps();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  if (editingItem) {
    const isEditMode = !!editingItem.id;
    const potentialParents = roadmaps.filter(r => r.id !== editingItem.id);

    return (
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader className="border-b border-primary/5 pb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {isEditMode ? 'Edit Roadmap Item' : 'Add Roadmap Item'}
          </CardTitle>
          <p className="text-sm text-text-light mt-1">
            {isEditMode ? 'Update this planned milestone.' : 'Add details about your upcoming features, system migrations, or learnings.'}
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input 
            label="Item Title" 
            type="text" 
            value={editingItem.title} 
            onChange={e => setEditingItem({...editingItem, title: e.target.value})} 
            required 
            placeholder="e.g. Migrate database cluster to PostgreSQL"
          />
          <div>
            <label className="block text-sm font-semibold text-text-light mb-1.5 font-sans">Description</label>
            <textarea 
              className="w-full px-4 py-2.5 border border-primary/15 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-text-light/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200"
              value={editingItem.description || ''} 
              onChange={e => setEditingItem({...editingItem, description: e.target.value})} 
              rows="3"
              placeholder="Explain the scope and why this milestone is important..."
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-light mb-1.5 font-sans">Current Status</label>
              <select 
                className="w-full px-4 py-2.5 border border-primary/15 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200"
                value={editingItem.status}
                onChange={e => setEditingItem({...editingItem, status: e.target.value})}
              >
                <option value="planned">Planned / Backlog</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-light mb-1.5 font-sans">Parent Roadmap (Optional)</label>
              <select 
                className="w-full px-4 py-2.5 border border-primary/15 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200"
                value={editingItem.parent_id || ''}
                onChange={e => setEditingItem({...editingItem, parent_id: e.target.value})}
              >
                <option value="">-- No Parent (Root Level) --</option>
                {potentialParents.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <Input 
              label="Target Date (Optional)" 
              type="date" 
              value={editingItem.target_date || ''} 
              onChange={e => setEditingItem({...editingItem, target_date: e.target.value})} 
            />
          </div>
          
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
                'Update Item'
              ) : (
                'Save Roadmap'
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
        <h1 className="text-3xl font-bold text-primary">Roadmap Manager</h1>
        <Button variant="primary" onClick={() => setEditingItem({ title: '', description: '', status: 'planned', target_date: '', is_published: 1, parent_id: '' })}>
          + Add Item
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
        ) : roadmaps.length === 0 ? (
          <Card>
            <CardContent>No roadmap items found.</CardContent>
          </Card>
        ) : roadmaps.map(r => {
          const isChild = !!r.parent_id;
          const parentName = isChild ? roadmaps.find(p => p.id === r.parent_id)?.title : null;
          return (
          <Card key={r.id} className={`flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 gap-4 ${isChild ? 'ml-8 md:ml-12 border-l-surface-variant' : ''}`} style={{borderLeftColor: r.status === 'completed' ? '#10b981' : r.status === 'in-progress' ? 'var(--color-secondary)' : 'var(--color-outline-variant)'}}>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{r.title}</CardTitle>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${r.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary/15 text-secondary'}`}>
                  {r.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <CardContent className="mt-2">
                {isChild && <div className="text-xs font-semibold text-primary/70 mb-1">↳ Child of: {parentName}</div>}
                <p className="text-sm text-text-light/90">{r.description}</p>
                <div className="mt-2 text-xs text-text-light/75 font-semibold uppercase tracking-wider">
                  Status: {r.status} {r.target_date && `| Target: ${r.target_date}`}
                </div>
              </CardContent>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <Button 
                variant="outline" 
                className="px-3 py-1.5 text-xs h-9"
                onClick={() => handleTogglePublish(r)}
              >
                {r.is_published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button 
                variant="secondary" 
                className="px-3 py-1.5 text-xs h-9"
                onClick={() => setEditingItem(r)}
              >
                Edit
              </Button>
              <Button variant="danger" className="px-3 py-1.5 text-xs h-9" onClick={() => handleDelete(r.id)}>
                Delete
              </Button>
            </div>
          </Card>
        )})}
      </div>
    </div>
  );
};

export default Roadmaps;
