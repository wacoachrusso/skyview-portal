export function Footer() {
  return (
    <footer className="relative bg-footer-gradient text-gray-400 py-12 px-4">
      <div className="absolute inset-0 bg-glow-gradient opacity-10" />
      <div className="container mx-auto relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4 text-white">SkyGuide</h3>
            <p className="text-sm">
              Your trusted companion for contract interpretation.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-white">About Us</h3>
            <div className="text-sm space-y-4">
              <p>
                SkyGuide was founded by Mike Russo and his wife, Yorlenny, to help aviation professionals navigate their union contracts with clarity and ease. With Mike's experience as a long-time flight attendant and union member, SkyGuide was created to address the frustrations of accessing accurate information when it's needed most.
              </p>
              <p>
                Our mission is simple: to empower flight attendants and pilots by making complex workplace agreements easier to understand, so you can focus on your career with confidence.
              </p>
              <p className="font-semibold">
                SkyGuide: Built by aviation professionals, for aviation professionals.
              </p>
            </div>
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