import React, { useState } from 'react';
import { X, Droplets, Award } from 'lucide-react';
import dataService from '../services/dataService';

const SERVICES = [
  { id: 'completa', name: 'Lavagem Completa', price: 15 },
  { id: 'exterior', name: 'Lavagem Exterior', price: 7 },
  { id: 'interior', name: 'Lavagem Interior', price: 8 },
];

export default function WashModal({ isOpen, onClose, customer, vehicles = [], onSave, currentUser }) {
  const [formData, setFormData] = useState({
    viatura_id: vehicles.length > 0 ? vehicles[0].id : '',
    tipo_servico: 'Lavagem Exterior',
    valor: 7,
    atribuiu_ponto: true,
    estado: 'concluido'
  });
  
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  if (!isOpen || !customer) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'tipo_servico') {
      const svc = SERVICES.find(s => s.name === value);
      setFormData(prev => ({ 
        ...prev, 
        tipo_servico: value, 
        valor: svc ? svc.price : prev.valor 
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const washData = {
        cliente_id: customer.id,
        viatura_id: formData.viatura_id || null,
        tipo_servico: formData.tipo_servico,
        valor: parseFloat(formData.valor),
        atribuiu_ponto: formData.atribuiu_ponto,
        registado_por: currentUser?.id || 1,
        estado: 'concluido' // force state to concluido
      };
      
      const result = await dataService.registerWash(washData);
      
      // Check if user hit 10 stamps
      const updatedStamps = (customer.carimbos_acumulados || 0) + (formData.atribuiu_ponto ? 1 : 0);
      
      if (updatedStamps === 10) {
        setShowCelebration(true);
        setTimeout(() => {
          if (onSave) onSave(result);
        }, 3000);
      } else {
        if (onSave) onSave(result);
      }
      
    } catch (error) {
      console.error("Erro ao registar lavagem:", error);
      alert("Ocorreu um erro ao registar a lavagem.");
    } finally {
      setLoading(false);
    }
  };

  if (showCelebration) {
    return (
      <div className="modal-overlay flex-center">
        <div className="modal w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center animate-bounce">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex-center mx-auto mb-4">
            <Award size={40} />
          </div>
          <h2 className="text-3xl font-bold text-yellow-600 mb-2">Parabéns!</h2>
          <p className="text-xl">O cliente {customer.nome} atingiu 10 carimbos!</p>
          <p className="mt-4 font-semibold">Tem direito a uma lavagem gratuita!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay flex-center">
      <div className="modal w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="modal-header flex-between p-4 border-b border-gray-100 bg-blue-50">
          <h2 className="text-xl font-bold flex items-center text-blue-800">
            <Droplets className="mr-2" /> Registar Lavagem
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body p-6">
            <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-100">
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-semibold text-lg">{customer.nome} <span className="badge badge-info ml-2">{customer.numero_cliente}</span></p>
            </div>

            <div className="form-group mb-4">
              <label className="font-semibold block mb-1">Viatura</label>
              {vehicles.length > 0 ? (
                <select 
                  name="viatura_id" 
                  value={formData.viatura_id} 
                  onChange={handleChange} 
                  className="input w-full"
                >
                  <option value="">-- Selecione uma viatura --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.matricula} - {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">Este cliente não tem viaturas registadas.</p>
              )}
            </div>

            <div className="form-group mb-4">
              <label className="font-semibold block mb-1">Tipo de Serviço</label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map(svc => (
                  <label 
                    key={svc.id} 
                    className={`border rounded p-3 cursor-pointer transition-colors ${formData.tipo_servico === svc.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input 
                      type="radio" 
                      name="tipo_servico" 
                      value={svc.name}
                      checked={formData.tipo_servico === svc.name}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="font-medium text-sm">{svc.name}</div>
                    <div className="text-blue-600 font-bold">{svc.price}€</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="font-semibold block mb-1">Valor (€)</label>
              <input 
                type="number" 
                name="valor" 
                value={formData.valor} 
                onChange={handleChange} 
                className="input w-full"
                step="0.01" 
                min="0"
                required
              />
            </div>

            <div className="form-group flex items-center mt-6">
              <input 
                type="checkbox" 
                id="atribuiu_ponto" 
                name="atribuiu_ponto" 
                checked={formData.atribuiu_ponto} 
                onChange={handleChange} 
                className="mr-2 w-5 h-5 text-blue-600 rounded"
              />
              <label htmlFor="atribuiu_ponto" className="font-semibold select-none cursor-pointer">
                Atribuir carimbo no cartão de fidelização
              </label>
            </div>
          </div>
          
          <div className="modal-footer p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary flex-center" disabled={loading}>
              <Droplets size={18} className="mr-2" />
              {loading ? 'A Registar...' : 'Registar Lavagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
