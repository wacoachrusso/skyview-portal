export function Footer() {
  return (
    <footer className="bg-[#1A1F2C] text-gray-400 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4 text-white">SkyGuide</h3>
            <p className="text-sm">
              Your trusted companion for contract interpretation.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-white">Connect</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center text-sm">
          © 2024 SkyGuide. All rights reserved.
        </div>
      </div>
    </footer>
  );
}