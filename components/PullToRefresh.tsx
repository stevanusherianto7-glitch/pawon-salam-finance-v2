import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void> | void;
    threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
    children,
    onRefresh,
    threshold = 80
}) => {
    const [startY, setStartY] = useState(0);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isPulling, setIsPulling] = useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        // Only enable pull to refresh if we are at the top of the scroll container
        // We need to check the parent's scrollTop because this component wraps the content
        // The parent is the one with overflow-y-auto
        const parent = contentRef.current?.parentElement;
        if (parent && parent.scrollTop === 0) {
            setStartY(e.touches[0].clientY);
            setIsPulling(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0) {
            // Apply resistance
            const resistance = 0.4;
            setPullDistance(diff * resistance);

            // Prevent default browser refresh if we are pulling
            if (diff > 5) {
                // e.preventDefault(); // Note: This might need passive: false listener if we want to prevent default
            }
        }
    };

    const handleTouchEnd = async () => {
        if (!isPulling || isRefreshing) return;

        setIsPulling(false);

        if (pullDistance > threshold) {
            setIsRefreshing(true);
            setPullDistance(50); // Snap to loading position

            // Haptic feedback if available (simulated)
            if (navigator.vibrate) navigator.vibrate(50);

            try {
                await onRefresh();
            } finally {
                // Reset after refresh
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                }, 500);
            }
        } else {
            setPullDistance(0);
        }
    };

    // Add CSS transition only when releasing, not when dragging
    const transitionStyle = isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    return (
        <div
            ref={contentRef}
            className="relative min-h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Loading Indicator */}
            <div
                className="absolute top-0 left-0 w-full flex justify-center items-center pointer-events-none z-10"
                style={{
                    height: `${threshold}px`,
                    transform: `translateY(${pullDistance - threshold}px)`,
                    transition: transitionStyle,
                    opacity: Math.min(pullDistance / threshold, 1)
                }}
            >
                <div className={`bg-white p-2 rounded-full shadow-md border border-orange-100 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 2}deg)` }}>
                    <Loader2 className="text-orange-500" size={24} />
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: transitionStyle
                }}
            >
                {children}
            </div>
        </div>
    );
};
