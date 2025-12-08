import React from 'react';
import { View, Image, ViewStyle } from 'react-native';

interface AppLogoProps {
    size?: number;
    style?: ViewStyle;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 100, style }) => {
    return (
        <View
            className="bg-white rounded-2xl items-center justify-center shadow-lg overflow-hidden"
            style={[{ width: size, height: size }, style]}
        >
            <Image
                source={require('../../../assets/images/Logo_Niyatkalpa.jpg')}
                className="w-full h-full"
                resizeMode="contain"
            />
        </View>
    );
};
