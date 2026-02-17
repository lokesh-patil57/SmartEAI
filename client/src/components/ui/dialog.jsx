import * as React from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const DialogContext = React.createContext({});

export function Dialog({ children, open, onOpenChange }) {
    const [isOpen, setIsOpen] = React.useState(open || false);

    React.useEffect(() => {
        if (open !== undefined) setIsOpen(open);
    }, [open]);

    const handleOpenChange = (val) => {
        setIsOpen(val);
        onOpenChange?.(val);
    };

    return (
        <DialogContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
}

export function DialogTrigger({ asChild, children, ...props }) {
    const { setIsOpen } = React.useContext(DialogContext);
    const child = asChild && React.Children.count(children) === 1 ? React.Children.only(children) : children;

    const handleClick = (e) => {
        // If it's a child element (asChild=true), call its original onClick too
        if (asChild && React.isValidElement(child) && child.props.onClick) {
            child.props.onClick(e);
        }
        setIsOpen(true);
    };

    if (asChild && React.isValidElement(child)) {
        return React.cloneElement(child, { onClick: handleClick, ...props });
    }

    return (
        <button onClick={handleClick} {...props}>
            {children}
        </button>
    );
}

export function DialogContent({ children, className = "" }) {
    const { isOpen, setIsOpen } = React.useContext(DialogContext);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setIsOpen(false)}
            />
            {/* Content */}
            <div className={twMerge(clsx(
                "relative z-50 grid w-full max-w-lg gap-4 bg-white p-6 shadow-lg sm:rounded-lg animate-in zoom-in-95 duration-200",
                className
            ))}>
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    );
}

export function DialogHeader({ children, className = "" }) {
    return <div className={twMerge(clsx("flex flex-col space-y-1.5 text-center sm:text-left", className))}>{children}</div>
}

export function DialogFooter({ children, className = "" }) {
    return <div className={twMerge(clsx("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className))}>{children}</div>
}

export function DialogTitle({ children, className = "" }) {
    return <h2 className={twMerge(clsx("text-lg font-semibold leading-none tracking-tight", className))}>{children}</h2>
}

export function DialogDescription({ children, className = "" }) {
    return <div className={twMerge(clsx("text-sm text-slate-500", className))}>{children}</div>
}
