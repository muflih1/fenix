import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {cn, composeRenderProps} from '../lib/utils';
import {Button} from './Button';
import {IconXFilled, type ReactNode} from '@tabler/icons-react';

export function DialogRoot(props: BaseDialog.Root.Props) {
  return <BaseDialog.Root {...props} />;
}

export function DialogTrigger(props: BaseDialog.Trigger.Props) {
  return <BaseDialog.Trigger {...props} />;
}

export function Dialog({
  className,
  children,
  ...props
}: BaseDialog.Popup.Props) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className='fixed inset-0 isolate z-50 bg-black/10 duration-100 motion-reduce:duration-1 supports-backdrop-filter:backdrop-blur-xs data-starting-style:opacity-0 data-ending-style:opacity-0' />
      <div className='fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-start'>
        <BaseDialog.Popup
          className={composeRenderProps(className, className =>
            cn(
              'flex flex-col top-[calc(0.25rem*var(--nested-dialogs))] scale-[calc(1-0.1*var(--nested-dialogs))] w-full max-w-[min(90vw,548px)] max-h-[90vh] rounded-b-xl bg-(--popover-background) outline-none duration-500 motion-reduce:duration-1 data-starting-style:opacity-0 data-starting-style:-translate-y-full data-ending-style:opacity-0 data-ending-style:-translate-y-full',
              className,
            ),
          )}
          {...props}
        >
          {children}
        </BaseDialog.Popup>
      </div>
    </BaseDialog.Portal>
  );
}

export function DialogHeader({
  text,
  withCloseButton = true,
}: {
  text?: string;
  withCloseButton?: boolean;
}) {
  return (
    <div className='flex h-14 items-center w-full justify-between border-b border-solid border-b-gray-300 shrink-0 min-h-0'>
      <div className='flex grow shrink items-center justify-start ms-4'>
        {text != null && (
          <BaseDialog.Title className='text-lg font-bold'>
            {text}
          </BaseDialog.Title>
        )}
      </div>
      <div className='size-9 mx-4'>
        {withCloseButton && (
          <BaseDialog.Close
            render={
              <Button size='icon' variant='ghost'>
                <IconXFilled size={20} />
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}

export function DialogClose(props: BaseDialog.Close.Props) {
  return <BaseDialog.Close {...props} />;
}

interface DialogConfirmationFooterProps {
  primary: Button.Props & {label?: ReactNode};
  secondary: Button.Props & {label?: ReactNode};
}

export function DialogConfirmationFooter({
  secondary,
  primary,
}: DialogConfirmationFooterProps) {
  return (
    <div className='p-4 flex flex-row-reverse items-stretch gap-x-2 shrink-0'>
      <Button padding='wide' {...primary}>
        {primary?.label ?? primary.children}
      </Button>
      <DialogClose
        render={
          <Button
            type={secondary.type ?? 'button'}
            variant={'secondary'}
            {...secondary}
          >
            {secondary.label ?? secondary.children}
          </Button>
        }
      />
    </div>
  );
}
