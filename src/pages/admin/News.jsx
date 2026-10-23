import { useState, useEffect } from 'react';
import { getNews, createNews, updateNews, deleteNews } from '../../services/api';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const News = () => {
  const [news, setNews] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // null means list, object means add/edit form
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await getNews();
      setNews(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem.id) {
        await updateNews(editingItem.id, editingItem);
      } else {
        await createNews(editingItem);
      }
      setEditingItem(null);
      await loadNews();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      const updated = { ...post, is_published: post.is_published ? 0 : 1 };
      await updateNews(post.id, updated);
      loadNews();
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this news post?')) {
      try {
        await deleteNews(id);
        loadNews();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  if (editingItem) {
    const isEditMode = !!editingItem.id;
    return (
      <Card className="max-w-3xl mx-auto shadow-md">
        <CardHeader className="border-b border-primary/5 pb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {isEditMode ? 'Edit News Post' : 'Add News Post'}
          </CardTitle>
          <p className="text-sm text-text-light mt-1">
            {isEditMode ? 'Modify this announcement details.' : 'Publish announcements, technical blogs, or milestones for visitors.'}
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input 
            label="Post Title" 
            type="text" 
            value={editingItem.title} 
            onChange={e => setEditingItem({...editingItem, title: e.target.value})} 
            required 
            placeholder="e.g. Announcing the open-source release of Project X"
          />
          <Input 
            label="Source Name (Optional)" 
            type="text" 
            value={editingItem.source || ''} 
            onChange={e => setEditingItem({...editingItem, source: e.target.value})} 
            placeholder="e.g. TechCrunch"
          />
          <Input 
            label="Source URL (Optional)" 
            type="url" 
            value={editingItem.source_url || ''} 
            onChange={e => setEditingItem({...editingItem, source_url: e.target.value})} 
            placeholder="e.g. https://techcrunch.com/..."
          />
          <div>
            <label className="block text-sm font-semibold text-text-light mb-1.5 font-sans">Content</label>
            <textarea 
              className="w-full px-4 py-2.5 border border-primary/15 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-text-light/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200"
              value={editingItem.content} 
              onChange={e => setEditingItem({...editingItem, content: e.target.value})} 
              rows="6"
              required
              placeholder="Write the full post contents here..."
            ></textarea>
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
                'Update Post'
              ) : (
                'Publish News'
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
        <h1 className="text-3xl font-bold text-primary">News Manager</h1>
        <Button variant="primary" onClick={() => setEditingItem({ title: '', content: '', source: '', source_url: '', is_published: 1 })}>
          + Add Post
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
        ) : news.length === 0 ? (
          <Card>
            <CardContent>No news posts found.</CardContent>
          </Card>
        ) : news.map(n => (
          <Card key={n.id}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{n.title}</CardTitle>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${n.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary/15 text-secondary'}`}>
                    {n.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="text-xs text-text-light mt-1">
                  {new Date(n.created_at).toLocaleString()}
                  {n.source && ` • Source: ${n.source}`}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="px-3 py-1.5 text-xs h-9"
                  onClick={() => handleTogglePublish(n)}
                >
                  {n.is_published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button 
                  variant="secondary" 
                  className="px-3 py-1.5 text-xs h-9"
                  onClick={() => setEditingItem(n)}
                >
                  Edit
                </Button>
                <Button variant="danger" className="px-3 py-1.5 text-xs h-9" onClick={() => handleDelete(n.id)}>
                  Delete
                </Button>
              </div>
            </div>
            <CardContent className="whitespace-pre-wrap">{n.content}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default News;
