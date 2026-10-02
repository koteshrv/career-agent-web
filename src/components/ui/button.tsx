import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-background hover:opacity-90',
        secondary: 'bg-card text-foreground border border-line-strong hover:bg-muted',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        danger: 'text-destructive border border-line-strong hover:bg-destructive/10',
        link: 'text-foreground underline underline-offset-4 decoration-line-strong hover:decoration-foreground px-0 h-auto rounded-none',
      },
      size: {
        sm: 'h-9 px-4 text-sm [&_svg]:size-4',
        md: 'h-10 px-5 text-base [&_svg]:size-4',
        lg: 'h-11 px-6 text-base [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, type, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} type={asChild ? undefined : type ?? 'button'} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
