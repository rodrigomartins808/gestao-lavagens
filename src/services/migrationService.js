import { supabase } from '../lib/supabase';
import dataService from './dataService';

export const migrateToSupabase = async () => {
  try {
    // Read all local data
    const localData = dataService.getExportData(); // contains { customers, vehicles, washes }

    console.log("Iniciando migração de", localData.customers.length, "clientes");

    // 1. Insert Customers
    if (localData.customers && localData.customers.length > 0) {
      const customersToInsert = localData.customers.map(c => ({
        id: c.id, // Keep local UUID to preserve relationships
        numero_cliente: c.numero_cliente,
        nome: c.nome,
        telemovel: c.telemovel,
        nif: c.nif,
        carimbos_acumulados: c.carimbos_acumulados,
        lavagens_gratuitas: c.lavagens_gratuitas || 0,
        last_wash_date: c.lastWashDate ? new Date(c.lastWashDate).toISOString() : null,
        criado_em: c.criado_em ? new Date(c.criado_em).toISOString() : new Date().toISOString()
      }));

      // Insert in chunks or all at once (since it's < 1000 usually)
      const { error: customerError } = await supabase
        .from('customers')
        .upsert(customersToInsert); // Use upsert to avoid duplicate errors

      if (customerError) throw customerError;
      console.log("Clientes migrados com sucesso.");
    }

    // 2. Insert Vehicles
    if (localData.vehicles && localData.vehicles.length > 0) {
      const vehiclesToInsert = localData.vehicles.map(v => ({
        id: v.id,
        cliente_id: v.cliente_id,
        matricula: v.matricula,
        marca: v.marca || '',
        modelo: v.modelo || '',
        cor: v.cor || '',
        criado_em: v.criado_em ? new Date(v.criado_em).toISOString() : new Date().toISOString()
      }));

      const { error: vehicleError } = await supabase
        .from('vehicles')
        .upsert(vehiclesToInsert);

      if (vehicleError) throw vehicleError;
      console.log("Viaturas migradas com sucesso.");
    }

    // 3. Insert Washes (History)
    if (localData.washes && localData.washes.length > 0) {
      const washesToInsert = localData.washes.map(w => ({
        id: w.id,
        cliente_id: w.cliente_id,
        tipo_lavagem: w.tipo_lavagem,
        valor: w.valor,
        carimbos_ganhos: w.carimbos_ganhos,
        data: w.data ? new Date(w.data).toISOString() : new Date().toISOString()
      }));

      const { error: washError } = await supabase
        .from('washes')
        .upsert(washesToInsert);

      if (washError) throw washError;
      console.log("Histórico migrado com sucesso.");
    }

    return { success: true, message: "Migração concluída com sucesso!" };
  } catch (error) {
    console.error("Erro na migração:", error);
    return { success: false, message: error.message };
  }
};
