import Link from "next/link";


const Footer = () => {
  

  return (
    <footer className="bg-[#0a1736] text-white pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-600 text-white font-bold rounded-lg w-8 h-8 flex items-center justify-center text-lg">
              P
            </div>
            <span className="text-xl font-bold">Pujaya</span>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            The most reliable auction platform to discover and sell unique items.
          </p>
          <div className="flex gap-3 text-gray-400 text-xl">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="font-bold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <Link href="/" className="hover:text-yellow-400">
                Home
              </Link>
            </li>
            <li>
              <Link href="/auctions" className="hover:text-yellow-400">
                Auctions
              </Link>
            </li>
            <li>
              <Link href="/auctions/create" className="hover:text-yellow-400">
                Sell
              </Link>
            </li>
            <li>
              <Link href="/contactUs" className="hover:text-yellow-400">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        {/* Categories */}
        <div>
          <h3 className="font-bold mb-3">Categories</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <Link href="/auctions?search=art" className="hover:text-yellow-400">
                Art
              </Link>
            </li>
            <li>
              <Link href="/auctions?search=watches" className="hover:text-yellow-400">
                Watches
              </Link>
            </li>
            <li>
              <Link href="/auctions?search=jewelry" className="hover:text-yellow-400">
                Jewelry
              </Link>
            </li>
            <li>
              <Link href="/auctions?search=collectibles" className="hover:text-yellow-400">
                Collectibles
              </Link>
            </li>
            <li>
              <Link href="/auctions?search=antiques" className="hover:text-yellow-400">
                Antiques
              </Link>
            </li>
          </ul>
        </div>
        {/* Support */}
        <div>
          <h3 className="font-bold mb-3">Support</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <Link href="#" className="hover:text-yellow-400">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-yellow-400">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-yellow-400">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/security" className="hover:text-yellow-400">
                Security
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-yellow-400">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs">
        <span>© 2024 Pujaya. All rights reserved.</span>
        <div className="flex gap-6 mt-2 md:mt-0">
          <Link href="#" className="hover:text-yellow-400">
            Terms
          </Link>
          <Link href="#" className="hover:text-yellow-400">
            Privacy
          </Link>
          <Link href="#" className="hover:text-yellow-400">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
// Footer
