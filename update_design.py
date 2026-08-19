import re

def run():
    with open('src/pages/LandingPage.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # The new precos section
    new_precos = """      {/* Preços em Direto (Minimalista) */}
      <section id="precos" style={{ padding: 'var(--space-8) 5%', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 12px rgba(16, 185, 129, 0.8)' }}></div>
             <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Cotação em Direto</span>
          </div>

          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Fuel size={14} /> Gasóleo Simples</span>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasoleo}€</span>
            </div>
            
            <div style={{ width: '1px', height: '40px', background: '#e5e7eb' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Fuel size={14} /> Gasolina 95</span>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasolina}€</span>
            </div>

            <div style={{ width: '1px', height: '40px', background: '#e5e7eb' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Flame size={14} /> Gás (Galp, Rubis, Cepsa)</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                 <span style={{ fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>Desde</span>
                 <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.05em', lineHeight: '1' }}>30.00€</span>
              </div>
            </div>
          </div>
          
        </div>
      </section>

"""

    # 1. Remove the old precos section.
    # It starts at "{/* Preços em Direto (Painel Digital) */}" and ends before "{/* Marcações e Mapa */}"
    start_old = content.find('      {/* Preços em Direto (Painel Digital) */}')
    end_old = content.find('      {/* Marcações e Mapa */}')
    
    if start_old != -1 and end_old != -1:
        # Cut it out
        content = content[:start_old] + content[end_old:]
        
    # 2. Insert the new precos section right before servicos.
    start_servicos = content.find('      {/* Serviços Animados - Opção B */}')
    
    if start_servicos != -1:
        content = content[:start_servicos] + new_precos + content[start_servicos:]

    with open('src/pages/LandingPage.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    run()
