import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-12 border-t border-surface-variant bg-surface-container-lowest">
      <div className="max-w-container-max mx-auto px-4 md:px-gutter flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body-md text-text-light">
          &copy; {new Date().getFullYear()} Reliable Craftsman. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="https://github.com/VictorOduorKe" className="font-label-md text-text-light hover:text-primary transition-colors">GitHub</a>
          <a href="https://www.linkedin.com/in/victor-oduor-ke" className="font-label-md text-text-light hover:text-primary transition-colors">LinkedIn</a>
          <Link to="/admin" className="font-label-md text-text-light hover:text-primary transition-colors">
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
