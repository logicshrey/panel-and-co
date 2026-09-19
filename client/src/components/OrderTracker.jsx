const STATUS_INDEX = { pending: 0, paid: 1, shipped: 2, delivered: 3 }

function OrderTracker({ status, paymentMethod }) {
  if (status === 'cancelled') return <div className="mt-5 border border-red-800 bg-red-950/30 p-3 text-sm text-red-300">This order has been cancelled.</div>
  const currentIndex = STATUS_INDEX[status] ?? 0
  const steps = ['Pending', paymentMethod === 'COD' ? 'Confirmed' : 'Paid', 'Shipped', 'Delivered']
  return <ol className="mt-6 grid gap-3 sm:grid-cols-4" aria-label="Order tracking">{steps.map((step, index) => { const complete = index < currentIndex; const current = index === currentIndex; return <li key={step} className="flex items-center gap-2 sm:flex-col sm:items-start"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${complete ? 'border-brand-accent bg-brand-accent text-ink-950' : current ? 'border-brand-accent text-brand-accent' : 'border-ink-800 text-ink-100/40'}`}>{complete ? '✓' : index + 1}</span><span className={current ? 'font-semibold text-ink-100' : complete ? 'text-ink-100/80' : 'text-ink-100/45'}>{step}</span></li> })}</ol>
}

export default OrderTracker
