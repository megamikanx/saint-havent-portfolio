import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-col items-center">
      <Link href="/" className="py-6 text-center leading-none">
        <span className="block text-4xl tracking-wide">SAINT</span>
        <span className="block text-4xl tracking-wide">HAVEN&apos;T</span>
      </Link>

      <nav className="flex w-full justify-center gap-16 border-y py-3 text-2xl">
        <Link href="/about">About</Link>
        <div className="group relative">
          <button type="button" className="cursor-default">
            Works
          </button>

          <div className="invisible absolute left-1/2 top-full z-10 -translate-x-1/2 pt-[13px] opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            <ul className="flex flex-col gap-2 whitespace-nowrap border bg-background px-6 py-4 text-xl">
              <li>
                <Link href="/works/photoshoots" className="hover:underline">
                  Photoshoots
                </Link>
              </li>
              <li>
                <Link href="/works/sound-design" className="hover:underline">
                  Sound Design
                </Link>
              </li>
              <li>
                <Link href="/works/band" className="hover:underline">
                  Band
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}