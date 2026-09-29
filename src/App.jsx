import { useMemo, useState } from 'react'
import './App.css'

const navItems = [
  { label: 'Home', href: 'home' },
  { label: 'Shop', href: 'shop' },
  { label: 'Our Honey', href: 'our-honey' },
  { label: 'How It Works', href: 'how-it-works' },
  { label: 'Wholesale', href: 'wholesale' },
  { label: 'Our Story', href: 'our-story' },
  { label: 'FAQ', href: 'faq' },
  { label: 'Contact', href: 'contact' },
]

const featureCards = [
  { title: 'Individually Packed', text: 'Convenient single servings.' },
  { title: 'Easy To Carry', text: 'Simple to keep at home, work or while travelling.' },
  { title: 'Easy To Use', text: 'Tear. Squeeze. Enjoy.' },
]

const catalogProducts = [
  { id: '5g-5', size: '5g', pack: 5, total: '25g total', qty: 1, image: '/images/pack-5g-5.jpg' },
  { id: '5g-10', size: '5g', pack: 10, total: '50g total', qty: 1, image: '/images/pack-5g-10.jpg' },
  { id: '5g-20', size: '5g', pack: 20, total: '100g total', qty: 1, image: '/images/pack-5g-20.jpg' },
  { id: '5g-50', size: '5g', pack: 50, total: '250g total', qty: 1, image: '/images/hero-honey-pack.jpg' },
  { id: '10g-5', size: '10g', pack: 5, total: '50g total', qty: 1, image: '/images/pack-10g-5.jpg' },
  { id: '10g-10', size: '10g', pack: 10, total: '100g total', qty: 1, image: '/images/pack-10g-10.jpg' },
  { id: '10g-20', size: '10g', pack: 20, total: '200g total', qty: 1, image: '/images/pack-10g-20.jpg' },
  { id: '10g-50', size: '10g', pack: 50, total: '500g total', qty: 1, image: '/images/pack-10g-50.png' },
]

const useCases = [
  { name: 'Tea', icon: '☕' },
  { name: 'Coffee', icon: '☕' },
  { name: 'Breakfast', icon: '🥣' },
  { name: 'Office', icon: '💼' },
  { name: 'On The Go', icon: '🧳' },
]

const faqItems = [
  { question: 'What is a Norvax Hub Honey Stick?', answer: 'A convenient single-serve honey sachet designed for easy use at home, work or while travelling.' },
  { question: 'How much honey is in each stick?', answer: 'Each stick contains either 5g or 10g of honey, depending on the selected format.' },
  { question: 'What sizes are available?', answer: 'Norvax Hub offers 5g and 10g individually packed honey sticks.' },
  { question: 'What pack sizes are available?', answer: 'The packs include 5, 10, 20 and 50-stick options.' },
  { question: 'How do I open a honey stick?', answer: 'Tear gently at the top, squeeze the sachet, and enjoy the honey.' },
  { question: 'How should I store the honey sticks?', answer: 'Store in a cool, dry place away from direct sunlight. Keep sealed until ready to use.' },
  { question: 'Can honey naturally crystallize?', answer: 'Yes, honey can crystallize naturally over time depending on conditions. This does not necessarily affect enjoyment.' },
  { question: 'Do you offer wholesale orders?', answer: 'Yes, wholesale and bulk enquiries are available through the dedicated wholesale section.' },
  { question: 'Where do you deliver?', answer: 'Delivery options can be confirmed with the Norvax Hub team based on your location and order requirements.' },
  { question: 'How can I contact Norvax Hub?', answer: 'Use the contact form, WhatsApp button or email details listed on the contact section.' },
]

const introBullets = [
  'Natural goodness',
  'Boosts energy',
  'Supports immunity',
  'No added preservatives',
]

