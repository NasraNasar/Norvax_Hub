import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { addItem, orderSummary, products, restoreCart, weight } from './catalog'
import './App.css'
import HoneyIllustration from './HoneyIllustration'

const HoneyScene = lazy(() => import('./HoneyScene'))
const email = 'hello@norvaxhub.com'
const faqs = [
  ['What is a honey stick?', 'A convenient, individually sealed portion of honey. Keep a few at home, at your desk or in your bag, ready for a sweeter moment.'],
  ['Which sizes and packs can I choose?', 'Choose a 5g or 10g stick, in packs of 5, 10, 20 or 50. The total honey weight is shown with every option.'],
  ['How do I use it?', 'Open the top of the wrapper, squeeze the honey into your tea, coffee or breakfast, and stir if needed. Dispose of the empty wrapper after use.'],
  ['How should I store my honey sticks?', 'Store in a cool, dry place away from direct sunlight. Keep the wrapper sealed until you are ready to use it. Check your pack for best-before and origin information.'],
  ['Can honey crystallize?', 'Honey can naturally crystallize over time. Contact us if you have a question about your particular pack.'],
  ['How do I order, and where do you deliver?', 'Select your packs and request an order quote. We will confirm pricing, delivery availability and payment arrangements with you before you place an order.'],
  ['Do you offer wholesale?', 'Yes. Tell us about your café, office, event or retail business using the wholesale form below. Include your preferred stick size and estimated quantity.'],
]

function Icon({ type = 'arrow', ...props }) {
  const paths = { arrow: 'M4 12h16m-6-6 6 6-6 6', play: 'm9 5 11 7-11 7V5Z', bag: 'M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2', close: 'm6 6 12 12M6 18 18 6', menu: 'M4 6h16M4 12h16M4 18h16', leaf: 'M19 4C6 2 1 10 7 17S23 14 19 4ZM5 21l11-12', drop: 'M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z', pack: 'm3 7 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 17l9 5 9-5', pause: 'M8 5v14M16 5v14', replay: 'M4 10a8 8 0 1 1 0 5M4 4v6h6' }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[type]} /></svg>
}
function Brand() {
  return <a className="brand" href="#home" aria-label="Norvax Hub home"><img src="/images/norvax-bee-logo.svg" alt="" width="40" height="48" /><span>Norvax <em>Hub</em></span></a>
}
function Scene({ mode, size = '5g', playing, replay = 0 }) {
  const element = useRef(null)
  const [loaded, setLoaded] = useState(mode === 'hero')
  useEffect(() => {
    if (loaded) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setLoaded(true); observer.disconnect() } }, { rootMargin: '250px' })
    observer.observe(element.current)
    return () => observer.disconnect()
  }, [loaded])
  return <div className={`scene scene-${mode}`} ref={element}>
    {loaded && <Suspense fallback={<HoneyIllustration mode={mode} size={size} playing={playing} replay={replay} />}><HoneyScene mode={mode} size={size} playing={playing} replay={replay} /></Suspense>}
  </div>
}
function SizeSwitch({ size, onChange, label = 'Stick size' }) {
  return <div className="size-switch" role="group" aria-label={label}>{['5g', '10g'].map((value) => <button key={value} aria-pressed={size === value} onClick={() => onChange(value)}>{value}<span> per stick</span></button>)}</div>
}
function Modal({ open, onClose, title, children, className = '' }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])
  return <dialog className={`modal ${className}`} ref={dialog} aria-label={title} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="modal-content"><button className="modal-close icon-button" aria-label="Close dialog" onClick={onClose}><Icon type="close" /></button>{children}</div></dialog>
}

