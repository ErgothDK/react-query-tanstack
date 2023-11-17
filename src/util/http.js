export async function fetchEvents({ signal, search }) {
  let endpoint = "http://localhost:3000/events";
  if (search) endpoint += "?search=" + search;

  const response = await fetch(endpoint, { signal: signal });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}
