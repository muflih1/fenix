import {
  DialogTrigger,
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
  Dialog as AriaDialog,
  Heading,
  type DialogProps,
} from 'react-aria-components';
import {cn, composeTailwindRenderProps} from '../lib/utils';
import type React from 'react';
import {Button} from './Button';
import {IconXFilled} from '@tabler/icons-react';

function DialogOverlay({className, ...props}: ModalOverlayProps) {
  return (
    <ModalOverlay
      className={composeTailwindRenderProps(
        className,
        cn(
          'absolute top-0 left-0 w-full h-(--page-height) bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs',
          'data-entering:opacity-0 data-exiting:opacity-0',
        ),
      )}
      {...props}
    />
  );
}

function Dialog({
  children,
  className,
  isDismissable = true,
  ...props
}: Omit<ModalOverlayProps, 'children'> &
  Pick<React.ComponentProps<typeof Modal>, 'isDismissable'> &
  Pick<DialogProps, 'children'>) {
  return (
    <DialogOverlay isDismissable={isDismissable} {...props}>
      <div className='sticky top-0 left-0 w-full h-(--visual-viewport-height) flex items-start justify-center box-border'>
        <Modal
          className={composeTailwindRenderProps(
            className,
            'flex flex-col w-full max-w-[min(90vw,548px)] max-h-[calc(var(--visual-viewport-height)*0.9)] rounded-b-xl bg-(--popover-background) outline-none data-entering:-translate-y-full data-exiting:-translate-y-full duration-300 ease-out transition-transform',
          )}
        >
          <AriaDialog className='flex min-h-0 flex-col outline-none'>
            {children}
          </AriaDialog>
        </Modal>
      </div>
    </DialogOverlay>
  );
}

function DialogHeader({
  title,
  withCloseButton = true,
}: {
  title: string;
  withCloseButton?: boolean;
}) {
  return (
    <div className='flex h-14 items-center w-full justify-between border-b border-solid border-b-gray-300 shrink-0 min-h-0'>
      <div className='flex grow shrink items-center justify-start ms-4'>
        <Heading slot='title' className='text-lg font-bold'>
          {title}
        </Heading>
      </div>
      <div className='size-9 mx-4'>
        {withCloseButton && (
          <Button size='icon' slot='close' variant='ghost'>
            <IconXFilled size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}

// function DialogBody() {
//   return
// }

export {DialogTrigger, DialogOverlay, Dialog, Heading, DialogHeader};
