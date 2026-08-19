def run():
    with open('src/pages/LandingPage.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Extract the inner content of the precos section (what's inside the div.maxWidth)
    precos_start = content.find('      {/* Preços em Direto (Minimalista) */}')
    precos_end = content.find('\n      {/* Serviços Animados */}')

    precos_block = content[precos_start:precos_end].strip()
    
    # 2. Remove the standalone precos section + surrounding blank lines
    content = content[:precos_start].rstrip() + '\n\n' + content[precos_end:]

    # 3. Insert the fuel bar inside the servicos section, just after the subtitle and before the service blocks
    # We'll insert it between the subtitle paragraph and the service blocks div
    insert_after = "            <p style={{ color: '#6b7280', fontSize: '1.25rem', marginTop: '0.25rem' }}>O que temos ao seu dispor todos os dias</p>\n          </div>"
    
    fuel_insert = """

          {/* Cotação em Direto - Integrada */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 2rem', marginBottom: '6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 12px rgba(16, 185, 129, 0.8)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Cotação em Direto</span>
            </div>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Fuel size={12} /> Gasóleo Simples</span>
                <span style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasoleo}€</span>
              </div>
              <div style={{ width: '1px', height: '36px', background: 'rgba(0,0,0,0.1)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Fuel size={12} /> Gasolina 95</span>
                <span style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasolina}€</span>
              </div>
              <div style={{ width: '1px', height: '36px', background: 'rgba(0,0,0,0.1)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Flame size={12} /> Gás (Galp, Rubis, Cepsa)</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#9ca3af' }}>Desde</span>
                  <span style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.05em', lineHeight: '1' }}>30.00€</span>
                </div>
              </div>
            </div>
          </div>"""

    content = content.replace(insert_after, insert_after + fuel_insert)

    with open('src/pages/LandingPage.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done!")

if __name__ == '__main__':
    run()
