import React, { useState, useEffect } from 'react';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../../../../../core/modules/laboratorio/domain/supplier.model';

interface ProviderInspectorProps {
  isOpen: boolean;
  isCreating: boolean;
  selectedSupplier: Supplier | null;
  onClose: () => void;
  onCreate: (data: CreateSupplierRequest) => Promise<void>;
  onUpdate: (id: string, data: UpdateSupplierRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface FormData {
  name: string;
  phone: string;
  city: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  city?: string;
  general?: string;
}

export const ProviderInspector: React.FC<ProviderInspectorProps> = ({
  isOpen,
  isCreating,
  selectedSupplier,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    city: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when inspector opens/closes or selected supplier changes
  useEffect(() => {
    if (isOpen && selectedSupplier && !isCreating) {
      setFormData({
        name: selectedSupplier.name,
        phone: selectedSupplier.phone,
        city: selectedSupplier.city,
      });
    } else if (isOpen && isCreating) {
      setFormData({
        name: '',
        phone: '',
        city: '',
      });
    } else if (!isOpen) {
      setFormData({
        name: '',
        phone: '',
        city: '',
      });
    }
    
    setErrors({});
  }, [isOpen, selectedSupplier, isCreating]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono no es válido';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isCreating) {
        await onCreate(formData);
      } else if (selectedSupplier) {
        await onUpdate(selectedSupplier.id, formData);
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al guardar proveedor',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;

    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(selectedSupplier.id);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al eliminar proveedor',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Desktop: Side Panel */}
      <div className="hidden lg:block fixed inset-0 z-50 pointer-events-none">
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />
        <div className="absolute right-0 top-0 h-full w-[450px] bg-white shadow-xl pointer-events-auto flex flex-col">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5DA]">
              <h2 className="text-[18px] font-semibold text-[#1F1F1A]">
                {isCreating ? 'Nuevo Proveedor' : 'Editar Proveedor'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F0EC] transition-colors"
                aria-label="Cerrar"
              >
                <svg 
                  className="w-5 h-5 text-[#8A8A77]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label 
                    htmlFor="name" 
                    className="block text-[12px] font-medium text-[#1F1F1A] mb-2"
                  >
                    Nombre del Proveedor
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="Ingrese el nombre del proveedor"
                    className={`w-full px-3 py-2 text-[16px] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-[#DDDDCF] focus:ring-[#868466] focus:border-[#868466]'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label 
                    htmlFor="phone" 
                    className="block text-[12px] font-medium text-[#1F1F1A] mb-2"
                  >
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="+52 555 123 4567"
                    className={`w-full px-3 py-2 text-[16px] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-[#DDDDCF] focus:ring-[#868466] focus:border-[#868466]'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* City Field */}
                <div>
                  <label 
                    htmlFor="city" 
                    className="block text-[12px] font-medium text-[#1F1F1A] mb-2"
                  >
                    Ciudad
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange('city')}
                    placeholder="Ciudad de México"
                    className={`w-full px-3 py-2 text-[16px] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.city 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-[#DDDDCF] focus:ring-[#868466] focus:border-[#868466]'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.city && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.city}</p>
                  )}
                </div>

                {/* General Error */}
                {errors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-[12px] text-red-600">{errors.general}</p>
                  </div>
                )}
              </div>
            </form>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-[#E5E5DA] bg-gradient-to-t from-white to-white">
              <div className="flex items-center justify-between">
                {/* Delete button (only in edit mode) */}
                {!isCreating && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                    className="px-4 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[14px] font-medium text-[#8A8A77] hover:bg-[#F0F0EC] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[14px] font-medium text-white bg-[#868466] hover:bg-[#767456] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Full Screen Sheet */}
      <div className="lg:hidden fixed inset-0 z-50">
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="absolute inset-0 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5DA]">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F0EC] transition-colors -ml-2"
              aria-label="Cerrar"
            >
              <svg 
                className="w-5 h-5 text-[#8A8A77]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-[16px] font-semibold text-[#1F1F1A]">
              {isCreating ? 'Nuevo Proveedor' : 'Editar Proveedor'}
            </h2>
            <div className="w-8" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label 
                  htmlFor="mobile-name" 
                  className="block text-[12px] font-medium text-[#1F1F1A] mb-2"
                >
                  Nombre del Proveedor
                </label>
                <input
                  id="mobile-name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Ingrese el nombre del proveedor"
                  className={`w-full px-3 py-2 text-[16px] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                    errors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#DDDDCF] focus:ring-[#868466] focus:border-[#868466]'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-[12px] text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label 
                  htmlFor="mobile-phone" 
                  className="block text-[12px] font-medium text-[#1F1F1A] mb-2"
                >
                  Teléfono
                </label>
                <input
                  id="mobile-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="+52 555 123 4567"
                  className={`w-full px-3 py-2 text-[16px] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                    errors.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#DDDDCF] focus:ring-[#868466] focus:border-[#868466]'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="mt-1 text-[12px] text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* City Field */}
              <div>
                <label 
                  htmlFor="mobile-city" 
                  className="block text-[12px] font-medium text-[#1F1F1A] mb-2"
                >
                  Ciudad
                </label>
                <input
                  id="mobile-city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  placeholder="Ciudad de México"
                  className={`w-full px-3 py-2 text-[16px] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                    errors.city 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#DDDDCF] focus:ring-[#868466] focus:border-[#868466]'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.city && (
                  <p className="mt-1 text-[12px] text-red-500">{errors.city}</p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-[12px] text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Delete button (only in edit mode) */}
              {!isCreating && (
                <div className="pt-4 border-t border-[#E5E5DA]">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                    className="w-full px-4 py-3 text-[14px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar Proveedor'}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Fixed Bottom Actions */}
          <div className="px-4 py-3 border-t border-[#E5E5DA] bg-gradient-to-t from-white to-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-[14px] font-medium text-[#8A8A77] hover:bg-[#F0F0EC] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-[14px] font-medium text-white bg-[#868466] hover:bg-[#767456] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
