import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const githubLink = "https://github.com/OfentseJ/fpl-squad-craft";
  const linkedInLink =
    "https://www.linkedin.com/in/ofentse-makhutja-13b4112a2/";
  const contactEmail = "makhutjaofentse@gmail.com";

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white mt-12 py-8 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          {/* 💻 Section 1: Branding and Copyright */}
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
              FPL Squad Craft
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              &copy; {currentYear} Fantasy Football Squad Craft. All rights
              reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Data provided by FPL API.
            </p>
          </div>

          {/* 🔗 Section 2: Quick Links - Uses FooterLink */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 mb-6 md:mb-0">
            <FooterLink href="/" title="Home" />
            <FooterLink href="/planner" title="Planner" />
            <FooterLink href="/live" title="Live" />
            <FooterLink href="/trends" title="Trends" />
          </div>

          {/* 🌐 Section 3: Social Media/Contact */}
          <div className="flex items-center space-x-4">
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              aria-label="GitHub Repository"
            >
              <Github size={24} />
            </a>
            <a
              href={linkedInLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              aria-label="LinkedIn Page"
            >
              <Linkedin size={24} />
            </a>
            <a
              href={`mailto:${contactEmail}`}
              className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              aria-label="Contact Email"
            >
              <Mail size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper component for links
function FooterLink({ href, title }) {
  return (
    <Link
      to={href}
      className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
    >
      {title}
    </Link>
  );
}
