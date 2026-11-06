export const products = [
  { id: '5g-5', size: '5g', pack: 5, image: '/images/pack-5g-5.jpg' },
  { id: '5g-10', size: '5g', pack: 10, image: '/images/pack-5g-10.jpg' },
  { id: '5g-20', size: '5g', pack: 20, image: '/images/pack-5g-20.jpg' },
  { id: '5g-50', size: '5g', pack: 50, image: '/images/hero-honey-pack.jpg' },
  { id: '10g-5', size: '10g', pack: 5, image: '/images/pack-10g-5.jpg' },
  { id: '10g-10', size: '10g', pack: 10, image: '/images/pack-10g-10.jpg' },
  { id: '10g-20', size: '10g', pack: 20, image: '/images/pack-10g-20.jpg' },
  { id: '10g-50', size: '10g', pack: 50, image: '/images/pack-10g-50.png' },
]

export const weight = (product) => Number.parseInt(product.size, 10) * product.pack

export function restoreCart(storage) {
  try {
    const saved = JSON.parse(storage.getItem('norvax-cart-v1') || '[]')
    if (!Array.isArray(saved)) return []
    const merged = new Map()
    for (const item of saved) {
      if (item && products.some((product) => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) {
        merged.set(item.id, Math.min(99, (merged.get(item.id) || 0) + item.quantity))
      }
    }
    return [...merged].map(([id, quantity]) => ({ id, quantity }))
  } catch { return [] }
}

export function addItem(cart, id, quantity = 1) {
  if (!products.some((product) => product.id === id)) return cart
  const amount = Math.min(99, Math.max(1, Math.floor(Number(quantity) || 1)))
  return cart.some((item) => item.id === id)
    ? cart.map((item) => item.id === id ? { ...item, quantity: Math.min(99, item.quantity + amount) } : item)
    : [...cart, { id, quantity: amount }]
}

export function orderSummary(cart) {
  return cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id)
    return `${item.quantity} × ${product.size} honey sticks, pack of ${product.pack} (${weight(product)}g per pack)`
  }).join('\n')
}
