import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import { campaignsAPI, type Campaign, subscribersAPI } from '../services/api';
import { NEWSLETTER_TEMPLATE } from '../templates/newsletter';
import './Campaigns.css';

const Campaigns: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'list' | 'edit' | 'create'>('list');
    const [formData, setFormData] = useState({
        id: '',
        subject: '',
        preview_text: '',
        content: ''
    });
    const [recipientCount, setRecipientCount] = useState(0);

    useEffect(() => {
        fetchCampaigns();
        fetchSubscriberCount();
    }, []);

    const fetchCampaigns = async () => {
        setIsLoading(true);
        try {
            const data = await campaignsAPI.getAll();
            setCampaigns(data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            // Don't alert on initial load error to avoid annoyance if purely auth related (handled by interceptor)
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubscriberCount = async () => {
        try {
            const stats = await subscribersAPI.stats();
            setRecipientCount(stats?.data?.total || 0);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setRecipientCount(0); // Safer fallback
        }
    };

    const handleCreate = () => {
        setFormData({
            id: '',
            subject: 'Boletín Bidxaagui: ',
            preview_text: '',
            content: ''
        });
        setView('create');
    };

    const handleEdit = (campaign: Campaign) => {
        if (campaign.status !== 'draft') {
            alert('Solo se pueden editar campañas en borrador.');
            return;
        }
        setFormData({
            id: campaign.id,
            subject: campaign.subject,
            preview_text: campaign.preview_text || '',
            content: campaign.content
        });
        setView('edit');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar esta campaña?')) return;
        try {
            await campaignsAPI.delete(id);
            await fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            alert('Error deleting campaign');
        }
    };

    const handleLoadTemplate = () => {
        if (formData.content && !window.confirm('Esto reemplazará el contenido actual. ¿Continuar?')) {
            return;
        }
        setFormData(prev => ({ ...prev, content: NEWSLETTER_TEMPLATE }));
    };

    const handleSave = async () => {
        if (!formData.subject || !formData.content) {
            alert('Por favor completa el asunto y el contenido.');
            return;
        }

        try {
            if (view === 'create') {
                await campaignsAPI.create({
                    subject: formData.subject,
                    preview_text: formData.preview_text,
                    content: formData.content
                });
            } else {
                await campaignsAPI.update(formData.id, {
                    subject: formData.subject,
                    preview_text: formData.preview_text,
                    content: formData.content
                });
            }
            setView('list');
            fetchCampaigns();
        } catch (error) {
            console.error('Error saving campaign:', error);
            alert('Error guardando la campaña');
        }
    };

    const handleSend = async (id: string) => {
        const confirmMsg = `¿Estás seguro de enviar esta campaña a ${recipientCount} suscriptores? Esta acción no se puede deshacer.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            const apiId = id || formData.id;
            const response = await campaignsAPI.send(apiId);
            alert(`Campaña procesada.\n${response.message || 'Envíos completados.'}`);
            if (view !== 'list') setView('list');
            fetchCampaigns();
        } catch (error) {
            console.error('Error sending campaign:', error);
            const msg = error instanceof Error ? error.message : 'Error desconocido';
            alert(`Error enviando la campaña: ${msg}`);
        }
    };

    return (
        <div className="admin-page">
            <AdminHeader title="Campañas de Email" />

            <div className="campaigns-container">
                {view === 'list' ? (
                    <>
                        <div className="actions-bar">
                            <button className="btn-primary" onClick={handleCreate}>
                                + Nueva Campaña
                            </button>
                        </div>

                        {isLoading ? (
                            <p>Cargando campañas...</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Asunto</th>
                                            <th>Estado</th>
                                            <th>Enviados / Fallidos</th>
                                            <th>Fecha Creación</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {campaigns.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center">No hay campañas registradas.</td>
                                            </tr>
                                        ) : (
                                            campaigns.map(campaign => (
                                                <tr key={campaign.id}>
                                                    <td>
                                                        <div className="campaign-subject">{campaign.subject}</div>
                                                        <small className="text-muted">{campaign.preview_text}</small>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${campaign.status}`}>
                                                            {campaign.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {['sent', 'sending', 'failed'].includes(campaign.status) ? (
                                                            <span>{campaign.successful_sends} / {campaign.failed_sends}</span>
                                                        ) : '-'}
                                                    </td>
                                                    <td>{new Date(campaign.created_at).toLocaleDateString()}</td>
                                                    <td className="actions-cell">
                                                        {campaign.status === 'draft' && (
                                                            <>
                                                                <button className="btn-icon" title="Editar" onClick={() => handleEdit(campaign)}>✏️</button>
                                                                <button className="btn-icon" title="Enviar" onClick={() => handleSend(campaign.id)}>🚀</button>
                                                            </>
                                                        )}
                                                        <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDelete(campaign.id)}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="editor-container">
                        <div className="editor-header">
                            <button className="btn-secondary" onClick={() => setView('list')}>← Volver</button>
                            <h2>{view === 'create' ? 'Nueva Campaña' : 'Editar Campaña'}</h2>
                            <div className="editor-actions">
                                <button className="btn-secondary" onClick={handleLoadTemplate}>Cargar Plantilla 2da Ed.</button>
                                <button className="btn-primary" onClick={handleSave}>Guardar Borrador</button>
                                {view === 'edit' && (
                                    <button className="btn-success" onClick={() => handleSend(formData.id)}>Enviar Ahora</button>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Asunto del Correo</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Ej: Nueva Edición: Antroponómadas"
                            />
                        </div>

                        <div className="form-group">
                            <label>Texto de Previsualización (Opcional)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.preview_text}
                                onChange={e => setFormData({ ...formData, preview_text: e.target.value })}
                                placeholder="Texto breve que aparece junto al asunto"
                            />
                        </div>

                        <div className="editor-split-view">
                            <div className="editor-pane source-pane">
                                <label>Código HTML (Editor)</label>
                                <textarea
                                    className="code-editor"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="<html>... Pegar código aquí o cargar plantilla"
                                    spellCheck={false}
                                />
                            </div>
                            <div className="editor-pane preview-pane">
                                <label>Previsualización</label>
                                <div className="preview-frame-container">
                                    <iframe
                                        srcDoc={formData.content}
                                        title="Email Preview"
                                        className="preview-iframe"
                                        sandbox="allow-same-origin"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Campaigns;
