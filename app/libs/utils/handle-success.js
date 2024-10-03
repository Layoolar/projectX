import { notifications } from '@mantine/notifications';

export function handleSuccess(prompt) {
  const data = prompt;

  notifications.show({
    title: 'Success',
    variant: 'success',
    message: data ? (
      <pre className='whitespace-pre-line'>{data?.message}</pre>
    ) : null,
    color: 'green',
  });
}
