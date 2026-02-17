import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function Label({ className, ...props }) {
    return (
        <label
            className={twMerge(clsx(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            ))}
            {...props}
        />
    )
}
