import React from "react";
import Loading from "../../components/loading/loading.js";
import Navbar from "../../components/navbar/navbar.js";
import Talk from "../../components/talk/talk.js";
import { useAppContext } from "../../context";

import style from "./talks_page.module.css";

const talks_url = "http://localhost:5555/talks";

function TalksPage() {
  const [talks, setTalks] = React.useState([]);
  const { setShowNewTalkModal } = useAppContext();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    const pollTalks = async () => {
      setLoading(true);
      let etag = undefined;
      while (true) {
        let response = null;
        try {
          response = await fetch(talks_url, {
            signal,
            credentials: "include",
            headers: etag
              ? { "If-None-Match": `"${etag}"`, Prefer: "wait=100" }
              : {},
          });
          if (response.status >= 400) {
            if (response.status === 403) {
              window.location = "/join";
            }
            throw new Error("fetch error");
          }
        } catch (error) {
          await new Promise((resolve) => setTimeout(() => resolve, 10000));
          continue;
        }
        if (response.status === 304) continue;
        // setEtagHeader(response.headers.get("etag"));
        etag = response.headers.get("etag");
        setTalks(await response.json());
        setLoading(false);
      }
    };
    pollTalks();
    return () => {
      abortController.abort();
    };
  }, []);

  if (loading) return <Loading />;
  return (
    <>
      <Navbar />
      <main className={style.talks_container}>
        <div className={style.title}>
          <h1>talks</h1>
          <button onClick={() => setShowNewTalkModal(true)}>new talk</button>
        </div>
        {talks.length > 0 ? (
          <section className={style.talks}>
            {talks.map((talk, index) => {
              return <Talk key={index} talk={talk} />;
            })}
          </section>
        ) : (
          <h1>no talks to show </h1>
        )}
      </main>
    </>
  );
}

export default TalksPage;
