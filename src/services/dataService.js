import { supabase } from '../lib/supabase';

const subDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const loginStaff = async (pin) => {
  if (pin === '1823') return { id: 'admin', name: 'Administrador', role: 'admin' };
  if (pin === '0000') return { id: 'func1', name: 'Equipa (Geral)', role: 'employee' };
  return null;
};

export const loginCustomer = async (customerNumber, phone) => {
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('numero_cliente', customerNumber)
    .eq('telemovel', phone)
    .single();
  return data;
};

export const getAllCustomers = async () => {
  const { data } = await supabase.from('customers').select('*').order('criado_em', { ascending: false });
  return data || [];
};

export const getCustomerById = async (id) => {
  const { data: customer } = await supabase.from('customers').select('*').eq('id', id).single();
  if (!customer) return null;
  customer.vehicles = await getVehiclesByCustomer(id);
  customer.washes = await getWashesByCustomer(id);
  return customer;
};

export const searchCustomers = async (query) => {
  if (!query) return [];
  const q = `%${query}%`;
  
  // 1. Pesquisa nos dados do cliente
  const { data: customersBySelf } = await supabase.from('customers')
    .select('*, vehicles(*)')
    .or(`nome.ilike.${q},telemovel.ilike.${q},numero_cliente.ilike.${q},nif.ilike.${q}`);
    
  // 2. Pesquisa nos dados das viaturas
  const { data: vehicles } = await supabase.from('vehicles')
    .select('cliente_id')
    .or(`marca.ilike.${q},modelo.ilike.${q},matricula.ilike.${q}`);
    
  let allCustomers = customersBySelf || [];
  
  // Junta os clientes encontrados através das viaturas
  if (vehicles && vehicles.length > 0) {
    const customerIds = vehicles.map(v => v.cliente_id);
    const existingIds = new Set(allCustomers.map(c => c.id));
    const newIds = customerIds.filter(id => !existingIds.has(id));
    
    if (newIds.length > 0) {
      const { data: customersByVehicles } = await supabase.from('customers')
        .select('*, vehicles(*)')
        .in('id', newIds);
        
      if (customersByVehicles) {
        allCustomers = [...allCustomers, ...customersByVehicles];
      }
    }
  }
  
  return allCustomers;
};

export const getNextCustomerNumber = async () => {
  const { data } = await supabase.from('customers').select('numero_cliente').order('numero_cliente', { ascending: false }).limit(1);
  if (!data || data.length === 0) return 'CLI-1001';
  const lastNum = data[0].numero_cliente;
  const numPart = parseInt(lastNum.replace('CLI-', ''));
  if (!isNaN(numPart)) return `CLI-${numPart + 1}`;
  return 'CLI-1001';
};

export const createCustomer = async (data) => {
  const numero_cliente = await getNextCustomerNumber();
  const { data: newCustomer, error } = await supabase.from('customers').insert([{
    numero_cliente,
    nome: data.nome,
    telemovel: data.telemovel,
    nif: data.nif || null,
    carimbos_acumulados: 0,
    lavagens_gratuitas: 0
  }]).select().single();
  if (error) throw error;
  return newCustomer;
};

export const updateCustomer = async (id, data) => {
  const { data: updated, error } = await supabase.from('customers').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
};

