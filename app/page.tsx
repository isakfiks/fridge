
export default function Home() {
  return (
    <div className="bg-[#FFF1CA] grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-1 items-center sm:items-start">
        <header className="items-center justify-center flex">
        <h1 className="mt-8 text-black text-xl mr-2">Fridge</h1>
        <h1 className="mt-8 text-black text-xl mr-2 ">|</h1>
        <h1 className="mt-8 text-black text-xl font-bold">Global</h1>

        <button className="ml-4 bg-[#FFB823] mt-8 p-2 text-black rounded-xl">New Post</button>
        </header>

        <div className="flex">
        <button className="rounded-lg text-black bg-[#FFB823] p-8 mr-4">
          <p className="text-lg font-semibold">
          Some catchy post title
          </p>
          <p>Post description bla bla bla..</p>
        </button>

        <button id="post1" className="rounded-lg text-black bg-[#FFB823] p-8 mr-4">
          <p className="text-lg font-semibold">
          Some catchy post title
          </p>
          <p>Post description bla bla bla..</p>
        </button>

        <button id="post2" className="rounded-lg text-black bg-[#FFB823] p-8 mr-4">
          <p className="text-lg font-semibold">
          Some catchy post title
          </p>
          <p>Post description bla bla bla..</p>
        </button>

        <button id="post3" className="rounded-lg text-black bg-[#FFB823] p-8 mr-4">
          <p className="text-lg font-semibold">
          Some catchy post title
          </p>
          <p>Post description bla bla bla..</p>
        </button>
        </div>
        </main>
    </div>
  );
}
