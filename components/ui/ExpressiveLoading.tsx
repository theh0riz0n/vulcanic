import { motion } from 'framer-motion';

const containerVariants = {
  start: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const dotVariants = {
  start: {
    y: '0%',
  },
  end: {
    y: '100%',
  },
};

const dotTransition = {
  duration: 0.4,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut',
};

const ExpressiveLoading = () => {
  return (
    <div className="flex justify-center items-center w-full h-full min-h-[200px]">
      <motion.div
        className="flex justify-around items-end w-24 h-8"
        variants={containerVariants}
        initial="start"
        animate="end"
      >
        <motion.span
          className="block w-4 h-4 bg-primary rounded-full"
          variants={dotVariants}
          transition={dotTransition}
        />
        <motion.span
          className="block w-4 h-4 bg-primary rounded-full"
          variants={dotVariants}
          transition={dotTransition}
        />
        <motion.span
          className="block w-4 h-4 bg-primary rounded-full"
          variants={dotVariants}
          transition={dotTransition}
        />
      </motion.div>
    </div>
  );
};

export default ExpressiveLoading;