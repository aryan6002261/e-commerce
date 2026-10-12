import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand-column">
          <Link href="/" className="wordmark footer-wordmark"><span className="wordmark-sun" aria-hidden="true">✳</span>morrow</Link>
          <p>A softer place to land.<br />Good things, for the everyday.</p>
          <span className="footer-doodle" aria-hidden="true">✳</span>
        </div>
        <div className="footer-links-column"><span className="footer-label">TAKE A LOOK</span><Link href="/#shop">Shop all</Link><Link href="/#our-story">Our story</Link><Link href="/account">Your account</Link></div>
        <div className="footer-links-column"><span className="footer-label">HERE TO HELP</span><Link href="/checkout">Shipping &amp; orders</Link><Link href="/account">Order history</Link><a href="mailto:hello@morrow.example">Say hello</a></div>
        <div className="footer-signoff"><span>Thoughtfully found.<br /><em>Lovingly lived with.</em></span><span className="footer-signoff-star">✳</span></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Morrow &amp; Co. Made for keeping.</span><span>DESIGNED FOR THE DAYS IN BETWEEN <span aria-hidden="true">✳</span></span><Link href="/#shop">Back to the good stuff ↑</Link></div>
    </footer>
  );
}
