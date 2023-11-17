import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingIndicator from "../UI/LoadingIndicator";
import EventItem from "./EventItem";
import ErrorBlock from "../UI/ErrorBlock";
import { fetchEvents } from "../../util/http";

export default function FindEventSection() {
  const searchElement = useRef();
  const [search, setSearch] = useState();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", { search: search }],
    queryFn: ({ signal }) => fetchEvents({ signal, search }),
    enabled: search !== undefined,
  });

  let content = <p>Please enter a search term and to find events.</p>;

  if (isLoading) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info ? error.message : "Failed to load the events"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSearch(searchElement.current.value);
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
