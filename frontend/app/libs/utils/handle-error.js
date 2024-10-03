import { notifications } from "@mantine/notifications";

export function handleError(prompt) {
  const error = prompt?.response?.data?.error?.message;
  const statusMessage = prompt?.response?.data?.statusMessage;
  notifications.show({
    title: "Error",
    variant: "error",
    message: prompt ? (
      <pre className="whitespace-pre-line">{error || statusMessage}</pre>
    ) : null,
    color: "red",
  });
}
