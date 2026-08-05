import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, Car } from 'lucide-react';
import dataService from '../services/dataService';

export default function QuickSearch({ onSelectCustomer, onCreateNew }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        const data = await dataService.searchCustomers(query);
        setResults(data || []);
      } catch (error) {
        console.error("Erro na pesquisa:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout.current);
  }, [query]);

  return (
    <div className="quick-search-container w-full relative">
      <div className="search-input-wrapper relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          className="input input-lg w-full pl-10 pr-4"
          placeholder="Pesquisar por nome, telemóvel, nif ou matrícula..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isSearching && <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">A procurar...</span>}
      </div>

      {query.length >= 2 && !isSearching && (
        <div className="search-results absolute w-full mt-2 bg-white shadow-lg rounded-md border border-gray-100 z-10 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Resultados</h4>
              {results.map((customer) => (
                <div
                  key={customer.id}
                  className="search-result-card p-3 hover:bg-gray-50 cursor-pointer rounded-md border-b border-gray-50 last:border-0 transition-colors"
                  onClick={() => onSelectCustomer(customer)}
                >
                  <div className="flex-between">
                    <div className="font-semibold text-gray-800 flex items-center">
                      <User size={16} className="mr-2 text-blue-500" />
                      {customer.nome}
                    </div>
                    <span className="badge badge-info">{customer.numero_cliente}</span>
                  </div>
                  
                  <div className="mt-1 flex-between text-sm text-gray-600">
                    <div>Carimbos: <span className="font-bold">{customer.carimbos_acumulados}/10</span></div>
                  </div>

                  {customer.vehicles && customer.vehicles.length > 0 && (
                    <div className="mt-2 pl-6">
                      {customer.vehicles.map(v => (
                        <div key={v.id} className="text-xs text-gray-500 flex items-center mb-1">
                          <Car size={12} className="mr-1" />
                          {v.matricula} • {v.marca} {v.modelo} ({v.cor})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p className="mb-4">Nenhum cliente encontrado.</p>
              <button 
                className="btn btn-outline w-full flex-center"
                onClick={() => onCreateNew(query)}
              >
                <Plus size={16} className="mr-2" />
                Criar Novo Cliente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
