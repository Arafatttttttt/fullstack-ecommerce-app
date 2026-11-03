import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-amazon-darker text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-white mb-4">Get to Know Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white hover:underline">Careers</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline">About Us</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline">Investor Relations</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Make Money with Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white hover:underline">Sell products</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline">Become an Affiliate</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Let Us Help You</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/orders" className="hover:text-white hover:underline">Your Orders</Link></li>
              <li><Link to="/profile" className="hover:text-white hover:underline">Your Account</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline">Shipping Rates & Policies</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline">Returns & Replacements</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Connect with Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white hover:underline">Facebook</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline">Twitter</Link></li>
              <li><Link to="#" className="hover:text-white hover:underline">Instagram</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 text-center text-sm">
          <p>&copy; 2024 Amazon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
