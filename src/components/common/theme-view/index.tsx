import { View } from '@tarojs/components';
import { useTheme } from '@/useHooks/useFlywheel';

export default function ThemeView({ children }) {
  const theme = useTheme();
  return <View style={theme}>{children}</View>;
}
