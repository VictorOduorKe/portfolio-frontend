import { useState, useEffect } from 'react';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../../services/api';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // null means list, object means add/edit form
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem.id) {
        await updateSkill(editingItem.id, editingItem);
      } else {
        await createSkill(editingItem);
      }
      setEditingItem(null);
      await loadSkills();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (skill) => {
    try {
      const updated = { ...skill, is_published: skill.is_published ? 0 : 1 };
      await updateSkill(skill.id, updated);
      loadSkills();
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this skill?')) {
      try {
        await deleteSkill(id);
        loadSkills();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  if (editingItem) {
    const isEditMode = !!editingItem.id;
    return (
      <Card className="max-w-xl mx-auto shadow-md">
        <CardHeader className="border-b border-primary/5 pb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {isEditMode ? 'Edit Skill' : 'Add New Skill'}
          </CardTitle>
          <p className="text-sm text-text-light mt-1">
            {isEditMode ? 'Update this competency detail.' : 'Specify a competency to showcase in your expertise chart.'}
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input 
            label="Skill Name" 
            type="text" 
            value={editingItem.name} 
            onChange={e => setEditingItem({...editingItem, name: e.target.value})} 
            required 
            placeholder="e.g. React.js, Kubernetes, PHP"
          />
          <div className="mb-4">
            <label className="block text-sm font-semibold text-text-light mb-1.5 font-sans">Category</label>
            <select 
              className="w-full px-4 py-2.5 border border-primary/15 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200"
              value={editingItem.category} 
              onChange={e => setEditingItem({...editingItem, category: e.target.value})} 
            >
              <option value="Frontend Development">Frontend Development</option>
              <option value="Backend Development">Backend Development</option>
              <option value="Databases">Databases</option>
              <option value="Cybersecurity & Networking">Cybersecurity & Networking</option>
              <option value="AI & Automation">AI & Automation</option>
              <option value="Payment Systems">Payment Systems</option>
              <option value="System Design & Architecture">System Design & Architecture</option>
              <option value="Software Projects Experience">Software Projects Experience</option>
              <option value="Tools & Workflow">Tools & Workflow</option>
              <option value="Human-Computer Interaction (HCI)">Human-Computer Interaction (HCI)</option>
            </select>
          </div>
          <Input 
            label="Proficiency (0-100%)" 
            type="number" 
            min="0" max="100"
            value={editingItem.proficiency} 
            onChange={e => setEditingItem({...editingItem, proficiency: e.target.value})} 
            placeholder="80"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Experience Badge" 
              type="text" 
              value={editingItem.experience_badge || ''} 
              onChange={e => setEditingItem({...editingItem, experience_badge: e.target.value})} 
              placeholder="e.g. 5+ projects"
            />
            <Input 
              label="Tags (comma-separated)" 
              type="text" 
              value={editingItem.tags || ''} 
              onChange={e => setEditingItem({...editingItem, tags: e.target.value})} 
              placeholder="e.g. Secure APIs, MVC, cPanel"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-text-light mb-1.5 font-sans">Description (Optional)</label>
            <textarea 
              className="w-full px-4 py-2.5 border border-primary/15 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200 text-sm placeholder:text-text-light/40"
              rows={3}
              value={editingItem.description || ''} 
              onChange={e => setEditingItem({...editingItem, description: e.target.value})} 
              placeholder="Describe what you built or your focus area with this skill."
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
                'Update Skill'
              ) : (
                'Save Skill'
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
        <h1 className="text-3xl font-bold text-primary">Skills Manager</h1>
        <Button variant="primary" onClick={() => setEditingItem({ name: '', category: 'Frontend Development', proficiency: '80', description: '', tags: '', experience_badge: '', is_published: 1 })}>
          + Add Skill
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-surface-container-lowest border border-surface-variant/40 rounded-2xl w-full">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-16 h-16 rounded-full border-4 border-primary/10 animate-ping"></div>
              <div className="w-10 h-10 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 animate-spin"></div>
            </div>
            <p className="mt-6 text-sm text-text-light font-semibold tracking-wider animate-pulse">
              Loading database items...
            </p>
          </div>
        ) : skills.length === 0 ? (
          <Card className="col-span-full">
            <CardContent>No skills found.</CardContent>
          </Card>
        ) : skills.map(s => (
          <Card key={s.id} className="flex flex-col justify-between h-full p-8">
            <div className="flex justify-between items-start w-full">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{s.name}</CardTitle>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary/15 text-secondary'}`}>
                    {s.is_published ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <CardContent className="text-xs text-text-light p-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <span>{s.category} &bull; {s.proficiency}%</span>
                    {s.experience_badge && (
                      <span className="inline-block text-[10px] bg-primary/10 text-primary font-bold px-2.5 py-1 rounded">
                        {s.experience_badge}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-xs text-text-light/85 border-l-2 border-primary/20 pl-3 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                  {s.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {s.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="inline-block text-[10px] font-semibold bg-surface-container-low text-text-light px-2.5 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 justify-end border-t border-primary/5 pt-3 w-full">
              <Button 
                variant="outline" 
                className="px-2.5 py-1 text-xs h-8"
                onClick={() => handleTogglePublish(s)}
              >
                {s.is_published ? 'Hide' : 'Show'}
              </Button>
              <Button 
                variant="secondary" 
                className="px-2.5 py-1 text-xs h-8"
                onClick={() => setEditingItem(s)}
              >
                Edit
              </Button>
              <Button variant="danger" className="px-2.5 py-1 text-xs h-8" onClick={() => handleDelete(s.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Skills;
