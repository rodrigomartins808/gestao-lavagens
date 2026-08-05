/**
 * WhatsApp message generation service
 */

export const generateWelcomeMessage = (customer) => {
  const lines = [
    'Olá ' + customer.nome + '! 🚗✨',
    '',
    'Bem-vindo(a) ao Posto Gestão!',
    'O seu cartão de cliente digital já está ativo.',
    '',
    '👤 N.º Cliente: *' + customer.numero_cliente + '*',
    '🔑 Senha: *' + customer.telemovel + '*',
    '',
    'Aceda ao seu portal aqui: https://postogestao.app/login',
    '',
    'Obrigado pela preferência! 💧'
  ];
  return encodeURIComponent(lines.join('\n'));
};

export const generateCarReadyMessage = (customer, vehicle) => {
  const vehicleName = vehicle
    ? ' o seu ' + vehicle.marca + ' ' + vehicle.modelo + ' (' + vehicle.matricula + ')'
    : ' o seu veículo';
  const lines = [
    'Olá ' + customer.nome + '! 🚘✨',
    '',
    'Informamos que' + vehicleName + ' já está lavado e pronto a ser levantado no nosso posto.',
    '',
    'Obrigado pela preferência e até breve! 💧'
  ];
  return encodeURIComponent(lines.join('\n'));
};

export const generateInactivityMessage = (customer, discountPercent) => {
  const lines = [
    'Olá ' + customer.nome + '! Sentimos a sua falta no Posto Gestão 🥺',
    '',
    'Para que o seu carro volte a brilhar, temos um desconto especial de *' + discountPercent + '%* na sua próxima lavagem!',
    '',
    'Mostre esta mensagem no posto para usufruir. Válido por 7 dias. 🚗✨'
  ];
  return encodeURIComponent(lines.join('\n'));
};

export const generateCampaignMessage = (customer, campaignText) => {
  const lines = [
    'Olá ' + customer.nome + '! 🎉',
    '',
    campaignText,
    '',
    'Visite-nos brevemente! 🚗✨'
  ];
  return encodeURIComponent(lines.join('\n'));
};

export const generateFreeWashMessage = (customer) => {
  const lines = [
    'Parabéns ' + customer.nome + '! 🥳🎉',
    '',
    'Acabou de completar 10 carimbos no seu cartão digital!',
    'A sua PRÓXIMA lavagem será totalmente GRÁTIS! 🎁🚘',
    '',
    'Venha reclamar a sua oferta no Posto Gestão. Até já! 💧'
  ];
  return encodeURIComponent(lines.join('\n'));
};

export const openWhatsApp = (phone, encodedMessage) => {
  let cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
    cleanPhone = '351' + cleanPhone;
  }

  const url = 'https://wa.me/' + cleanPhone + '?text=' + encodedMessage;
  window.open(url, '_blank');
};

export const generateAlmostThereMessage = (customer) => {
  const lines = [
    'Olá ' + customer.nome + '! 🎯',
    '',
    'Já não nos visita há algum tempo.',
    'Sabia que falta apenas 1 lavagem para ganhar a sua lavagem exterior 100% gratuita?',
    '',
    'Venha visitar-nos esta semana e aproveite! 🚗✨'
  ];
  return encodeURIComponent(lines.join('\n'));
};

export const generateMissYourCarMessage = (customer, vehicle) => {
  const vehicleName = vehicle
    ? ' o seu ' + vehicle.marca
    : ' o seu carro';
  const lines = [
    'Olá ' + customer.nome + ', já temos saudades suas! 👋',
    '',
    'E apostamos que' + vehicleName + ' também tem saudades de brilhar.',
    'Passe pelo Posto Lavagem e dê-lhe o banho que ele merece! 💦',
    '',
    'Até breve! 🚗✨'
  ];
  return encodeURIComponent(lines.join('\n'));
};

export const generateVIPReactivationMessage = (customer) => {
  const lines = [
    'Olá ' + customer.nome + '! 🎁',
    '',
    'Faz muito tempo que não o vemos no Posto Lavagem.',
    'Temos uma oferta especial para si: se nos visitar nos próximos 7 dias, oferecemos-lhe 1 carimbo extra de oferta no seu cartão!',
    '',
    'Mostre esta mensagem no posto. Esperamos por si! 🚗✨'
  ];
  return encodeURIComponent(lines.join('\n'));
};

export default {
  generateWelcomeMessage,
  generateCarReadyMessage,
  generateInactivityMessage,
  generateCampaignMessage,
  generateFreeWashMessage,
  generateAlmostThereMessage,
  generateMissYourCarMessage,
  generateVIPReactivationMessage,
  openWhatsApp
};
