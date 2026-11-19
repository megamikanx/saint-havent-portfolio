import Image from "next/image";
import { getHomePage, imageUrl } from "@/sanity/client";

const HERO_SLOTS = [
  { className: "h-[420px] w-[360px]", width: 720 },
  { className: "h-[340px] w-[280px]", width: 560 },
];

export default async function Home() {
  const home = await getHomePage();

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex justify-center gap-6 px-8 py-10">
        {HERO_SLOTS.map((slot, i) => {
          const image = home.heroImages?.[i];
          return (
            <div key={i} className={`relative border ${slot.className}`}>
              <Image
                src={imageUrl(image, slot.width)}
                alt={image?.alt ?? ""}
                fill
                sizes={`${slot.width / 2}px`}
                className="object-cover"
                preload
              />
            </div>
          );
        })}
      </section>

      <p className="mx-auto max-w-xl px-6 text-center">
        {home.bio ?? "Lorem Ipsum blah blah blah bio goes here later."}
      </p>
    </main>
  );
}
