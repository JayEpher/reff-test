export async function getInitialState(): Promise<{ name: string; avatar?: string }> {
  return {
    name: 'Admin User',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  };
}
