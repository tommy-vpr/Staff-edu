"use client";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Image from "next/image";
import Link from "next/link";

const heroSliders = [
  {
    title: "Zooted",
    description: `Prepare to get Zooted with our newest blend! Made with a potent formulation of botanical extracts, and coming with six brand new blends, getting Zooted has never been easier!`,
    imageUrl: "/images/slider-zooted.webp",
    url: "https://itslitto.com/pages/hemp?strain=zooted",
  },
  {
    title: "Edibles",
    description: `Experience fast-acting chill with our new LITTO Bites, crafted with nano-technology. 
              Available in Green Apple Yuzu, Pink Lemonade, Baja Blast, Blood Orange, and Strawberry 
              Banana, in both 1-pack and 10-pack options!`,
    imageUrl: "/images/slider-edibles.webp",
    url: "https://itslitto.com/pages/cannabis?state=california&strain=edible",
  },
  {
    title: "Smacked",
    description: `Get blown away by our SMACKED All-In-One Devices, packed with potent botanical extracts. With seven premium blends, these devices are perfect for enthusiasts looking for a powerful experience.`,
    imageUrl: "/images/slider-smacked.webp",
    url: "https://itslitto.com/pages/hemp?strain=smacked",
  },
];

export default () => {
  return (
    <div className="w-full px-1 lg:px-12 bg-gray-100">
      <Swiper
        // install Swiper modules
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        loop
        pagination={{ clickable: true }}
      >
        {heroSliders.map((slider) => (
          <SwiperSlide key={slider.title} className="w-full">
            <div className="p-8 max-w-[1000px] m-auto flex-col-reverse lg:flex-row flex items-center gap-8">
              <div className="w-full lg:w-1/2">
                <h3 className="text-5xl bebasNeue">{slider.title}</h3>
                <p className="mb-6">{slider.description}</p>
                <Link
                  className="rounded-full w-fit px-4 py-3 bg-[#72bf49] text-white 
                uppercase text-xs xl:text-sm hover:brightness-105 duration-150"
                  href={slider.url}
                >
                  Shop now
                </Link>
              </div>
              <div className="w-1/2flex justify-center">
                <Image
                  src={slider.imageUrl}
                  alt={slider.title}
                  height={100}
                  width={600}
                  objectFit="cover"
                  objectPosition="center"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
