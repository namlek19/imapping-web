import Image from "next/image";
import Link from "next/link";
import type { LocationItem } from "@/app/api/v1/locations/data";

interface LocationCardProps {
  location: LocationItem;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <Link href={`/locations/${location.locationId}`} className="group block bg-surface rounded-3xl border border-slate-200/50 shadow-sm shadow-slate-300/40 overflow-hidden hover:-translate-y-1 hover:shadow-md hover:shadow-slate-300/50 transition-all duration-300">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {location.imageUrl ? (
          <Image
            src={location.imageUrl}
            alt={location.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10">
              <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center gap-1 text-xs font-semibold text-[#FF7F50]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.31-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.387 1.445-.99 2.274-1.813C15.302 15.125 17 12.745 17 9A7 7 0 103 9c0 3.745 1.698 6.125 3.352 7.536.83.823 1.654 1.426 2.274 1.813.311.193.571.337.757.433a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
          </svg>
          <span>{location.address}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-[#008080] transition-colors duration-200">
          {location.name}
        </h3>

        <p className="text-sm font-normal text-secondary leading-relaxed line-clamp-2">
          {location.description}
        </p>
      </div>
    </Link>
  );
}
