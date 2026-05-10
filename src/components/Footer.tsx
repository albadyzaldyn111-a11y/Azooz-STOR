import { Link } from "react-router";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-lg">AZOOZ STORE</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your premium destination for discovering and downloading top-quality digital applications.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Discover</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/apps" className="hover:text-foreground transition-colors">All Apps</Link></li>
              <li><Link to="/apps?featured=true" className="hover:text-foreground transition-colors">Featured</Link></li>
              <li><Link to="/apps?trending=true" className="hover:text-foreground transition-colors">Trending</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/downloads" className="hover:text-foreground transition-colors">Downloads</Link></li>
              <li><Link to="/favorites" className="hover:text-foreground transition-colors">Favorites</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AZOOZ STORE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
