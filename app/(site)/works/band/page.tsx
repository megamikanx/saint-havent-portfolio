const TRACKS = [
  {
    id: "398471673",
    title: "Looking For Love",
    url: "https://fujideathcult.bandcamp.com/track/looking-for-love",
  },
  {
    id: "4063750984",
    title: "Youth Service (demo)",
    url: "https://fujideathcult.bandcamp.com/track/youth-service-demo",
  },
];

export default function Band() {
  return (
    <main className="px-8 py-10">
      <h1 className="mb-10 text-4xl">Band</h1>

      <div className="flex flex-wrap justify-center gap-10">
        {TRACKS.map((track) => (
          <iframe
            key={track.id}
            title={`${track.title} by FUJIDEATHCULT`}
            src={`https://bandcamp.com/EmbeddedPlayer/track=${track.id}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/transparent=true/`}
            loading="lazy"
            className="h-[442px] w-[350px] max-w-full border-0"
          >
            <a href={track.url}>{track.title} by FUJIDEATHCULT</a>
          </iframe>
        ))}
      </div>
    </main>
  );
}
