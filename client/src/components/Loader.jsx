import React from 'react';
import { Loader as LoaderIcon } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      {/* Spinner */}
      <LoaderIcon className="w-12 h-12 text-blue-600 animate-spin" />

      {/* Text */}
      {/* <h2 className="text-xl font-semibold text-gray-800 mt-6">
        Loading...
      </h2>
      <p className="text-gray-600">
        Please wait while we fetch your data.
      </p> */}
    </div>
  );
};

export default Loader;
