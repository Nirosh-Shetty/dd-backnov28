import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';

const TagsManager = () => {
    const [tags, setTags] = useState([]);
    const [show, setShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('');
    const [desc, setDesc] = useState('');
    const [editing, setEditing] = useState(null);

    const load = async () => {
        try {
            const res = await axios.get('http://localhost:7013/api/admin/food-tags');
            setTags(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { load(); }, []);

    const createTag = async () => {
        try {
            if (!name) return alert('Tag name required');
            await axios.post('http://localhost:7013/api/admin/food-tags', { tagName: name, description: desc, tagColor: color });
            setName(''); setDesc(''); setColor(''); setShow(false); load();
        } catch (e) { alert(e.response?.data?.error || 'Error'); }
    };

    const startEdit = (t) => {
        setEditing(t); setName(t.tagName); setDesc(t.description || ''); setColor(t.tagColor || ''); setEditShow(true);
    };

    const saveEdit = async () => {
        try {
            await axios.put(`http://localhost:7013/api/admin/food-tags/${editing._id}`, { tagName: name, description: desc, tagColor: color });
            setEditShow(false); setEditing(null); setName(''); setDesc(''); setColor(''); load();
        } catch (e) { alert(e.response?.data?.error || 'Error'); }
    };

    const deleteTag = async (id) => {
        // if (!confirm('Delete this tag?')) return;
        try { await axios.delete(`http://localhost:7013/api/admin/food-tags/${id}`); load(); } catch (e) { alert('Error deleting'); }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h4>Food Tags</h4>
                <Button onClick={() => setShow(true)}>+ Add Tag</Button>
            </div>
            <div>
                {tags.map(t => (
                    <div key={t._id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, borderBottom: '1px solid #eee' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ width: 18, height: 18, background: t.tagColor || '#ddd', borderRadius: 4 }} />
                            <strong>{t.tagName}</strong>
                            <span style={{ color: '#666' }}>{t.description}</span>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                            <Button variant="outline-primary" size="sm" onClick={() => startEdit(t)}>Edit</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => deleteTag(t._id)}>Delete</Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton><Modal.Title>Add Tag</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-2"><Form.Label>Name</Form.Label><Form.Control value={name} onChange={e => setName(e.target.value)} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>Color</Form.Label><Form.Control placeholder="#f0f0f0" value={color} onChange={e => setColor(e.target.value)} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>Description</Form.Label><Form.Control value={desc} onChange={e => setDesc(e.target.value)} /></Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                    <Button onClick={createTag}>Create</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={editShow} onHide={() => setEditShow(false)}>
                <Modal.Header closeButton><Modal.Title>Edit Tag</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-2"><Form.Label>Name</Form.Label><Form.Control value={name} onChange={e => setName(e.target.value)} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>Color</Form.Label><Form.Control value={color} onChange={e => setColor(e.target.value)} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>Description</Form.Label><Form.Control value={desc} onChange={e => setDesc(e.target.value)} /></Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditShow(false)}>Close</Button>
                    <Button onClick={saveEdit}>Save</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TagsManager;
