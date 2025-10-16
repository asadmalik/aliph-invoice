// server/api/di/postinvoicedata.post.ts
export default defineEventHandler(async (event) => {
    await readBody(event)
    return { statusCode: '00', FbrInvoiceNumber: 'DI-POC-' + Date.now(), postingDate: new Date().toISOString() }
})
