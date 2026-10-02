import NetInfo from '@react-native-community/netinfo';

async function isConnected(): Promise<boolean> {
  const state = await NetInfo.fetch();

  return state.isConnected === true && state.isInternetReachable !== false;
}

export const networkService = {
  isConnected,
};
