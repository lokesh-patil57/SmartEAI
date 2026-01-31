import React from 'react';

export default function FinalCTAPreview() {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="bg-white">
      {/* Final CTA Section */}
      <section className="relative overflow-hidden py-20 md:py-32" style={{ backgroundColor: '#F8FAFC' }}>
        
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse-slow-delayed" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          
          {/* Sparkle icon with animation */}
          <div 
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-6 sm:mb-8 animate-scale-in"
            style={{
              background: 'linear-gradient(to bottom right, rgba(31, 41, 51, 0.1), rgba(35, 105, 235, 0.1))'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#1F2933" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
          </div>

          {/* Heading with stagger animation */}
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight animate-fade-up"
            style={{ color: '#1F2933' }}
          >
            Start writing with{' '}
            <span className="relative inline-block">
              <span 
                className="relative z-10 bg-gradient-to-r from-[#1F2933] via-[#2369EB] to-[#1F2933] bg-clip-text text-transparent"
              >
                clarity
              </span>
              
            </span>
          </h2>

          {/* Subtext with fade-in */}
          <p 
            className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-up-delay"
            style={{ color: '#334155' }}
          >
            Turn your thoughts into structured content — faster and with confidence.
          </p>

          {/* CTA Button */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
            <button 
              className="group relative overflow-hidden text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-base sm:text-lg font-semibold rounded-xl hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#1F2933' }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Writing
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </span>
              
              {/* Shine effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-600 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`}
              />
            </button>
          </div>

          {/* Trust indicators */}
          <div 
            className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm animate-fade-in-delay"
            style={{ color: '#64748b' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Free to start</span>
            </div>
            
          </div>

        </div>
      </section>

      
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes expand {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulseSlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.7s cubic-bezier(0.25, 0.4, 0.25, 1) forwards;
        }

        .animate-fade-up-delay {
          animation: fadeUp 0.7s cubic-bezier(0.25, 0.4, 0.25, 1) 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-up-delay-2 {
          animation: fadeUp 0.7s cubic-bezier(0.25, 0.4, 0.25, 1) 0.3s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.6s cubic-bezier(0.25, 0.4, 0.25, 1) 0.4s forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-expand {
          animation: expand 0.6s cubic-bezier(0.25, 0.4, 0.25, 1) 0.3s forwards;
          transform-origin: left;
          transform: scaleX(0);
        }

        .animate-pulse-slow {
          animation: pulseSlow 6s ease-in-out infinite;
        }

        .animate-pulse-slow-delayed {
          animation: pulseSlow 6s ease-in-out infinite;
          animation-delay: 2s;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}