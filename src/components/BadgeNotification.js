import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BadgeNotification = ({ badge, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'bg-amber-500',
      silver: 'bg-gray-300',
      gold: 'bg-yellow-400',
      platinum: 'bg-blue-300',
      default: 'bg-purple-400'
    };
    return colors[tier] || colors.default;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="flex items-start p-4 max-w-md bg-white rounded-lg shadow-xl border-l-4 border-green-500">
            <motion.div 
              className={`${getTierColor(badge.badge.tier)} p-3 rounded-full mr-3 flex-shrink-0`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-2xl">{badge.badge.emoji}</span>
            </motion.div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">New Badge Earned!</h3>
                <button 
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 500);
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close notification"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-700 font-medium">{badge.badge.name}</p>
              <p className="text-sm text-gray-500">{badge.badge.description}</p>
              <div className="mt-2 flex items-center space-x-2">
                <motion.span 
                  className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  +{badge.badge.xp_value} XP
                </motion.span>
                <span className="text-xs text-gray-400">
                  {new Date(badge.earned_date).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeNotification; 