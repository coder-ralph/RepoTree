const Footer = () => {
    return (
      <footer className="w-full bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} RepoTree. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };
  
export default Footer;
