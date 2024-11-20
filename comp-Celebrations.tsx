import React, { useEffect } from 'react';
import { CelebrationEffects } from './types';

interface CelebrationsProps {
  active: boolean;
  effects: CelebrationEffects;
}

interface ParticleOptions {
  className?: string;
  duration?: number;
  setup?: (el: HTMLDivElement) => void;
  animate?: (el: HTMLDivElement) => void;
}

export const Celebrations: React.FC<CelebrationsProps> = ({ active, effects }) => {
  useEffect(() => {
    if (!active) return;

    // Helper to create and animate elements
    const createParticle = ({
      className = '',
      duration = 2000,
      setup = (el: HTMLDivElement) => {},
      animate = (el: HTMLDivElement) => {},
    }: ParticleOptions) => {
      const element = document.createElement('div');
      element.style.position = 'fixed';
      element.style.pointerEvents = 'none';
      element.style.zIndex = '40';
      element.className = className;
      setup(element);
      document.body.appendChild(element);
      
      requestAnimationFrame(() => animate(element));
      setTimeout(() => element.remove(), duration);
      return element;
    };

    // Victory Sound
    if (effects.victorySound) {
      const audio = new Audio('/victory.mp3');
      audio.volume = 0.5;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio playback failed:", error);
        });
      }
    }

    // Confetti effect
    if (effects.confetti) {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {
          createParticle({
            duration: 3000,
            setup: (el) => {
              el.style.width = '10px';
              el.style.height = '10px';
              el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
              el.style.left = `${Math.random() * 100}vw`;
              el.style.top = '-10px';
              el.style.transition = 'all 3s ease-out';
            },
            animate: (el) => {
              el.style.transform = `translateY(100vh) rotate(${720 + Math.random() * 360}deg)`;
              el.style.opacity = '0';
            }
          });
        }, i * 20);
      }
    }

    // Coin Rain
    if (effects.coinRain) {
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          createParticle({
            duration: 2000,
            setup: (el) => {
              el.style.width = '20px';
              el.style.height = '20px';
              el.style.backgroundColor = '#ffd700';
              el.style.borderRadius = '50%';
              el.style.left = `${Math.random() * 100}vw`;
              el.style.top = '-20px';
              el.style.transition = 'all 2s ease-out';
              el.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
            },
            animate: (el) => {
              el.style.transform = 'translateY(100vh) rotate(360deg)';
            }
          });
        }, i * 100);
      }
    }

    // Fireworks
    if (effects.fireworks) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const x = Math.random() * 100;
          const y = Math.random() * 50;
          for (let j = 0; j < 30; j++) {
            createParticle({
              duration: 1000,
              setup: (el) => {
                el.style.width = '4px';
                el.style.height = '4px';
                el.style.backgroundColor = '#ffd700';
                el.style.left = `${x}vw`;
                el.style.top = `${y}vh`;
                el.style.transition = 'all 1s ease-out';
              },
              animate: (el) => {
                const angle = (j / 30) * Math.PI * 2;
                const distance = 100;
                el.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
                el.style.opacity = '0';
              }
            });
          }
        }, i * 500);
      }
    }

  }, [active, effects]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 40 }}>
      {active && effects.fireworks && (
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-1000" />
      )}
    </div>
  );
}