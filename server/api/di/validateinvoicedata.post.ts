// server/api/di/validateinvoicedata.post.ts
export default defineEventHandler(async (event) => {
    await readBody(event)                      // ignore payload for mock
    return { statusCode: '00', validationReferenceNo: 'VAL-' + Math.random().toString(36).slice(2, 8) }
})
