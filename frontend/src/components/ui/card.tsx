import * as React from "react"
import { cn } from "../../lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        // Light mode: glassy white, dark text. Dark mode: glassy dark, white text. Both: animated border.
        `relative rounded-xl p-6 shadow-lg backdrop-blur-md transition hover:shadow-2xl
        border border-transparent
        bg-white/90 text-gray-900
        dark:bg-[#232336]/90 dark:text-white
        before:content-[''] before:absolute before:inset-0 before:rounded-xl before:pointer-events-none
        before:border-2 before:border-transparent before:bg-gradient-to-br before:from-primary-400/40 before:via-purple-500/30 before:to-pink-400/30
        before:animate-border-glow
        `,
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

// Add border-glow animation to index.css if not present:
// @keyframes border-glow {
//   0%, 100% { filter: blur(2px) brightness(1); }
//   50% { filter: blur(4px) brightness(1.2); }
// }
// .animate-border-glow { animation: border-glow 3s ease-in-out infinite; }
export { Card }
