// server/api/di/postinvoicedata.post.ts
export default defineEventHandler(async (event) => {
    await readBody(event)
    return { statusCode: '00', invoiceNumber: 'DI-POC-' + Date.now(), postingDate: new Date().toISOString() }
})
