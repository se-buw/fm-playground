import React, { useState, useRef, useCallback, useEffect } from 'react';
import './ResizableSplitter.css';

interface ResizableSplitterProps {
    leftChild: React.ReactNode;
    rightChild: React.ReactNode;
    initialLeftWidth?: number; // percentage (0-100)
    minLeftWidth?: number; // percentage (0-100)
    maxLeftWidth?: number; // percentage (0-100)
    resizerWidth?: number; // pixels
    breakpoint?: number; // screen width in pixels where it switches to vertical layout
}

const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
    leftChild,
    rightChild,
    initialLeftWidth = 50,
    minLeftWidth = 20,
    maxLeftWidth = 80,
    resizerWidth = 6,
    breakpoint = 768, // Default to tablet/mobile breakpoint
}) => {
    const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizerRef = useRef<HTMLDivElement>(null);

    // Check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, [breakpoint]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const mouseX = e.clientX - containerRect.left;

            const newLeftWidth = (mouseX / containerWidth) * 100;
            const clampedWidth = Math.min(Math.max(newLeftWidth, minLeftWidth), maxLeftWidth);

            setLeftWidth(clampedWidth);
        },
        [isDragging, minLeftWidth, maxLeftWidth]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const rightWidth = 100 - leftWidth;

    // For mobile screens, render a simple vertical layout
    if (isMobile) {
        return (
            <div className='resizable-splitter-container mobile-layout'>
                <div className='resizable-panel mobile-panel'>{leftChild}</div>
                <div className='resizable-panel mobile-panel'>{rightChild}</div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className='resizable-splitter-container desktop-layout'>
            <div
                className='resizable-panel left-panel'
                style={{ width: `calc(${leftWidth}% - ${resizerWidth / 2}px)` }}
            >
                {leftChild}
            </div>

            <div
                ref={resizerRef}
                className={`resizable-resizer ${isDragging ? 'dragging' : ''}`}
                style={{ width: `${resizerWidth}px` }}
                onMouseDown={handleMouseDown}
            >
                <div className='resizer-handle' />
            </div>

            <div
                className='resizable-panel right-panel'
                style={{ width: `calc(${rightWidth}% - ${resizerWidth / 2}px)` }}
            >
                {rightChild}
            </div>
        </div>
    );
};

export default ResizableSplitter;
