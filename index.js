import { registerRootComponent } from 'expo';
import * as Linking from 'expo-linking';
import { enableScreens } from 'react-native-screens';
import 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

import {App} from './App';

enableScreens();


registerRootComponent(App);
