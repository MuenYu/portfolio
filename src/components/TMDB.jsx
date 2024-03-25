import { useEffect, useState } from "react";
import tmdb from "@/api/tmdb";
import Card from "@/components/Card";

function TMDB({ list, secret, className }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState(0); // 0: loading, 1: success, 2: failed

  useEffect(() => {
    tmdb(list, secret)
      .then((data) => {
        setState(1);
        setData(data);
      })
      .catch((e) => {
        setState(-1);
        setData(e.message);
      });
  }, [state]);

  let content = <span className="loading loading-spinner text-neutral"></span>;
  if (state === 1) {
    content = data.items.map((item, index) => {
      return (
        <Card
          key={index}
          className="col-span-full md:col-span-6 lg:col-span-3"
          img={item.poster}
          title={item.name}
          link={item.link}
        />
      );
    });
  } else if (state === -1) {
    content = <p>{data}</p>;
  }

  return (
    <div
      className={`mt-5 w-full grid grid-cols-12 min-h-40 gap-3 ${className}`}
    >
      {content}
    </div>
  );
}

export default TMDB;