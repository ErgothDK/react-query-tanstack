import { Link, Outlet, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, deleteEvent, queryClient } from "../../util/http";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const IMAGE_BASE_URL = "http://localhost:3000/";
  const navigate = useNavigate();
  const { id: idEvent } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event", { id: idEvent }],
    queryFn: ({ signal }) => fetchEvent({ id: idEvent, signal }),
  });

  const {
    mutate,
    isPending: deleteIsPending,
    isError: deleteHasError,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKeys: ["events"],
      });
      navigate("/events");
    },
  });

  const deleteHandler = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      mutate({
        id: idEvent,
      });
    }
  };

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <p>Loading event info...</p>}
      {error && (
        <ErrorBlock
          title="Failed loading the event"
          message={error.info ? error.message : "Failed to load the events"}
        />
      )}
      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={deleteHandler}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={IMAGE_BASE_URL + data.image} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {data.date} {data.time}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
