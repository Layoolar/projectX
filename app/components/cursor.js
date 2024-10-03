"use client";
import { useState, useEffect, useRef } from 'react';

export default function Cursor() {

    const cursorRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const mouseX = clientX - cursorRef.current.clientWidth / 2;
            const mouseY = clientY - cursorRef.current.clientHeight / 2;
            cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        };

        document.addEventListener('mousemove', handleMouseMove);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    return (
        <div ref={cursorRef} className="cursorCon">
            <img src='/icons/cursor.png' alt='cursor' />
        </div>
    );
}

