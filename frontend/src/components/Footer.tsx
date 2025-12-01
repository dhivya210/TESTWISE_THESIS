import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';
import { Logo } from '@/components/Logo';

export const Footer = () => {
  return (
    <footer 
      className="text-white mt-auto relative z-10"
      style={{
        background: 'rgba(161, 143, 255, 0.3)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <Logo size="sm" orientation="horizontal" variant="light" />
            <p 
              className="text-sm"
              style={{
                color: '#2E1869',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 300,
              }}
            >
              AI-powered decision support for test automation tool selection.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 
              className="font-semibold text-lg"
              style={{
                color: '#2E1869',
                fontFamily: "'Manrope', 'Space Grotesk', 'Inter', sans-serif",
                fontWeight: 700,
              }}
            >
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/questionnaire" 
                  className="transition-colors"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 300,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Start Evaluation
                </Link>
              </li>
              <li>
                <Link 
                  to="/comparison" 
                  className="transition-colors"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 300,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Tool Comparison
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 
              className="font-semibold text-lg"
              style={{
                color: '#2E1869',
                fontFamily: "'Manrope', 'Space Grotesk', 'Inter', sans-serif",
                fontWeight: 700,
              }}
            >
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/resources" 
                  className="transition-colors"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 300,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="transition-colors"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 300,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 
              className="font-semibold text-lg"
              style={{
                color: '#2E1869',
                fontFamily: "'Manrope', 'Space Grotesk', 'Inter', sans-serif",
                fontWeight: 700,
              }}
            >
              Connect
            </h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-colors"
                style={{
                  color: '#2E1869',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-colors"
                style={{
                  color: '#2E1869',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="mailto:support@testwise.com" 
                className="transition-colors"
                style={{
                  color: '#2E1869',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section with Copyright */}
        <div className="mt-8 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-center items-center">
          <p 
            className="text-sm text-center"
            style={{
              color: '#2E1869',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 300,
              opacity: 0.8,
            }}
          >
            &copy; 2025 TestWise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
