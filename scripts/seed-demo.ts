import { eq } from 'drizzle-orm'
import { db, professional, service, user } from '@/lib/db'

async function main() {
  const DEMO_USER_ID = 'demo-user-id'
  const DEMO_EMAIL = 'demo@agendaae.local'

  const [existingUser] = await db.select().from(user).where(eq(user.id, DEMO_USER_ID)).limit(1)
  if (!existingUser) {
    await db.insert(user).values({
      id: DEMO_USER_ID,
      name: 'Profissional Demo',
      email: DEMO_EMAIL,
      emailVerified: true,
    })
  }

  const [existingPro] = await db
    .select()
    .from(professional)
    .where(eq(professional.slug, 'demo'))
    .limit(1)

  let proId: string
  if (existingPro) {
    proId = existingPro.id
    console.log('Profissional demo já existe:', proId)
  } else {
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)
    const [created] = await db
      .insert(professional)
      .values({
        userId: DEMO_USER_ID,
        name: 'Marina Silva',
        slug: 'demo',
        niche: 'beauty',
        phone: '+5548999999999',
        bio: 'Profissional de unhas e cílios com 8 anos de experiência. Atendo no centro de Floripa.',
        trialEndsAt,
        onboardingCompleted: true,
      })
      .returning({ id: professional.id })
    proId = created.id
    console.log('Profissional demo criado:', proId)
  }

  const existingServices = await db.select().from(service).where(eq(service.professionalId, proId))

  if (existingServices.length === 0) {
    await db.insert(service).values([
      {
        professionalId: proId,
        name: 'Unhas em gel',
        description: 'Aplicação completa, esmaltação e finalização',
        priceCents: 8000,
        durationMinutes: 90,
      },
      {
        professionalId: proId,
        name: 'Manutenção',
        description: 'Manutenção das unhas em gel',
        priceCents: 6000,
        durationMinutes: 60,
      },
      {
        professionalId: proId,
        name: 'Cílios fio a fio',
        priceCents: 18000,
        durationMinutes: 120,
      },
    ])
    console.log('3 serviços criados')
  } else {
    console.log(`${existingServices.length} serviços já existem`)
  }

  console.log('\n✅ Seed concluído. Acesse: http://localhost:3000/agendar/demo')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
