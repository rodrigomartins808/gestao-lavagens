import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Droplets, Wrench, Calendar, MapPin, ChevronRight, ChevronLeft, User, Flame, Phone, Clock, CheckCircle2 } from 'lucide-react';
import dataService from '../services/dataService';
import logo from '../assets/logo.jpeg';
import logoWhite from '../assets/logo-white.png';

// -- Add ServiceBlock above LandingPage --
const ServiceBlock = ({ service, index }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % service.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + service.images.length) % service.images.length);
  };

  return (
    <div 
      className="reveal-on-scroll service-block-container"
      style={{ 
        display: 'flex', 
        flexDirection: 'row', // Default will be row, we will handle responsive in CSS
        gap: '4rem',
        alignItems: 'center'
      }}
    >
      {/* Texto */}
      <div style={{ flex: 1, order: index % 2 === 0 ? 1 : 2 }} className="service-text-col">
        {/* Icone removido a pedido do utilizador */}
        <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: 'var(--space-4)', color: '#111827', lineHeight: '1.2' }}>
          {service.title}
        </h3>
        <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '1.125rem', marginBottom: 'var(--space-6)' }}>
          {service.description}
        </p>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {service.items.map(item => (
            <li key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', background: 'white', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <CheckCircle2 size={22} color="var(--accent-red)" style={{ marginRight: '0.75rem', flexShrink: 0 }} /> 
                <span style={{ fontWeight: '700', color: '#111827', fontSize: '1.1rem' }}>{item.name}</span>
                <span style={{ color: 'var(--accent-red)', fontWeight: '800', marginLeft: 'auto', fontSize: '1.1rem', whiteSpace: 'nowrap', paddingLeft: '1rem' }}>{item.price}</span>
              </div>
              {item.desc && (
                <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0.15rem 0 0 2rem', lineHeight: '1.4' }}>{item.desc}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Imagens Slider */}
      <div style={{ flex: 1, position: 'relative', height: '450px', width: '100%', order: index % 2 === 0 ? 2 : 1 }} className="service-img-col">
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)', border: '1px solid rgba(0,0,0,0.08)', background: '#e8e4df' }}>
          {service.images.map((img, i) => (
            <img 
              key={img}
              src={img} 
              alt={`${service.title} imagem ${i+1}`}
              style={{ 
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', 
                opacity: i === currentImage ? 1 : 0, transition: 'opacity 0.6s ease-in-out' 
              }}
            />
          ))}
          
          {service.images.length > 1 && (
            <>
              <button onClick={prevImage} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextImage} style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}>
                <ChevronRight size={24} />
              </button>
              
              {/* Dots */}
              <div style={{ position: 'absolute', bottom: '1rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 20 }}>
                {service.images.map((_, i) => (
                  <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === currentImage ? 'var(--accent-red)' : 'rgba(255,255,255,0.5)', transition: 'background 0.3s ease' }} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [fuelPrices, setFuelPrices] = useState({ gasoleo: '1.49', gasolina: '1.69', gas: '0.89' });
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [bookingForm, setBookingForm] = useState({
    nome: '',
    telemovel: '',
    matricula: '',
    servico: 'Lavagem Completa',
    data_desejada: minDate,
    hora_chegada: '08:00',
    hora_levantamento: '12:00'
  });

  // Helpers para Dropdowns Personalizados
  const [activeServiceId, setActiveServiceId] = useState('lavagem');

  // Dados dos serviços
  const servicesData = [
    {
      id: 'lavagem',
      icon: <Droplets size={28} />,
      title: 'Lavagem Automóvel',
      description: 'Cuidamos do seu carro ao pormenor. Desde uma lavagem simples com produtos de alta qualidade, até à limpeza profunda de interiores.',
      items: [
        { name: 'Lavagem Simples', desc: 'Lavagem exterior e secagem', price: '8.50€' },
        { name: 'Lavagem Interior', desc: 'Aspiração e limpeza completa do interior', price: '9.50€' },
        { name: 'Lavagem Completa', desc: 'Lavagem exterior, aspiração e limpeza de vidros', price: '15.00€' }
      ],
      images: [
        'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 'mecanica',
      icon: <Wrench size={28} />,
      title: 'Mecânica Rápida',
      description: 'Mudança de óleo, travões e pequenos arranjos mecânicos feitos com precisão pela nossa equipa.',
      items: [
        { name: 'Serviços simples de mecânica', price: 'Sob consulta presencial' }
      ],
      images: [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1632823462947-a87754d9c792?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 'especiais',
      icon: <Clock size={28} />,
      title: 'Serviços Especiais',
      description: 'Polimentos, higienização a ozono, limpeza profunda de estofos e tratamento de peles para devolver o aspeto de novo.',
      items: [
        { name: 'Lavagem de estofos (c/ lavagem completa)', price: '75.00€' },
        { name: 'Revitalização de plásticos (internos e externos)', price: '25.00€' },
        { name: 'Higienização a Ozono', price: '20.00€' },
        { name: 'Remoção de bolor', price: '10.00€' },
        { name: 'Remoção calcário dos vidros', price: '22.50€' }
      ],
      images: [
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [servicesData]);

  const dateOptions = [];
  const today = new Date();
  const daysPT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthsPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const label = i === 1 ? `Amanhã (${d.getDate()} ${monthsPT[d.getMonth()]})` : `${daysPT[d.getDay()]}, ${d.getDate()} ${monthsPT[d.getMonth()]}`;
    dateOptions.push({ value: dateStr, label });
  }

  const chegadaOptions = [];
  for (let h = 8; h <= 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 19 && m > 30) continue;
      chegadaOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  const levantamentoOptions = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 8 && m === 0) continue; // começa às 08:30
      if (h === 20 && m > 30) continue;
      levantamentoOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  const [bookingStatus, setBookingStatus] = useState('');
  const [dayBookings, setDayBookings] = useState([]);

  useEffect(() => {
    if (!bookingForm.data_desejada) return;
    dataService.getBookingsByDate(bookingForm.data_desejada).then(data => {
      setDayBookings(data);
    }).catch(e => console.error("Erro a carregar vagas:", e));
  }, [bookingForm.data_desejada]);

  const getServicePoints = (servico) => {
    if (!servico) return 30;
    if (servico.includes('Simples')) return 20; // max 3 por 30m
    if (servico.includes('Completa') || servico.includes('Especiais') || servico.includes('Mecânica')) return 30; // max 2 por 30m
    return 10; // Gás
  };
  const MAX_POINTS = 60;

  useEffect(() => {
    const pointsInSlot = dayBookings.filter(b => b.hora_chegada === bookingForm.hora_chegada).reduce((sum, b) => sum + getServicePoints(b.servico), 0);
    if (pointsInSlot + getServicePoints(bookingForm.servico) > MAX_POINTS) {
      const firstAvailable = chegadaOptions.find(t => {
        const pts = dayBookings.filter(b => b.hora_chegada === t).reduce((sum, b) => sum + getServicePoints(b.servico), 0);
        return pts + getServicePoints(bookingForm.servico) <= MAX_POINTS;
      });
      if (firstAvailable) {
        setBookingForm(prev => ({...prev, hora_chegada: firstAvailable}));
      }
    }
  }, [dayBookings, bookingForm.servico, bookingForm.hora_chegada]);

  // The tomorrow and minDate variables are now defined at the top

  useEffect(() => {
    async function loadPrices() {
      try {
        const prices = await dataService.getFuelPrices();
        setFuelPrices(prices);
      } catch (err) {
        console.error("Erro a carregar preços", err);
      }
    }
    loadPrices();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validar capacidade no momento do submit
    const pts = dayBookings.filter(b => b.hora_chegada === bookingForm.hora_chegada).reduce((sum, b) => sum + getServicePoints(b.servico), 0);
    if (pts + getServicePoints(bookingForm.servico) > MAX_POINTS) {
      alert("Lamentamos, mas essa hora de chegada acabou de esgotar. Por favor selecione outra.");
      return;
    }

    setBookingStatus('submitting');
    try {
      const formToSubmit = {
        ...bookingForm,
        matricula: bookingForm.matricula.replace(/\s+/g, '').toUpperCase(),
        periodo: `${bookingForm.hora_chegada} às ${bookingForm.hora_levantamento}`
      };
      // remover campos extra antes de enviar, caso o addBooking passe tudo pro DB
      delete formToSubmit.hora_chegada;
      delete formToSubmit.hora_levantamento;

      await dataService.addBooking(formToSubmit);
      setBookingStatus('success');
      setBookingForm({
        nome: '',
        telemovel: '',
        matricula: '',
        servico: 'Lavagem Completa',
        data_desejada: minDate,
        hora_chegada: '08:00',
        hora_levantamento: '12:00'
      });
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: '#f7f5f2', color: '#1a1a1a' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) 5%', backgroundColor: '#f7f5f2', boxShadow: '0 1px 0 rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={logo} 
            alt="GarageM Logo" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ height: '60px', cursor: 'pointer', mixBlendMode: 'multiply' }} 
          />
        </div>
        
        <nav style={{ display: 'flex', gap: '2rem', fontWeight: '600', color: '#4b5563', fontSize: '1.05rem' }}>
          <button onClick={() => document.getElementById('servicos').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', color: '#4b5563', fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'} onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>Serviços</button>
          <button onClick={() => document.getElementById('precos').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', color: '#4b5563', fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'} onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>Combustível</button>
          <button onClick={() => document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', color: '#4b5563', fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'} onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>Marcações</button>
          <button onClick={() => document.getElementById('sobre').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', color: '#4b5563', fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'} onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>Sobre Nós</button>
        </nav>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'var(--accent-red)', color: 'white', padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '1.05rem', border: 'none', cursor: 'pointer', textAlign: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#dc2626'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-red)'}>
            Agendar Lavagem
          </button>
          <button 
            onClick={() => navigate('/cartao')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#111827', border: '2px solid #e5e7eb', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#111827'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
          >
            <User size={18} />
            Área de Cliente
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
          position: 'relative',
          paddingTop: 'var(--space-32)', 
          paddingBottom: 'var(--space-24)', 
          paddingLeft: '5%', 
          paddingRight: '5%', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          overflow: 'hidden'
      }}>
        {/* Background Layer with Dark Overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: -1,
          backgroundImage: 'url("https://images.unsplash.com/photo-1544256718-3bcf237f3974?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}></div>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'rgba(17, 24, 39, 0.85)' }}></div>

        <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: '800', marginBottom: 'var(--space-4)', lineHeight: '1.1', maxWidth: '900px', letterSpacing: '-0.02em' }}>
          Desde sempre no centro de Famalicão, <span style={{ color: 'var(--accent-red)' }}>sempre ao seu lado.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#d1d5db', maxWidth: '650px', marginBottom: 'var(--space-8)', lineHeight: '1.6' }}>
          Combustível, mecânica rápida e a melhor lavagem automóvel da cidade. Onde a confiança tem nome próprio.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-16)' }}>
          <button onClick={() => document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'var(--accent-red)', color: 'white', padding: '1rem 2.5rem', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '1.125rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Agendar Lavagem <ChevronRight size={20} />
          </button>
        </div>

        {/* Hero Image Placeholder (New Facade) */}
        <div style={{ width: '100%', maxWidth: '1000px', aspectRatio: '16/9', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
          <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" alt="Fachada Atual GarageM" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
            <p style={{ margin: 0, color: 'white', fontWeight: '500', fontSize: '1.1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>A nossa fachada atual — sempre prontos para o receber.</p>
          </div>
        </div>
      </section>

      {/* Preços em Direto (Minimalista) */}
      <section id="precos" style={{ padding: 'var(--space-10) 5%', backgroundColor: '#f7f5f2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 12px rgba(16, 185, 129, 0.8)' }}></div>
             <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Cotação em Direto</span>
          </div>

          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#78716c', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Fuel size={14} /> Gasóleo Simples</span>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1c1917', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasoleo}€</span>
            </div>
            
            <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.12)' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#78716c', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Fuel size={14} /> Gasolina 95</span>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1c1917', letterSpacing: '-0.05em', lineHeight: '1' }}>{fuelPrices.gasolina}€</span>
            </div>

            <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.12)' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#78716c', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Flame size={14} /> Gás (Galp, Rubis, Cepsa)</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                 <span style={{ fontSize: '1rem', fontWeight: '600', color: '#78716c' }}>Desde</span>
                 <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1c1917', letterSpacing: '-0.05em', lineHeight: '1' }}>30.00€</span>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Serviços Animados */}
      <section id="servicos" style={{ backgroundColor: '#f7f5f2', position: 'relative', padding: 'var(--space-24) 5%', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '6rem' }} className="reveal-on-scroll">
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#111827', margin: 0, lineHeight: '1.1' }}>Os nossos serviços</h2>
            <p style={{ color: '#6b7280', fontSize: '1.25rem', marginTop: '0.25rem' }}>O que temos ao seu dispor todos os dias</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10rem' }}>
            {servicesData.map((service, index) => (
              <ServiceBlock key={service.id} service={service} index={index} />
            ))}
          </div>

        </div>
      </section>

      {/* Marcações e Mapa */}
      <section id="agendar" className="section-dots" style={{ padding: 'var(--space-24) 5%', background: '#f7f5f2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-16)' }}>
          
          {/* Form */}
          <div style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9)' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: 'var(--space-2)', color: '#111827' }}>Agendar Serviço</h3>
            <p style={{ color: '#4b5563', marginBottom: 'var(--space-8)', lineHeight: '1.6' }}>Preencha o formulário e garantimos o seu lugar. Entraremos em contacto para confirmar.</p>
            
            {bookingStatus === 'success' ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#065f46', padding: '2rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Calendar size={48} style={{ margin: '0 auto 1rem', color: '#10b981' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Pedido Enviado!</h4>
                <p>Recebemos o seu pedido com sucesso. Iremos entrar em contacto brevemente.</p>
                <button onClick={() => setBookingStatus('')} style={{ marginTop: '1.5rem', background: 'white', color: '#065f46', border: '1px solid #10b981', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Fazer outro pedido</button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Nome *</label>
                    <input type="text" required value={bookingForm.nome} onChange={e => setBookingForm({...bookingForm, nome: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Telemóvel *</label>
                    <input type="tel" required value={bookingForm.telemovel} onChange={e => setBookingForm({...bookingForm, telemovel: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Matrícula *</label>
                    <input type="text" placeholder="XX-XX-XX" required value={bookingForm.matricula} onChange={e => setBookingForm({...bookingForm, matricula: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%', textTransform: 'uppercase' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Serviço *</label>
                    <select value={bookingForm.servico} onChange={e => setBookingForm({...bookingForm, servico: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', background: 'white', transition: 'border-color 0.2s', width: '100%', appearance: 'none' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'}>
                      <option>Lavagem Simples</option>
                      <option>Lavagem Completa</option>
                      <option>Serviços Especiais</option>
                      <option>Mecânica Rápida</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Data *</label>
                    <select required value={bookingForm.data_desejada} onChange={e => setBookingForm({...bookingForm, data_desejada: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27%239ca3af%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/></svg>") no-repeat right 0.75rem center/1.25rem white' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'}>
                      {dateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Chegada *</label>
                    <select required value={bookingForm.hora_chegada} onChange={e => setBookingForm({...bookingForm, hora_chegada: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27%239ca3af%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/></svg>") no-repeat right 0.75rem center/1.25rem white' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'}>
                      {chegadaOptions.map(t => {
                        const pts = dayBookings.filter(b => b.hora_chegada === t).reduce((sum, b) => sum + getServicePoints(b.servico), 0);
                        const available = pts + getServicePoints(bookingForm.servico) <= MAX_POINTS;
                        return (
                          <option key={t} value={t} disabled={!available}>
                            {t} {!available ? '(Esgotado)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Levantamento *</label>
                    <select required value={bookingForm.hora_levantamento} onChange={e => setBookingForm({...bookingForm, hora_levantamento: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27%239ca3af%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/></svg>") no-repeat right 0.75rem center/1.25rem white' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'}>
                      {levantamentoOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 'var(--space-4)' }}>
                  <button type="submit" disabled={bookingStatus === 'submitting'} style={{ background: 'var(--accent-red)', color: 'white', padding: '0.875rem 2rem', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '1rem', border: 'none', cursor: bookingStatus === 'submitting' ? 'wait' : 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#dc2626'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-red)'}>
                    {bookingStatus === 'submitting' ? 'A enviar...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Map & Contacts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827' }}><MapPin size={28} color="var(--accent-red)" /> Onde nos encontrar</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>R. São João de Deus, 4760-114<br/>Vila Nova de Famalicão</p>
            </div>
            <div style={{ width: '100%', height: '100%', minHeight: '300px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', background: '#e8e4df' }}>
              <iframe 
                title="Google Maps Location"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0, minHeight: '300px' }} 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2983.33644033604!2d-8.5222014!3d41.4097486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDI0JzM1LjEiTiA4wrAzMScyMC4wIlc!5e0!3m2!1spt-PT!2spt!4v1620000000000!5m2!1spt-PT!2spt" 
                allowFullScreen>
              </iframe>
            </div>
          </div>

        </div>
      </section>

      {/* Sobre Nós */}
      <section id="sobre" className="section-dots" style={{ padding: 'var(--space-24) 5%', backgroundColor: '#f7f5f2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center' }}>
          <div style={{ paddingRight: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', marginBottom: 'var(--space-6)', lineHeight: '1.1' }}>Mais do que um posto. Uma paragem obrigatória.</h2>
            <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: 'var(--space-4)', lineHeight: '1.7' }}>
              A GarageM não é apenas um local de passagem. O nosso edifício faz parte da história do centro de Famalicão há mais de 25 anos. Passámos por marcas internacionais como a BP e Prio, mas hoje orgulhamo-nos de ser um espaço com identidade própria e independente.
            </p>
            <p style={{ fontSize: '1.125rem', color: '#4b5563', lineHeight: '1.7' }}>
              Aqui, não é apenas mais um número. Conhecemos os nossos clientes pelo nome, sabemos o que o seu carro precisa e fazemos questão de manter essa proximidade humana. É essa confiança que nos mantém aqui todos os dias.
            </p>
          </div>
          <div style={{ position: 'relative', height: '100%', minHeight: '400px', background: '#e5e7eb', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12rem', fontWeight: '900', color: '#f3f4f6', zIndex: 0, userSelect: 'none', whiteSpace: 'nowrap' }}>
              est. 199X
            </div>
            <p style={{ color: '#9ca3af', fontWeight: '600', zIndex: 1, textAlign: 'center', padding: '1rem', border: '2px dashed #d1d5db', borderRadius: 'var(--radius-lg)' }}>
              [Placeholder para Fotografia Histórica / Edifício]
            </p>
          </div>
        </div>
      </section>

      {/* Footer Completo */}
      <footer style={{ background: '#000000', color: '#d1d5db', padding: 'var(--space-16) 5% var(--space-8)', fontSize: '0.95rem', borderTop: '4px solid var(--accent-red)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
          
          <div>
            <img src={logoWhite} alt="GarageM" style={{ height: '32px', marginBottom: 'var(--space-4)' }} />
            <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: 'var(--space-4)', maxWidth: '280px' }}>
              O posto de abastecimento e lavagem automóvel no coração de Famalicão. 
            </p>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Contactos</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} color="#9ca3af"/> R. São João de Deus, 4760-114 V.N. Famalicão</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={18} color="#9ca3af"/> <a href="tel:928220150" style={{ color: '#d1d5db', textDecoration: 'none' }}>928 220 150</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Horário</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#9ca3af' }}>
              <li><strong>Segunda a Sábado:</strong> 07:45 - 21:00</li>
              <li><strong>Domingo e Feriados:</strong> 08:00 - 14:00</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Siga-nos</h4>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#d1d5db'}>Facebook</a>
              <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#d1d5db'}>Instagram</a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #374151', paddingTop: 'var(--space-8)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
          <p>© {new Date().getFullYear()} GarageM. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button onClick={() => navigate('/privacidade')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#6b7280'}>Política de Privacidade</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
