import { Platform, ViewStyle } from 'react-native';

export const colors = {
  bg: '#FFFFFF',
  surface: '#F4F4F6',
  arc: '#EFEFF2',
  ink: '#121216',
  mute: '#8B8B96',
  line: '#E7E7EC',
  orange: '#FF5A1F',
  orangeSoft: '#FFEAE0',
  peach: '#FBDCCB',
  dark: '#17171B',
  success: '#1FA463',
  danger: '#E5484D',
  white: '#FFFFFF',
};

export const f = {
  reg: 'PlusJakartaSans_400Regular',
  med: 'PlusJakartaSans_500Medium',
  semi: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  xbold: 'PlusJakartaSans_800ExtraBold',
};

export const shadow = (level: 1 | 2 | 3 = 1): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#1B1B2A',
      shadowOpacity: [0.06, 0.1, 0.18][level - 1],
      shadowRadius: [8, 14, 22][level - 1],
      shadowOffset: { width: 0, height: [3, 6, 10][level - 1] },
    },
    default: { elevation: [2, 4, 8][level - 1] },
  }) as ViewStyle;

/** Space the floating tab bar occupies, so scroll content can clear it. */
export const TAB_BAR_CLEARANCE = 112;
