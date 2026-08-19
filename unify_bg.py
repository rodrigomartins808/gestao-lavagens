import re

with open('src/pages/LandingPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. ROOT wrapper: off-white background ────────────────────────────────────
content = content.replace(
    "style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#333333' }}",
    "style={{ minHeight: '100vh', backgroundColor: '#f7f5f2', color: '#1a1a1a' }}"
)

# ── 2. HEADER: off-white + grain consistency ─────────────────────────────────
content = content.replace(
    "padding: 'var(--space-4) 5%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'",
    "padding: 'var(--space-4) 5%', backgroundColor: '#f7f5f2', boxShadow: '0 1px 0 rgba(0,0,0,0.08)'"
)

# ── 3. FUEL SECTION: match the off-white page ─────────────────────────────────
content = content.replace(
    "padding: 'var(--space-8) 5%', backgroundColor: 'white' }}",
    "padding: 'var(--space-10) 5%', backgroundColor: '#f7f5f2', borderBottom: '1px solid rgba(0,0,0,0.07)' }}"
)
# fuel dividers and prices: use darker text for off-white bg
content = content.replace(
    "color: '#9ca3af', letterSpacing: '0.1em'",
    "color: '#78716c', letterSpacing: '0.1em'"
)
content = content.replace(
    "color: '#111827', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasoleo}",
    "color: '#1c1917', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasoleo}"
)
content = content.replace(
    "color: '#111827', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasolina}",
    "color: '#1c1917', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasolina}"
)
content = content.replace(
    "color: '#111827', letterSpacing: '-0.05em', lineHeight: '1' }}>30.00€",
    "color: '#1c1917', letterSpacing: '-0.05em', lineHeight: '1' }}>30.00€"
)
content = content.replace(
    "color: '#6b7280' }}>Desde",
    "color: '#78716c' }}>Desde"
)
content = content.replace(
    "background: '#e5e7eb' }}></div>",
    "background: 'rgba(0,0,0,0.12)' }}></div>"
)
# fuel labels
content = content.replace(
    "color: '#9ca3af', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Fuel",
    "color: '#78716c', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Fuel"
)
content = content.replace(
    "color: '#9ca3af', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Flame",
    "color: '#78716c', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Flame"
)

# ── 4. SERVICES section: keep dark, but remove the harsh borderTop ────────────
content = content.replace(
    "backgroundColor: '#111827', position: 'relative', padding: 'var(--space-24) 5%', overflow: 'hidden'",
    "backgroundColor: '#111827', position: 'relative', padding: 'var(--space-24) 5%', overflow: 'hidden'"
)

# ── 5. BOOKING section: off-white base, form card elevated ────────────────────
content = content.replace(
    "padding: 'var(--space-24) 5%', background: '#f9fafb', borderTop: '1px solid #e5e7eb'",
    "padding: 'var(--space-24) 5%', background: '#f7f5f2'"
)
content = content.replace(
    "background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'",
    "background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9)'"
)
content = content.replace(
    "color: '#111827' }}>Agendar Serviço",
    "color: '#111827' }}>Agendar Serviço"
)

# ── 6. SOBRE NÓS section: off-white ──────────────────────────────────────────
content = content.replace(
    "padding: 'var(--space-24) 5%', backgroundColor: '#f9fafb'",
    "padding: 'var(--space-24) 5%', backgroundColor: '#f7f5f2'"
)

# ── 7. MAP container: blend into off-white ───────────────────────────────────
content = content.replace(
    "border: '1px solid #e5e7eb', background: '#e5e7eb'",
    "border: '1px solid rgba(0,0,0,0.1)', background: '#e8e4df'"
)

with open('src/pages/LandingPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
