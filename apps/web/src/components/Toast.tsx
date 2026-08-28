import {
  UNSTABLE_ToastRegion as AriaToastRegion,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastContent as ToastContent,
  Text,
} from 'react-aria-components/Toast';
import {Button} from './Button';
import {IconAlertTriangleFilled, IconXFilled} from '@tabler/icons-react';
import './Toast.css';
import {flushSync} from 'react-dom';
import React, {type CSSProperties} from 'react';

// Define the type for your toast content. This interface defines the properties of your toast content, affecting what you
// pass to the queue calls as arguments.
interface MyToastContent {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

// This is a global toast queue, to be imported and called where ever you want to queue a toast via queue.add().
export const queue = new ToastQueue<MyToastContent>({
  // Wrap state updates in a CSS view transition.
  wrapUpdate(fn) {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        flushSync(fn);
      });
    } else {
      fn();
    }
  },
});

export function ToastRegion() {
  return (
    <AriaToastRegion
      queue={queue}
      className='fixed bottom-4 left-4 z-100 flex flex-col-reverse gap-2 rounded-lg outline-none'
    >
      {({toast}) => (
        <AriaToast
          className='toast flex items-center py-4 px-2.5 rounded-(--toast-corner-radius) bg-(--toast-surface) shadow-[0_4px_12px_rgba(0,0,0,.1)] border border-solid border-gray-200 w-full min-w-(--toast-container-min-width) [view-transition-class:toast]'
          toast={toast}
          style={{viewTransitionName: toast.key} as CSSProperties}
        >
          {toast.content.icon != null && (
            <div className='flex flex-col p-1.5'>{toast.content.icon}</div>
          )}
          <ToastContent className='flex grow w-full items-center'>
            <Text slot='title' className='text-sm'>
              {toast.content.title}
            </Text>
            {toast.content.description && (
              <Text slot='description'>{toast.content.description}</Text>
            )}
          </ToastContent>
          <div className='p-1.5 flex flex-col'>
            <Button
              slot='close'
              aria-label='Close'
              variant='secondary'
              size='icon-xs'
            >
              <IconXFilled size={16} />
            </Button>
          </div>
        </AriaToast>
      )}
    </AriaToastRegion>
  );
}

export function pushSimpleToast(
  {icon, message}: {icon?: React.ReactNode; message: string},
  duration = 2750,
) {
  queue.add({title: message, icon}, {timeout: duration});
}

export function pushErrorToast({message}: {message: string}) {
  pushSimpleToast({
    message,
    icon: (
      <IconAlertTriangleFilled
        size={20}
        fill='currentColor'
        className='text-(--warning)'
      />
    ),
  });
}
