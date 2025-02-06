"use client";

import React, { useEffect } from "react";

const Page = () => {
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "https://form.jotform.com/jsform/240235016160037";
  //   script.async = true;
  //   document.body.appendChild(script);

  //   return () => {
  //     document.body.removeChild(script); // Cleanup script on unmount
  //   };
  // }, []);

  return (
    <div className="lg:m-auto w-full lg:w-[600px] p-4 lg:p-6 rounded-lg shadow-lg">
      <h3 className="text-center text-4xl lg:text-5xl mt-4 lg:mt-6 mb-8">
        Contact Us
      </h3>

      <iframe
        src="https://form.jotform.com/240235016160037"
        width="100%"
        height="600px"
        title="JotForm"
        className="h-screen lg:h-[50vh] border rounded-lg shadow-md"
      ></iframe>
    </div>
  );
};

export default Page;
