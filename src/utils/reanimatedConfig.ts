import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

/**
 * Configure Reanimated Logger
 * 
 * Disables strict mode warnings for third-party libraries (React Navigation)
 * that use Reanimated internally and may access .value during render.
 * 
 * This is safe because:
 * 1. The warnings are from React Navigation's bottom tabs, not our code
 * 2. Our codebase doesn't directly use Reanimated shared values
 * 3. The warnings don't affect functionality, only development experience
 */
configureReanimatedLogger({
    strict: false, // Disable strict mode warnings
});
