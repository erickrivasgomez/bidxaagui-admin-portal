import React, { useState, useEffect, useRef } from 'react';
import { suppliersApi, type Supplier, type CreateSupplierRequest, type UpdateSupplierRequest } from '../api/suppliers';
import '../pages/labs/LabsLayout.css';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSupplierRequest | UpdateSupplierRequest) => Promise<void>;
  supplier?: Supplier;
  loading?: boolean;
}

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSave, supplier, loading = false }) => {
  const [formData, setFormData] = useState<CreateSupplierRequest>({
    name: '',
    phone: '',
    city: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateSupplierRequest, string>>>({});
  const [cities, setCities] = useState<string[]>([]);
  const [showCityAutocomplete, setShowCityAutocomplete] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [activeCityIndex, setActiveCityIndex] = useState(-1);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes or supplier changes
  useEffect(() => {
    if (isOpen) {
      setFormData(supplier ? {
        name: supplier.name,
        phone: supplier.phone,
        city: supplier.city,
      } : {
        name: '',
        phone: '',
        city: '',
      });
      setErrors({});
    }
  }, [supplier, isOpen]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await suppliersApi.getCities();
        setCities(response.data.data.cities);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowCityAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field: keyof CreateSupplierRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    if (field === 'city') {
      const filtered = cities
        .filter(city => city.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setFilteredCities(filtered);
      setShowCityAutocomplete(value.length > 0 && filtered.length > 0);
      setActiveCityIndex(-1);
    }
  };

  const handleCitySelect = (city: string) => {
    setFormData(prev => ({ ...prev, city }));
    setShowCityAutocomplete(false);
    cityInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showCityAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveCityIndex(prev => (prev < filteredCities.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveCityIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && activeCityIndex >= 0) {
        e.preventDefault();
        handleCitySelect(filteredCities[activeCityIndex]);
      } else if (e.key === 'Escape') {
        setShowCityAutocomplete(false);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateSupplierRequest, string>> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.phone || formData.phone.trim().length < 10) {
      newErrors.phone = 'El teléfono debe tener al menos 10 caracteres';
    }

    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'La ciudad debe tener al menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save supplier:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="labs-modal-overlay" onClick={onClose}>
      <div className="labs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="labs-modal-header">
          <h2>{supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
          <button className="labs-modal-close" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="labs-modal-form">
          <div className="labs-form-input-wrapper">
            <label className="labs-form-label">Nombre *</label>
            <input
              type="text"
              inputMode="text"
              className="labs-form-input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre del proveedor"
              disabled={loading}
            />
            {errors.name && <div className="labs-form-error">{errors.name}</div>}
          </div>

          <div className="labs-form-input-wrapper">
            <label className="labs-form-label">Teléfono *</label>
            <input
              type="tel"
              inputMode="tel"
              className="labs-form-input"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+52 55 1234 5678"
              disabled={loading}
            />
            {errors.phone && <div className="labs-form-error">{errors.phone}</div>}
          </div>

          <div className="labs-form-input-wrapper" ref={autocompleteRef}>
            <label className="labs-form-label">Ciudad *</label>
            <input
              ref={cityInputRef}
              type="text"
              inputMode="text"
              className="labs-form-input"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ciudad"
              disabled={loading}
              autoComplete="off"
            />
            {errors.city && <div className="labs-form-error">{errors.city}</div>}
            
            {showCityAutocomplete && (
              <div className="labs-autocomplete">
                {filteredCities.map((city, index) => (
                  <div
                    key={city}
                    className={`labs-autocomplete-item ${index === activeCityIndex ? 'active' : ''}`}
                    onClick={() => handleCitySelect(city)}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="labs-modal-footer">
            <button
              type="button"
              className="labs-modal-btn labs-modal-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="labs-modal-btn labs-modal-btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : supplier ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
