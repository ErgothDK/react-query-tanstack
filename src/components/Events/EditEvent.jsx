import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id: idEvent } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: idEvent }],
    queryFn: ({ signal, queryKey }) => fetchEvent({ signal, ...queryKey[1] }),
  });

  const {
    mutate,
    isPending: updateIsPending,
    isError: updateHasError,
    error: updateError,
  } = useMutation({
    mutationFn: updateEvent,
    onMutate: (data) => {
      const newEvent = data.event;
      queryClient.cancelQueries({ queryKey: ["events", { id: idEvent }] });
      const oldEvent = queryClient.getQueryData(["events", { id: idEvent }]);
      queryClient.setQueryData(["events", { id: idEvent }], newEvent);

      return { oldEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", { id: idEvent }], context.oldEvent);
    },
    onSettled: (data, context) => {
      queryClient.invalidateQueries(["events", { id: idEvent }]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: idEvent, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  return (
    <Modal onClose={handleClose}>
      {isPending && (
        <div className="center">
          <LoadingIndicator />
        </div>
      )}
      {isError && (
        <div className="form-actions">
          <ErrorBlock
            title="Failed loading the event details"
            message={
              error.info ? error.message : "Failed to load the event details"
            }
          />
        </div>
      )}
      {data && (
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      )}
    </Modal>
  );
}
