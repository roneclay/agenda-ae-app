export type ReminderTone = 'informal' | 'formal' | 'affectionate'
export type NicheId = 'beauty' | 'legal' | 'petcare' | 'fitness'

export type NichePalette = {
  /** Base brand color (buttons, links, active states) */
  base: string
  /** Hover/pressed state — ~17% darker than base */
  dark: string
  /** Text-on-tint color — ~35% darker than base */
  darker: string
  /** Near-white tint — subtle backgrounds (badges, hero glow) */
  soft: string
  /** Light tint — hover backgrounds, selected states */
  tint50: string
  /** Stronger tint — borders, icon backgrounds */
  tint100: string
}

export type ProfessionalExample = {
  label: string
  emoji: string
}

export type NicheConfig = {
  niche: NicheId
  /** Marca voltada ao cliente final (nav, footer, e-mails, metadata). Cada nicho tem seu domínio e sua marca própria. */
  brandName: string
  /** Caminho do logo em /public, se existir. Nav/Footer caem pro nome em texto se não tiver. */
  logoUrl?: string
  primaryColor: string
  /** Derived from primaryColor (darken/lighten mixes) — see scripts used to generate this file's history */
  palette: NichePalette
  /** Exemplos de profissionais do nicho, usados na home (marketing) — nunca hardcodar isso fora daqui */
  professionalExamples: ProfessionalExample[]
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
    brandName: 'Agendadinho',
    logoUrl: '/logo-agendadinho.png',
    primaryColor: '#C85C30',
    palette: {
      base: '#C85C30',
      dark: '#A64C28',
      darker: '#823C1F',
      soft: '#FDFAF9',
      tint50: '#FCF5F3',
      tint100: '#F5E2DA',
    },
    professionalExamples: [
      { label: 'Cabeleireiro(a)', emoji: '💇' },
      { label: 'Barbeiro(a)', emoji: '💈' },
      { label: 'Manicure', emoji: '💅' },
      { label: 'Esteticista', emoji: '✨' },
    ],
    appointmentNoun: 'atendimento',
    professionalNoun: 'profissional',
    customerNoun: 'cliente',
    noShowSlang: 'deu um chumbo',
    fullAgendaSlang: 'agenda travada',
    reminderTone: 'informal',
    whatsappGreeting: 'Oi! 😊 Sou a assistente de {name}. Posso ajudar com agendamentos!',
    proPriceCents: 2990,
    defaultServices: [{ name: 'Atendimento', durationMinutes: 60, priceCents: 8000 }],
  },
  legal: {
    niche: 'legal',
    // TODO: marca própria ainda não definida — "AgendaAe" é nome interno provisório, não decidido pro público
    brandName: 'AgendaAe',
    primaryColor: '#1A3A5C',
    palette: {
      base: '#1A3A5C',
      dark: '#16304C',
      darker: '#11263C',
      soft: '#F8F9FA',
      tint50: '#F1F3F5',
      tint100: '#D6DCE2',
    },
    professionalExamples: [
      { label: 'Advogado(a)', emoji: '⚖️' },
      { label: 'Consultor(a) jurídico(a)', emoji: '📋' },
      { label: 'Escritório de advocacia', emoji: '🏛️' },
    ],
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
    // TODO: marca própria ainda não definida — "AgendaAe" é nome interno provisório, não decidido pro público
    brandName: 'AgendaAe',
    primaryColor: '#2E7D52',
    palette: {
      base: '#2E7D52',
      dark: '#266844',
      darker: '#1E5135',
      soft: '#F9FBFA',
      tint50: '#F2F7F5',
      tint100: '#D9E8E0',
    },
    professionalExamples: [
      { label: 'Veterinário(a)', emoji: '🐾' },
      { label: 'Pet sitter', emoji: '🐕' },
      { label: 'Adestrador(a)', emoji: '🎾' },
    ],
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
    // TODO: marca própria ainda não definida — "AgendaAe" é nome interno provisório, não decidido pro público
    brandName: 'AgendaAe',
    primaryColor: '#7B2D8B',
    palette: {
      base: '#7B2D8B',
      dark: '#662573',
      darker: '#501D5A',
      soft: '#FBF9FC',
      tint50: '#F7F2F8',
      tint100: '#E7D9EA',
    },
    professionalExamples: [
      { label: 'Personal trainer', emoji: '🏋️' },
      { label: 'Instrutor(a) de yoga', emoji: '🧘' },
      { label: 'Fisioterapeuta', emoji: '🤸' },
    ],
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
