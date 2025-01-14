// pages/404.tsx

import Link from "next/link";
import React from "react";

const Custom404: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">
        The page you&apos;re looking for does not exist.
      </p>
    </div>
  );
};

export default Custom404;
