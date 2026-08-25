export async function sendWhatsAppMock(to: string, message: string): Promise<void> {
  console.log('\n📱 [WHATSAPP MOCK]')
  console.log(`Para: ${to}`)
  console.log(`Mensagem:\n${message}`)
  console.log('─'.repeat(50))
}
