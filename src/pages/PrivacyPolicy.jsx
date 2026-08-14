import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.jpeg';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem', fontWeight: '500' }}
        >
          <ArrowLeft size={20} /> Voltar
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <img src={logo} alt="Garage M" style={{ height: '80px', borderRadius: '12px' }} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '2rem', textAlign: 'center' }}>Política de Privacidade</h1>
        
        <div style={{ color: '#334155', lineHeight: '1.7', fontSize: '1.1rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>A <strong>Garage M</strong> (doravante "nós" ou "o estabelecimento") respeita a sua privacidade e agradece a confiança que deposita em nós. Esta Política de Privacidade explica como recolhemos, usamos, protegemos e tratamos os seus dados pessoais, em estrita conformidade com o Regulamento Geral de Proteção de Dados (RGPD).</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>1. Dados Recolhidos</h2>
          <p style={{ marginBottom: '1rem' }}>Para o correto funcionamento do nosso programa de fidelização (Cartão VIP) e gestão de operações de lavagem, recolhemos os seguintes dados diretamente do cliente:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Nome</strong> (para identificação e personalização do atendimento);</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Número de Telemóvel</strong> (para acesso ao Portal de Cliente, envio de avisos sobre o estado da viatura e envio de comunicações promocionais/ofertas exclusivas);</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Matrícula, Marca, Modelo</strong> (para controlo operacional das lavagens e histórico da viatura);</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Histórico de Presenças</strong> (registo das datas, horas e serviços de lavagem realizados no nosso estabelecimento para atribuição de pontos e lavagens gratuitas).</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>2. Finalidade do Tratamento</h2>
          <p style={{ marginBottom: '1rem' }}>Os dados recolhidos destinam-se exclusivamente a:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}>Criação e gestão da sua Ficha de Cliente e Cartão VIP;</li>
            <li style={{ marginBottom: '0.5rem' }}>Envio de notificações sobre o estado do seu veículo (ex: "Em Lavagem", "Pronto a Levantar") através de SMS ou WhatsApp;</li>
            <li style={{ marginBottom: '0.5rem' }}>Oferta de campanhas de reativação, descontos e avisos relevantes diretamente relacionados com os serviços da Garage M;</li>
            <li style={{ marginBottom: '0.5rem' }}>Melhoria contínua dos nossos serviços através da análise (anónima e agregada) do histórico de presenças.</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>3. Partilha de Dados</h2>
          <p style={{ marginBottom: '1.5rem' }}>A Garage M garante que os seus dados pessoais são para <strong>uso estritamente interno</strong>. Em nenhum momento venderemos, alugaremos ou partilharemos os seus dados com terceiros para fins de marketing externo. Os dados podem apenas ser processados por plataformas parceiras (ex: provedores de servidores ou sistemas de mensagens) estritamente necessárias ao funcionamento tecnológico deste serviço e que cumprem com os requisitos do RGPD.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>4. Segurança dos Dados</h2>
          <p style={{ marginBottom: '1.5rem' }}>Implementámos medidas técnicas e organizativas (como proteção por palavra-passe, acessos restritos da equipa e ligações seguras) para proteger os seus dados pessoais contra a destruição, alteração ou acesso não autorizado.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>5. Os Seus Direitos e Retenção de Dados</h2>
          <p style={{ marginBottom: '1rem' }}>De acordo com o RGPD, o cliente tem o direito de aceder e retificar os seus dados.</p>
          <p style={{ marginBottom: '1rem' }}><strong>Retenção de Dados por Motivos de Segurança:</strong> Para efeitos de segurança, resolução de litígios e proteção jurídica do nosso estabelecimento, os registos de lavagem e dados associados são retidos obrigatoriamente por um período de <strong>6 meses</strong> após a última visita. Findo este período, caso não existam pendências, o cliente poderá solicitar o apagamento total da sua ficha de cliente (Direito ao Esquecimento).</p>
          <p style={{ marginBottom: '1rem' }}>A qualquer momento, o cliente pode <strong>retirar o consentimento</strong> para o envio de campanhas de marketing (como mensagens promocionais de WhatsApp), sem que isso comprometa as lavagens que tenha a decorrer ou o histórico de segurança.</p>
          <p style={{ marginBottom: '1.5rem' }}>Para exercer os seus direitos, poderá contactar a gerência do estabelecimento.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>6. Aceitação</h2>
          <p style={{ marginBottom: '1.5rem' }}>Ao fornecer-nos o seu nome, telemóvel e matrícula no momento do registo ou ao entregar-nos a sua viatura para lavagem e solicitar a criação de ficha, está a concordar de forma expressa e livre com a recolha e tratamento dos seus dados nos moldes descritos nesta política.</p>
        </div>
      </div>
    </div>
  );
}
