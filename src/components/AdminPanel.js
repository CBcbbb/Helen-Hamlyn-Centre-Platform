import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit, Trash2, LogOut, X } from 'lucide-react';

const AdminPanel = ({ onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    fetch('/data/graphData.json')
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  // Save all data
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const isProduction = window.location.hostname !== 'localhost';
      const apiUrl = isProduction ? '/api/save-data' : 'http://localhost:3001/api/save-data';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Data saved successfully! Refresh the main page to see changes.');
      } else {
        alert('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error: Make sure local API server is running (npm run start:api)');
    }
    setSaving(false);
  };

  // Delete node
  const handleDelete = (nodeId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setData({
      nodes: data.nodes.filter(n => n.id !== nodeId),
      links: data.links.filter(l => l.source !== nodeId && l.target !== nodeId)
    });
  };

  // Open edit modal
  const handleEdit = (node) => {
    setEditingNode({ ...node });
    setShowEditModal(true);
  };

  // Save edited node
  const handleSaveEdit = () => {
    setData({
      ...data,
      nodes: data.nodes.map(n => n.id === editingNode.id ? editingNode : n)
    });
    setShowEditModal(false);
    setEditingNode(null);
  };

  // Add new node
  const handleAddNode = (type) => {
    const newId = `${type.charAt(0)}${String(data.nodes.filter(n => n.type === type).length + 1).padStart(3, '0')}`;
    const newNode = {
      id: newId,
      name: 'New ' + type.slice(0, -1),
      type: type
    };

    setData({
      ...data,
      nodes: [...data.nodes, newNode]
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">VOICE Admin Panel</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
              style={{ backgroundColor: saving ? '#9ca3af' : '#148D66' }}
              onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#107052')}
              onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = '#148D66')}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: '#6b7280' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Add buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => handleAddNode('People')}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#5F5BA3' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4a4782'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#5F5BA3'}
          >
            <Plus size={18} />
            Add Person
          </button>
          <button
            onClick={() => handleAddNode('Institutions')}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#DC2680' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b01e68'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#DC2680'}
          >
            <Plus size={18} />
            Add Institution
          </button>
          <button
            onClick={() => handleAddNode('Projects')}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#EB631A' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#c94f15'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#EB631A'}
          >
            <Plus size={18} />
            Add Project
          </button>
          <button
            onClick={() => handleAddNode('Methods')}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#148D66' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#107052'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#148D66'}
          >
            <Plus size={18} />
            Add Method
          </button>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {['People', 'Institutions', 'Projects', 'Methods'].map(type => (
            <div key={type} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                {type} ({data.nodes.filter(n => n.type === type).length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.nodes.filter(n => n.type === type).map(node => (
                  <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <span className="font-medium text-gray-900">{node.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(node)}
                        className="p-2 rounded transition-colors"
                        style={{ color: '#00837F' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(node.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit {editingNode.type.slice(0, -1)}</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingNode.name}
                    onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {editingNode.type === 'People' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio (separate paragraphs with double line break)</label>
                      <textarea
                        value={Array.isArray(editingNode.bio) ? editingNode.bio.join('\n\n') : (editingNode.bio || '')}
                        onChange={(e) => setEditingNode({ ...editingNode, bio: e.target.value.split('\n\n') })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Websites (one per line)</label>
                      <textarea
                        value={Array.isArray(editingNode.websites) ? editingNode.websites.join('\n') : (editingNode.websites || '')}
                        onChange={(e) => setEditingNode({ ...editingNode, websites: e.target.value.split('\n').filter(w => w.trim()) })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Social Links (one per line)</label>
                      <textarea
                        value={Array.isArray(editingNode.social) ? editingNode.social.join('\n') : (editingNode.social || '')}
                        onChange={(e) => setEditingNode({ ...editingNode, social: e.target.value.split('\n').filter(s => s.trim()) })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Connections</label>
                      <input
                        type="text"
                        value={editingNode.connections || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, connections: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {editingNode.type === 'Institutions' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio (separate paragraphs with double line break)</label>
                      <textarea
                        value={Array.isArray(editingNode.bio) ? editingNode.bio.join('\n\n') : (editingNode.bio || '')}
                        onChange={(e) => setEditingNode({ ...editingNode, bio: e.target.value.split('\n\n') })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="text"
                        value={editingNode.website || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Social Links (one per line)</label>
                      <textarea
                        value={Array.isArray(editingNode.social) ? editingNode.social.join('\n') : (editingNode.social || '')}
                        onChange={(e) => setEditingNode({ ...editingNode, social: e.target.value.split('\n').filter(s => s.trim()) })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {editingNode.type === 'Projects' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (separate paragraphs with double line break)</label>
                      <textarea
                        value={Array.isArray(editingNode.description) ? editingNode.description.join('\n\n') : (editingNode.description || '')}
                        onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value.split('\n\n') })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Who Involved</label>
                      <textarea
                        value={editingNode.who_involved || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, who_involved: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Legacy Impacts</label>
                      <textarea
                        value={editingNode.legacy_impacts || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, legacy_impacts: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
                      <textarea
                        value={editingNode.challenges || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, challenges: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                      <input
                        type="text"
                        value={editingNode.budget || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, budget: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Methods</label>
                      <input
                        type="text"
                        value={editingNode.methods || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, methods: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website (URL or JSON string for multiple)</label>
                      <textarea
                        value={typeof editingNode.website === 'string' ? editingNode.website : JSON.stringify(editingNode.website, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setEditingNode({ ...editingNode, website: parsed });
                          } catch {
                            setEditingNode({ ...editingNode, website: e.target.value });
                          }
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Involved Institutions</label>
                      <textarea
                        value={editingNode.involved_institutions || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, involved_institutions: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {editingNode.type === 'Methods' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (separate paragraphs with double line break)</label>
                      <textarea
                        value={Array.isArray(editingNode.description) ? editingNode.description.join('\n\n') : (editingNode.description || '')}
                        onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value.split('\n\n') })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
                      <textarea
                        value={editingNode.steps || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, steps: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
                      <textarea
                        value={editingNode.challenges || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, challenges: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conditions</label>
                      <textarea
                        value={editingNode.conditions || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, conditions: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publications (one per line)</label>
                      <textarea
                        value={Array.isArray(editingNode.publications) ? editingNode.publications.join('\n') : (editingNode.publications || '')}
                        onChange={(e) => setEditingNode({ ...editingNode, publications: e.target.value.split('\n').filter(p => p.trim()) })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Templates</label>
                      <textarea
                        value={editingNode.templates || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, templates: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={editingNode.category || ''}
                        onChange={(e) => setEditingNode({ ...editingNode, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#00837F' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#006d69'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#00837F'}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
