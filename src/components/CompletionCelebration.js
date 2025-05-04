import Confetti from 'react-confetti';


const CompletionCelebration = ({ show, onClose, courseTitle , name}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[1000]">
      <Confetti 
        width={window.innerWidth} 
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
      />
      
      <div className="bg-white p-8 rounded-lg text-center max-w-md relative">
        <h2 className="text-emerald-600 text-3xl mb-4">
          🎉 Congratulations {name}! 🎉
        </h2>
        <p className="text-xl mb-6">
          You've successfully completed <strong>{courseTitle}</strong>!
        </p>
        
        <button 
          onClick={onClose}
          className="mt-4 px-6 py-3 bg-emerald-600 text-white border-none rounded-full cursor-pointer text-base font-bold hover:scale-105 transition-all duration-300"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default CompletionCelebration;