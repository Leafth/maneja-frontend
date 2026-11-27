import Svg, { Path, type SvgProps } from 'react-native-svg';

interface CowIconProps extends SvgProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function CowIcon({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...props
}: CowIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox='2 2 20 20'
      fill='none'
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      {/* Chifres */}
      <Path d='M7.2 6.6C5.6 5.8 5.1 4.4 5.5 3' />
      <Path d='M16.8 6.6C18.4 5.8 18.9 4.4 18.5 3' />

      {/* Orelhas - mais para fora, sem entrar na cara */}
      <Path d='M6.4 8.4 3.4 7.2 2.8 9.7 5.8 10.5' />
      <Path d='M17.6 8.4 20.6 7.2 21.2 9.7 18.2 10.5' />

      {/* Cabeça */}
      <Path d='M7.4 7.2c1.4-.9 7.8-.9 9.2 0 .9 1.9.9 5.8 0 8.7-1 2.9-2.9 4.8-4.6 4.8s-3.6-1.9-4.6-4.8c-.9-2.9-.9-6.8 0-8.7Z' />

      {/* Focinho */}
      <Path d='M8.3 15.2c1-.9 6.4-.9 7.4 0 .9.9.9 2.7 0 3.7-1.8 1.6-5.6 1.6-7.4 0-.9-1-.9-2.8 0-3.7Z' />

      {/* Olhos */}
      <Path d='M9.5 11.8h.01' />
      <Path d='M14.5 11.8h.01' />

      {/* Narinas */}
      <Path d='M10.5 17h.01' />
      <Path d='M13.5 17h.01' />
    </Svg>
  );
}