function App() {
  const [activeSize, setActiveSize] = useState('5g')
  const [buildSize, setBuildSize] = useState('5g')
  const [buildPack, setBuildPack] = useState(20)
  const [expandedFaq, setExpandedFaq] = useState(0)
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 })
  const [productQuantities, setProductQuantities] = useState(
    Object.fromEntries(catalogProducts.map((product) => [product.id, product.qty])),
  )
  const [cart, setCart] = useState([
    { id: '5g-20', size: '5g', pack: 20, quantity: 1, label: '5g • Pack of 20', weight: '100g', price: 'Configurable' },
  ])

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const totalHoneyWeight = useMemo(() => {
    const grams = Number.parseInt(buildSize, 10)
    return grams * buildPack
  }, [buildPack, buildSize])

  const subtotal = cart.reduce((sum, item) => sum + (item.quantity || 0), 0)

  const addToCart = (product) => {
    const quantity = productQuantities[product.id] || 1
    const existing = cart.find((item) => item.id === product.id)

    if (existing) {
      setCart((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        ),
      )
      return
    }

    setCart((current) => [
      ...current,
      {
        id: product.id,
        size: product.size,
        pack: product.pack,
        quantity,
        label: `${product.size} • Pack of ${product.pack}`,
        weight: product.total,
        price: 'Configurable',
      },
    ])
  }

  const addBuildToCart = () => {
    const buildItem = {
      id: `custom-${buildSize}-${buildPack}`,
      size: buildSize,
      pack: buildPack,
      quantity: 1,
      label: `${buildSize} • Pack of ${buildPack}`,
      weight: `${buildSize === '5g' ? 5 : 10}g × ${buildPack} sticks`,
      price: 'Configurable',
    }

    const existing = cart.find((item) => item.id === buildItem.id)

    if (existing) {
      setCart((current) =>
        current.map((item) =>
          item.id === buildItem.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      )
      return
    }

    setCart((current) => [...current, buildItem])
  }

  const adjustQuantity = (productId, delta) => {
    setProductQuantities((current) => ({
      ...current,
      [productId]: Math.max(1, (current[productId] || 1) + delta),
    }))
  }

  const updateCartQuantity = (cartId, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === cartId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeCartItem = (cartId) => {
    setCart((current) => current.filter((item) => item.id !== cartId))
  }

  const sizeKey = activeSize === '5g' ? '5g' : '10g'

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="brand-block">
          <img className="brand-mark" src="/images/norvax-bee-logo.svg" alt="" />
          <div className="brand-copy">
            <div className="brand-name-row">
              <span className="brand-name">Norvax</span>
              <span className="brand-name brand-name--accent">Hub</span>
            </div>
            <span className="header-tagline">Nature&apos;s sweetness in every drop</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.label} href={`#${item.href}`} className="nav-link" onClick={(event) => {
              event.preventDefault()
              scrollToSection(item.href)
            }}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions" aria-label="Quick actions">
          <button type="button" className="icon-button" aria-label="Search" onClick={() => scrollToSection('shop')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 015.94 12.56l4.33 4.34 1.41-1.41-4.34-4.33A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"/></svg>
          </button>
          <button type="button" className="icon-button" aria-label="Account" onClick={() => scrollToSection('contact')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>
          </button>
          <button type="button" className="icon-button cart-button" aria-label="Cart" onClick={() => scrollToSection('cart')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a2 2 0 110 4 2 2 0 010-4zm10 0a2 2 0 110 4 2 2 0 010-4zM7.2 15h10.9a2 2 0 001.96-1.63l1.12-6.28A1 1 0 0020.2 6H6.42L6 3H3v2h1.6l2.7 10.22L7 16h11v2H7.2z"/></svg>
            <span>{cart.length}</span>
          </button>
        </div>
      </header>

      <main className="page-content">
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <div className="hero-ambience" aria-hidden="true">
              <span className="hero-particle hero-particle-one"></span>
              <span className="hero-particle hero-particle-two"></span>
              <span className="hero-honeyline"></span>
            </div>
            <p className="hero-eyebrow">Pure honey • Single serve</p>
            <h1 className="hero-headline">
              <span className="hero-headline-serif">Honey.</span>
              <span className="hero-headline-sans">Made <span className="hero-headline-accent">Convenient.</span></span>
            </h1>
            <p className="hero-copy-primary">Pure honey, portioned for everyday moments.</p>
            <p className="hero-copy-secondary">Available in convenient 5g and 10g individually packed sticks.</p>

            <div className="hero-process" aria-label="Tear, squeeze, enjoy">
              <div className="hero-process-step">
                <span className="process-number">01</span>
                <span className="process-label">Tear</span>
              </div>
              <span className="process-arrow" aria-hidden="true">→</span>
              <div className="hero-process-step">
                <span className="process-number">02</span>
                <span className="process-label">Squeeze</span>
              </div>
              <span className="process-arrow" aria-hidden="true">→</span>
              <div className="hero-process-step">
                <span className="process-number">03</span>
                <span className="process-label">Enjoy</span>
              </div>
            </div>

            <div className="hero-size-control">
              <div className="hero-size-heading">
                <span className="hero-size-label">Choose your stick</span>
                <span className="hero-size-note" aria-live="polite">
                  {activeSize === '5g' ? 'Light single serving' : 'Generous single serving'}
                </span>
              </div>
              <div className="size-switcher" data-active-size={activeSize} role="group" aria-label="Choose stick size">
                <span className="size-indicator" aria-hidden="true"></span>
                {['5g', '10g'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={size === activeSize ? 'size-pill active' : 'size-pill'}
                    aria-pressed={size === activeSize}
                    onClick={() => setActiveSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-actions">
              <button type="button" className="primary-button hero-primary" onClick={() => scrollToSection('shop')}>
                <span>Shop honey</span>
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="secondary-button hero-secondary" onClick={() => scrollToSection('our-honey')}>Discover more</button>
            </div>

            <p className="hero-trust-line">5g &amp; 10g <span>•</span> Individually packed <span>•</span> Easy to carry</p>
          </div>

          <div className="hero-visual" aria-live="polite">
            <div
              className={`hero-scene hero-scene-${activeSize}`}
              onMouseMove={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect()
                const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 4
                const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * -4
                setHeroTilt({ x: offsetX, y: offsetY })
              }}
              onMouseLeave={() => setHeroTilt({ x: 0, y: 0 })}
              style={{
                '--tilt-x': `${heroTilt.x}deg`,
                '--tilt-y': `${heroTilt.y}deg`,
              }}
            >
              <img
                className="hero-product-photo"
                src={activeSize === '5g' ? '/images/hero-5g-poster.jpeg' : '/images/hero-10g-poster.png'}
                alt={`Norvax Hub ${activeSize} honey sticks promotional poster`}
              />
            </div>
          </div>
        </section>

        <section className="intro-section" id="intro">
          <div className="section-heading centered">
            <span className="heading-tag">Honey, One Stick at a Time.</span>
            <h2>Enjoy honey in a convenient, individually packed format.</h2>
            <p>Norvax Hub Honey Sticks make it simple to enjoy honey at home, at work or on the go.</p>
          </div>

          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.title === 'Individually Packed' ? '▣' : feature.title === 'Easy To Carry' ? '◌' : '✦'}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <span className="heading-tag">Shop our honey</span>
            <h2>Choose the pack that fits your flow.</h2>
          </div>

          <div className="catalog-grid">
            {catalogProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-visual">
                  <img className="product-photo" src={product.image} alt={`${product.size} Norvax Hub honey sticks, pack of ${product.pack}`} loading="lazy" />
                </div>

                <div className="product-info">
                  <small>{product.size} honey sticks</small>
                  <h3>Pack of {product.pack}</h3>
                  <p>{product.total}</p>
                </div>

                <div className="quantity-row">
                  <button type="button" onClick={() => adjustQuantity(product.id, -1)} aria-label="Decrease quantity">−</button>
                  <span>{productQuantities[product.id]}</span>
                  <button type="button" onClick={() => adjustQuantity(product.id, 1)} aria-label="Increase quantity">+</button>
                </div>

                <div className="product-actions">
                  <button type="button" className="ghost-button" onClick={() => scrollToSection('our-honey')}>View Product</button>
                  <button type="button" className="primary-button" onClick={() => addToCart(product)}>Add to Cart</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="build-section">
          <div className="section-heading">
            <span className="heading-tag">Build your pack</span>
            <h2>Make your perfect honey bundle.</h2>
          </div>

          <div className="build-layout">
            <div className="build-controls">
              <div className="build-step">
                <label>Choose stick size</label>
                <div className="size-switcher compact">
                  {['5g', '10g'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={size === buildSize ? 'size-pill active' : 'size-pill'}
                      onClick={() => setBuildSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="build-step">
                <label>Choose pack</label>
                <div className="pack-switcher">
                  {[5, 10, 20, 50].map((pack) => (
                    <button
                      key={pack}
                      type="button"
                      className={pack === buildPack ? 'pack-pill active' : 'pack-pill'}
                      onClick={() => setBuildPack(pack)}
                    >
                      {pack}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="build-summary">
              <div className="summary-box">
                <div className="summary-result">{buildSize} × {buildPack} sticks</div>
                <div className="summary-total">= {totalHoneyWeight}g Total Honey</div>
                <button type="button" className="primary-button wide" onClick={addBuildToCart}>Add to Cart</button>
              </div>
            </div>
          </div>
        </section>

        <section className="story-section" id="how-it-works">
          <div className="section-heading">
            <span className="heading-tag">From Honey to Your Stick</span>
            <h2>Simple, thoughtful packing from the first drop.</h2>
          </div>

          <div className="packing-flow" aria-label="Honey packing process">
            {['Honey', 'Portion', 'Seal', 'Pack', 'Ready to Enjoy'].map((stage, index) => (
              <div className="flow-step" key={stage}>
                <div className="flow-icon" aria-hidden="true">
                  {index === 0 && '✦'}
                  {index === 1 && '▣'}
                  {index === 2 && '◈'}
                  {index === 3 && '▤'}
                  {index === 4 && '✓'}
                </div>
                <span>{stage}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="usage-section">
          <div className="section-heading">
            <span className="heading-tag">Tear • Squeeze • Enjoy</span>
            <h2>Made for everyday moments.</h2>
          </div>

          <div className="usage-grid">
            {['Tear', 'Squeeze', 'Enjoy'].map((step, index) => (
              <article className="usage-card" key={step}>
                <div className="usage-index">STEP {index + 1}</div>
                <h3>{step}</h3>
                <div className="usage-visual usage-visual--1">
                  {index === 0 && <div className="tear-strip"></div>}
                  {index === 1 && <div className="squeeze-sachet"><span></span></div>}
                  {index === 2 && <div className="enjoy-flow"></div>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="lifestyle-section">
          <div className="section-heading">
            <span className="heading-tag">A Little Sweetness, Wherever You Are.</span>
            <h2>Perfect for your daily rituals.</h2>
          </div>

          <div className="use-case-grid">
            {useCases.map((useCase) => (
              <div key={useCase.name} className="use-case">
                <div className="use-case-icon">{useCase.icon}</div>
                <span>{useCase.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="feature-box-section">
          <div className="feature-box-visual">
            <div className="box-hero-pack">
              <div className="box-hero-stacks">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="box-hero-label">
                <strong>Norvax Hub</strong>
                <small>Pure &amp; Natural</small>
                <em>5g × 50 Sachets</em>
              </div>
            </div>
          </div>

          <div className="feature-box-copy">
            <span className="heading-tag">50-pack feature</span>
            <h2>50 honey sticks. 5g each. 250g total.</h2>
            <p>Designed for everyday convenience, shared moments and quick refreshers throughout the day.</p>
            <button type="button" className="primary-button">View 50 pack</button>
          </div>
        </section>

        <section className="educational-section" id="our-honey">
          <div className="section-heading">
            <span className="heading-tag">Our Honey</span>
            <h2>Simple. Convenient. Made for everyday moments.</h2>
          </div>

          <div className="info-grid">
            <div className="info-panel">
              <h3>Ingredients</h3>
              <p>100% honey</p>
            </div>
            <div className="info-panel">
              <h3>Stick size</h3>
              <p>5g / 10g</p>
            </div>
            <div className="info-panel">
              <h3>Net weight</h3>
              <p>25g–500g depending on pack</p>
            </div>
            <div className="info-panel">
              <h3>Storage instructions</h3>
              <p>Store in a cool, dry place away from direct sunlight.</p>
            </div>
            <div className="info-panel">
              <h3>How to use</h3>
              <p>Tear, squeeze and enjoy.</p>
            </div>
            <div className="info-panel">
              <h3>Country of origin</h3>
              <p>Configurable placeholder</p>
            </div>
            <div className="info-panel">
              <h3>Best before</h3>
              <p>Configurable placeholder</p>
            </div>
          </div>
        </section>

        <section className="story-brand-section" id="our-story">
          <div className="story-card">
            <span className="heading-tag">The Norvax Hub Story</span>
            <h2>Thoughtful packaging for modern everyday sweetness.</h2>
            <p>We believe convenience should feel refined, practical and easy to enjoy. Norvax Hub brings together thoughtful packaging, quality honey and a design that fits seamlessly into daily routines.</p>
            <p>From morning tea to office breaks and travel moments, each stick is created to make honey feel simple, clean and ready whenever you need it.</p>
          </div>
        </section>

        <section className="wholesale-section" id="wholesale">
          <div className="wholesale-copy">
            <span className="heading-tag">Honey Sticks for Your Business</span>
            <h2>Convenient individually packed honey for cafés, offices, events and retailers.</h2>
            <p>Looking for convenient individually packed honey for your business? Contact Norvax Hub about bulk and wholesale orders.</p>
            <button type="button" className="primary-button">Request wholesale pricing</button>
          </div>

          <form className="wholesale-form" onSubmit={(event) => event.preventDefault()}>
            <div className="field-row">
              <label>
                <span>Name</span>
                <input type="text" placeholder="Your name" />
              </label>
              <label>
                <span>Business Name</span>
                <input type="text" placeholder="Business name" />
              </label>
            </div>
            <div className="field-row">
              <label>
                <span>Email</span>
                <input type="email" placeholder="name@email.com" />
              </label>
              <label>
                <span>Phone / WhatsApp</span>
                <input type="tel" placeholder="Optional" />
              </label>
            </div>
            <div className="field-row">
              <label>
                <span>Business Type</span>
                <input type="text" placeholder="Café, hotel, office..." />
              </label>
              <label>
                <span>5g / 10g / Both</span>
                <input type="text" placeholder="Preferred size" />
              </label>
            </div>
            <label>
              <span>Estimated Quantity</span>
              <input type="text" placeholder="e.g. 500 packs" />
            </label>
            <label>
              <span>Message</span>
              <textarea rows="4" placeholder="Tell us about your requirements" />
            </label>
            <button type="submit" className="primary-button wide" onClick={() => scrollToSection('contact')}>Send enquiry</button>
          </form>
        </section>

        <section className="faq-section" id="faq">
          <div className="section-heading centered">
            <span className="heading-tag">FAQ</span>
            <h2>Questions, answered simply.</h2>
          </div>

          <div className="faq-list" id="faq">
            {faqItems.map((item, index) => (
              <div key={item.question} className={expandedFaq === index ? 'faq-item open' : 'faq-item'}>
                <button type="button" className="faq-question" onClick={() => setExpandedFaq(expandedFaq === index ? -1 : index)}>
                  <span>{item.question}</span>
                  <span className="faq-toggle">+</span>
                </button>
                {expandedFaq === index && <p className="faq-answer">{item.answer}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy">
            <span className="heading-tag">Contact</span>
            <h2>Let’s talk honey.</h2>
            <p>Use the contact form or message us directly.</p>
            <div className="contact-meta">
              <div><strong>Email</strong><span>hello@norvaxhub.com</span></div>
              <div><strong>WhatsApp</strong><span>+00 000 000 000</span></div>
              <div><strong>Social</strong><span>Instagram • Facebook • LinkedIn</span></div>
            </div>
            <div className="contact-actions">
              <button type="button" className="primary-button">WhatsApp</button>
              <button type="button" className="secondary-button">Email</button>
            </div>
          </div>

          <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span>Name</span>
              <input type="text" placeholder="Your name" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" placeholder="Your email" />
            </label>
            <label>
              <span>Message</span>
              <textarea rows="5" placeholder="How can we help?" />
            </label>
            <button type="submit" className="primary-button wide">Send message</button>
          </form>
        </section>

        <section className="cart-section" id="cart">
          <div className="section-heading">
            <span className="heading-tag">Cart</span>
            <h2>Your selected honey packs.</h2>
          </div>

          <div className="cart-card">
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty.</p>
            ) : (
              <div className="cart-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-thumb">
                      <div className={`mini-pack mini-pack--${item.size.toLowerCase()}`}></div>
                    </div>
                    <div className="cart-details">
                      <strong>{item.label}</strong>
                      <small>{item.weight}</small>
                    </div>
                    <div className="cart-qty">
                      <button type="button" onClick={() => updateCartQuantity(item.id, -1)} aria-label="Decrease cart item">−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateCartQuantity(item.id, 1)} aria-label="Increase cart item">+</button>
                    </div>
                    <div className="cart-price">{item.price}</div>
                    <button type="button" className="remove-link" onClick={() => removeCartItem(item.id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-footer">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{subtotal} item(s)</strong>
              </div>
              <div className="cart-actions-row">
                <button type="button" className="secondary-button" onClick={() => scrollToSection('shop')}>Continue shopping</button>
                <button type="button" className="primary-button" onClick={() => scrollToSection('contact')}>Checkout</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
