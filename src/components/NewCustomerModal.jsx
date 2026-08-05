import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Check } from 'lucide-react';
import dataService from '../services/dataService';
import whatsappService from '../services/whatsappService';

const COLORS = ['Preto', 'Branco', 'Cinzento', 'Azul', 'Vermelho', 'Verde', 'Amarelo', 'Bordeaux', 'Prata'];

export default function NewCustomerModal({ isOpen, onClose, onSave, prefillData }) {
  const [formData, setFormData] = useState({
    nome: '',
    telemovel: '',
    nif: '',
    matricula: '',
    marca: '',
    modelo: '',
    cor: 'Preto',
  });
  
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (prefillData) {
      const isNumber = /^\d+$/.test(prefillData);
      const isPlate = /^[A-Za-z0-9-]{6,8}$/.test(prefillData);
      
      setFormData(prev => ({
        ...prev,
        telemovel: isNumber && prefillData.length >= 9 ? prefillData : prev.telemovel,
        nome: !isNumber && !isPlate ? prefillData : prev.nome,
        matricula: isPlate ? prefillData : prev.matricula
      }));
    }
  }, [prefillData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const customer = await dataService.createCustomer({
        nome: formData.nome,
        telemovel: formData.telemovel,
        nif: formData.nif
      });

      if (formData.matricula) {
        await dataService.addVehicle({
          cliente_id: customer.id,
          matricula: formData.matricula,
          marca: formData.marca,
          modelo: formData.modelo,
          cor: formData.cor
        });
      }

      setSuccessData(customer);
      if (onSave) onSave(customer);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      alert("Ocorreu um erro ao criar o cliente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendWelcome = () => {
    if (successData && successData.telemovel) {
      const msg = whatsappService.generateWelcomeMessage(successData);
      whatsappService.openWhatsApp(successData.telemovel, msg);
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setFormData({ nome: '', telemovel: '', nif: '', matricula: '', marca: '', modelo: '', cor: 'Preto' });
    onClose();
  };

  return (
    <div className="modal-overlay flex-center">
      <div className="modal w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden" style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div className="modal-header flex-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold">Novo Cliente</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        {successData ? (
          <div className="modal-body p-8 text-center" style={{ overflowY: 'auto' }}>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex-center mx-auto mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', background: '#dcfce7', borderRadius: '50%', margin: '0 auto 1rem auto' }}>
              <Check size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Cliente Criado!</h3>
            <p className="text-gray-600 mb-6">
              O número de cliente é: <span className="font-bold text-lg badge badge-info">{successData.numero_cliente}</span>
            </p>
            
            <div className="flex justify-center gap-4 mt-6" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={handleClose}>Fechar</button>
              <button className="btn btn-whatsapp flex-center" onClick={handleSendWelcome}>
                <MessageSquare size={18} className="mr-2" />
                Enviar Mensagem de Boas-vindas
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="modal-body p-6" style={{ overflowY: 'auto', flex: 1 }}>
              <h3 className="font-semibold text-lg mb-4 border-b pb-2">Dados Pessoais</h3>
              <div className="grid gap-4 mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Nome *</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="input" required />
                </div>
                <div className="form-group">
                  <label>Telemóvel *</label>
                  <input type="tel" name="telemovel" value={formData.telemovel} onChange={handleChange} className="input" required />
                </div>
                <div className="form-group">
                  <label>NIF</label>
                  <input type="text" name="nif" value={formData.nif} onChange={handleChange} className="input" />
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-4 border-b pb-2">Viatura (Opcional)</h3>
              <div className="grid gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Matrícula</label>
                  <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="input uppercase" placeholder="XX-XX-XX" />
                </div>
                <div className="form-group">
                  <label>Marca</label>
                  <input type="text" name="marca" value={formData.marca} onChange={handleChange} className="input" />
                </div>
                <div className="form-group">
                  <label>Modelo</label>
                  <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className="input" />
                </div>
                <div className="form-group">
                  <label>Cor</label>
                  <select name="cor" value={formData.cor} onChange={handleChange} className="input">
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-footer p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-outline" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary flex-center" disabled={loading}>
                <Save size={18} className="mr-2" />
                {loading ? 'A Guardar...' : 'Guardar Cliente'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
