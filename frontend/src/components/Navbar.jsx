import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

const Navbar = ({ user, onReset }) => {
  const navigate = useNavigate();

  const handleReset = () => {
    onReset();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textSecondary cursor-pointer"
              onClick={() => navigate("/")}
            >
              GRE Engine
            </span>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <span className="text-sm font-medium text-textPrimary hidden sm:block">
                  {user.name}
                </span>
              </div>
              <Button
                variant="ghost"
                className="!px-3 !py-1.5 text-sm"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
