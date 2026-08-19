import re

def update_landing_page():
    with open('src/pages/LandingPage.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Split content into parts to swap sections
    marker_servicos = '      {/* Serviços Animados - Opção B */}\n'
    marker_precos = '      {/* Preços em Direto (Painel Digital) */}\n'
    marker_marcacoes = '      {/* Marcações e Mapa */}\n'

    part_a = content.split(marker_servicos)[0]
    rest_1 = marker_servicos + content.split(marker_servicos)[1]
    
    part_servicos = rest_1.split(marker_precos)[0]
    rest_2 = marker_precos + rest_1.split(marker_precos)[1]
    
    part_precos = rest_2.split(marker_marcacoes)[0]
    part_marcacoes = marker_marcacoes + rest_2.split(marker_marcacoes)[1]

    # Swap precos and servicos
    new_content = part_a + part_precos + part_servicos + part_marcacoes

    # 2. Update styles in precos
    # Padding of the section
    new_content = new_content.replace(
        "padding: 'var(--space-12) 5%'", 
        "padding: 'var(--space-24) 5%'"
    )
    # Grid size
    new_content = new_content.replace(
        "minmax(280px, 1fr)", 
        "minmax(200px, 1fr)"
    )
    # Card paddings
    new_content = new_content.replace(
        "padding: 'var(--space-6)'", 
        "padding: 'var(--space-5)'"
    )
    # Font sizes
    new_content = new_content.replace(
        "fontSize: '3.5rem'", 
        "fontSize: '2.5rem'"
    )
    new_content = new_content.replace(
        "fontSize: '2.5rem'", 
        "fontSize: '2rem'" # This will apply to gas price
    )

    # 3. Increase negative space globally
    new_content = new_content.replace(
        "paddingTop: 'var(--space-32)', paddingBottom: 'var(--space-24)'",
        "paddingTop: 'var(--space-40)', paddingBottom: 'var(--space-32)'"
    )
    new_content = new_content.replace(
        "padding: 'var(--space-24) 5%'",
        "padding: 'var(--space-32) 5%'"
    )
    new_content = new_content.replace(
        "gap: '10rem'",
        "gap: '12rem'"
    )
    new_content = new_content.replace(
        "marginBottom: '6rem'",
        "marginBottom: '8rem'"
    )
    new_content = new_content.replace(
        "marginBottom: 'var(--space-16)'",
        "marginBottom: 'var(--space-24)'" # Gap below hero text
    )

    with open('src/pages/LandingPage.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)

if __name__ == '__main__':
    update_landing_page()
