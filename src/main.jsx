import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const CONFIG = {
  whatsapp: '918296056692',
  phone: '+918296056692',
  phoneDisplay: '+91 82960 56692',
};

const vehicles = [
  { id: 'dzire1', name: 'Swift Dzire', label: 'Car 1', detail: '4 passengers • Sedan' },
  { id: 'dzire2', name: 'Swift Dzire', label: 'Car 2', detail: '4 passengers • Sedan' },
  { id: 'ertiga', name: 'Ertiga', label: 'MUV', detail: '6 passengers • MUV' },
];

const starterReviews = [
  { name: 'Rahul K.', place: 'Mangalore', rating: 5, text: 'The booking was simple and the driver reached on time. WhatsApp confirmation made everything easy.' },
  { name: 'Shreya P.', place: 'Udupi', rating: 5, text: 'We booked an Ertiga for our family trip. The car was clean and there was enough space for everyone.' },
  { name: 'Arun M.', place: 'Mangalore', rating: 5, text: 'Needed an airport drop early morning. Quick response on WhatsApp and the pickup was smooth.' },
];

function Stars({ rating = 5 }) {
  return <span className="stars" aria-label={`${rating} out of 5 stars`}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

function VehicleArt({ type = 'dzire' }) {
  return <div className={`vehicle-art ${type}`} aria-hidden="true"><span className="vehicle-window" /><span className="vehicle-wheel one" /><span className="vehicle-wheel two" /></div>;
}

function App() {
  const [selectedCar, setSelectedCar] = useState(vehicles[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Optional — share your current GPS location with your booking.');
  const [form, setForm] = useState({ name: '', phone: '', from: '', to: '', customLocation: '' });
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mangaloreTravelsReviews') || '[]');
      return Array.isArray(saved) ? [...starterReviews, ...saved] : starterReviews;
    } catch {
      return starterReviews;
    }
  });

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const bookingMessage = useMemo(() => {
    const gps = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : 'Not shared';
    return `🚕 *NEW CAB BOOKING — Mangalore Travels*

👤 Name: ${form.name.trim()}
📞 Customer Phone: ${form.phone.trim()}
🚗 Car: ${selectedCar.name} (${selectedCar.label})
📍 From: ${form.from.trim()}
🏁 To: ${form.to.trim()}
📝 Custom Location / Landmark: ${form.customLocation.trim() || 'Not provided'}
🌐 Current GPS: ${gps}

Please confirm availability and pickup details.`;
  }, [form, location, selectedCar]);

  const validateBooking = () => {
    const values = [form.name, form.phone, form.from, form.to].map((v) => v.trim());
    if (values.some((v) => !v)) {
      alert('Please fill in Name, Phone, From and To.');
      return false;
    }
    if (!/^[0-9+()\-\s]{8,18}$/.test(form.phone.trim())) {
      alert('Please enter a valid phone number.');
      return false;
    }
    return true;
  };

  const openWhatsApp = (message) => {
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const sendBooking = () => {
    if (validateBooking()) openWhatsApp(bookingMessage);
  };

  const callToBook = () => {
    if (!validateBooking()) return;
    openWhatsApp(bookingMessage);
    setTimeout(() => { window.location.href = `tel:${CONFIG.phone}`; }, 700);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('GPS is not supported by this browser.');
      return;
    }
    setLocationStatus('Requesting your location…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocation(next);
        setLocationStatus('Location captured. It will be included in WhatsApp.');
      },
      () => setLocationStatus('Location permission was not granted. You can use the custom location box instead.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const addReview = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const review = {
      name: String(data.get('reviewName') || '').trim(),
      place: String(data.get('reviewPlace') || '').trim(),
      rating: Number(data.get('reviewRating') || 5),
      text: String(data.get('reviewText') || '').trim(),
    };
    if (!review.name || !review.text) {
      alert('Please enter your name and review.');
      return;
    }
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem('mangaloreTravelsReviews') || '[]'); } catch { return []; }
    })();
    const nextSaved = [...(Array.isArray(saved) ? saved : []), review];
    localStorage.setItem('mangaloreTravelsReviews', JSON.stringify(nextSaved));
    setReviews((old) => [...old, review]);
    event.currentTarget.reset();
    const message = `⭐ *NEW CUSTOMER REVIEW — Mangalore Travels*\n\n👤 Name: ${review.name}\n📍 Location: ${review.place || 'Not provided'}\n⭐ Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}\n📝 Review: ${review.text}`;
    alert('Thank you! Your review was added on this device. WhatsApp will open so you can send it to the owner.');
    openWhatsApp(message);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#home" onClick={closeMenu} aria-label="Mangalore Travels home">
            <span className="brand-mark">MT</span>
            <span>Mangalore <b>Travels</b></span>
          </a>
          <button className={`menu-toggle ${menuOpen ? 'active' : ''}`} type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            <span /><span /><span />
          </button>
          <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
            {['book', 'fleet', 'services', 'reviews', 'contact'].map((id) => (
              <a key={id} href={`#${id}`} onClick={closeMenu}>{id === 'fleet' ? 'Cars' : id[0].toUpperCase() + id.slice(1)}</a>
            ))}
            <a className="nav-call mobile-nav-call" href={`tel:${CONFIG.phone}`} onClick={closeMenu}>Call Now</a>
          </nav>
          <a className="nav-call desktop-call" href={`tel:${CONFIG.phone}`}>Call Now</a>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="pill">🚕 Mangalore • Local • Airport • Outstation</div>
              <h1>Your ride. <span>Our responsibility.</span></h1>
              <p>Reliable cab booking in Mangalore with simple WhatsApp booking. No login. No registration. Just choose your car and ride.</p>
              <div className="hero-actions">
                <a href="#book" className="btn btn-primary">Book Now <span>→</span></a>
                <a href={`tel:${CONFIG.phone}`} className="btn btn-dark">☎ Call Us</a>
              </div>
              <div className="trust-row"><span>✓ No login</span><span>✓ Direct WhatsApp</span><span>✓ Fast confirmation</span></div>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="hero-glow" />
              <div className="hero-orbit" />
              <div className="road" />
              <div className="hero-car">
                <div className="hero-car-top" />
                <div className="hero-car-window window-one" />
                <div className="hero-car-window window-two" />
                <div className="hero-car-body" />
                <div className="hero-wheel wheel-one" /><div className="hero-wheel wheel-two" />
                <div className="hero-light light-one" /><div className="hero-light light-two" />
              </div>
              <div className="float-card support-card"><b>24/7</b><small>Booking support</small></div>
              <div className="float-card fleet-card-small"><b>3 Cars</b><small>Ready to book</small></div>
            </div>
          </div>
        </section>

        <section className="quick-strip" aria-label="Booking steps">
          <div className="container quick-grid">
            <article><span>01</span><div><b>Choose your car</b><small>Swift Dzire or Ertiga</small></div></article>
            <article><span>02</span><div><b>Enter your route</b><small>Pickup & destination</small></div></article>
            <article><span>03</span><div><b>Share booking</b><small>WhatsApp + location</small></div></article>
          </div>
        </section>

        <section id="book" className="section booking-section">
          <div className="container">
            <div className="section-head"><div><p className="eyebrow">BOOK YOUR RIDE</p><h2>Ready when you are.</h2></div><p>No account needed. Fill the details and send your request directly to Mangalore Travels on WhatsApp.</p></div>
            <div className="booking-layout">
              <div className="booking-card">
                <div className="step-label"><span>1</span> Select a vehicle</div>
                <div className="vehicle-grid">
                  {vehicles.map((vehicle) => (
                    <button key={vehicle.id} className={`vehicle-option ${selectedCar.id === vehicle.id ? 'selected' : ''}`} type="button" onClick={() => setSelectedCar(vehicle)} aria-pressed={selectedCar.id === vehicle.id}>
                      <VehicleArt type={vehicle.id === 'ertiga' ? 'ertiga' : 'dzire'} />
                      <div><strong>{vehicle.name}</strong><small>{vehicle.detail} • {vehicle.label}</small></div>
                    </button>
                  ))}
                </div>

                <div className="step-label"><span>2</span> Your journey</div>
                <div className="form-grid">
                  <label>From / Pickup *<input value={form.from} onChange={(e) => update('from', e.target.value)} placeholder="e.g. Mangalore Airport" autoComplete="street-address" /></label>
                  <label>To / Destination *<input value={form.to} onChange={(e) => update('to', e.target.value)} placeholder="e.g. Mangalore City" /></label>
                  <label>Your name *<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Enter your name" autoComplete="name" /></label>
                  <label>Phone number *<input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="10-digit mobile number" autoComplete="tel" inputMode="tel" /></label>
                </div>

                <div className="location-box">
                  <div><b>📍 Current location</b><small>{locationStatus}</small></div>
                  <button className="btn btn-small" type="button" onClick={getLocation}>{location ? '✓ Location Ready' : 'Use My Location'}</button>
                </div>
                <label className="full-label">Custom pickup / location note (optional)<textarea value={form.customLocation} onChange={(e) => update('customLocation', e.target.value)} rows="3" placeholder="Apartment, hotel, landmark, gate number, etc." /></label>
                <div className="booking-actions"><button className="btn btn-primary btn-large" type="button" onClick={sendBooking}>💬 Send Booking on WhatsApp</button><button className="btn btn-dark btn-large" type="button" onClick={callToBook}>☎ Call to Book</button></div>
                <p className="tiny-note">WhatsApp opens with the booking details. The customer must tap Send in WhatsApp. Call to Book then opens the phone dialer.</p>
              </div>

              <aside className="booking-summary">
                <p className="eyebrow">BOOKING PREVIEW</p>
                <h3>{selectedCar.name} <small>{selectedCar.label}</small></h3>
                <div className="summary-route"><i /> <span>{form.from.trim() || 'Pickup not entered'}</span></div>
                <div className="route-line" />
                <div className="summary-route"><i className="pin" /> <span>{form.to.trim() || 'Destination not entered'}</span></div>
                <div className="summary-location">📍 {location ? 'Current GPS ready to share' : (form.customLocation.trim() || 'Current location not added')}</div>
                <hr />
                <p>Need a different route or vehicle?</p>
                <a className="summary-call" href={`tel:${CONFIG.phone}`}>Call {CONFIG.phoneDisplay} →</a>
              </aside>
            </div>
          </div>
        </section>

        <section id="fleet" className="section dark-section">
          <div className="container">
            <div className="section-head light"><div><p className="eyebrow">OUR FLEET</p><h2>Choose your comfort.</h2></div><p>Three vehicles are available for your booking request. Final availability is confirmed by phone or WhatsApp.</p></div>
            <div className="fleet-grid">
              {vehicles.map((vehicle, index) => (
                <article className={`fleet-item ${vehicle.id === 'ertiga' ? 'featured' : ''}`} key={vehicle.id}>
                  {vehicle.id === 'ertiga' && <span className="badge">6 SEATS</span>}
                  <VehicleArt type={vehicle.id === 'ertiga' ? 'ertiga' : 'dzire'} />
                  <h3>{vehicle.name}</h3>
                  <p>{vehicle.id === 'ertiga' ? 'Spacious MUV for family travel, airport runs and longer journeys.' : 'Comfortable sedan for city rides, airport transfers and small groups.'}</p>
                  <span className="fleet-meta">{vehicle.label} • {vehicle.id === 'ertiga' ? 'Up to 6' : 'Up to 4'} passengers</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="container">
            <div className="section-head"><div><p className="eyebrow">TRAVEL SERVICES</p><h2>More than a ride.</h2></div></div>
            <div className="service-grid">
              {[
                ['✈️', 'Airport Transfers', 'Pickup and drop-off for Mangalore International Airport and nearby areas.'],
                ['🏙️', 'Local Cab', 'Point-to-point city travel for errands, meetings, shopping and daily trips.'],
                ['🛣️', 'Outstation Trips', 'Comfortable intercity journeys with a vehicle that fits your group.'],
                ['👨‍👩‍👧‍👦', 'Family Travel', 'Spacious Ertiga option for families and small groups.'],
              ].map(([icon, title, text]) => <article className="service-card" key={title}><b>{icon} {title}</b><p>{text}</p></article>)}
            </div>
          </div>
        </section>

        <section id="reviews" className="section reviews-section">
          <div className="container">
            <div className="section-head"><div><p className="eyebrow">CUSTOMER REVIEWS</p><h2>What riders say.</h2></div><span className="review-note">Customers can add a review below.</span></div>
            <div className="review-grid">
              {reviews.map((review, index) => <article className="review-card" key={`${review.name}-${index}`}><Stars rating={review.rating} /><p>“{review.text}”</p><div><b>{review.name}</b><small>{review.place || 'Customer'}</small></div></article>)}
            </div>
            <div className="review-form-card">
              <p className="eyebrow">ADD YOUR REVIEW</p><h3>Share your experience</h3>
              <form className="review-form" onSubmit={addReview}>
                <div className="form-grid"><label>Your name *<input name="reviewName" required placeholder="Enter your name" /></label><label>Location<input name="reviewPlace" placeholder="e.g. Mangalore" /></label></div>
                <label>Rating *<select name="reviewRating" defaultValue="5"><option value="5">★★★★★ — 5</option><option value="4">★★★★☆ — 4</option><option value="3">★★★☆☆ — 3</option><option value="2">★★☆☆☆ — 2</option><option value="1">★☆☆☆☆ — 1</option></select></label>
                <label>Your review *<textarea name="reviewText" required maxLength="500" rows="4" placeholder="Tell us about your trip..." /></label>
                <button className="btn btn-primary btn-large" type="submit">⭐ Add Review</button>
                <p className="tiny-note">Reviews are stored on this device. WhatsApp is also prepared so the customer can send the review to the owner.</p>
              </form>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="container"><div className="contact-card"><div><p className="eyebrow">CONTACT US</p><h2>Let’s get you moving.</h2><p>For instant booking, call us or send your trip details on WhatsApp.</p></div><div className="contact-actions"><a className="contact-link" href={`tel:${CONFIG.phone}`}>☎ <span>Call<br /><b>{CONFIG.phoneDisplay}</b></span></a><a className="contact-link" href={`https://wa.me/${CONFIG.whatsapp}`}>💬 <span>WhatsApp<br /><b>Chat with us</b></span></a></div></div></div>
        </section>
      </main>

      <footer><div className="container footer-inner"><div><strong>Mangalore Travels</strong><p>Simple. Reliable. Local.</p></div><div className="footer-links"><a href="#book">Book a Cab</a><a href="#fleet">Our Cars</a><a href="#contact">Contact</a></div><small>© {new Date().getFullYear()} Mangalore Travels. All rights reserved.</small></div></footer>
      <div className="mobile-actions"><a href="#book">🚕 Book</a><a href={`tel:${CONFIG.phone}`}>☎ Call</a><a href={`https://wa.me/${CONFIG.whatsapp}`}>💬 WhatsApp</a></div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