export default function App() {
  const [size, setSize] = useState('5g')
  const [cart, setCart] = useState(() => { try { return restoreCart(window.localStorage) } catch { return [] } })
  const [menu, setMenu] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [ritualPlaying, setRitualPlaying] = useState(true)
  const [fillPlaying, setFillPlaying] = useState(true)
  const [ritualReplay, setRitualReplay] = useState(0)
  const [fillReplay, setFillReplay] = useState(0)
  const formRef = useRef(null)
  const totalPacks = cart.reduce((sum, entry) => sum + entry.quantity, 0)
  const totalGrams = cart.reduce((sum, entry) => sum + weight(products.find((item) => item.id === entry.id)) * entry.quantity, 0)

  useEffect(() => { try { localStorage.setItem('norvax-cart-v1', JSON.stringify(cart)) } catch { /* The bag remains usable when storage is unavailable. */ } }, [cart])
  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(() => setMessage(''), 4500)
    return () => clearTimeout(timeout)
  }, [message])
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setMotion(!preference.matches)
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') setMenu(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  function add(productToAdd, count = 1) {
    setCart((current) => addItem(current, productToAdd.id, count))
    setMessage(`${count} × ${productToAdd.size} pack of ${productToAdd.pack} added to your bag.`)
  }
  function selectProduct(value) { setProduct(value); setQuantity(1) }
  function changeQuantity(id, delta) { setCart((current) => current.map((entry) => entry.id === id ? { ...entry, quantity: Math.max(1, Math.min(99, entry.quantity + delta)) } : entry)) }
  function prepareEnquiry(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nBusiness: ${data.get('business') || 'Personal enquiry'}\nPhone: ${data.get('phone') || 'Not supplied'}\nEnquiry: ${data.get('kind')}\nPreferred size: ${data.get('size')}\nEstimated quantity: ${data.get('quantity') || 'To confirm'}\n\n${data.get('message')}\n\n${cart.length ? 'Selected packs:\n' + orderSummary(cart) : ''}`
    setEmailDraft(`mailto:${email}?subject=${encodeURIComponent('Norvax Hub — ' + data.get('kind'))}&body=${encodeURIComponent(body)}`)
  }
  function requestQuote() {
    setCartOpen(false)
    requestAnimationFrame(() => {
      document.getElementById('contact').scrollIntoView({ behavior: motion ? 'smooth' : 'instant' })
      formRef.current?.elements.namedItem('name')?.focus({ preventScroll: true })
    })
  }

  return <div className={`page-shell ${!motion ? 'motion-paused' : ''}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <Brand />
      <nav id="main-navigation" className={menu ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
        {[['Shop', 'shop'], ['How to Use', 'how-it-works'], ['Our Story', 'our-story'], ['Wholesale', 'wholesale']].map(([label, id]) => <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <button className="bag-button" aria-label={`Open shopping bag, ${totalPacks} pack${totalPacks === 1 ? '' : 's'}`} onClick={() => setCartOpen(true)}><Icon type="bag" /><span className="bag-count">{totalPacks}</span></button>
        <button className="icon-button menu-button" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} aria-controls="main-navigation" onClick={() => setMenu(!menu)}><Icon type={menu ? 'close' : 'menu'} /></button>
      </div>
    </header>
    <main id="main">
      <section id="home" className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Nature’s sweetness, simply packed</p>
          <h1>A little honey.<br />A <em>sweeter</em> moment.</h1>
          <p className="hero-description">Your daily sweetness, beautifully portioned.<br className="desktop-break" /> Honey sticks made for wherever life takes you.</p>
          <div className="hero-actions"><a className="button button-dark" href="#shop">Shop honey sticks <Icon /></a><a className="text-button" href="#how-it-works"><span className="play-circle"><Icon type="play" /></span> Watch the ritual</a></div>
          <p className="hero-note">5g &amp; 10g <span>·</span> Individually packed <span>·</span> Easy to carry</p>
        </div>
        <div className="hero-art">
          <div className="hero-halo" /><div className="hero-orbit" />
          <span className="art-caption">SMALL STICK. SWEET POSSIBILITY.</span>
          <Scene mode="hero" size={size} playing={motion} />
          <div className="hero-art-footer"><SizeSwitch size={size} onChange={setSize} label="Preview stick size" /><button className="motion-button" aria-label={motion ? 'Pause all animations' : 'Resume animations'} onClick={() => setMotion(!motion)}><Icon type={motion ? 'pause' : 'play'} /></button></div>
          <span className="scene-note">Animated product illustration</span>
        </div>
      </section>
      <div className="benefit-strip"><span><Icon type="pack" /> Perfectly portioned</span><span><Icon type="bag" /> Ready wherever you are</span><span><Icon type="drop" /> Tear. Squeeze. Enjoy.</span></div>

      <section id="shop" className="section shop">
        <div className="section-top"><div><p className="eyebrow">YOUR EVERYDAY ESSENTIAL</p><h2>Find your kind<br className="mobile-break" /> of <em>sweet.</em></h2></div><div className="shop-selector"><span>Choose your stick size</span><SizeSwitch size={size} onChange={setSize} label="Shop stick size" /></div></div>
        <div className="product-grid">{products.filter((item) => item.size === size).map((item, index) => <article className="product-card" key={item.id}>
          <button className="product-image-button" onClick={() => selectProduct(item)} aria-label={`View ${item.size} pack of ${item.pack}`}><span className="product-number">0{index + 1}</span><img src={item.image} alt={`${item.size} Norvax Hub honey sticks, pack of ${item.pack}`} width="640" height="640" loading="lazy" /><span className="image-link"><Icon /></span></button>
          <div className="product-title"><h3>{item.pack} sticks</h3><span>{weight(item)}g total</span></div>
          <p>{['A little introduction.', 'For your daily ritual.', 'Sweetness to share.', 'Keep everyone stocked.'][index]}</p>
          <div className="product-actions"><button className="choose-button" onClick={() => selectProduct(item)}>Choose pack <Icon /></button><button className="quick-add" aria-label={`Add ${item.size} pack of ${item.pack} to bag`} onClick={() => add(item)}>+</button></div>
        </article>)}</div>
        <div className="shop-footnote"><p>Choose your favourites. We’ll confirm pricing and delivery with your quote.</p><button className="text-button" onClick={() => setCartOpen(true)}>View your bag <Icon type="bag" /></button></div>
      </section>

      <section id="how-it-works" className="ritual">
        <div className="ritual-copy"><p className="eyebrow">A MOMENT, JUST FOR YOU</p><h2>Tear. Squeeze.<br /><em>Slow down.</em></h2><p>Morning tea. An afternoon coffee.<br />A little honey makes the ordinary sweeter.</p><div className="scene-actions"><button className="button button-light" onClick={() => { setRitualReplay((value) => value + 1); setRitualPlaying(true); setMotion(true) }}><Icon type="replay" /> Replay the ritual</button><button className="motion-button" aria-label={ritualPlaying ? 'Pause pouring animation' : 'Play pouring animation'} onClick={() => setRitualPlaying(!ritualPlaying)}><Icon type={ritualPlaying ? 'pause' : 'play'} /></button></div><ol className="ritual-steps"><li><span>01</span> Open</li><li><span>02</span> Squeeze</li><li><span>03</span> Enjoy</li></ol></div>
        <div className="ritual-art"><Scene mode="pour" playing={motion && ritualPlaying} replay={ritualReplay} /><span className="scene-note">Illustrative opening &amp; pouring demonstration</span></div>
      </section>

      <section className="section packing" id="packing">
        <div className="packing-art"><Scene mode="fill" playing={motion && fillPlaying} replay={fillReplay} /><span className="packing-art-label">THE ANATOMY OF A SWEET MOMENT</span></div>
        <div className="packing-copy"><p className="eyebrow">THOUGHTFULLY PORTIONED</p><h2>From the<br /><em>first drop.</em></h2><p>A closer look at the idea behind every stick: honey, a convenient portion, and a sealed wrapper that is ready when you are.</p><ol className="packing-steps"><li><span>01</span><div><h3>Fill</h3><p>Golden honey, portioned into the clear wrapper.</p></div></li><li><span>02</span><div><h3>Seal</h3><p>Individually packed for everyday convenience.</p></div></li><li><span>03</span><div><h3>Ready for your day</h3><p>Choose your pack and take a little sweetness along.</p></div></li></ol><div className="scene-actions"><button className="text-button" onClick={() => { setFillReplay((value) => value + 1); setFillPlaying(true); setMotion(true) }}><Icon type="replay" /> Replay filling</button><button className="motion-button" aria-label={fillPlaying ? 'Pause filling animation' : 'Play filling animation'} onClick={() => setFillPlaying(!fillPlaying)}><Icon type={fillPlaying ? 'pause' : 'play'} /></button></div><small className="illustration-note">A product illustration, not footage of our production line.</small></div>
      </section>

      <section className="story section" id="our-story"><div className="story-photo"><img src="/images/hero-honey-pack.jpg" alt="Norvax Hub honey sticks in their retail display pack" width="1312" height="1199" loading="lazy" /><span className="photo-caption">A LITTLE SWEETNESS, WHEREVER YOU ARE.</span></div><div className="story-copy"><p className="eyebrow">THE NORVAX HUB STORY</p><h2>Simple pleasures.<br /><em>Thoughtful details.</em></h2><p>We believe the little things make the everyday special. A quiet cup of tea. A shared breakfast. A moment to yourself.</p><p>Norvax Hub brings honey to those moments in a convenient, individually packed format. Easy to carry, simple to use, and ready for your next ritual.</p><a className="text-button" href="#our-honey">Get to know our honey <Icon /></a></div></section>

      <section className="honey-details section" id="our-honey"><p className="eyebrow">GOOD TO KNOW</p><h2>Honey, made <em>simple.</em></h2><dl><div><dt>Ingredients</dt><dd>100% honey</dd></div><div><dt>Portion sizes</dt><dd>5g or 10g per stick</dd></div><div><dt>Pack options</dt><dd>5, 10, 20 or 50 sticks</dd></div><div><dt>Keep it fresh</dt><dd>Store sealed in a cool, dry place, away from sunlight.</dd></div></dl><p className="detail-note">Please refer to your product packaging for origin and best-before details.</p></section>

      <section className="wholesale-banner" id="wholesale"><div><p className="eyebrow">FOR CAFÉS, OFFICES & EVERYONE IN BETWEEN</p><h2>Good things are<br /><em>better shared.</em></h2></div><div><p>Bring a little sweetness to your business.<br />Let’s find the right packs for your guests, customers or team.</p><a className="button button-dark" href="#contact" onClick={() => { if (formRef.current) formRef.current.elements.namedItem('kind').value = 'Wholesale enquiry' }}>Let’s talk wholesale <Icon /></a></div></section>

      <section className="section faq" id="faq"><div><p className="eyebrow">A FEW SWEET ANSWERS</p><h2>Curious?<br /><em>We’re here.</em></h2><a className="text-button" href="#contact">Ask us something <Icon /></a></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

      <section className="section contact" id="contact"><div className="contact-copy"><p className="eyebrow">LET’S TALK HONEY</p><h2>Something sweet<br /><em>starts here.</em></h2><p>Questions, order quotes or wholesale enquiries — we’d love to hear from you.</p><a className="contact-email" href={`mailto:${email}`}>{email} <Icon /></a><p className="contact-note">The form prepares an email for you to review and send from your email app.</p>{cart.length > 0 && <div className="enquiry-bag"><Icon type="bag" /><div><strong>{totalPacks} selected pack{totalPacks !== 1 ? 's' : ''}</strong><span>Your selection will be included in the enquiry.</span></div><button className="text-button" onClick={() => setCartOpen(true)}>Edit</button></div>}</div>
        <form ref={formRef} onSubmit={prepareEnquiry} onChange={() => setEmailDraft('')}><div className="field-row"><label>Your name<input name="name" autoComplete="name" required maxLength="100" placeholder="Name" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength="160" placeholder="you@example.com" /></label></div><div className="field-row"><label>Enquiry type<select name="kind" defaultValue="Order quote"><option>Order quote</option><option>Wholesale enquiry</option><option>General question</option></select></label><label>Business name <span>(optional)</span><input name="business" autoComplete="organization" maxLength="160" placeholder="Your business" /></label></div><div className="field-row"><label>Preferred stick size<select name="size"><option>Both sizes</option><option>5g</option><option>10g</option></select></label><label>Estimated quantity <span>(optional)</span><input name="quantity" maxLength="60" placeholder="e.g. 20 packs of 50" /></label></div><label>Phone <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" maxLength="40" placeholder="Phone or WhatsApp" /></label><label>Your message<textarea name="message" rows="3" required maxLength="2000" placeholder="Tell us a little about what you’re looking for…" /></label><button className="button button-dark" type="submit">Prepare enquiry <Icon /></button><div aria-live="polite">{emailDraft && <div className="email-ready"><strong>Your enquiry is ready to review.</strong><p>Open your email app, check the details and press Send there.</p><a className="button button-dark" href={emailDraft}>Open email draft <Icon /></a></div>}</div></form>
      </section>
    </main>
    <footer><div className="footer-top"><Brand /><p>Nature’s sweetness in every drop.</p><div><a href="#shop">Shop</a><a href="#faq">FAQ</a><a href="#contact">Contact</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Norvax Hub</span><button onClick={() => setMotion(!motion)}>{motion ? 'Pause animations' : 'Resume animations'} <Icon type={motion ? 'pause' : 'play'} /></button><a href="#home">Back to top ↑</a></div></footer>
    <div className={`toast ${message ? 'visible' : ''}`} role="status">{message}<button onClick={() => { setCartOpen(true); setMessage('') }}>View bag <Icon type="bag" /></button></div>

    <Modal open={Boolean(product)} onClose={() => setProduct(null)} title="Choose your honey pack" className="product-modal">{product && <><img src={product.image} alt={`${product.size} honey sticks, pack of ${product.pack}`} /><div className="product-modal-copy"><p className="eyebrow">NORVAX HUB HONEY STICKS</p><h2>{product.pack} little<br /><em>sweet moments.</em></h2><p>{product.size} per stick · {weight(product)}g total honey</p><SizeSwitch size={product.size} onChange={(value) => setProduct(products.find((item) => item.size === value && item.pack === product.pack))} /><fieldset className="pack-options"><legend>Sticks per pack</legend>{[5, 10, 20, 50].map((value) => <button type="button" key={value} aria-pressed={product.pack === value} onClick={() => setProduct(products.find((item) => item.size === product.size && item.pack === value))}>{value}</button>)}</fieldset><div className="quantity"><span>Number of packs</span><div><button aria-label="Decrease packs" disabled={quantity === 1} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><output>{quantity}</output><button aria-label="Increase packs" disabled={quantity === 99} onClick={() => setQuantity(Math.min(99, quantity + 1))}>+</button></div></div><button className="button button-dark" onClick={() => { add(product, quantity); setProduct(null) }}>Add to bag <Icon type="bag" /></button><small>Pricing and delivery confirmed with your order quote.</small></div></>}</Modal>
    <Modal open={cartOpen} onClose={() => setCartOpen(false)} title="Your shopping bag" className="cart-modal"><p className="eyebrow">YOUR SELECTION</p><h2>A bag of <em>sweetness.</em></h2>{!cart.length ? <div className="empty-cart"><Icon type="bag" /><p>Your bag is waiting for a little honey.</p><button className="button button-dark" onClick={() => { setCartOpen(false); document.getElementById('shop').scrollIntoView() }}>Explore the collection <Icon /></button></div> : <><div className="cart-items">{cart.map((entry) => { const item = products.find((value) => value.id === entry.id); return <div className="cart-item" key={entry.id}><img src={item.image} alt={`${item.size} pack of ${item.pack}`} /><div><h3>{item.size} · {item.pack} sticks</h3><p>{weight(item)}g per pack</p><button className="remove" onClick={() => setCart((current) => current.filter((value) => value.id !== entry.id))}>Remove</button></div><div className="cart-quantity"><button aria-label={`Decrease ${entry.id}`} disabled={entry.quantity === 1} onClick={() => changeQuantity(entry.id, -1)}>−</button><output>{entry.quantity}</output><button aria-label={`Increase ${entry.id}`} disabled={entry.quantity === 99} onClick={() => changeQuantity(entry.id, 1)}>+</button></div></div> })}</div><div className="cart-summary"><span>{totalPacks} pack{totalPacks !== 1 ? 's' : ''}</span><strong>{totalGrams}g total honey</strong></div><p>We’ll confirm the price, delivery and payment details before you order.</p><button className="button button-dark" onClick={requestQuote}>Request an order quote <Icon /></button><button className="text-button continue" onClick={() => setCartOpen(false)}>Continue exploring</button></>}</Modal>
  </div>
}
