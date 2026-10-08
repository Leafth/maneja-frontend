import { Image } from 'react-native';

import imageTerrain from '@/assets/images/group-terreno-bg/image.png';

export function TerrainsEmptyState() {
  return (
    <Image
      source={imageTerrain}
      resizeMode="contain"
      className="h-[270px] w-[270px]"
    />
  );
}
