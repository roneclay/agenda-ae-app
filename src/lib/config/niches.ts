export type ReminderTone = 'informal' | 'formal' | 'affectionate'
export type NicheId = 'beauty' | 'legal' | 'petcare' | 'fitness'

export type NicheConfig = {
  niche: NicheId
  primaryColor: string
  appointmentNoun: string
  professionalNoun: string
  customerNoun: string
  subjectNoun?: string
  noShowSlang: string
  fullAgendaSlang: string
  reminderTone: ReminderTone
  whatsappGreeting: string
  proPriceCents: number
  defaultServices: Array<{
    name: string
    durationMinutes: number
    priceCents: number
  }>
}

export const NICHES: Record<NicheId, NicheConfig> = {
  beauty: {
    niche: 'beauty',
    primaryColor: '#C85C30',
    appointmentNoun: 'atendimento',
    professionalNoun: 'profissional',
    customerNoun: 'cliente',
    noShowSlang: 'deu um chumbo',
    fullAgendaSlang: 'agenda travada',
    reminderTone: 'informal',
    whatsappGreeting: 'Oi! 😊 Sou a assistente de {name}. Posso ajudar com agendamentos!',
    proPriceCents: 4900,
    defaultServices: [{ name: 'Atendimento', durationMinutes: 60, priceCents: 8000 }],
  },
  legal: {
    niche: 'legal',
    primaryColor: '#1A3A5C',
    appointmentNoun: 'consulta',
    professionalNoun: 'advogado',
    customerNoun: 'cliente',
    subjectNoun: 'processo',
    noShowSlang: 'faltou sem avisar',
    fullAgendaSlang: 'agenda cheia',
    reminderTone: 'formal',
    whatsappGreeting: 'Olá! Sou o assistente do(a) {name}. Como posso ajudá-lo(a)?',
    proPriceCents: 9700,
    defaultServices: [{ name: 'Consulta inicial', durationMinutes: 60, priceCents: 0 }],
  },
  petcare: {
    niche: 'petcare',
    primaryColor: '#2E7D52',
    appointmentNoun: 'sessão',
    professionalNoun: 'profissional',
    customerNoun: 'tutor',
    subjectNoun: 'pet',
    noShowSlang: 'não compareceu',
    fullAgendaSlang: 'agenda lotada',
    reminderTone: 'affectionate',
    whatsappGreeting: 'Olá! 🐾 Sou a assistente de {name}. Posso ajudar a agendar para seu pet!',
    proPriceCents: 7900,
    defaultServices: [{ name: 'Banho e tosa', durationMinutes: 90, priceCents: 8000 }],
  },
  fitness: {
    niche: 'fitness',
    primaryColor: '#7B2D8B',
    appointmentNoun: 'treino',
    professionalNoun: 'personal',
    customerNoun: 'aluno',
    noShowSlang: 'faltou o treino',
    fullAgendaSlang: 'sem horário disponível',
    reminderTone: 'informal',
    whatsappGreeting: 'Oi! 💪 Sou o assistente de {name}. Bora agendar seu treino?',
    proPriceCents: 4900,
    defaultServices: [{ name: 'Treino personalizado', durationMinutes: 60, priceCents: 10000 }],
  },
}

export function getNicheFromHost(host: string): NicheConfig {
  if (process.env.NODE_ENV === 'development') {
    return NICHES[(process.env.NICHE as NicheId) ?? 'beauty'] ?? NICHES.beauty
  }
  if (host.includes('agendaadv') || host.includes('legal')) return NICHES.legal
  if (host.includes('agendapet') || host.includes('petcare')) return NICHES.petcare
  if (host.includes('agendafit') || host.includes('fitness')) return NICHES.fitness
  return NICHES.beauty
}
