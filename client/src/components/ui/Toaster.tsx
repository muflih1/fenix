import {scheduleNormalPriCallback} from '@/utils/jsscheduler';
import {
  UNSTABLE_Toast as ToastPrimitive,
  UNSTABLE_ToastRegion as ToastRegionPrimitive,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastContent as ToastContentPrimitive,
} from 'react-aria-components/Toast';

export const queue = new ToastQueue<{message: string}>({
  maxVisibleToasts: 1,
  wrapUpdate(fn) {
    scheduleNormalPriCallback(() => fn());
  },
});

export function ToasterRegion() {
  return (
    <ToastRegionPrimitive
      queue={queue}
      className='fixed bottom-4 flex flex-col'
    >
      {({toast}) => (
        <ToastPrimitive
          toast={toast}
          style={{viewTransitionName: toast.key}}
          className='flex items-center gap-4 bg-blue-600 px-4 py-3 rounded-lg outline-none forced-colors:outline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 font-sans w-57.5 
      [view-transition-name:toast]'
        >
          <ToastContentPrimitive>
            <p>{toast.content.message}</p>
          </ToastContentPrimitive>
        </ToastPrimitive>
      )}
    </ToastRegionPrimitive>
  );
}
