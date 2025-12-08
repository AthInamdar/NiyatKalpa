import 'react-native-reanimated';
import { configureReanimatedLogger } from 'react-native-reanimated';

// Disable strict mode warnings from third-party libraries (React Navigation)
configureReanimatedLogger({ strict: false });

import 'react-native-gesture-handler';
import './global.css';
import App from './App';

// register the root component
import { registerRootComponent } from 'expo';

registerRootComponent(App);
