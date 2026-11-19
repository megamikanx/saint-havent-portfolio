export default function Contact() {
  return (
    <main className="px-8 py-10">
      <h1 className="mb-8 text-5xl">Contact</h1>

      <form className="mx-auto flex max-w-3xl flex-col gap-4">
        <label>
          <span className="sr-only">Name</span>
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            className="w-full border px-3 py-2"
          />
        </label>

        <label>
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full border px-3 py-2"
          />
        </label>

        <label>
          <span className="sr-only">Subject</span>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            className="w-full border px-3 py-2"
          />
        </label>

        <label>
          <span className="sr-only">Message</span>
          <textarea
            name="message"
            placeholder="Message"
            required
            rows={8}
            className="w-full border px-3 py-2"
          />
        </label>

        <button type="submit" className="mx-auto border px-6 py-2">
          Submit
        </button>
      </form>
    </main>
  );
}