import React from "react";

const MobileBottomNav = ({ activePage, setPage, navItems }) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-dark border-t-2 border-orange-500 flex justify-around items-center h-24 lg:hidden z-1000"
      style={{ direction: "rtl" }}
    >
      {navItems.map(({ name, page, Icon }) => (
        <button
          key={page}
          onClick={() => setPage(page)}
          className={`flex flex-col items-center justify-center text-xs font-semibold transition-colors ${
            activePage === page ? "text-orange-500" : "text-gray-400"
          }`}
          aria-label={name}
          title={name}
        >
          {Icon && (
            <Icon
              className={`w-8 h-8 mb-1 ${
                activePage === page ? "text-orange-500" : "text-gray-500"
              }`}
            />
          )}
          {name}
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
