import { Link, Outlet, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, deleteEvent, queryClient } from "../../util/http";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";

export default function EventDetails() {
  const IMAGE_BASE_URL = "http://localhost:3000/";
  const navigate = useNavigate();
  const { id: idEvent } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: idEvent }],
    queryFn: ({ signal }) => fetchEvent({ id: idEvent, signal }),
  });

  const setIsDeletingHandler = (isDeleting) => setIsDeleting(isDeleting);

  const {
    mutate,
    isPending: deleteIsPending,
    isError: deleteHasError,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const deleteHandler = () => {
    mutate({
      id: idEvent,
    });
  };

  return (
    <>
      {isDeleting && (
        <Modal onClose={() => setIsDeletingHandler(false)}>
          <h2>Are you sure?</h2>
          <p>Do you want to delete this event?</p>
          <div className="form-actions">
            {deleteIsPending && <p>Deleting the event...</p>}
            {!deleteIsPending && (
              <>
                <button
                  className="button-text"
                  onClick={() => setIsDeletingHandler(false)}
                >
                  Cancel
                </button>
                <button className="button" onClick={deleteHandler}>
                  Confirm
                </button>
              </>
            )}
          </div>
          {deleteHasError && (
            <ErrorBlock
              title="Failed to delete event"
              message={
                deleteError.info
                  ? deleteError.message
                  : "Failed to delete the event"
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && (
        <div id="event-details-content" className="center">
          <LoadingIndicator />
        </div>
      )}
      {isError && (
        <div id="event-details-content" className="center">
          <ErrorBlock
            title="Failed loading the event"
            message={error.info ? error.message : "Failed to load the events"}
          />
        </div>
      )}
      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={() => setIsDeletingHandler(true)}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={IMAGE_BASE_URL + data.image} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {new Date(data.date).toLocaleDateString("en-Us", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {data.time}
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
