import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-2xl font-bold mb-4">Repo<span className="text-blue-600">Tree</span></h4>
            <p className="text-gray-400">Simplify your GitHub repository visualization</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="#about" className="hover:text-blue-400 transition-colors">About</Link></li>
              <li><Link href="#faq" className="hover:text-blue-400 transition-colors">FAQs</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-4">Connect With Us</h5>
            <div className="flex space-x-4">
              <a href="https://github.com/coder-ralph" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-blue-400 transition-colors">
                <Github className="h-6 w-6" />
              </a>
              <a href="https://x.com/coderralph" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-blue-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://www.linkedin.com/in/ralphrosael/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-400 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} RepoTree. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
