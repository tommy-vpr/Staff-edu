import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Check, SquarePen } from "lucide-react";
import Link from "next/link";

const Dashboard = async () => {
  const session = await getServerSession(authOptions);

  const firstName = session?.user.name?.split(" ")[0]; // Get the first name

  return (
    <div>
      <h3 className="text-3xl font-semibold uppercase mb-8">
        Welcome, {firstName || session?.user.name}!
      </h3>
      <div className="flex gap-8">
        <div className="w-1/2 rounded-lg overflow-hidden">
          <video autoPlay muted loop className="w-full h-auto">
            <source
              src="https://cdn.shopify.com/videos/c/o/v/d8a05164335a4c9d8ec5a5ac6bd5fe0b.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div>
          <h3 className="font-semibold uppercase text-3xl mb-2 text-green-400">
            Budtender Perks
          </h3>
          <ul className="space-y-2 text-sm mb-4">
            <li className="flex gap-1">
              <Check size={14} />
              Exclusive Discounts or Promotions
            </li>
            <li className="flex gap-1">
              <Check size={14} />
              Access to Exclusive Content
            </li>
            <li className="flex gap-1">
              <Check size={14} />
              Early Access
            </li>
            <li className="flex gap-1">
              <Check size={14} />
              Community Perks
            </li>
          </ul>
          <Link
            href="https://itslitto.com/"
            className="bg-green-400 text-[#333] font-semibold text-sm py-2 px-4 rounded-sm hover:bg-green-500"
          >
            Check out our website
          </Link>
        </div>
      </div>
      <div className="mt-12">
        <h3 className="font-semibold uppercase text-lg mb-2">
          Feeling Confident? Take a Test
        </h3>
        <div className="flex gap-4">
          <div className="bg-[#333] p-4 rounded-sm flex items-center gap-2">
            <SquarePen size={14} />
            Hemp Test
          </div>
          <div className="bg-[#333] p-4 rounded-sm flex items-center gap-2">
            <SquarePen size={14} />
            Cannabis Test
          </div>
          <div className="bg-[#333] p-4 rounded-sm flex items-center gap-2">
            <SquarePen size={14} />
            Strains Test
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
