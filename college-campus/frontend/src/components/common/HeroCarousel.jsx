import React, { useState, useEffect } from 'react';
import campus1 from '../../assets/images/campus1.png';
import campus2 from '../../assets/images/campus2.png';
import campus3 from '../../assets/images/campus3.png';

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const slides = [
        {
            image: campus1,
            title: 'State-of-the-Art Research Center',
            tag: 'Innovation'
        },
        {
            image: campus2,
            title: 'Modern & Collaborative Library',
            tag: 'Academic'
        },
        {
            image: campus3,
            title: 'Professional Sports Infrastructure',
            tag: 'Athletics'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <section className="relative h-[400px] w-full overflow-hidden rounded-[40px] shadow-2xl shadow-indigo-200/50 mb-12">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-12 left-12 text-white">
                        <span className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                            {slide.tag}
                        </span>
                        <h2 className="text-4xl font-black tracking-tight">{slide.title}</h2>
                    </div>
                </div>
            ))}

            <div className="absolute bottom-12 right-12 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-12 h-1 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-16' : 'bg-white/30 truncate'
                            }`}
                    ></button>
                ))}
            </div>
        </section>
    );
};

export default HeroCarousel;
