export function mockAgentResponse(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('agendar') || m.includes('marcar') || m.includes('horário'))
    return 'Claro! Qual atendimento você quer agendar? Tenho horários disponíveis essa semana 😊'
  if (m.includes('preço') || m.includes('valor') || m.includes('quanto'))
    return 'Nossos atendimentos:\n• Unhas em gel — R$80 (1h)\n• Manutenção — R$60 (45min)\n\nQual prefere?'
  if (m.includes('disponível') || m.includes('vaga') || m.includes('horário'))
    return 'Tenho horários livres:\n• Amanhã às 10h\n• Amanhã às 14h\n• Quinta às 16h\n\nQual fica melhor?'
  if (m.includes('cancelar') || m.includes('desmarcar'))
    return 'Entendido! Vou cancelar seu agendamento. Quer remarcar para outro horário?'
  if (m.includes('sim') || m.includes('confirmar'))
    return 'Confirmado! ✅ Você receberá um lembrete 24h antes. Até lá!'
  return 'Oi! Posso agendar, remarcar ou cancelar um horário para você. Como posso ajudar? 😊'
}
