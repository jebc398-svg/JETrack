import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { TicketPhoto, TicketNote } from '@/lib/types';
import { formatDateTime, generateId } from '@/lib/utils';
import {
  ArrowLeft,
  Camera,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Send
} from 'lucide-react';

interface TechWorkViewProps {
  jobId: string;
  onBack: () => void;
  onRequestSignature: (jobId: string) => void;
}

const TechWorkView: React.FC<TechWorkViewProps> = ({
  jobId,
  onBack,
  onRequestSignature
}) => {
  const ticket = useAppStore(s => s.tickets.find(t => t.id === jobId));
  const updateTicket = useAppStore(s => s.updateTicket);
  const user = useAppStore(s => s.user);

  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [noteText, setNoteText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<TicketPhoto | null>(null);
  const antesInputRef = useRef<HTMLInputElement>(null);
  const despuesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ticket?.startedAt) return;

    const startTime = new Date(ticket.startedAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = now - startTime;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [ticket?.startedAt]);

  const handlePhotoUpload = useCallback(
    (type: 'antes' | 'despues') => {
      const input = type === 'antes' ? antesInputRef.current : despuesInputRef.current;
      input?.click();
    },
    []
  );

  const processPhotoFile = useCallback(
    (file: File, type: 'antes' | 'despues') => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newPhoto: TicketPhoto = {
          id: generateId(),
          url: dataUrl,
          type,
          caption: '',
          uploadedAt: new Date().toISOString()
        };

        const currentPhotos = ticket?.photos || [];
        updateTicket(jobId, {
          photos: [...currentPhotos, newPhoto]
        });
      };
      reader.readAsDataURL(file);
    },
    [ticket?.photos, jobId, updateTicket]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, type: 'antes' | 'despues') => {
      const file = e.target.files?.[0];
      if (file) {
        processPhotoFile(file, type);
      }
      e.target.value = '';
    },
    [processPhotoFile]
  );

  const handleAddNote = useCallback(() => {
    if (!noteText.trim()) return;

    const newNote: TicketNote = {
      id: generateId(),
      content: noteText.trim(),
      author: user?.name || 'Técnico',
      authorRole: user?.role || 'technician',
      createdAt: new Date().toISOString(),
      isInternal: false
    };

    const currentNotes = ticket?.notes || [];
    updateTicket(jobId, {
      notes: [...currentNotes, newNote]
    });
    setNoteText('');
  }, [noteText, user, ticket?.notes, jobId, updateTicket]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'iniciado': return '#16a34a';
      case 'pausado': return '#d97706';
      case 'en_camino': return '#2563eb';
      case 'scheduled': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'iniciado': return 'Iniciado';
      case 'pausado': return 'Pausado';
      case 'en_camino': return 'En Camino';
      case 'scheduled': return 'Programado';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const fotosAntes = ticket?.photos?.filter(p => p.type === 'antes') || [];
  const fotosDespues = ticket?.photos?.filter(p => p.type === 'despues') || [];
  const hasAntesPhotos = fotosAntes.length > 0;

  if (!ticket) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: '#64748b' }}>Ticket no encontrado</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: '#ffffff'
        }}>
          Trabajo en Progreso
        </h1>
      </header>

      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px',
            color: '#64748b',
            fontSize: '14px'
          }}>
            <Clock size={16} />
            <span>Tiempo Transcurrido</span>
          </div>
          <div style={{
            fontSize: '42px',
            fontWeight: '700',
            fontFamily: 'monospace',
            color: '#1d4ed8',
            letterSpacing: '2px'
          }}>
            {elapsedTime}
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            Inicio: {ticket.startedAt ? formatDateTime(ticket.startedAt) : '--'}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(ticket.status)
          }} />
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#0f172a'
          }}>
            {getStatusLabel(ticket.status)}
          </span>
          {ticket.status === 'iniciado' && (
            <CheckCircle size={16} style={{ marginLeft: 'auto', color: '#16a34a' }} />
          )}
        </div>

        {!hasAntesPhotos && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#92400e' }}>
              Debes tomar al menos una foto "Antes" antes de finalizar el trabajo
            </span>
          </div>
        )}

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <Camera size={18} style={{ color: '#2563eb' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
              Fotos Antes ({fotosAntes.length})
            </h3>
          </div>

          <input
            ref={antesInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileChange(e, 'antes')}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => handlePhotoUpload('antes')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Camera size={18} />
            Tomar Foto Antes
          </button>

          {fotosAntes.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              marginTop: '12px',
              paddingBottom: '8px'
            }}>
              {fotosAntes.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedPhoto?.id === photo.id ? '2px solid #2563eb' : '2px solid #e2e8f0'
                  }}
                >
                  <img
                    src={photo.url}
                    alt="Foto antes"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <Camera size={18} style={{ color: '#16a34a' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
              Fotos Después ({fotosDespues.length})
            </h3>
          </div>

          <input
            ref={despuesInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileChange(e, 'despues')}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => handlePhotoUpload('despues')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Camera size={18} />
            Tomar Foto Después
          </button>

          {fotosDespues.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              marginTop: '12px',
              paddingBottom: '8px'
            }}>
              {fotosDespues.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedPhoto?.id === photo.id ? '2px solid #2563eb' : '2px solid #e2e8f0'
                  }}
                >
                  <img
                    src={photo.url}
                    alt="Foto después"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <FileText size={18} style={{ color: '#2563eb' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
              Notas del Trabajo
            </h3>
          </div>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Agregar una nota sobre el trabajo..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />

          <button
            onClick={handleAddNote}
            disabled={!noteText.trim()}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '12px',
              backgroundColor: noteText.trim() ? '#7c3aed' : '#e2e8f0',
              color: noteText.trim() ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '12px',
              cursor: noteText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Send size={16} />
            Agregar Nota
          </button>

          {ticket.notes && ticket.notes.length > 0 && (
            <div style={{
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {ticket.notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#0f172a'
                      }}>
                        {note.author}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '500',
                        color: '#64748b',
                        backgroundColor: '#e2e8f0',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {note.authorRole === 'technician' ? 'Técnico' : note.authorRole === 'admin' ? 'Admin' : note.authorRole === 'supervisor' ? 'Supervisor' : note.authorRole}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      color: '#94a3b8'
                    }}>
                      {formatDateTime(note.createdAt)}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#334155',
                    lineHeight: '1.4'
                  }}>
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onRequestSignature(jobId)}
          disabled={!hasAntesPhotos}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: hasAntesPhotos ? '#16a34a' : '#94a3b8',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            cursor: hasAntesPhotos ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '8px'
          }}
        >
          Finalizar y Solicitar Firma
        </button>
      </div>

      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={24} />
          </button>
          <img
            src={selectedPhoto.url}
            alt="Foto ampliada"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          <div style={{
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#d1d5db'
            }}>
              {selectedPhoto.type === 'antes' ? 'Foto Antes' : 'Foto Después'}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginTop: '4px'
            }}>
              {formatDateTime(selectedPhoto.uploadedAt)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechWorkView;
