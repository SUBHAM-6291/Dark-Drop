import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-black p-4 flex justify-between items-center sticky top-0 z-50 w-full">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-md flex items-center justify-center border border-gray-700">
          <span className="text-white text-xl font-bold">D</span>
        </div>
        <Link
          href="/"
          className="text-white text-xl sm:text-2xl font-semibold hover:text-gray-300 transition-colors duration-300"
        >
          Darkdrop
        </Link>
      </div>

      <div className="flex gap-4 sm:gap-6">
        <Link
          href="/signin"
          className="text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-md hover:bg-gray-800 hover:text-gray-100 transition-all duration-300 ease-in-out"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-md hover:bg-gray-800 hover:text-gray-100 transition-all duration-300 ease-in-out"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;