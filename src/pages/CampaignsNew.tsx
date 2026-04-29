import React, { useState } from 'react';
import { UniversalLayout } from '../components/layout/UniversalLayout';
import { Inspector } from '../components/layout/Inspector';
import { ContentCard } from '../components/ui/ContentCard';
import { useNavigation } from '../hooks/useNavigation';
import { useCampaigns } from '../core/modules/antroponomadas/application/useCampaigns';
import { getSubscribersStatsUseCase } from '../core/modules/antroponomadas/infrastructure/antroponomadas.dependencies';
import { NEWSLETTER_TEMPLATE } from '../templates/newsletter';
import type { Campaign } from '../core/modules/antroponomadas/domain/campaign.model';
import './CampaignsNew.css';

const CampaignsNew: React.FC = () => {
  const { navigationItems } = useNavigation();
  const { campaigns, loading, createCampaign, updateCampaign, deleteCampaign, sendCampaign, sendTestCampaign } = useCampaigns();
  
  const [recipientCount, setRecipientCount] = useState(0);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorMode, setInspectorMode] = useState<'create' | 'edit'>('create');
  const [, setSelectedCampaign] = useState<Campaign | null>(null);
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
    setSelectedCampaign(null);
    setIsInspectorOpen(true);
  };

  const handleEdit = (campaign: Campaign) => {
    if (campaign.status !== 'draft') {
      // TODO: Replace with toast notification
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
    setSelectedCampaign(campaign);
    setIsInspectorOpen(true);
  };

  const handleDelete = async (id: string) => {
    // TODO: Replace with confirmation panel
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
      // TODO: Replace with toast notification
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
      setSelectedCampaign(null);
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
      setSelectedCampaign(null);
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'primary';
      case 'sending': return 'warning';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviado';
      case 'sending': return 'Enviando';
      case 'failed': return 'Fallido';
      default: return status;
    }
  };

  return (
    <UniversalLayout
      navigation={navigationItems}
      user={{
        name: 'Administrador',
        email: 'admin@bidxaagui.com'
      }}
    >
      <div className="campaigns-new">
        {/* Header */}
        <div className="campaigns-header">
          <div className="campaigns-title">
            <h1>Campañas de Email</h1>
            <p>Gestiona tus campañas de correo electrónico</p>
          </div>
          <button className="btn-premium" onClick={handleCreate}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva Campaña
          </button>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <ContentCard
            title={campaigns?.length || 0}
            subtitle="Total Campañas"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={recipientCount}
            subtitle="Suscriptores"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={campaigns?.filter(c => c.status === 'sent').length || 0}
            subtitle="Enviadas"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={campaigns?.filter(c => c.status === 'draft').length || 0}
            subtitle="Borradores"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            }
            density="compact"
          />
        </div>

        {/* Campaigns List */}
        <div className="campaigns-content">
          {loading ? (
            <div className="loading-state">
              <div className="skeleton-cards">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-header" />
                    <div className="skeleton-content" />
                    <div className="skeleton-actions" />
                  </div>
                ))}
              </div>
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="campaigns-grid">
              {campaigns.map((campaign) => (
                <ContentCard
                  key={campaign.id}
                  title={campaign.subject}
                  description={campaign.preview_text}
                  status={getStatusVariant(campaign.status)}
                  badge={getStatusLabel(campaign.status)}
                  actions={[
                    {
                      id: 'view',
                      label: 'Ver',
                      onClick: () => handleEdit(campaign),
                      disabled: campaign.status !== 'draft'
                    },
                    {
                      id: 'test',
                      label: 'Prueba',
                      onClick: () => handleSendTest(campaign.id),
                      disabled: campaign.status !== 'draft'
                    },
                    {
                      id: 'delete',
                      label: 'Eliminar',
                      onClick: () => handleDelete(campaign.id),
                      variant: 'danger'
                    }
                  ]}
                  density="compact"
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-10 5L2 7" />
                </svg>
              </div>
              <h3>No hay campañas</h3>
              <p>Crea tu primera campaña para comenzar a comunicarte con tus suscriptores</p>
              <button className="btn-primary" onClick={handleCreate}>
                Crear Primera Campaña
              </button>
            </div>
          )}
        </div>

        {/* Inspector Panel */}
        <Inspector
          isOpen={isInspectorOpen}
          onClose={() => {
            setIsInspectorOpen(false);
            setSelectedCampaign(null);
          }}
          title={inspectorMode === 'create' ? 'Nueva Campaña' : 'Editar Campaña'}
          mode={inspectorMode}
        >
          <div className="inspector-form">
            <div className="form-group">
              <label>Asunto del Correo</label>
              <input
                type="text"
                className="input"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ej: Nueva Edición: Antroponómadas"
              />
            </div>

            <div className="form-group">
              <label>Texto de Previsualización (Opcional)</label>
              <input
                type="text"
                className="input"
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

          <div className="inspector-actions">
            <button className="btn-ghost" onClick={handleLoadTemplate}>
              Cargar Plantilla
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Guardar Borrador
            </button>
            {inspectorMode === 'edit' && (
              <button className="btn-premium" onClick={handleSend}>
                Enviar Ahora
              </button>
            )}
          </div>
        </Inspector>
      </div>
    </UniversalLayout>
  );
};

export default CampaignsNew;