export const deleteCustomer = async (id) => {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const getInactiveCustomers = async (days) => {
  const threshold = subDays(new Date(), days).toISOString();
  const { data } = await supabase.from('customers').select('*').lt('last_wash_date', threshold);
  
  // To keep compatibility with UI that needs daysInactive
  if (data) {
    return data.map(c => {
      const ms = new Date() - new Date(c.last_wash_date);
      return { ...c, daysInactive: Math.floor(ms / (1000 * 60 * 60 * 24)) };
    });
  }
  return [];
};

export const getVehiclesByCustomer = async (customerId) => {
  const { data } = await supabase.from('vehicles').select('*').eq('cliente_id', customerId);
  return data || [];
};

export const addVehicle = async (data) => {
  const { data: newVehicle, error } = await supabase.from('vehicles').insert([data]).select().single();
  if (error) throw error;
  return newVehicle;
};

export const removeVehicle = async (id) => {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const getWashesByCustomer = async (customerId) => {
  const { data } = await supabase.from('washes').select('*').eq('cliente_id', customerId).order('data', { ascending: false });
  return data || [];
};

export const registerWashEntry = async (data) => {
  const washPayload = {
    telemovel: data.telemovel,
    matricula: data.matricula,
    tipo_lavagem: data.tipo_servico || data.tipo_lavagem,
    valor: data.valor || 0,
    hora_pedida: data.hora_pedida || null,
    estado: 'em_preparacao',
    cliente_id: data.cliente_id || null, // pode ser null no início
    data: new Date().toISOString(),
    marca_modelo: data.marca_modelo || null,
    cor: data.cor || null
  };
  
  const { data: newWash, error } = await supabase.from('washes').insert([washPayload]).select().single();
  if (error) throw error;
  
  return newWash;
};

export const updateWashStatus = async (washId, estado) => {
  const updateData = { estado };
  if (estado === 'finalizado') {
    updateData.data_finalizado = new Date().toISOString();
  } else if (estado === 'entregue') {
    updateData.data_entregue = new Date().toISOString();
  }

  const { data, error } = await supabase.from('washes').update(updateData).eq('id', washId).select().single();
  if (error) throw error;
  return data;
};

export const completeWashAndAssign = async (washId, clienteId, atribuirPonto) => {
  // Passa para entregue e associa cliente
  const updateData = {
    estado: 'entregue',
    data_entregue: new Date().toISOString(),
    cliente_id: clienteId || null,
    carimbos_ganhos: atribuirPonto ? 1 : 0
  };

  const { data: wash, error } = await supabase.from('washes').update(updateData).eq('id', washId).select().single();
  if (error) throw error;

  // Se tem cliente e ganha ponto, atualizar o cliente
  if (clienteId && atribuirPonto) {
    const customer = await getCustomerById(clienteId);
    let newStamps = (customer.carimbos_acumulados || 0) + 1;
    let newFreeWashes = customer.lavagens_gratuitas || 0;
    
    if (newStamps >= 10) {
      newStamps = 0;
      newFreeWashes += 1;
    }
    
    await supabase.from('customers').update({
      carimbos_acumulados: newStamps,
      lavagens_gratuitas: newFreeWashes,
      last_wash_date: new Date().toISOString()
    }).eq('id', clienteId);
  }
  return wash;
};

export const getActiveWashes = async () => {
  const { data, error } = await supabase
    .from('washes')
    .select('*')
    .in('estado', ['em_preparacao', 'finalizado'])
    .order('data', { ascending: true });
    
  if (error) {
    console.error("Erro a carregar lavagens ativas:", error);
    return [];
  }
  return data || [];
};

export const getWashById = async (id) => {
  const { data } = await supabase.from('washes').select('*').eq('id', id).single();
  return data;
};

export const getTodayStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const { data: washes } = await supabase.from('washes').select('*').gte('data', todayStart.toISOString());
  
  const totalRevenue = washes?.reduce((sum, w) => sum + (Number(w.valor) || 0), 0) || 0;
  return {
    totalWashes: washes?.length || 0,
    todayRegisteredWashes: washes?.filter(w => w.cliente_id).length || 0,
    todayAnonymousWashes: washes?.filter(w => !w.cliente_id).length || 0,
    totalRevenue,
    newCustomers: 0
  };
};

export const getGlobalStats = async () => {
  const { count: totalWashes } = await supabase.from('washes').select('*', { count: 'exact', head: true });
  return { totalWashes: totalWashes || 0, totalAnonymousWashes: 0, totalFreeWashes: 0 };
};

export const getMonthStats = async () => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0,0,0,0);
  
  const { data: washes } = await supabase.from('washes').select('*').gte('data', monthStart.toISOString());
  const { count: newCustomers } = await supabase.from('customers').select('*', { count: 'exact', head: true }).gte('criado_em', monthStart.toISOString());
  
  const totalRevenue = washes?.reduce((sum, w) => sum + (Number(w.valor) || 0), 0) || 0;
  
  return { 
    totalWashes: washes?.length || 0, 
    totalRevenue, 
    newCustomers: newCustomers || 0, 
    topCustomers: [] 
  };
};

export const getExportData = async () => {
  const { data: customers } = await supabase.from('customers').select('*');
  const { data: vehicles } = await supabase.from('vehicles').select('*');
  const { data: washes } = await supabase.from('washes').select('*');
  
  return { 
    customers: customers || [], 
    vehicles: vehicles || [], 
    washes: washes || [] 
  };
};

export const getWashesPerDay = async (month, year) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);
  const { data: washes } = await supabase.from('washes').select('*').gte('data', startDate.toISOString()).lt('data', endDate.toISOString());
  
  if (!washes) return [];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    count: 0,
    revenue: 0
  }));

  washes.forEach(wash => {
    const day = new Date(wash.data).getDate();
    dailyData[day - 1].count += 1;
    dailyData[day - 1].revenue += (Number(wash.valor) || 0);
  });

  return dailyData.filter(d => d.count > 0);
};

export const getWashesPerMonth = async (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);
  const { data: washes } = await supabase.from('washes').select('*').gte('data', startDate.toISOString()).lt('data', endDate.toISOString());
  
  if (!washes) return [];
  
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: monthNames[i],
    count: 0,
    revenue: 0
  }));

  washes.forEach(wash => {
    const m = new Date(wash.data).getMonth();
    monthlyData[m].count += 1;
    monthlyData[m].revenue += (Number(wash.valor) || 0);
  });

  return monthlyData.filter(m => m.count > 0);
};
export const getCustomerLifetimeValue = async (customerId) => { 
  const { data } = await supabase.from('washes').select('valor').eq('cliente_id', customerId);
  return data?.reduce((sum, w) => sum + (Number(w.valor) || 0), 0) || 0;
};

export default {
  loginStaff, loginCustomer, getAllCustomers, getCustomerById, searchCustomers, createCustomer, updateCustomer, deleteCustomer, getNextCustomerNumber, getInactiveCustomers, getVehiclesByCustomer, addVehicle, removeVehicle, getWashesByCustomer, registerWashEntry, updateWashStatus, completeWashAndAssign, getActiveWashes, getWashById, getTodayStats, getGlobalStats, getMonthStats, getExportData, getWashesPerDay, getWashesPerMonth, getCustomerLifetimeValue
};
