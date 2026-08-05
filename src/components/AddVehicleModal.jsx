import React, { useState } from 'react';
import { X, Save, Car } from 'lucide-react';
import dataService from '../services/dataService';

const COLORS = ['Preto', 'Branco', 'Cinzento', 'Azul', 'Vermelho', 'Verde', 'Amarelo', 'Bordeaux', 'Prata'];

export default function AddVehicleModal({ isOpen, onClose, onSave, customerId }) {
  const [formData, setFormData] = useState({
    matricula: '',
    marca: '',
    modelo: '',
    cor: 'Preto',
  });
  
  const [loading, setLoading] = useState(false);

  if (!isOpen || !customerId) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const vehicle = await dataService.addVehicle({
        cliente_id: customerId,
        matricula: formData.matricula,
        marca: formData.marca,
        modelo: formData.modelo,
        cor: formData.cor
      });

      if (onSave) onSave(vehicle);
    } catch (error) {
      console.error("Erro ao adicionar viatura:", error);
      alert("Ocorreu um erro ao adicionar a viatura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay flex-center">
      <div className="modal w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="modal-header flex-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center">
            <Car className="mr-2" /> Nova Viatura
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body p-6">
            <div className="form-group mb-4">
              <label className="block mb-1 font-medium">Matrícula *</label>
              <input 
                type="text" 
                name="matricula" 
                value={formData.matricula} 
                onChange={handleChange} 
                className="input w-full uppercase" 
                placeholder="XX-XX-XX"
                required 
              />
            </div>
            <div className="form-group mb-4">
              <label className="block mb-1 font-medium">Marca</label>
              <input 
                type="text" 
                name="marca" 
                value={formData.marca} 
                onChange={handleChange} 
                className="input w-full" 
                required
              />
            </div>
            <div className="form-group mb-4">
              <label className="block mb-1 font-medium">Modelo</label>
              <input 
                type="text" 
                name="modelo" 
                value={formData.modelo} 
                onChange={handleChange} 
                className="input w-full" 
                required
              />
            </div>
            <div className="form-group mb-4">
              <label className="block mb-1 font-medium">Cor</label>
              <select 
                name="cor" 
                value={formData.cor} 
                onChange={handleChange} 
                className="input w-full"
              >
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="modal-footer p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary flex-center" disabled={loading}>
              <Save size={18} className="mr-2" />
              {loading ? 'A Guardar...' : 'Guardar Viatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
