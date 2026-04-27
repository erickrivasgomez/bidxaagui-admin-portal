import React, { useState } from 'react';
import { useCampaigns } from '../core/modules/antroponomadas/application/useCampaigns';
import { getSubscribersStatsUseCase } from '../core/modules/antroponomadas/infrastructure/antroponomadas.dependencies';
import { NEWSLETTER_TEMPLATE } from '../templates/newsletter';
import { AppCanvas } from '../components/AppCanvas';
import { AppInspector } from '../components/AppInspector';
import type { Campaign } from '../core/modules/antroponomadas/domain/campaign.model';
import './Campaigns.css';

const Campaigns: React.FC = () => {
    const { campaigns, loading, createCampaign, updateCampaign, deleteCampaign, sendCampaign, sendTestCampaign } = useCampaigns();
    
    const [recipientCount, setRecipientCount] = useState(0);
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [inspectorMode, setInspectorMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({
        id: '',
        subject: '',
        preview_text: '',
        content: ''
    });

    const fetchSubscriberCount = async () => {
        try {
            const stats = await getSubscribersStatsUseCase.execute();
            setRecipientCount(stats.total || 0);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setRecipientCount(0);
        }
    };

    React.useEffect(() => {
        fetchSubscriberCount();
    }, []);

    const handleCreate = () => {
        setFormData({
            id: '',
            subject: 'Boletín Bidxaagui: ',
            preview_text: '',
            content: ''
        });
        setInspectorMode('create');
        setIsInspectorOpen(true);
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
        setInspectorMode('edit');
        setIsInspectorOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar esta campaña?')) return;
        try {
            await deleteCampaign(id);
        } catch (error) {
            console.error('Error deleting campaign:', error);
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
            if (inspectorMode === 'create') {
                await createCampaign({
                    subject: formData.subject,
                    preview_text: formData.preview_text,
                    content: formData.content
                });
            } else {
                await updateCampaign(formData.id, {
                    subject: formData.subject,
                    preview_text: formData.preview_text,
                    content: formData.content
                });
            }
            // Clean form after successful submission
            setFormData({ id: '', subject: '', preview_text: '', content: '' });
            setIsInspectorOpen(false);
        } catch (error) {
            console.error('Error saving campaign:', error);
            alert('Error guardando la campaña');
        }
    };

    const handleSend = async () => {
        const confirmMsg = `¿Estás seguro de enviar esta campaña a ${recipientCount} suscriptores? Esta acción no se puede deshacer.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await sendCampaign(formData.id);
            alert(`Campaña enviada y procesada correctamente.`);
            setIsInspectorOpen(false);
        } catch (error) {
            console.error('Error sending campaign:', error);
            const msg = error instanceof Error ? error.message : 'Error desconocido';
            alert(`Error enviando la campaña: ${msg}`);
        }
    };

    const handleSendTest = async (id: string) => {
        const testEmails = ['antroponomadas.2025revd@gmail.com', 'rivaserick@outlook.com'];
        const confirmMsg = `¿Enviar prueba a ${testEmails.join(', ')}?`;
        
        if (!window.confirm(confirmMsg)) return;

        try {
            const apiId = id || formData.id;
            await sendTestCampaign(apiId, testEmails);
            alert(`Prueba enviada correctamente a: ${testEmails.join(', ')}`);
        } catch (error) {
            console.error('Error sending test:', error);
            const msg = error instanceof Error ? error.message : 'Error desconocido';
            alert(`Error enviando la prueba: ${msg}`);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        const statusMap: Record<string, string> = {
            draft: 'status-draft',
            sent: 'status-sent',
            sending: 'status-sending',
            failed: 'status-failed'
        };
        return statusMap[status] || 'status-draft';
    };

    return (
        <>
            <AppCanvas
                title="Campañas de Email"
                actions={
                    <button className="btn-primary" onClick={handleCreate} style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}>
                        + Nueva Campaña
                    </button>
                }
            >
                {loading ? (
                    <div className="skeleton-table">
                        <div className="skeleton-row" />
                        <div className="skeleton-row" />
                        <div className="skeleton-row" />
                    </div>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Asunto</th>
                                <th>Estado</th>
                                <th>Enviados / Fallidos</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(campaigns || []).length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        No hay campañas registradas.
                                    </td>
                                </tr>
                            ) : (
                                (campaigns || []).map(campaign => (
                                    <tr key={campaign.id}>
                                        <td>
                                            <div className="campaign-subject">{campaign.subject}</div>
                                            <div className="campaign-preview">{campaign.preview_text}</div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(campaign.status)}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td>
                                            {['sent', 'sending', 'failed'].includes(campaign.status) ? (
                                                <span>{campaign.successful_sends} / {campaign.failed_sends}</span>
                                            ) : '-'}
                                        </td>
                                        <td>{new Date(campaign.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {campaign.status === 'draft' && (
                                                    <>
                                                        <button className="btn-action-secondary" onClick={() => handleEdit(campaign)} title="Editar">
                                                            ✏️
                                                        </button>
                                                        <button className="btn-action-secondary" onClick={() => handleSendTest(campaign.id)} title="Enviar prueba">
                                                            ✉️
                                                        </button>
                                                    </>
                                                )}
                                                <button className="btn-action-danger" onClick={() => handleDelete(campaign.id)} title="Eliminar">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </AppCanvas>

            <AppInspector
                isOpen={isInspectorOpen}
                onClose={() => setIsInspectorOpen(false)}
                title={inspectorMode === 'create' ? 'Nueva Campaña' : 'Editar Campaña'}
                footer={
                    <>
                        <button className="btn-secondary" onClick={handleLoadTemplate}>
                            Cargar Plantilla
                        </button>
                        <button className="btn-primary" onClick={handleSave}>
                            Guardar Borrador
                        </button>
                        {inspectorMode === 'edit' && (
                            <button className="btn-success" onClick={handleSend}>
                                Enviar Ahora
                            </button>
                        )}
                    </>
                }
            >
                <div className="inspector-form">
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
            </AppInspector>
        </>
    );
};

export default Campaigns;
