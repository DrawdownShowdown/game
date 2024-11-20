// ui.alert.tsx
/**
 * @group UI Components
 * @description Alert component system with variants for different states
 * 
 * @example Basic Usage
 * ```tsx
 * <Alert variant="default">
 *   <AlertTitle>Title</AlertTitle>
 *   <AlertDescription>Description</AlertDescription>
 * </Alert>
 * ```
 * 
 * @component Alert - Main container component
 * @component AlertTitle - Alert heading component
 * @component AlertDescription - Alert content component
 * 
 * @relatedComponents
 * - ui.dialog.tsx - For modal dialogs
 * - ui.toast.tsx - For temporary notifications
 * 
 * @visualStructure
 * Alert
 * ├── [Icon] (optional)
 * ├── AlertTitle
 * └── AlertDescription
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, X } from "lucide-react"
import { cn } from "./utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: "border-green-500/50 bg-green-50 text-green-700 [&>svg]:text-green-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & {
    onClose?: () => void;
    icon?: React.ReactNode;
  }
>(({ className, variant, children, onClose, icon, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    {icon && <span className="mr-4">{icon}</span>}
    <div className={cn(
      "flex items-center justify-between",
      onClose ? "pr-8" : ""
    )}>
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 p-1 rounded-full hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

const SuccessAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onClose?: () => void;
  }
>(({ children, className, onClose, ...props }, ref) => (
  <Alert
    ref={ref}
    variant="success"
    className={className}
    onClose={onClose}
    icon={<CheckCircle2 className="h-4 w-4" />}
    {...props}
  >
    {children}
  </Alert>
))
SuccessAlert.displayName = "SuccessAlert"

const ErrorAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onClose?: () => void;
  }
>(({ children, className, onClose, ...props }, ref) => (
  <Alert
    ref={ref}
    variant="destructive"
    className={className}
    onClose={onClose}
    icon={<AlertCircle className="h-4 w-4" />}
    {...props}
  >
    {children}
  </Alert>
))
ErrorAlert.displayName = "ErrorAlert"

export {
  Alert,
  AlertTitle,
  AlertDescription,
  SuccessAlert,
  ErrorAlert
}